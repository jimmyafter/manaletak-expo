package com.manaletak.app.data

/** Turns what a person typed into a safe FTS4 expression. Pure Kotlin so it is unit tested without a device. */
object SearchQuery {
    private val separators = Regex("[^\\p{L}\\p{N}]+")

    /** Lowercase words with punctuation removed, so user input can never break FTS syntax. */
    fun tokens(raw: String): List<String> =
        raw.lowercase().split(separators).filter { it.isNotBlank() }

    /**
     * Every word becomes a prefix match, and all words must match: "kunci mot" finds "kunci motor".
     * Returns null when there is nothing to search for.
     */
    fun toFtsMatch(raw: String): String? {
        val words = tokens(raw)
        return if (words.isEmpty()) null else words.joinToString(" ") { "$it*" }
    }

    /** LIKE pattern used only to rank name matches first. Escapes LIKE wildcards in the input. */
    fun likeName(raw: String): String {
        val cleaned = raw.trim().lowercase().replace("%", "").replace("_", "")
        return "%$cleaned%"
    }
}
