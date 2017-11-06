package com.wadobo.socializa

import android.content.Context
import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.TextView
import kotlinx.android.synthetic.main.activity_list_event.*
import org.json.JSONObject

class ListEventActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_list_event)

        listView.adapter = MyAdapter(this)

    }
}

class MyAdapter(context: Context) : BaseAdapter() {

    private val mContext: Context

    // TODO: get games for server
    private val games = listOf<Map<String, Any>>(
        mapOf(
            "event_title" to "Event 1",
            "event_desc" to "At as in understood an remarkably solicitude. Mean them very seen she she. Use totally written the observe pressed justice. Instantly cordially far intention recommend estimable yet her his. Ladies stairs enough esteem add fat all enable. Needed its design number winter see. Oh be me sure wise sons no. Piqued ye of am spirit regret. Stimulated discretion impossible admiration in particular conviction up.",
            "event_distance" to 1500,
            "event_current_player" to 90,
            "event_max_player" to 100,
            "event_premium" to "free"
        ),
        mapOf(
            "event_title" to "Event 2",
            "event_desc" to "This is a short description",
            "event_distance" to 150,
            "event_current_player" to 5,
            "event_max_player" to 100,
            "event_premium" to "premium"
        )
    )

    init {
        mContext = context
    }

    override fun getView(position: Int, convertView: View?, viewGroup: ViewGroup?): View {
        val layoutInflate = LayoutInflater.from(mContext)
        val row = layoutInflate.inflate(R.layout.list_event_row, viewGroup, false)

        val event_title = row.findViewById<TextView>(R.id.txtEventTitle)
        event_title.text = games.get(position).get("event_title").toString()
        val event_desc = row.findViewById<TextView>(R.id.txtEventDesc)
        event_desc.text = games.get(position).get("event_desc").toString()
        val event_distance = row.findViewById<TextView>(R.id.txtEventDistance)
        event_distance.text = games.get(position).get("event_distance").toString()
        val event_amount_player = row.findViewById<TextView>(R.id.txtEventAmountPlayer)
        val current_player = games.get(position).get("event_current_player")
        val max_player = games.get(position).get("event_max_player")
        event_amount_player.text = "$current_player / $max_player p"
        val event_premium = row.findViewById<TextView>(R.id.txtEventPremium)
        if (games.get(position).get("event_premium") == "premium") {
            event_premium.text = "premium"
        } else {
            event_premium.text = "free"
        }

        return row
    }

    override fun getItem(position: Int): Any {
        val data = JSONObject()
        data.put("event_title", "evento")
        data.put("event_desc", "this is a test event description")
        data.put("event_distance", 1500)
        data.put("event_current_player", 5)
        data.put("event_max_player", 100)
        data.put("event_premium", "free")
        return data
    }

    override fun getItemId(position: Int): Long {
        return position.toLong()
    }

    override fun getCount(): Int {
        return games.size
    }

}
