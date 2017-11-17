package us.whodag.acquire.web.db

import org.eclipse.jetty.websocket.api.Session
import us.whodag.acquire.acq.AcquireId

class AcquireWSSessions(private val acquireSessions: MutableMap<AcquireId, MutableList<Session>>,
                        private val removeSessionFn: MutableMap<Session, () -> Unit>) {
    constructor() : this(mutableMapOf(), mutableMapOf())

    /**
     * Add a WS session for the Acquire game id.
     * Returns whether the session was successfully added.
     */
    fun add(acquireId: AcquireId, session: Session): Boolean {
        val sessions = acquireSessions.getOrPut(acquireId,  { mutableListOf() })
        if (sessions.contains(session)) {
            return false
        }
        val removeFn: () -> Unit = {
            acquireSessions[acquireId]!!.remove(session)
            if (acquireSessions[acquireId]!!.isEmpty()) {
                acquireSessions.remove(acquireId)
            }
            removeSessionFn.remove(session)
        }

        sessions.add(session)
        removeSessionFn.put(session, removeFn)
        return true
    }

    /** Remove a WS session from the saved sessions. */
    fun remove(session: Session) {
        removeSessionFn.getOrDefault(session, {
            acquireSessions.values.forEach { sessions -> sessions.remove(session) }
        })()
    }

    /** Return an iterator to the session associated with the Acquire game id. */
    fun sessions(acquireId: AcquireId): Iterator<Session> {
        return acquireSessions.getOrDefault(acquireId, mutableListOf()).iterator()
    }

    /** Return an iterator to all saved sessions. */
    fun sessions(): Iterator<Session> {
        return removeSessionFn.keys.iterator()
    }

    fun count(acquireId: AcquireId): Int {
        return acquireSessions.getOrDefault(acquireId, mutableListOf()).size
    }
}