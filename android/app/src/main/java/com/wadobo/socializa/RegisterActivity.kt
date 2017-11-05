package com.wadobo.socializa

import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import android.util.Patterns
import kotlinx.android.synthetic.main.activity_register.*
import org.json.JSONObject

class RegisterActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        val service = ServiceApp()
        val api_client = APIClient(service)

        btnRegister.setOnClickListener({
            val path = "player/register/"
            val params = JSONObject()
            var valid = true
            if (!Patterns.EMAIL_ADDRESS.matcher(textMail.text).matches()) {
                textMail.error = getText(R.string.wrong_mail)
                valid = false
            }
            if (textPwd1.text.equals(textPwd2.text)) {
                textPwd2.error = getText(R.string.wrong_password)
                valid = false
            }

            if (valid) {
                params.put("email", textMail.text)
                params.put("password", textPwd1.text)

                api_client.post(path, params) { response ->
                    btnRegister.text = response.toString()
                }
            }
        })
    }
}
