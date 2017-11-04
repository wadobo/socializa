package com.wadobo.socializa

import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import kotlinx.android.synthetic.main.activity_main.*

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        btnMail.setOnClickListener({
            if (layoutSignup.visibility == View.INVISIBLE) {
                layoutSignup.visibility = View.VISIBLE
            } else {
                layoutSignup.visibility = View.INVISIBLE
            }
        })
    }
}
