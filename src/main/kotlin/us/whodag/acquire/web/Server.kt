package us.whodag.acquire.web

import com.xenomachina.argparser.ArgParser
import com.xenomachina.argparser.default
import io.javalin.ApiBuilder.get
import io.javalin.ApiBuilder.post
import io.javalin.Javalin
import us.whodag.acquire.*
import us.whodag.acquire.Acquires.logger
import us.whodag.acquire.acq.AcquireId
import us.whodag.acquire.acq.JsonCacheAcquire
import us.whodag.acquire.ai.RandomAi
import us.whodag.acquire.json.*
import us.whodag.acquire.obj.player.PlayerId
import us.whodag.acquire.req.AcqReq
import us.whodag.acquire.req.Response
import us.whodag.acquire.req.isSuccess
import us.whodag.acquire.sm.GameOver
import us.whodag.acquire.web.db.AcquireAIs
import us.whodag.acquire.web.db.AcquireJsonCaches
import us.whodag.acquire.web.db.AcquireServerInfo
import us.whodag.acquire.web.db.AcquireWSSessions
import java.util.concurrent.Executors
import java.util.regex.Pattern

private class BadRequestException(override var message: String): Exception()
private class NotFoundException(override var message: String): Exception()

private fun templatePath(file: String): String = "/http/html/$file"

/** Time constants in ms. */
private object TimeMs {
    val WS_IDLE_TIMEOUT: Long = 300000
    val WS_PING_FREQUENCY: Long = WS_IDLE_TIMEOUT / 3

    val AI_SLEEP_TIME: Long = 1500
}

/*
 * Sever Threads
 */

/* Continually pings open WS sessions to ensure they remain open. */
private fun runWSPing(acquireWSSessions: AcquireWSSessions): Nothing {
    while (true) {
        acquireWSSessions.sessions().forEach { it.remote.sendPing(null) }
        Thread.sleep(TimeMs.WS_PING_FREQUENCY)
    }
}

/* Continually submit Acquire requests for acquire AI */
private fun runAIHandler(acquireJsonCaches: AcquireJsonCaches,
                         acquireWSSessions: AcquireWSSessions,
                         acquireServerInfo: AcquireServerInfo,
                         acquireAIs: AcquireAIs): Nothing {
    while (true) {
        // inspect each acquire game that has AI
        for (acquireId in acquireAIs.gamesWithAi()) {
            val acquire = acquireJsonCaches.find(acquireId)

            // if the game has ended or no longer exists, remove it
            if (acquire == null || (acquire.state().acqSmState is GameOver)) {
                acquireAIs.remove(acquireId)
                continue
            }

            // check each AI player in the game for requests, if found skip the other players this iteration
            for ((ai, playerId) in acquireAIs.aiPlayers(acquireId)) {
                val acqReq = ai.chooseRequest(acquire, playerId)
                if (acqReq != null) {
                    submitAcquireRequest(acquire, acqReq, acquireWSSessions, acquireServerInfo)
                    break
                }
            }
        }
        Thread.sleep(TimeMs.AI_SLEEP_TIME)
    }
}

/*
 * Server Functions
 */

/* Updates the server object state when submitting a request to an Acquire game. */
private fun submitAcquireRequest(acquire: JsonCacheAcquire,
                                 acqReq: AcqReq,
                                 acquireWSSessions: AcquireWSSessions,
                                 acquireServerInfo: AcquireServerInfo): Response {
    val response = acquire.submit(acqReq)
    if (response.isSuccess()) {
        acquireWSSessions.sessions(acquire.id()).forEach { it.remote.sendString(acquire.stateJson(acquire.turn())) }
        acquireServerInfo.successfulReq(acquire.id())
    }
    return response
}

private class Parser(parser: ArgParser) {
    val rooturl by parser.storing("the hostname of the server").default("localhost:8080")
    val port by parser.storing("the port of the server") { toInt() }.default(8080)
}

fun main(args: Array<String>) {
    val parser = Parser(ArgParser(args))

    val PLAYER_NAME_LIMIT = 10
    val PLAYER_CREATE_PATTERN = Pattern.compile("""([a-zA-Z0-9]\s*)+""")

    val acquireJsonCache = AcquireJsonCaches()
    val acquireWSSessions = AcquireWSSessions()
    val acquireServerInfo = AcquireServerInfo()
    val acquireAis = AcquireAIs()

    val app = Javalin.create().enableCorsForOrigin("null").port(parser.port)
    app.exception(BadRequestException::class.java) { e, ctx -> ctx.status(400).result(e.message) }
    app.exception(NotFoundException::class.java) { e, ctx -> ctx.status(404).result(e.message) }
    app.enableStaticFiles("/http/public")
    app.ws("/game/ws") { ws ->
        ws.onConnect { session -> session.idleTimeout = TimeMs.WS_IDLE_TIMEOUT }
        ws.onMessage { session, message ->
            // expect the message to contain the acquire id to become a listener for
            val acquire = acquireJsonCache.find(AcquireId(message))
            if (acquire == null) {
                session.close(1011, "Acquire game with id [$message] not found")
            } else {
                acquireWSSessions.add(AcquireId(message), session)
                logger.debug("Adding session to acquire: " + message)
                session.remote.sendString(acquire.stateJson(acquire.turn()))
            }
        }
        ws.onClose { session, statusCode, reason ->
            logger.debug("Session onClose statusCode [$statusCode] reason [$reason]")
            acquireWSSessions.remove(session)
        }
        ws.onError { session, throwable ->
            logger.warn("Session onError throwable [$throwable]")
            acquireWSSessions.remove(session)
        }
    }
    app.routes {
        get("/") { ctx -> ctx.renderMustache(templatePath("index.html"), mapOf(Pair("rooturl", parser.rooturl))) }
        get("/api/http") { ctx -> ctx.renderMustache(templatePath("md/api_http.html"))}
        get("/api/objects") { ctx -> ctx.renderMustache(templatePath("md/api_objects.html"))}
        get("/api/requests") { ctx -> ctx.renderMustache(templatePath("md/api_requests.html"))}
        get("/api/states") { ctx -> ctx.renderMustache(templatePath("md/api_states.html"))}
        get("/game") { ctx ->
            ctx.renderMustache(templatePath("games.html"), mapOf(Pair("overviews", acquireJsonCache.all().overviews(acquireServerInfo, acquireWSSessions))))
        }
        get("/game/:id/gui") { ctx ->
            val id = AcquireId(ctx.param("id")!!)
            val acquire = acquireJsonCache.find(id) ?: throw NotFoundException("Acquire game with id [$id] not found")
            val player: String = ctx.queryParam("player") ?: ""
            if (!player.isEmpty() && !acquire.players().map { it.name }.contains(player)) throw NotFoundException("Player [$player] not in Acquire game with id [$id]")
            if (acquireAis.hasAi(id) && acquireAis.aiPlayerIds(id).map { it.name }.contains(player)) throw NotFoundException("Player [$player] is an AI in Acquire game with id [$id]")
            ctx.renderMustache(templatePath("gui.html"), mapOf(Pair("rooturl", parser.rooturl),
                                                               Pair("gameId", acquire.id().name),
                                                               Pair("playerId", player)))
        }
        get("/game/:id") { ctx -> // QUERY: turn
            val id = AcquireId(ctx.param("id")!!)
            val acquire = acquireJsonCache.find(id) ?: throw NotFoundException("Acquire game with id [$id] not found")
            val turn: Int = ctx.queryParam("turn")?.toInt() ?: acquire.turn()
            ctx.contentType("application/json").result(acquire.stateJson(turn))
        }
        get("/game/:id/history") { ctx -> // QUERY: startTurn, endTurn
            val id = AcquireId(ctx.param("id")!!)
            val acquire = acquireJsonCache.find(id) ?: throw NotFoundException("Acquire game with id [$id] not found")
            val startTurn: Int = ctx.queryParam("startTurn")?.toInt() ?: 0
            val endTurn: Int = ctx.queryParam("endTurn")?.toInt() ?: acquire.turn()
            if (startTurn < 0) throw NotFoundException("Cannot request a turn range start less than 0. Requested [$startTurn]")
            if (endTurn > acquire.turn()) throw NotFoundException("Cannot request a turn range end greater than the current turn of the game. Current Turn [${acquire.turn()}] Requested [$endTurn]")
            ctx.contentType("application/json").result(acquire.statesJson(startTurn, endTurn))
        }
        post("/game/:id/request") { ctx ->
            val id = AcquireId(ctx.param("id")!!)
            val acquire = acquireJsonCache.find(id) ?: throw NotFoundException("Acquire game with id [$id] not found")
            try {
                val acqReq = parseJson(ctx.body()).toAcqReq()
                if (acquireAis.hasAi(id) && acquireAis.aiPlayerIds(id).contains(acqReq.player)) throw NotFoundException("Player [${acqReq.player.name}] is an AI in Acquire game with id [$id]")
                val response = submitAcquireRequest(acquire, acqReq, acquireWSSessions, acquireServerInfo)
                ctx.contentType("application/json").result(response.json().toString())
            } catch (e: JsonException) {
                throw BadRequestException("Unable to parse body JSON into an Acquire request: ${e.message}")
            }
        }
        post("/game/create") { ctx ->
            try {
                // TODO: ERROR CHECK
                val playersParam = ctx.formParam("players")
                val aiParam = ctx.formParam("ai")
                val playerIds = if (playersParam == null || playersParam.isEmpty()) emptyList()
                                else if (!PLAYER_CREATE_PATTERN.matcher(playersParam).matches()) throw BadRequestException("Players parameter must be delimited by spaces. Example: [odo joree sal]")
                                else playersParam.split("""\s+""".toRegex()).map { PlayerId(it.toLowerCase()) }
                val aiIds = if (aiParam == null || aiParam.isEmpty()) emptyList()
                            else if (!PLAYER_CREATE_PATTERN.matcher(aiParam).matches()) throw BadRequestException("Ai parameter must be delimited by spaces. Example: [odo joree sal]")
                            else aiParam.split("""\s+""".toRegex()).map { PlayerId(it.toLowerCase()) }

                if (playerIds.map { it.name }.any { it.length > PLAYER_NAME_LIMIT }) throw BadRequestException("Player names must be less than $PLAYER_NAME_LIMIT characters")
                if (aiIds.map { it.name }.any { it.length > PLAYER_NAME_LIMIT }) throw BadRequestException("Ai names must be less than $PLAYER_NAME_LIMIT characters")
                if (playerIds.isEmpty() && aiIds.isEmpty()) throw BadRequestException("Must have at least one player in the game")

                // Adding the the AcquireDB will fail if there are conflicting ids
                // That shouldn't ever happen, but if it does, recreated the game and a new id will be generated
                val allPlayerIds = playerIds + aiIds
                var acquire = Acquires.standard(allPlayerIds)
                while (!acquireJsonCache.add(acquire)) {
                    Thread.sleep(100)
                    acquire = Acquires.standard(allPlayerIds)
                }

                // create random AIs
                aiIds.forEach { id -> acquireAis.add(acquire.id(), id, RandomAi()) }
                acquireServerInfo.add(acquire.id())

                ctx.redirect("/game")
            } catch (e: JsonException) {
                throw BadRequestException("Unable to parse players form param JSON into player ids: ${e.message}")
            }
        }
    }
    app.start()

    // spin up the required server threads
    val executor = Executors.newCachedThreadPool()!!
    executor.submit({ runWSPing(acquireWSSessions) })
    executor.submit({ runAIHandler(acquireJsonCache, acquireWSSessions, acquireServerInfo, acquireAis) })

//    acquireJsonCache.find(AcquireId("test_game"))
//    acquireJsonCache.find(AcquireId("six"))
}
