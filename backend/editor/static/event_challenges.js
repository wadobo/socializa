var map = null;
var selectedPosInput = null;

function pointSelected(evt) {
    var c = evt.coordinate;
    var p = new ol.proj.transform([c[0], c[1]], 'EPSG:3857', 'EPSG:4326');
    selectedPosInput.val("" + p[1] + ", " + p[0]);
    $("#posModal").modal("hide");
}

function showmap() {
    selectedPosInput = $(this).parent().parent().find(".pos");
    $("#posModal").modal("show");
    if (!map) {
        setTimeout(function() {
            map = new ol.Map({
              target: 'map',
              layers: [
                new ol.layer.Tile({
                  source: new ol.source.OSM()
                })
              ],
              view: new ol.View({
                center: ol.proj.fromLonLat([-5.9866369, 37.3580539]),
                zoom: 14
              })
            });

            var geocoder = new Geocoder('nominatim', {
              provider: 'osm',
              //key: '__some_key__',
              lang: 'es-ES',
              placeholder: 'Search for ...',
              targetType: 'text-input',
              limit: 5,
              keepOpen: true
            });
            map.addControl(geocoder);

            map.on("singleclick", pointSelected);
        }, 500);
    }
    return false;
}

function ctypeChange() {
    var id = $(this).data("id");
    var value = $(this).val();
    if (value == 'ai') {
        $("#ai_"+id).show();
        $("#actor_"+id).hide();
    } else {
        $("#ai_"+id).hide();
        $("#actor_"+id).show();
    }
}

function autocomplete() {
    var q = $(this).val();
    var input = $(this);
    input.popover("destroy");

    if (q.length < 3) {
        return;
    }

    $.post("/editor/ajax/player/", {q: q}, function(response) {
        var options = "";
        response.forEach(function(p) {
            options += '<li class="list-group-item selectPlayer">' + p.username + '</li>';
        });

        setTimeout(function() {
            input.popover({
                title: "players",
                html: true,
                content: '<ul class="list-group">' + options + '</ul>',
                trigger: "manual"
            });

            input.popover("show");

            $(".selectPlayer").click(function() {
                input.val($(this).html());
                input.popover("hide");
            });
        }, 200);
    });
}

$(document).ready(function() {
    $(".mapbtn").click(showmap);
    $(".ctype").change(ctypeChange);
    $(".ctype").each(ctypeChange);

    $(".player").keyup(autocomplete);
});
