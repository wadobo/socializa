package com.wadobo.socializa

import android.util.Log
import com.android.volley.AuthFailureError
import com.android.volley.Request.Method
import com.android.volley.Response
import com.android.volley.VolleyLog
import com.android.volley.toolbox.JsonObjectRequest
import org.json.JSONObject


class ServiceApp : ServiceInterface {

    val TAG = ServiceApp::class.java.simpleName
    val basePath = "https://socializa.wadobo.com/api/"
    var auth_token = ""
    var refresh_token = ""

    private fun base(method: Int, path: String, params: JSONObject, completionHandler: (response: JSONObject?) -> Unit) {
        val jsonObjReq = object : JsonObjectRequest(method, basePath + path, params,
                Response.Listener<JSONObject> { response ->
                    Log.d(TAG, "/$method request OK! Response: $response")
                    completionHandler(response)
                },
                Response.ErrorListener { error ->
                    VolleyLog.e(TAG, "/$method request fail! Error: ${error.message}")
                    completionHandler(null)
                }) {
            @Throws(AuthFailureError::class)
            override fun getHeaders(): Map<String, String> {
                val headers = HashMap<String, String>()
                headers.put("Content-Type", "application/json")
                headers.put("Authorization", auth_token)
                return headers
            }
        }
        QueueApp.instance?.addToRequestQueue(jsonObjReq, TAG)

    }

    fun setToken(token: String) {
        auth_token = token
    }

    fun setRefreshToken(token: String) {
        refresh_token = token
    }
    override fun post(path: String, params: JSONObject, completionHandler: (response: JSONObject?) -> Unit) {
        base(Method.POST, path, params, completionHandler)
    }

    override fun get(path: String, params: JSONObject, completionHandler: (response: JSONObject?) -> Unit) {
        base(Method.GET, path, params, completionHandler)
    }

    override fun put(path: String, params: JSONObject, completionHandler: (response: JSONObject?) -> Unit) {
        base(Method.PUT, path, params, completionHandler)
    }

    override fun delete(path: String, params: JSONObject, completionHandler: (response: JSONObject?) -> Unit) {
        base(Method.DELETE, path, params, completionHandler)
    }
}