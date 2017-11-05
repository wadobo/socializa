package com.wadobo.socializa

import org.json.JSONObject

class APIClient constructor(serviceInjection: ServiceInterface): ServiceInterface {
    private val service: ServiceInterface = serviceInjection

    override fun post(path: String, params: JSONObject, completionHandler: (response: JSONObject?) -> Unit) {
        service.post(path, params, completionHandler)
    }

    override fun get(path: String, params: JSONObject, completionHandler: (response: JSONObject?) -> Unit) {
        service.get(path, params, completionHandler)
    }

    override fun put(path: String, params: JSONObject, completionHandler: (response: JSONObject?) -> Unit) {
        service.put(path, params, completionHandler)
    }

    override fun delete(path: String, params: JSONObject, completionHandler: (response: JSONObject?) -> Unit) {
        service.delete(path, params, completionHandler)
    }
}