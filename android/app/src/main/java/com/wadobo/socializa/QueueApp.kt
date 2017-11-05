package com.wadobo.socializa

import android.app.Application
import android.text.TextUtils
import com.android.volley.Request
import com.android.volley.RequestQueue
import com.android.volley.toolbox.Volley


class QueueApp : Application() {
    override fun onCreate() {
      super.onCreate()
      instance = this
  }

  val requestQueue: RequestQueue? = null
      get() {
          if (field == null) {
              return Volley.newRequestQueue(applicationContext)
          }
          return field
      }

  fun <T> addToRequestQueue(request: Request<T>, tag: String) {
      request.tag = if (TextUtils.isEmpty(tag)) TAG else tag
      requestQueue?.add(request)
  }

  fun <T> addToRequestQueue(request: Request<T>) {
      request.tag = TAG
      requestQueue?.add(request)
  }

  fun cancelPendingRequests(tag: Any) {
      if (requestQueue != null) {
          requestQueue!!.cancelAll(tag)
      }
  }

  companion object {
      private val TAG = QueueApp::class.java.simpleName
      @get:Synchronized var instance: QueueApp? = null
          private set
  }
}