var map = null;
var selectedPosInput = null;

function addchallenge() {
    var ch = $(".orig_challenge").last().clone();
    var n = parseInt(ch.attr("n"), 10);
    n += 1;

    ch.attr("id", "challenge_"+n);
    ch.attr("n", n);
    ch.find(".n").html(n);
    ch.find(".rmchallenge").attr("n", n).removeClass("hidden");

    ch.find(".name").attr("name", "challenge_name_"+n);
    ch.find(".desc").attr("name", "challenge_desc_"+n);
    ch.find(".type").attr("name", "challenge_type_"+n);
    ch.find(".pos").attr("name", "challenge_pos_"+n);

    $("#challenges").append(ch);

    $(".rmchallenge").unbind("click").click(rmchallenge);
    $(".mapbtn").unbind("click").click(showmap);
    return false;
}

function rmchallenge() {
    var n = $(this).attr("n");
    $("#challenge_"+n).remove();
    return false;
}

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

$(document).ready(function() {
    $("#addchallenge").click(addchallenge);
    $(".mapbtn").click(showmap);
    $(".rmchallenge").unbind("click").click(rmchallenge);
});
