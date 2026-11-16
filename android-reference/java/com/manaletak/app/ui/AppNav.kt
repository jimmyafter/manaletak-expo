package com.manaletak.app.ui

import androidx.annotation.StringRes
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.CameraAlt
import androidx.compose.material.icons.outlined.GridView
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.manaletak.app.R
import com.manaletak.app.ui.capture.CaptureScreen
import com.manaletak.app.ui.confirm.ConfirmScreen
import com.manaletak.app.ui.find.FindScreen
import com.manaletak.app.ui.places.PlacesScreen

private object Routes {
    const val CAPTURE = "capture"
    const val FIND = "find"
    const val PLACES = "places"
    const val CONFIRM = "confirm/{photo}"
    fun confirm(photoFileName: String) = "confirm/$photoFileName"
}

private data class Tab(val route: String, @StringRes val label: Int, val icon: ImageVector)

private val tabs = listOf(
    Tab(Routes.CAPTURE, R.string.nav_capture, Icons.Outlined.CameraAlt),
    Tab(Routes.FIND, R.string.nav_find, Icons.Outlined.Search),
    Tab(Routes.PLACES, R.string.nav_places, Icons.Outlined.GridView),
)

@Composable
fun AppNav() {
    val nav = rememberNavController()
    val backStack by nav.currentBackStackEntryAsState()
    val route = backStack?.destination?.route

    Scaffold(
        bottomBar = {
            if (tabs.any { it.route == route }) {
                NavigationBar {
                    tabs.forEach { tab ->
                        NavigationBarItem(
                            selected = route == tab.route,
                            onClick = {
                                nav.navigate(tab.route) {
                                    popUpTo(Routes.CAPTURE) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(tab.icon, contentDescription = null) },
                            label = { Text(stringResource(tab.label)) },
                        )
                    }
                }
            }
        },
    ) { padding ->
        NavHost(
            navController = nav,
            startDestination = Routes.CAPTURE,
            modifier = Modifier.padding(padding),
        ) {
            composable(Routes.CAPTURE) {
                CaptureScreen(onPhotoSaved = { fileName -> nav.navigate(Routes.confirm(fileName)) })
            }
            composable(
                route = Routes.CONFIRM,
                arguments = listOf(navArgument("photo") { type = NavType.StringType }),
            ) { entry ->
                ConfirmScreen(
                    photoFileName = entry.arguments?.getString("photo").orEmpty(),
                    onSaved = {
                        nav.navigate(Routes.CAPTURE) {
                            popUpTo(Routes.CAPTURE) { inclusive = true }
                        }
                    },
                )
            }
            composable(Routes.FIND) { FindScreen() }
            composable(Routes.PLACES) { PlacesScreen() }
        }
    }
}
