package com.wadobo.socializa

import org.json.JSONObject


interface ServiceInterface {
    fun post(path: String, params: JSONObject, completionHandler: (response: JSONObject?) -> Unit)
    fun get(path: String, params: JSONObject, completionHandler: (response: JSONObject?) -> Unit)
    fun put(path: String, params: JSONObject, completionHandler: (response: JSONObject?) -> Unit)
    fun delete(path: String, params: JSONObject, completionHandler: (response: JSONObject?) -> Unit)
}