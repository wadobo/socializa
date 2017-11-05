package com.wadobo.socializa

import android.content.Intent
import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import kotlinx.android.synthetic.main.activity_login.*
import org.json.JSONObject

class LoginActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        btnGotoRegister.setOnClickListener({
            val intent = Intent(this, RegisterActivity::class.java)
            startActivity(intent)
        })

        val service = ServiceApp()
        val api_client = APIClient(service)

        btnMail.setOnClickListener({
            if (layoutSignup.visibility == View.INVISIBLE) {
                layoutSignup.visibility = View.VISIBLE
            } else {
                layoutSignup.visibility = View.INVISIBLE
            }
        })

        btnLogin.setOnClickListener({
            val path = "social/token/"
            val params = JSONObject()
            params.put("client_id", "IImAQ6XDqnF9zF8amMXgnznQjgIGTvNqFGwB3elx")
            params.put("grant_type", "password")
            params.put("username", textMail.text)
            params.put("password", textPwd.text)

            api_client.post(path, params) {response ->
                service.setToken(response?.get("access_token") as String)
                service.setRefreshToken(response?.get("refresh_token") as String)
                val intent = Intent(this, MainActivity::class.java)
                startActivity(intent)
            }
        })

        btnFacebook.setOnClickListener({
            val path = "player/near/"
            val params = JSONObject()

            api_client.get(path, params) {response ->
                textApp.text = response.toString()
            }
        })
    }
}
