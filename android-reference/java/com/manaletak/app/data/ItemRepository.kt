package com.manaletak.app.data

import androidx.room.withTransaction
import kotlinx.coroutines.flow.Flow

/** What the Confirm screen hands over when the user taps Save. */
data class ItemDraft(
    val name: String,
    val aliases: List<String> = emptyList(),
    val tags: List<String> = emptyList(),
    /** Breadcrumb with levels separated by ">", for example "Bilik tidur > Almari > Laci 2". May be empty. */
    val placePath: String = "",
    val isSensitive: Boolean = false,
    /** File name inside filesDir/photos, or null for an item saved without a photo. */
    val photoFileName: String? = null,
    val language: String? = null,
    val aiConfidence: Float? = null,
)

class ItemRepository(private val db: AppDatabase) {
    private val items = db.itemDao()
    private val locations = db.locationDao()

    fun recent(): Flow<List<ItemEntity>> = items.recent()
    fun activeCount(): Flow<Int> = items.activeCount()
    fun roomSummaries(): Flow<List<RoomSummary>> = locations.roomSummaries()

    suspend fun search(raw: String): List<ItemEntity> {
        val match = SearchQuery.toFtsMatch(raw) ?: return emptyList()
        return items.search(match, SearchQuery.likeName(raw))
    }

    suspend fun saveItem(draft: ItemDraft): Long = db.withTransaction {
        val path = normalizePath(draft.placePath)
        val leafId = if (path.isEmpty()) null else ensurePlace(path)
        val itemId = items.insertItem(
            ItemEntity(
                locationId = leafId,
                name = draft.name.trim(),
                aliases = draft.aliases.joinToString(" "),
                tags = draft.tags.joinToString(" "),
                isSensitive = draft.isSensitive,
                language = draft.language,
                aiConfidence = draft.aiConfidence,
                pathText = path,
                coverPhoto = draft.photoFileName,
            ),
        )
        draft.photoFileName?.let { items.insertPhoto(ItemPhotoEntity(itemId = itemId, fileName = it)) }
        itemId
    }

    /** Moves an item and keeps the history, as in the "I moved it" flow. */
    suspend fun moveItem(itemId: Long, newPlacePath: String, photoFileName: String?) = db.withTransaction {
        val item = items.getItem(itemId) ?: return@withTransaction
        val path = normalizePath(newPlacePath)
        val leafId = if (path.isEmpty()) null else ensurePlace(path)
        items.insertMove(
            ItemMoveEntity(itemId = itemId, fromPath = item.pathText.ifEmpty { null }, toPath = path, photoFileName = photoFileName),
        )
        photoFileName?.let { items.insertPhoto(ItemPhotoEntity(itemId = itemId, fileName = it)) }
        items.updateItem(
            item.copy(
                locationId = leafId,
                pathText = path,
                coverPhoto = photoFileName ?: item.coverPhoto,
                updatedAt = System.currentTimeMillis(),
                dirty = true,
            ),
        )
    }

    /** "  Bilik tidur>Almari  > Laci 2 " becomes "Bilik tidur > Almari > Laci 2". */
    private fun normalizePath(raw: String): String =
        raw.split(">").map { it.trim() }.filter { it.isNotEmpty() }.joinToString(" > ")

    /** Creates any missing levels of the path and returns the id of the last one. */
    private suspend fun ensurePlace(path: String): Long {
        var parentId: Long? = null
        var built = ""
        val levels = path.split(" > ")
        levels.forEachIndexed { index, name ->
            built = if (built.isEmpty()) name else "$built > $name"
            val existing = locations.findByPath(built)
            parentId = existing?.id ?: locations.insert(
                LocationEntity(
                    parentId = parentId,
                    name = name,
                    kind = when (index) {
                        0 -> "room"
                        1 -> "furniture"
                        else -> "container"
                    },
                    pathText = built,
                ),
            )
        }
        return parentId!!
    }
}
