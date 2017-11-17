package us.whodag.acquire.web.db

import us.whodag.acquire.acq.AcquireId
import us.whodag.acquire.ai.AcqAi
import us.whodag.acquire.obj.player.PlayerId

data class AiPlayer(val ai: AcqAi, val playerId: PlayerId)

class AcquireAIs(private val acquireAis: MutableMap<AcquireId, MutableList<AiPlayer>>) {
    constructor() : this(mutableMapOf())

    fun add(acquireId: AcquireId, playerId: PlayerId, ai: AcqAi) {
        acquireAis.putIfAbsent(acquireId, mutableListOf())
        acquireAis[acquireId]!!.add(AiPlayer(ai, playerId))
    }

    fun remove(acquireId: AcquireId) {
        acquireAis.remove(acquireId)
    }

    fun hasAi(acquireId: AcquireId): Boolean = acquireAis.containsKey(acquireId)

    fun aiPlayerIds(acquireId: AcquireId): List<PlayerId> =
            if (acquireAis.containsKey(acquireId)) acquireAis[acquireId]!!.map { it.playerId }
            else emptyList()

    fun aiPlayers(acquireId: AcquireId): List<AiPlayer> =
            if (acquireAis.containsKey(acquireId)) acquireAis[acquireId]!!
            else emptyList()

    fun gamesWithAi(): Collection<AcquireId> {
        return acquireAis.keys
    }
}
