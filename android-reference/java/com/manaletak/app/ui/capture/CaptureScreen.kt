package com.manaletak.app.ui.capture

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Mic
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.manaletak.app.R
import java.io.File
import java.util.UUID

/**
 * Camera-first home screen. Voice capture (hold-to-talk) and the AI fill-in are the next slice: for now the
 * mic is shown disabled and Confirm is a manual form.
 */
@Composable
fun CaptureScreen(onPhotoSaved: (fileName: String) -> Unit) {
    val context = LocalContext.current
    var granted by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED,
        )
    }
    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted = it }
    LaunchedEffect(Unit) {
        if (!granted) launcher.launch(Manifest.permission.CAMERA)
    }

    if (granted) {
        CameraContent(onPhotoSaved)
    } else {
        PermissionContent(onRequest = { launcher.launch(Manifest.permission.CAMERA) })
    }
}

@Composable
private fun PermissionContent(onRequest: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().padding(32.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp, Alignment.CenterVertically),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = stringResource(R.string.permission_camera_title),
            style = MaterialTheme.typography.headlineMedium,
            textAlign = TextAlign.Center,
        )
        Text(
            text = stringResource(R.string.permission_camera_body),
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
        )
        Button(onClick = onRequest, modifier = Modifier.fillMaxWidth().height(56.dp)) {
            Text(stringResource(R.string.permission_camera_button), style = MaterialTheme.typography.titleSmall)
        }
    }
}

@Composable
private fun CameraContent(onPhotoSaved: (String) -> Unit) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val imageCapture = remember {
        ImageCapture.Builder().setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY).build()
    }
    val errorMessage = stringResource(R.string.capture_error)
    val shutterLabel = stringResource(R.string.capture_shutter)
    val micLabel = stringResource(R.string.capture_mic)

    Box(modifier = Modifier.fillMaxSize().background(Color.Black)) {
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { ctx ->
                PreviewView(ctx).also { previewView ->
                    val providerFuture = ProcessCameraProvider.getInstance(ctx)
                    providerFuture.addListener({
                        val provider = providerFuture.get()
                        val preview = Preview.Builder().build().also { it.setSurfaceProvider(previewView.surfaceProvider) }
                        provider.unbindAll()
                        provider.bindToLifecycle(lifecycleOwner, CameraSelector.DEFAULT_BACK_CAMERA, preview, imageCapture)
                    }, ContextCompat.getMainExecutor(ctx))
                }
            },
        )

        // Bottom controls sit on a dark scrim so white text keeps 15:1 contrast over any photo.
        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .background(Color(0xD11F1B16))
                .padding(start = 24.dp, end = 24.dp, top = 20.dp, bottom = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Text(
                text = stringResource(R.string.capture_hint),
                style = MaterialTheme.typography.bodyMedium,
                color = Color.White,
                textAlign = TextAlign.Center,
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Spacer(Modifier.size(64.dp))

                // Shutter: 84dp ring with a 62dp disc.
                Box(
                    modifier = Modifier
                        .size(84.dp)
                        .border(BorderStroke(4.dp, Color.White), CircleShape)
                        .clickable(onClickLabel = shutterLabel) {
                            takePhoto(
                                context = context,
                                imageCapture = imageCapture,
                                onSaved = onPhotoSaved,
                                onFailure = { Toast.makeText(context, errorMessage, Toast.LENGTH_SHORT).show() },
                            )
                        }
                        .semantics { contentDescription = shutterLabel },
                    contentAlignment = Alignment.Center,
                ) {
                    Box(modifier = Modifier.size(62.dp).background(Color.White, CircleShape))
                }

                // Mic is disabled until the voice slice lands.
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Box(
                        modifier = Modifier
                            .size(64.dp)
                            .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.45f), CircleShape)
                            .border(BorderStroke(2.dp, Color.White.copy(alpha = 0.6f)), CircleShape)
                            .semantics { contentDescription = micLabel },
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(Icons.Outlined.Mic, contentDescription = null, tint = Color.White, modifier = Modifier.size(28.dp))
                    }
                }
            }
            Text(
                text = stringResource(R.string.capture_voice_hint),
                style = MaterialTheme.typography.labelSmall,
                color = Color.White.copy(alpha = 0.85f),
                textAlign = TextAlign.Center,
            )
        }
    }
}

/**
 * Saves a full-size JPEG into filesDir/photos and returns only the file name.
 * TODO (next slice): downscale to 1280 px before saving and before any AI call, as SPEC.md requires.
 */
private fun takePhoto(context: Context, imageCapture: ImageCapture, onSaved: (String) -> Unit, onFailure: () -> Unit) {
    val dir = File(context.filesDir, "photos").apply { mkdirs() }
    val file = File(dir, "${UUID.randomUUID()}.jpg")
    val options = ImageCapture.OutputFileOptions.Builder(file).build()
    imageCapture.takePicture(
        options,
        ContextCompat.getMainExecutor(context),
        object : ImageCapture.OnImageSavedCallback {
            override fun onImageSaved(output: ImageCapture.OutputFileResults) = onSaved(file.name)
            override fun onError(exception: ImageCaptureException) = onFailure()
        },
    )
}
