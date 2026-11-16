package com.manaletak.app.data

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Fts4
import androidx.room.FtsOptions
import androidx.room.Index
import androidx.room.PrimaryKey
import java.util.UUID

/** Every row carries a household so family sharing later needs no migration. v1 is one local household. */
const val LOCAL_HOUSEHOLD = "local"

/**
 * Local ids are Long so the FTS table can point at a stable rowid. `uuid` is the id used for cloud sync.
 * `dirty` marks rows that still need to be pushed to the Plus backup.
 */
@Entity(
    tableName = "locations",
    indices = [Index("parentId"), Index("pathText"), Index(value = ["uuid"], unique = true)],
)
data class LocationEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val uuid: String = UUID.randomUUID().toString(),
    val householdId: String = LOCAL_HOUSEHOLD,
    val parentId: Long? = null,
    val name: String,
    /** "room", "furniture" or "container". */
    val kind: String,
    /** Full breadcrumb, for example "Bilik tidur > Almari > Laci 2". Denormalised so search can index it. */
    val pathText: String,
    val updatedAt: Long = System.currentTimeMillis(),
    val deletedAt: Long? = null,
    val dirty: Boolean = true,
)

@Entity(
    tableName = "items",
    indices = [Index("locationId"), Index(value = ["uuid"], unique = true)],
)
data class ItemEntity(
    // The column is named rowid so the FTS table below can use this table as its content source.
    @PrimaryKey(autoGenerate = true) @ColumnInfo(name = "rowid") val id: Long = 0,
    val uuid: String = UUID.randomUUID().toString(),
    val householdId: String = LOCAL_HOUSEHOLD,
    val locationId: Long? = null,
    val name: String,
    /** Other spellings and the other language, space separated: "pasport travel document". */
    val aliases: String = "",
    /** Short lowercase tags, space separated. */
    val tags: String = "",
    val note: String? = null,
    val isSensitive: Boolean = false,
    /** "ms", "en" or "mixed". */
    val language: String? = null,
    val aiConfidence: Float? = null,
    val pathText: String = "",
    /** File name (not path) of the first photo inside filesDir/photos. Denormalised for list screens. */
    val coverPhoto: String? = null,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val deletedAt: Long? = null,
    val dirty: Boolean = true,
)

/** Full-text index over the searchable columns of [ItemEntity]. Room keeps it in sync through triggers. */
@Fts4(contentEntity = ItemEntity::class, tokenizer = FtsOptions.TOKENIZER_UNICODE61)
@Entity(tableName = "items_fts")
data class ItemFts(
    val name: String,
    val aliases: String,
    val tags: String,
    val note: String?,
    val pathText: String,
)

@Entity(
    tableName = "item_photos",
    foreignKeys = [
        ForeignKey(
            entity = ItemEntity::class,
            parentColumns = ["rowid"],
            childColumns = ["itemId"],
            onDelete = ForeignKey.CASCADE,
        ),
    ],
    indices = [Index("itemId")],
)
data class ItemPhotoEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val itemId: Long,
    /** File name inside filesDir/photos. */
    val fileName: String,
    /** "place" (where it is) or "item" (the thing itself). */
    val kind: String = "place",
    val createdAt: Long = System.currentTimeMillis(),
)

@Entity(
    tableName = "item_moves",
    foreignKeys = [
        ForeignKey(
            entity = ItemEntity::class,
            parentColumns = ["rowid"],
            childColumns = ["itemId"],
            onDelete = ForeignKey.CASCADE,
        ),
    ],
    indices = [Index("itemId")],
)
data class ItemMoveEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val itemId: Long,
    val fromPath: String?,
    val toPath: String,
    val photoFileName: String? = null,
    val movedAt: Long = System.currentTimeMillis(),
)
