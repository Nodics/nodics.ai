/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const crypto = require('node:crypto');

/** @module discoveryProjection/service/defaultDiscoveryDocumentBuilderService @description Builds normalized generic Discovery document projections from safe domain payloads. @layer service @owner discoveryProjection */
module.exports = {
    queryMetadataFields: [
        'site',
        'pageType',
        'slot',
        'targetType',
        'targetCode',
        'channel',
        'device',
        'region',
        'publicationStatus',
        'deliveryStatus',
        'specificity',
        'priority',
        'release',
        'indexVersion'
    ],

    /** Hashes a payload deterministically. @param {Object} payload Payload. @returns {string} Hash. */
    hash: function (payload) {
        return crypto.createHash('sha256').update(JSON.stringify(payload || {})).digest('hex');
    },

    /** Builds one generic document projection. @param {Object} request Build request. @returns {Object} Projection. */
    build: function (request) {
        let now = request.projectedAt || new Date();
        let payload = request.payload || {};
        let document = {
            code: request.code || [request.ownerType, request.ownerCode, request.indexConfigurationCode, request.storeCode, request.locale].filter(Boolean).join('|'),
            tenant: request.tenant,
            ownerType: request.ownerType,
            ownerCode: request.ownerCode,
            indexConfigurationCode: request.indexConfigurationCode,
            storeCode: request.storeCode,
            locale: request.locale,
            status: request.status || 'CURRENT',
            payload: payload,
            sourceHash: request.sourceHash || this.hash(payload),
            projectedAt: now,
            active: request.active !== false,
            created: request.created || now,
            updated: request.updated || now
        };
        this.queryMetadataFields.forEach(field => {
            if (request[field] !== undefined && request[field] !== null) {
                document[field] = request[field];
            }
        });
        return document;
    }
};
