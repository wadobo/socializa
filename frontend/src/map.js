import React from 'react';
import { browserHistory } from 'react-router'
import { Link } from 'react-router'
import ol from 'openlayers'

import { user, logout } from './auth';


export default class Map extends React.Component {
    state = { user: user }

    componentDidMount() {
      var view = new ol.View({
        center: ol.proj.fromLonLat([37.41, 8.82]),
        zoom: 12
      });

      var map = new ol.Map({
        target: 'socializa-map',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
        ],
        view: view
      });

      var geolocation = new ol.Geolocation({
        projection: view.getProjection()
      });

      // update when the position changes.
      geolocation.on('change', function() {
        accuracy = geolocation.getAccuracy() + ' [m]';
        altitude = geolocation.getAltitude() + ' [m]';
        altitudeAccuracy = geolocation.getAltitudeAccuracy() + ' [m]';
        heading = geolocation.getHeading() + ' [rad]';
        speed = geolocation.getSpeed() + ' [m/s]';
      });

      // handle geolocation error.
      geolocation.on('error', function(error) {
        console.error(error.message);
      });

      var accuracyFeature = new ol.Feature();
      geolocation.on('change:accuracyGeometry', function() {
        accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
      });

      var positionFeature = new ol.Feature();
      positionFeature.setStyle(new ol.style.Style({
        image: new ol.style.Icon({ src: '/app/images/geo1.svg' })
      }));
      positionFeature.customData = {name: 'me'};

      geolocation.on('change:position', function() {
        var coordinates = geolocation.getPosition();
        view.setCenter(coordinates);
        positionFeature.setGeometry(coordinates ?
            new ol.geom.Point(coordinates) : null);
      });

      // my position layer
      new ol.layer.Vector({
        map: map,
        source: new ol.source.Vector({
          //features: [accuracyFeature, positionFeature]
          features: [positionFeature]
        })
      });

      geolocation.setTracking(true);


      var select = new ol.interaction.Select();
      map.addInteraction(select);
      select.on('select', function(e) {
            var f = e.target.getFeatures();
            if (f.getLength()) {
                console.log(f.getArray()[0]);
                console.log(f.getArray()[0].customData.name);
            }
      });
    }

    render() {
        return (
            <div id="socializa-map">
            </div>
        );
    }
}
