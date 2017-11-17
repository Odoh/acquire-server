package us.whodag.acquire.web.db

import mu.KLogging
import us.whodag.acquire.acq.AcquireId
import java.time.LocalDateTime

data class ServerInfo(val lastReqTime: LocalDateTime)

class AcquireServerInfo(private val acquires: MutableMap<AcquireId, ServerInfo>) {
    constructor() : this(mutableMapOf())

    companion object: KLogging()

    fun add(acquireId: AcquireId) {
        acquires[acquireId] = ServerInfo(LocalDateTime.now())
    }

    fun find(acquireId: AcquireId): ServerInfo {
        if (!acquires.containsKey(acquireId)) {
            add(acquireId)
        }
        return acquires[acquireId]!!
    }

    fun successfulReq(acquireId: AcquireId) {
        if (!acquires.containsKey(acquireId)) {
            add(acquireId)
        }
        acquires[acquireId] = acquires[acquireId]!!.copy(lastReqTime = LocalDateTime.now())
    }
}