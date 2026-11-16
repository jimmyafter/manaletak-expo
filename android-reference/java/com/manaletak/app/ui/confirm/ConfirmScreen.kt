package com.manaletak.app.ui.confirm

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.manaletak.app.R
import com.manaletak.app.app
import com.manaletak.app.data.ItemDraft
import java.io.File
import kotlinx.coroutines.launch

/**
 * Manual form for now. Next slice: the AI pre-fills these fields from the photo and voice note, the place
 * becomes tappable chips, and low-confidence fields use the amber style from the design.
 */
@Composable
fun ConfirmScreen(photoFileName: String, onSaved: () -> Unit) {
    val context = LocalContext.current
    val repository = remember { context.app.repository }
    val scope = rememberCoroutineScope()

    var name by rememberSaveable { mutableStateOf("") }
    var place by rememberSaveable { mutableStateOf("") }
    var tags by rememberSaveable { mutableStateOf("") }
    var sensitive by rememberSaveable { mutableStateOf(false) }
    var saving by remember { mutableStateOf(false) }
    val photo = remember(photoFileName) { File(context.filesDir, "photos/$photoFileName") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .imePadding()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(text = stringResource(R.string.confirm_title), style = MaterialTheme.typography.headlineMedium)

        AsyncImage(
            model = photo,
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxWidth().height(176.dp).clip(MaterialTheme.shapes.medium),
        )

        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text(stringResource(R.string.field_item)) },
            singleLine = true,
            shape = MaterialTheme.shapes.small,
            modifier = Modifier.fillMaxWidth(),
        )

        OutlinedTextField(
            value = place,
            onValueChange = { place = it },
            label = { Text(stringResource(R.string.field_where)) },
            placeholder = { Text(stringResource(R.string.field_where_hint)) },
            supportingText = { Text(stringResource(R.string.field_where_support)) },
            singleLine = true,
            shape = MaterialTheme.shapes.small,
            modifier = Modifier.fillMaxWidth(),
        )

        OutlinedTextField(
            value = tags,
            onValueChange = { tags = it },
            label = { Text(stringResource(R.string.field_tags)) },
            singleLine = true,
            shape = MaterialTheme.shapes.small,
            modifier = Modifier.fillMaxWidth(),
        )

        // The whole row toggles, so the touch target is the full card, not just the small switch.
        Card(
            shape = MaterialTheme.shapes.medium,
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLowest),
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
            modifier = Modifier.fillMaxWidth(),
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .toggleable(value = sensitive, role = Role.Switch, onValueChange = { sensitive = it })
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(stringResource(R.string.sensitive), style = MaterialTheme.typography.bodyLarge)
                    Text(
                        stringResource(R.string.sensitive_sub),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Switch(checked = sensitive, onCheckedChange = null)
            }
        }

        Button(
            onClick = {
                saving = true
                scope.launch {
                    repository.saveItem(
                        ItemDraft(
                            name = name,
                            tags = tags.split(",").map { it.trim().lowercase() }.filter { it.isNotEmpty() },
                            placePath = place,
                            isSensitive = sensitive,
                            photoFileName = photoFileName,
                        ),
                    )
                    onSaved()
                }
            },
            enabled = name.isNotBlank() && !saving,
            shape = MaterialTheme.shapes.large,
            modifier = Modifier.fillMaxWidth().height(56.dp),
        ) {
            Text(stringResource(R.string.save), style = MaterialTheme.typography.titleSmall)
        }
    }
}
