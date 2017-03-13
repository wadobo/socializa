var map = null;
var features = null;
var format = new ol.format.GeoJSON();

function updateInput(ev) {
    if (ev && ev.feature) {
        var f = format.writeFeature(ev.feature, {featureProjection: 'EPSG:3857'});
        $("#mapinput").val(f);
    }
}

function showmap() {
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

    features = new ol.Collection();
    var featureOverlay = new ol.layer.Vector({
      source: new ol.source.Vector({features: features}),
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(19, 167, 0, 0.3)'
        }),
        stroke: new ol.style.Stroke({
          color: '#13A700',
          width: 2
        }),
        image: new ol.style.Circle({
          radius: 7,
          fill: new ol.style.Fill({
            color: '#13A700'
          })
        })
      })
    });
    featureOverlay.setMap(map);

    var draw = new ol.interaction.Draw({
      features: features,
      type: 'Polygon'
    });
    map.addInteraction(draw);

    draw.on('drawend', updateInput);
}

$(document).ready(function() {
    showmap();
    $("#clearmap").click(function() {
        if (features) {
            features.clear();
            $("#mapinput").val("");
        }
        return false;
    });
});
