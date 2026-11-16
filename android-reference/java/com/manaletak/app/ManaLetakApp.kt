package com.manaletak.app

import android.app.Application
import android.content.Context
import com.manaletak.app.data.AppDatabase
import com.manaletak.app.data.ItemRepository

class ManaLetakApp : Application() {
    val database: AppDatabase by lazy { AppDatabase.build(this) }
    val repository: ItemRepository by lazy { ItemRepository(database) }
}

/** The application object, for screens that need the repository. Move to ViewModels as logic grows. */
val Context.app: ManaLetakApp
    get() = applicationContext as ManaLetakApp
