package us.whodag.acquire.web.db

import mu.KLogging
import us.whodag.acquire.Acquire
import us.whodag.acquire.Acquires
import us.whodag.acquire.Acquires.filePersist
import us.whodag.acquire.Acquires.jsonCache
import us.whodag.acquire.acq.AcquireId
import us.whodag.acquire.acq.JsonCacheAcquire
import us.whodag.acquire.defaultGamePath
import java.nio.file.Files
import java.nio.file.Paths
import kotlin.collections.Collection
import kotlin.collections.MutableMap
import kotlin.collections.mutableMapOf
import kotlin.collections.set

/**
 * Database of JSON cached Acquire games which are file persisted.
 */
class AcquireJsonCaches(private val acquires: MutableMap<AcquireId, JsonCacheAcquire>) {
    constructor() : this(mutableMapOf())

    companion object: KLogging()

    /**
     * Add an acquire game to the AcquireDatabase.
     * Returns whether the add was successful.
     */
    fun add(acquire: Acquire): Boolean {
        if (find(acquire.id()) != null) {
            logger.warn { "Unable to add Acquire game as a game with id [${acquire.id()}] already exists" }
            return false
        }
        acquires[acquire.id()] = acquire.filePersist().jsonCache()
        return true
    }

    /**
     * Attempt to find acquire game with the associated id.
     * First looks in memory, if not file, looks for a file persisted instance.
     * Returns null if unable to be found.
     */
    fun find(acquireId: AcquireId): JsonCacheAcquire? {
        val inMemory = acquires[acquireId]
        if (inMemory != null) {
            logger.debug { "Found Acquire game with id $acquireId in memory" }
            return inMemory
        }
        val persisted = loadPersistedGame("${acquireId.name}.acq");
        if (persisted != null) {
            logger.debug { "Found Acquire game with id $acquireId in file" }
            return persisted
        }
        return null;
    }

    /** Load an Acquire game into memory from its persisted path name. */
    private fun loadPersistedGame(persistedName: String): JsonCacheAcquire? {
        val inFile = Acquires.standardLoadFromPath(defaultGamePath(persistedName))
        if (inFile != null) {
            val loaded = inFile.filePersist().jsonCache()
            acquires[loaded.id()] = loaded
            return loaded
        }
        return null
    }

    /** Load all Acquire games that have been persisted. */
    fun loadAllPersistedGames() {
        Files.walk(Paths.get(defaultGamePath("")))
            .filter { item -> item.toString().endsWith(".acq") }
            .forEach { acqFile -> loadPersistedGame(acqFile.fileName.toString()) }
    }

    /**
     * Return all stored Acquire games.
     */
    fun all(): Collection<Acquire> {
        return acquires.values
    }
}