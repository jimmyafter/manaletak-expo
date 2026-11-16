package com.manaletak.app.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

data class RoomSummary(
    val name: String,
    val itemCount: Int,
)

@Dao
interface LocationDao {
    @Insert
    suspend fun insert(location: LocationEntity): Long

    @Query("SELECT * FROM locations WHERE pathText = :path AND deletedAt IS NULL LIMIT 1")
    suspend fun findByPath(path: String): LocationEntity?

    @Query(
        """
        SELECT l.name AS name,
               (SELECT COUNT(*) FROM items i
                 WHERE i.deletedAt IS NULL
                   AND (i.pathText = l.name OR i.pathText LIKE l.name || ' > %')) AS itemCount
        FROM locations l
        WHERE l.kind = 'room' AND l.deletedAt IS NULL
        ORDER BY l.name
        """,
    )
    fun roomSummaries(): Flow<List<RoomSummary>>
}

@Dao
interface ItemDao {
    @Insert
    suspend fun insertItem(item: ItemEntity): Long

    @Update
    suspend fun updateItem(item: ItemEntity)

    @Insert
    suspend fun insertPhoto(photo: ItemPhotoEntity): Long

    @Insert
    suspend fun insertMove(move: ItemMoveEntity): Long

    @Query("SELECT * FROM items WHERE rowid = :id AND deletedAt IS NULL")
    suspend fun getItem(id: Long): ItemEntity?

    @Query("SELECT * FROM items WHERE deletedAt IS NULL ORDER BY updatedAt DESC LIMIT 30")
    fun recent(): Flow<List<ItemEntity>>

    @Query("SELECT COUNT(*) FROM items WHERE deletedAt IS NULL")
    fun activeCount(): Flow<Int>

    /**
     * Full-text search. [match] is an FTS4 expression built by [SearchQuery.toFtsMatch].
     * Name matches rank above alias, tag and place matches; newest first within each group.
     */
    @Query(
        """
        SELECT items.* FROM items
        JOIN items_fts ON items.rowid = items_fts.rowid
        WHERE items_fts MATCH :match AND items.deletedAt IS NULL
        ORDER BY CASE WHEN items.name LIKE :likeName THEN 0 ELSE 1 END, items.updatedAt DESC
        LIMIT 50
        """,
    )
    suspend fun search(match: String, likeName: String): List<ItemEntity>
}
