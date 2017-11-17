package us.whodag.acquire.web

import us.whodag.acquire.req.AcqReqs.playersWithRequest
import us.whodag.acquire.Acquire
import us.whodag.acquire.web.db.AcquireServerInfo
import us.whodag.acquire.web.db.AcquireWSSessions
import java.time.format.DateTimeFormatter

/**
 * Overview information about an Acquire game.
 */
data class GameOverview(val lastReqTime: String,
                        val sessions: Int,
                        val id: String,
                        val state: String,
                        val turn: Int,
                        val activePlayer: String,
                        val players: Collection<String>)

private val LAST_REQ_TIME_PATTERN = DateTimeFormatter.ofPattern("MM/dd/uu hh:mm a")

/** The overview of an Acquire game. */
fun Acquire.overview(acqServerInfo: AcquireServerInfo,
                     acqWSSessions: AcquireWSSessions): GameOverview {
    val serverInfo = acqServerInfo.find(id())
    return GameOverview(serverInfo.lastReqTime.format(LAST_REQ_TIME_PATTERN).toString(),
            acqWSSessions.count(id()),
            id().name,
            state().acqSmState.toString(),
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

