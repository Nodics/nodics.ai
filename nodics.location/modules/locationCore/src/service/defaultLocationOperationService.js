/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const ADDRESS_FIELDS = [
    'flatNo',
    'building',
    'street',
    'addressLine1',
    'addressLine2',
    'locality',
    'city',
    'state',
    'postalCode',
    'countryCode',
    'landmarkHint',
    'accessNotes',
    'geocodingProvider',
    'geocodingReference',
    'geocodingPrecision',
    'geocodingConfidence',
    'verificationStatus',
    'verificationSource',
    'verifiedByRef',
    'verifiedAt',
    'displayPolicy'
];

/** @module locationCore/src/service/defaultLocationOperationService @description Validates and delegates reusable Location operations to generated persistence services. @layer service @owner locationCore */
module.exports = {
    /** Throws a Nodics-compatible error when available. */
    fail: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = code;
        throw error;
    },

    /** Returns the generated persistence service for location records. */
    repository: function () {
        if (typeof SERVICE === 'undefined' || !SERVICE.DefaultLocationService) {
            this.fail('ERR_LOCATION_REPOSITORY_REQUIRED', 'Location persistence service is required');
        }
        return SERVICE.DefaultLocationService;
    },

    /** Normalizes and validates one coordinate. */
    coordinate: function (value, field, min, max) {
        if (value === undefined || value === null || value === '') this.fail('ERR_LOCATION_COORDINATE_REQUIRED', field + ' is required');
        let numeric = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(numeric) || numeric < min || numeric > max) {
            this.fail('ERR_LOCATION_COORDINATE_INVALID', field + ' must be a number between ' + min + ' and ' + max);
        }
        return numeric;
    },

    /** Ensures a reference is present and structurally usable. */
    requireRef: function (value, field) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) this.fail('ERR_LOCATION_REFERENCE_REQUIRED', field + ' reference is required');
        if (!value.code && !value.id && !value.ref && !value.schemaName) this.fail('ERR_LOCATION_REFERENCE_INVALID', field + ' reference must identify a target');
        return value;
    },

    /** Validates source references without tenant or transport leakage. */
    validateSourceRef: function (sourceRef) {
        this.requireRef(sourceRef, 'sourceRef');
        ['tenant', 'tenantCode', 'environment', 'server', 'provider', 'routePath'].forEach(field => {
            if (sourceRef[field] !== undefined) this.fail('ERR_LOCATION_SOURCE_REF_INVALID', 'sourceRef must not encode ' + field);
        });
        return sourceRef;
    },

    /** Rejects address facts that belong in Profile address/contact. */
    assertNoProfileAddressFields: function (model) {
        ADDRESS_FIELDS.forEach(field => {
            if (model[field] !== undefined) this.fail('ERR_LOCATION_ADDRESS_FIELD_DUPLICATED', 'Location must reference Profile address instead of storing ' + field);
        });
        if (model.coordinates !== undefined) this.fail('ERR_LOCATION_COORDINATE_ARRAY_INVALID', 'Location coordinates must be separate latitude and longitude fields');
    },

    /** Builds the canonical location model accepted by Location Core. */
    model: function (payload) {
        let model = Object.assign({}, payload || {});
        if (model.tenant !== undefined || model.tenantCode !== undefined) this.fail('ERR_LOCATION_TENANT_FIELD_INVALID', 'Tenant is runtime context, not Location business ownership');
        this.assertNoProfileAddressFields(model);
        if (!model.code) this.fail('ERR_LOCATION_CODE_REQUIRED', 'Location code is required');
        if (!model.name) this.fail('ERR_LOCATION_NAME_REQUIRED', 'Location name is required');
        if (!model.categoryCode) this.fail('ERR_LOCATION_CATEGORY_REQUIRED', 'Location categoryCode is required');
        if (!model.typeCode) this.fail('ERR_LOCATION_TYPE_REQUIRED', 'Location typeCode is required');
        model.latitude = this.coordinate(model.latitude, 'latitude', -90, 90);
        model.longitude = this.coordinate(model.longitude, 'longitude', -180, 180);
        model.addressRef = this.requireRef(model.addressRef, 'addressRef');
        model.sourceRef = this.validateSourceRef(model.sourceRef);
        model.visibility = model.visibility || { audiences: ['BACKOFFICE'] };
        model.status = model.status || 'DRAFT';
        model.revision = model.revision === undefined ? 0 : Number(model.revision);
        if (!Number.isInteger(model.revision) || model.revision < 0) this.fail('ERR_LOCATION_REVISION_INVALID', 'Location revision must be a non-negative integer');
        return model;
    },

    /** Builds runtime context for generated service calls. */
    context: function (request) {
        request = request || {};
        let tenant = request.tenant || request.authData && request.authData.tenant;
        if (!tenant) this.fail('ERR_LOCATION_RUNTIME_TENANT_REQUIRED', 'Runtime tenant context is required');
        return { tenant: tenant, authData: request.authData };
    },

    /** Creates a validated location through generated persistence. */
    create: function (request) {
        let context = this.context(request);
        return this.repository().save(Object.assign({}, context, { model: this.model(request && request.payload || request && request.model) }));
    },

    /** Updates a validated location through generated persistence. */
    update: function (request) {
        let context = this.context(request);
        let payload = Object.assign({}, request && request.payload || request && request.model || {});
        payload.code = request && request.params && request.params.locationCode || payload.code;
        let model = this.model(payload);
        return this.repository().update(Object.assign({}, context, { query: { code: model.code }, model: { $set: model } }));
    },

    /** Reads one location by code. */
    read: function (request) {
        let context = this.context(request);
        let code = request && request.params && request.params.locationCode || request && request.locationCode || request && request.code;
        if (typeof code !== 'string' || !code.trim() || code.length > 191) this.fail('ERR_LOCATION_CODE_REQUIRED', 'Location code is required');
        context = this.readContext(context);
        return this.repository().get(Object.assign({}, context, { query: { code: code }, searchOptions: { limit: 1 } }));
    },

    /** Authorizes a scoped runtime read before using the Location owner's private persistence actor. */
    readContext: function (context) {
        const auth = context.authData || {};
        if (!auth.runtimeScope) return context;
        if (auth.tokenType !== 'service' || auth.principalType !== 'service' || !auth.runtimeScope.instanceCode ||
            auth.tenant !== context.tenant || !Array.isArray(auth.modules) || !auth.modules.includes('locationCore') ||
            !Array.isArray(auth.permissions) || !auth.permissions.includes('location.location.read')) {
            this.fail('ERR_AUTH_00003', 'Location read requires an approved runtime scope and permission');
        }
        return { tenant: context.tenant, authData: { tenant: context.tenant,
            principalId: 'locationReferenceRead', loginId: 'locationReferenceRead', principalType: 'service',
            userGroups: ['serviceAccountUserGroup'] } };
    },

    /** Searches locations by safe Location-owned filters. */
    search: function (request) {
        let context = this.context(request);
        let filters = Object.assign({}, request && request.query || {}, request && request.payload && request.payload.filters || {});
        delete filters.tenant;
        delete filters.tenantCode;
        let allowed = ['code', 'categoryCode', 'typeCode', 'status', 'parentLocationCode'];
        let query = {};
        allowed.forEach(field => {
            if (filters[field] !== undefined) query[field] = filters[field];
        });
        let limit = Math.min(Math.max(Number(filters.limit || 25), 1), 100);
        return this.repository().get(Object.assign({}, context, { query: query, searchOptions: { limit: limit } }));
    }
};
