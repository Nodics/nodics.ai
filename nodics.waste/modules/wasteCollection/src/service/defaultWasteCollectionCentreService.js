/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCollection/src/service/defaultWasteCollectionCentreService @description Searches Waste-owned collection-centre contracts through role-aware enterprise associations. @layer service @owner wasteCollection */
module.exports = {
    /** Throws a Nodics-compatible error when available. */
    fail: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = code;
        throw error;
    },

    /** Returns the generated collection-point persistence service. */
    repository: function () {
        if (typeof SERVICE === 'undefined' || !SERVICE.DefaultWasteCollectionPointService) {
            this.fail('ERR_WASTE_COLLECTION_POINT_REPOSITORY_REQUIRED', 'Waste collection point persistence service is required');
        }
        return SERVICE.DefaultWasteCollectionPointService;
    },

    /** Returns the collection-point model when the runtime exposes direct model reads. */
    model: function (tenant) {
        if (typeof NODICS === 'undefined' || !NODICS.getModels) return undefined;
        let models = NODICS.getModels('wasteCollection', tenant);
        return models && models.WasteCollectionPointModel;
    },

    /** Unwraps generated service responses into an array. */
    records: function (response) {
        let value = response;
        for (let index = 0; index < 4 && value && typeof value === 'object' && !Array.isArray(value); index++) {
            if (value.result !== undefined) {
                value = value.result;
                continue;
            }
            if (value.data !== undefined) {
                value = value.data;
                continue;
            }
            break;
        }
        if (!value) return [];
        if (value.records && Array.isArray(value.records)) return value.records;
        if (value.items && Array.isArray(value.items)) return value.items;
        return Array.isArray(value) ? value : [value];
    },

    /** Reads a reference code from the standard Nodics reference shape. */
    refCode: function (value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) return '';
        return String(value.code || value.ref || value.id || '').trim();
    },

    /** Reads display text without making identifiers mutable. */
    text: function (value) {
        return typeof value === 'string' ? value.trim() : '';
    },

    /** Reads localized display text when records use locale maps. */
    localizedText: function (value) {
        if (typeof value === 'string') return value.trim();
        if (!value || typeof value !== 'object' || Array.isArray(value)) return '';
        let direct = value.en || value.default;
        if (typeof direct === 'string' && direct.trim()) return direct.trim();
        let first = Object.values(value).find(item => typeof item === 'string' && item.trim());
        return typeof first === 'string' ? first.trim() : '';
    },

    /** Returns unique non-empty codes in stable encounter order. */
    uniqueCodes: function (codes) {
        return Array.from(new Set((codes || []).map(code => String(code || '').trim()).filter(Boolean)));
    },

    /** Indexes records by code. */
    byCode: function (records) {
        let map = new Map();
        (records || []).forEach(record => {
            if (record && record.code) map.set(String(record.code), record);
        });
        return map;
    },

    /** Invokes another Nodics module through the governed module service. */
    invokeModule: function (options) {
        if (typeof SERVICE === 'undefined' || !SERVICE.DefaultModuleService ||
            typeof SERVICE.DefaultModuleService.invokeModule !== 'function') {
            return Promise.reject(new Error('DefaultModuleService is required for collection-centre enrichment'));
        }
        return SERVICE.DefaultModuleService.invokeModule(options);
    },

    /** Resolves Location-owned records through DefaultModuleService. */
    loadLocations: function (context, codes) {
        codes = this.uniqueCodes(codes);
        if (codes.length === 0) return Promise.resolve([]);
        return Promise.all(codes.map(code => this.invokeModule({
            moduleName: 'locationCore',
            connectionName: 'location',
            serviceName: 'DefaultLocationOperationService',
            operationName: 'read',
            apiName: '/locations/' + encodeURIComponent(code),
            methodName: 'GET',
            request: {
                tenant: context.tenant,
                authData: context.authData,
                locationCode: code
            },
            responseSelector: response => this.records(response)[0]
        }))).then(locations => locations.filter(Boolean));
    },

    /** Resolves Profile-owned records through DefaultModuleService. */
    loadProfileRecords: function (context, schemaName, codes) {
        codes = this.uniqueCodes(codes);
        if (codes.length === 0) return Promise.resolve([]);
        return this.invokeModule({
            local: false,
            moduleName: typeof CONFIG !== 'undefined' && CONFIG.get && CONFIG.get('profileModuleName') || 'profile',
            connectionName: 'profile',
            apiName: '/references/read',
            methodName: 'POST',
            request: {
                tenant: context.tenant,
                authData: context.authData
            },
            requestBody: {
                type: schemaName,
                codes: codes
            },
            responseSelector: response => this.records(response)
        });
    },

    /** Adds Location/Profile projections while preserving Waste as the API owner. */
    enrich: async function (records, context) {
        let unavailableSources = [];
        let locationCodes = this.uniqueCodes(records.map(record => this.refCode(record.locationRef)));
        let locations = [];
        try {
            locations = await this.loadLocations(context, locationCodes);
        } catch (error) {
            unavailableSources.push('locationCore:location');
        }
        let locationsByCode = this.byCode(locations);
        let addressCodes = this.uniqueCodes(locations.map(location => this.refCode(location.addressRef)));
        let addresses = [];
        try {
            addresses = await this.loadProfileRecords(context, 'address', addressCodes);
        } catch (error) {
            unavailableSources.push('profile:address');
        }
        let enterpriseCodes = this.uniqueCodes(records.flatMap(record => [
            this.refCode(record.operatorEnterpriseRef),
            this.refCode(record.assetOwnerEnterpriseRef)
        ]));
        let enterprises = [];
        try {
            enterprises = await this.loadProfileRecords(context, 'enterprise', enterpriseCodes);
        } catch (error) {
            unavailableSources.push('profile:enterprise');
        }
        let addressesByCode = this.byCode(addresses);
        let enterprisesByCode = this.byCode(enterprises);
        return {
            records: records.map(record => {
                let location = locationsByCode.get(this.refCode(record.locationRef));
                let address = location ? addressesByCode.get(this.refCode(location.addressRef)) : undefined;
                let operatorEnterpriseCode = this.refCode(record.operatorEnterpriseRef);
                let assetOwnerEnterpriseCode = this.refCode(record.assetOwnerEnterpriseRef);
                let operatorEnterprise = enterprisesByCode.get(operatorEnterpriseCode);
                let assetOwnerEnterprise = enterprisesByCode.get(assetOwnerEnterpriseCode);
                return Object.assign({}, record, {
                    location: location,
                    address: address,
                    operatorEnterprise: operatorEnterprise,
                    assetOwnerEnterprise: assetOwnerEnterprise,
                    operatorEnterpriseName: this.localizedText(operatorEnterprise && operatorEnterprise.name) || operatorEnterpriseCode,
                    assetOwnerEnterpriseName: this.localizedText(assetOwnerEnterprise && assetOwnerEnterprise.name) || assetOwnerEnterpriseCode,
                    addressCode: address && address.code || location && this.refCode(location.addressRef) || '',
                    addressLine: address && (this.text(address.addressLine1) || this.text(address.addressLine2)) || '',
                    city: address && this.text(address.city) || '',
                    countryCode: address && this.text(address.countryCode) || '',
                    latitude: location && location.latitude !== undefined ? location.latitude : address && address.latitude,
                    longitude: location && location.longitude !== undefined ? location.longitude : address && address.longitude
                });
            }),
            sourceCounts: {
                collectionPoints: records.length,
                locations: locations.length,
                addresses: addresses.length,
                enterprises: enterprises.length
            },
            unavailableSources: unavailableSources
        };
    },

    /** Builds runtime context for generated service calls. */
    context: function (request) {
        request = request || {};
        let tenant = request.tenant || request.authData && request.authData.tenant;
        if (!tenant) this.fail('ERR_WASTE_COLLECTION_CENTRE_RUNTIME_TENANT_REQUIRED', 'Runtime tenant context is required');
        return { tenant: tenant, authData: request.authData };
    },

    /** Converts shorthand filter names into persistence query fields. */
    query: function (filters) {
        filters = filters || {};
        if (filters.tenant !== undefined || filters.tenantCode !== undefined) {
            this.fail('ERR_WASTE_COLLECTION_CENTRE_TENANT_FILTER_INVALID', 'Tenant is runtime context, not collection-centre business ownership');
        }
        let query = {};
        ['code', 'collectionPointType', 'operatingStatus', 'publicVisibility', 'status'].forEach(field => {
            if (filters[field] !== undefined && filters[field] !== '') query[field] = filters[field];
        });
        if (filters.active !== undefined) {
            if (typeof filters.active !== 'boolean') this.fail('ERR_WASTE_COLLECTION_CENTRE_ACTIVE_FILTER_INVALID', 'Active must be a boolean');
            query.active = filters.active;
        }
        if (filters.operatorEnterpriseCode) query['operatorEnterpriseRef.code'] = filters.operatorEnterpriseCode;
        if (filters.assetOwnerEnterpriseCode) query['assetOwnerEnterpriseRef.code'] = filters.assetOwnerEnterpriseCode;
        if (filters.locationCode) query['locationRef.code'] = filters.locationCode;
        return query;
    },

    /** Returns a bounded page-size value. */
    pageSize: function (value) {
        let pageSize = Number(value || 25);
        if (!Number.isInteger(pageSize)) pageSize = 25;
        return Math.min(Math.max(pageSize, 1), 100);
    },

    /** Returns a bounded page-number value. */
    pageNumber: function (value) {
        let pageNumber = Number(value || 1);
        if (!Number.isInteger(pageNumber)) pageNumber = 1;
        return Math.max(pageNumber, 1);
    },

    /** Searches collection-centre records by safe Waste-owned filters. */
    search: async function (request) {
        let context = this.context(request);
        let payload = request && request.payload || {};
        let filters = Object.assign({}, request && request.query || {}, payload.filters || {});
        let pageSize = this.pageSize(filters.pageSize || filters.limit || payload.pageSize || payload.limit);
        let pageNumber = this.pageNumber(filters.pageNumber || payload.pageNumber);
        delete filters.limit;
        delete filters.pageSize;
        delete filters.pageNumber;
        let query = this.query(filters);
        let searchOptions = { pageSize: pageSize, pageNumber: pageNumber };
        let model = this.model(context.tenant);
        let response = model && typeof model.getItems === 'function'
            ? await model.getItems(Object.assign({}, context, {
                query: query,
                searchOptions: searchOptions,
                options: { recursive: false, skipItemCache: true }
            }))
            : await this.repository().get(Object.assign({}, context, {
                query: query,
                searchOptions: searchOptions,
                options: { recursive: false, skipItemCache: true }
            }));
        let records = this.records(response);
        let enrichment = await this.enrich(records, context);
        return {
            records: enrichment.records,
            totalCount: response && Number.isInteger(response.totalCount) ? response.totalCount : records.length,
            pageNumber: pageNumber,
            pageSize: pageSize,
            sourceCounts: enrichment.sourceCounts,
            unavailableSources: enrichment.unavailableSources
        };
    }
};
