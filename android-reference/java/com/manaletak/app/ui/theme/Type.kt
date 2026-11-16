package com.manaletak.app.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

// TODO: bundle Plus Jakarta Sans (res/font) and replace FontFamily.Default. Sizes below are in sp so the
// app follows Android font scaling. Scale from the Style guide board.
private val Family = FontFamily.Default

val AppTypography = Typography(
    displayMedium = TextStyle(fontFamily = Family, fontSize = 32.sp, lineHeight = 36.sp, fontWeight = FontWeight.Bold),
    headlineLarge = TextStyle(fontFamily = Family, fontSize = 28.sp, lineHeight = 32.sp, fontWeight = FontWeight.Bold),
    headlineMedium = TextStyle(fontFamily = Family, fontSize = 22.sp, lineHeight = 26.sp, fontWeight = FontWeight.Bold),
    titleMedium = TextStyle(fontFamily = Family, fontSize = 18.sp, lineHeight = 24.sp, fontWeight = FontWeight.Bold),
    titleSmall = TextStyle(fontFamily = Family, fontSize = 17.sp, lineHeight = 22.sp, fontWeight = FontWeight.Bold),
    bodyLarge = TextStyle(fontFamily = Family, fontSize = 16.sp, lineHeight = 24.sp, fontWeight = FontWeight.Medium),
    bodyMedium = TextStyle(fontFamily = Family, fontSize = 14.sp, lineHeight = 20.sp, fontWeight = FontWeight.Medium),
    bodySmall = TextStyle(fontFamily = Family, fontSize = 13.sp, lineHeight = 18.sp, fontWeight = FontWeight.Medium),
    labelLarge = TextStyle(fontFamily = Family, fontSize = 14.sp, lineHeight = 20.sp, fontWeight = FontWeight.SemiBold),
    labelSmall = TextStyle(fontFamily = Family, fontSize = 12.sp, lineHeight = 16.sp, fontWeight = FontWeight.SemiBold),
)
