/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module locationMap/src/service/defaultLocationMapCoordinateAdapterService @description Translates domain latitude/longitude objects to provider coordinate arrays at the map boundary. @layer service @owner locationMap */
module.exports = {
    /** Throws a Nodics-compatible error when available. */
    fail: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = code;
        throw error;
    },

    /** Normalizes a latitude or longitude number with bounds. */
    coordinate: function (value, field, min, max) {
        let numeric = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(numeric) || numeric < min || numeric > max) {
            this.fail('ERR_LOCATION_MAP_COORDINATE_INVALID', field + ' must be a number between ' + min + ' and ' + max);
        }
        return numeric;
    },

    /** Returns a domain coordinate object with named fields. */
    domainPoint: function (value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            this.fail('ERR_LOCATION_MAP_DOMAIN_POINT_INVALID', 'Domain point must provide latitude and longitude fields');
        }
        return Object.freeze({
            latitude: this.coordinate(value.latitude, 'latitude', -90, 90),
            longitude: this.coordinate(value.longitude, 'longitude', -180, 180)
        });
    },

    /** Converts a domain point into a GeoJSON/Mapbox provider position. */
    toProviderPosition: function (value) {
        let point = this.domainPoint(value);
        return Object.freeze([point.longitude, point.latitude]);
    },

    /** Converts a GeoJSON/Mapbox provider position into a named domain point. */
    fromProviderPosition: function (value) {
        if (!Array.isArray(value) || value.length < 2) {
            this.fail('ERR_LOCATION_MAP_PROVIDER_POSITION_INVALID', 'Provider position must be [longitude, latitude]');
        }
        return this.domainPoint({ latitude: value[1], longitude: value[0] });
    },

    /** Converts a domain point into a GeoJSON Point feature fragment. */
    toGeoJsonPoint: function (value) {
        return Object.freeze({ type: 'Point', coordinates: this.toProviderPosition(value) });
    },

    /** Converts a GeoJSON Point feature fragment into a named domain point. */
    fromGeoJsonPoint: function (value) {
        if (!value || typeof value !== 'object' || Array.isArray(value) || value.type !== 'Point') {
            this.fail('ERR_LOCATION_MAP_GEOJSON_POINT_INVALID', 'GeoJSON point must be a Point object');
        }
        return this.fromProviderPosition(value.coordinates);
    }
};
