package com.manaletak.app.ui.places

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.manaletak.app.R
import com.manaletak.app.app
import com.manaletak.app.data.RoomSummary

/**
 * Rooms and item counts. Next slices: open a room to browse furniture and containers, rename and merge
 * places, the free-tier cap banner, and the 3-photo preview thumbnails from the design.
 */
@Composable
fun PlacesScreen() {
    val context = LocalContext.current
    val repository = remember { context.app.repository }
    val rooms by remember { repository.roomSummaries() }.collectAsState(initial = emptyList())
    val total by remember { repository.activeCount() }.collectAsState(initial = 0)

    Column(
        modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp).padding(top = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Column(modifier = Modifier.padding(horizontal = 4.dp)) {
            Text(text = stringResource(R.string.places_title), style = MaterialTheme.typography.headlineLarge)
            Text(
                text = stringResource(R.string.items_count, total),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }

        if (rooms.isEmpty()) {
            Text(
                text = stringResource(R.string.places_empty),
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(horizontal = 4.dp),
            )
        } else {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                items(rooms, key = { it.name }) { RoomCard(it) }
            }
        }
    }
}

@Composable
private fun RoomCard(room: RoomSummary) {
    Card(
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLowest),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
        modifier = Modifier.fillMaxWidth().defaultMinSize(minHeight = 96.dp),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(2.dp),
        ) {
            Text(text = room.name, style = MaterialTheme.typography.titleMedium)
            Text(
                text = stringResource(R.string.items_count, room.itemCount),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}
