import React from 'react';
import { hashHistory } from 'react-router'
import { Link } from 'react-router'
import ol from 'openlayers'

import { user, logout } from './auth';
import API from './api';


export default class Map extends React.Component {
    state = { user: user, state: 'stopped' }

    componentDidMount() {
      this.view = new ol.View({
        center: ol.proj.fromLonLat([37.41, 8.82]),
        zoom: 12
      });

      this.map = new ol.Map({
        target: 'socializa-map',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
        ],
        view: this.view
      });

      this.startGeolocation();

      $('canvas').height($(window).height() - 120);
      this.map.updateSize();
    }

    startGeolocation() {
      var view = this.view;
      var map = this.map;

      var geolocation = new ol.Geolocation({
        projection: view.getProjection()
      });

      this.geolocation = geolocation;
      window.map = map;
      window.geo = geolocation;

      // update when the position changes.
      geolocation.on('change', function() {
        var accuracy = geolocation.getAccuracy() + ' [m]';
        var altitude = geolocation.getAltitude() + ' [m]';
        var altitudeAccuracy = geolocation.getAltitudeAccuracy() + ' [m]';
        var heading = geolocation.getHeading() + ' [rad]';
        var speed = geolocation.getSpeed() + ' [m/s]';

        var coordinates = geolocation.getPosition();
        var lonlat = ol.proj.toLonLat(coordinates);
        API.setPos(lonlat[1], lonlat[0], user.apikey);
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
        image: new ol.style.Icon({ src: 'app/images/geo1.svg' })
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

    start = (e) => {
        this.geolocation.setTracking(true);
        this.view.setZoom(18);
        this.setState({ state: 'started' });
    }

    stop = (e) => {
        this.geolocation.setTracking(false);
        this.setState({ state: 'stopped' });
    }

    render() {
        return (
            <div>
                <div id="socializa-map">
                </div>

                {(
                    () => {
                        switch (this.state.state) {
                            case 'started':
                                return <button className="btn btn-block btn-danger" onClick={ this.stop }>Stop</button>
                            default:
                                return <button className="btn btn-block btn-success" onClick={ this.start }>Start</button>
                        }
                    }
                )()}

            </div>
        );
    }
}
