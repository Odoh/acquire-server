package us.whodag.acquire.web

import com.eclipsesource.json.JsonArray
import com.eclipsesource.json.JsonObject
import us.whodag.acquire.req.AcqReqs.playersWithRequest
import us.whodag.acquire.Acquire
import us.whodag.acquire.json.json
import us.whodag.acquire.sm.AcqSmState
import us.whodag.acquire.web.db.AcquireServerInfo
import us.whodag.acquire.web.db.AcquireWSSessions
import java.time.format.DateTimeFormatter

/**
 * Overview information about an Acquire game.
 */
data class GameOverview(val lastReqTime: String,
                        val sessions: Int,
                        val id: String,
                        val state: AcqSmState,
                        val turn: Int,
                        val activePlayer: String,
                        val players: Collection<String>)

private val LAST_REQ_TIME_PATTERN = DateTimeFormatter.ofPattern("MM/dd/uu hh:mm a")
private val LAST_REQ_TIME = "last_req_time"
private val NUM_SESSIONS = "num_sessions"
private val ID = "id"
private val STATE = "state"
private val TURN = "turn"
private val ACTIVE_PLAYER = "active_player"
private val PLAYERS = "players"

/** Return the JSON representation of a game overview. */
fun GameOverview.json(): JsonObject {
    return JsonObject()
        .add(LAST_REQ_TIME, lastReqTime)
        .add(NUM_SESSIONS, sessions)
        .add(ID, id)
        .add(STATE, state.json())
        .add(TURN, turn)
        .add(ACTIVE_PLAYER, activePlayer)
        .add(PLAYERS, players.fold(JsonArray(), { array, player -> array.add(player)}))
}

/** Return a JSON string of the collection of game over views. */
fun Collection<GameOverview>.jsonString(): String {
    return this.fold(JsonArray(), { array, overview -> array.add(overview.json()) })
        .toString()
}

/** The overview of an Acquire game. */
fun Acquire.overview(acqServerInfo: AcquireServerInfo,
                     acqWSSessions: AcquireWSSessions): GameOverview {
    val serverInfo = acqServerInfo.find(id())
    return GameOverview(serverInfo.lastReqTime.format(LAST_REQ_TIME_PATTERN).toString(),
            acqWSSessions.count(id()),
            id().name,
            state().acqSmState,
            turn(),
            playersWithRequest().joinToString { it.name },
            state().acqSmState.acqObj.players.keys.map { it.name })
}

/** The overviews of a collection of acquire games. */
fun Collection<Acquire>.overviews(acqServerInfo: AcquireServerInfo,
                                  acqWSSessions: AcquireWSSessions): List<GameOverview> {
    val sorted = this.sortedByDescending { acqServerInfo.find(it.id()).lastReqTime  }
    val overviews = mutableListOf<GameOverview>()
    sorted.forEach { overviews.add(it.overview(acqServerInfo, acqWSSessions)) }
    return overviews
}

