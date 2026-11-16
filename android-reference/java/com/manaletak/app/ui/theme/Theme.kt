package com.manaletak.app.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

// v1 ships light only. Dark theme is a later slice, not an afterthought: add tokens to the Style guide first.
private val LightColors = lightColorScheme(
    primary = Accent,
    onPrimary = Color.White,
    primaryContainer = AccentTint,
    onPrimaryContainer = AccentInk,
    secondaryContainer = AccentTint,
    onSecondaryContainer = AccentInk,
    tertiaryContainer = AmberBg,
    onTertiaryContainer = AmberInk,
    background = Ground,
    onBackground = Ink,
    surface = Ground,
    onSurface = Ink,
    surfaceVariant = Sand,
    onSurfaceVariant = Ink2,
    surfaceContainerLowest = Surface,
    surfaceContainerLow = Surface,
    surfaceContainer = Surface, // navigation bar
    outline = FieldBorder,
    outlineVariant = Line,
    error = Danger,
    onError = Color.White,
)

private val AppShapes = Shapes(
    small = RoundedCornerShape(14.dp),  // fields
    medium = RoundedCornerShape(20.dp), // cards, photos
    large = RoundedCornerShape(28.dp),  // pill buttons, hero photos
)

@Composable
fun ManaLetakTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColors,
        typography = AppTypography,
        shapes = AppShapes,
        content = content,
    )
}
