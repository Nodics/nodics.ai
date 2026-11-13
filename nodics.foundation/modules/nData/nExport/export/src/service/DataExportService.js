/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.foundation/modules/nData/nExport/export/src/service/DataExportService
 * @description Implements nExport source read, transformation, rendering, and generated-media creation behavior.
 * @layer service
 * @owner nExport
 * @override Project modules may override export behavior through later active modules while preserving media-owned media lookup, access policy, and download delivery.
 */
const crypto = require('crypto');

module.exports = {
    /**
     * Initializes the data export service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Finalizes the data export service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Executes a governed schema export through existing read contracts and
     * media-owned generated-file storage.
     *
     * @param {Object} request Export request.
     * @returns {Promise<Object>} Export media and execution summary.
     */
    export: async function (request) {
        let payload = this.normalizeRequest(request);
        let descriptor = await this.resolveSchemaDescriptor(request, payload);
        let records = await this.collectRecords(request, payload, descriptor);
        let schemaModel = this.resolveSchemaModel(request, payload);
        let exportRecords = await this.applyExportAccessPolicies(
            Object.assign({}, request, {
                moduleName: payload.moduleName,
                schemaModel: schemaModel,
            }),
            records,
        );
        let provenance = this.buildProvenance(request, payload, descriptor, exportRecords.length);
        let rendered = this.render(payload, exportRecords, descriptor, provenance);
        let media = await this.storeMedia(request, payload, rendered);
        return {
            code: 'SUC_SYS_00000',
            data: {
                moduleName: payload.moduleName,
                schemaName: payload.schemaName,
                format: payload.format,
                fileName: rendered.fileName,
                media: this.projectMedia(media),
                provenance: Object.assign({}, provenance, {
                    checksumAlgorithm: 'SHA-256',
                    checksum: rendered.checksum,
                }),
                summary: {
                    requestedRecords: records.length,
                    exportedRecords: exportRecords.length,
                    totalAvailableRecords: records.totalCount || exportRecords.length,
                    truncated: records.truncated === true,
                },
            },
        };
    },

    /**
     * Reports generation availability without reading records, invoking policy
     * providers, or creating an artifact. Route authorization remains independent.
     *
     * @param {Object} request Trusted secured runtime request; caller settings are not used.
     * @returns {Promise<Object>} Versioned, client-safe runtime availability evidence.
     */
    workspace: function (request) {
        if (request) this.resolveEnterpriseCode(request);
        let data = {
            contractVersion: 1,
            kind: 'GOVERNED_EXPORT',
            availability: 'UNAVAILABLE',
            formats: [],
            reason: 'Export availability could not be verified. Refresh its current status.'
        };
        try {
            let config = this.getConfiguration();
            data.formats = Array.isArray(config.allowedFormats)
                ? Array.from(new Set(config.allowedFormats.filter(format => ['csv', 'json'].includes(format)))) : [];
            let exposure = CONFIG && CONFIG.get ? CONFIG.get('apiExposure') || {} : {};
            if (typeof config.enabled !== 'boolean') {
                data.reason = 'Export availability could not be verified. Refresh its current status.';
            } else if (config.enabled === false || exposure.categories?.dataExport?.enabled !== true) {
                data.availability = 'DISABLED';
                data.reason = 'File export is not enabled in this workspace.';
            } else {
                let methods = [
                    ['DefaultSchemaUtilityService', 'getSchema'],
                    ['DefaultSchemaSafeQueryService', 'searchGenerated'],
                    ['DefaultSchemaReadAccessPolicyService', 'applyExportPolicies'],
                    ['DefaultMediaUploadService', 'upload']
                ];
                let collaboratorsAvailable = typeof SERVICE !== 'undefined' && methods.every(([name, method]) =>
                    SERVICE[name] && typeof SERVICE[name][method] === 'function');
                if (data.formats.length && collaboratorsAvailable) {
                    data.availability = 'AVAILABLE';
                    delete data.reason;
                } else {
                    data.reason = 'File export is unavailable. Ask your administrator to check this workspace.';
                }
            }
        } catch (_) {
            data.formats = [];
        }
        return Promise.resolve({ code: 'SUC_SYS_00000', data: data });
    },

    /**
     * Returns governed export history by projecting generated export media.
     * Media remains the storage and download authority; nExport owns the
     * export-run projection shown to BackOffice clients.
     *
     * @param {Object} request History request.
     * @returns {Promise<Object>} Export history records.
     */
    history: async function (request) {
        if (!SERVICE.DefaultMediaService || typeof SERVICE.DefaultMediaService.get !== 'function') {
            throw new CLASSES.NodicsError('ERR_EXP_00001', 'media service is required for export history');
        }
        let config = this.getConfiguration();
        let mediaConfig = config.media || {};
        let query = this.getHistoryQuery(request, mediaConfig);
        const limit = this.resolveHistoryLimit(request);
        const skip = this.resolveHistorySkip(request);
        const pageNumber = Math.floor(skip / limit) + 1;
        const pageOffset = skip % limit;
        const readPage = (page) => SERVICE.DefaultMediaService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: query,
            searchOptions: {
                pageSize: limit,
                pageNumber: page,
                sort: { created: -1, code: -1 },
                projection: {
                    code: 1,
                    name: 1,
                    description: 1,
                    folderCode: 1,
                    formatCode: 1,
                    originalFileName: 1,
                    mimeType: 1,
                    extension: 1,
                    sizeBytes: 1,
                    checksum: 1,
                    checksumAlgorithm: 1,
                    enterpriseCode: 1,
                    ownerReference: 1,
                    status: 1,
                    created: 1,
                    createdBy: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
        });
        let records = this.items(await readPage(pageNumber));
        if (pageOffset && records.length === limit) {
            records = records.concat(this.items(await readPage(pageNumber + 1)));
        }
        return {
            code: 'SUC_SYS_00000',
            data: records.slice(pageOffset, pageOffset + limit).map((media) => this.projectHistoryMedia(media)),
        };
    },

    /**
     * Normalizes and validates the browser-safe export request.
     *
     * @param {Object} request Runtime request.
     * @returns {Object} Bounded export payload.
     */
    normalizeRequest: function (request) {
        let config = this.getConfiguration();
        if (config.enabled !== true) {
            throw new CLASSES.NodicsError('ERR_EXP_00001', 'Data export is disabled by configuration');
        }
        let body = (request && request.export) || {};
        let moduleName = this.safeCode(body.moduleName, 'Export module');
        let schemaName = this.safeCode(body.schemaName, 'Export schema');
        let format = String(body.format || config.defaultFormat || 'csv')
            .trim()
            .toLowerCase();
        if (!config.allowedFormats.includes(format)) {
            throw new CLASSES.NodicsError('ERR_EXP_00001', 'Requested export file type is not supported');
        }
        let query = body.query && typeof body.query === 'object' && !Array.isArray(body.query) ? body.query : {};
        let pageSize = Number(config.pageSize || 50);
        if (!Number.isInteger(pageSize) || pageSize < 1) pageSize = 50;
        let maximumRecords = Number(config.maximumRecords || 1000);
        if (!Number.isInteger(maximumRecords) || maximumRecords < 1) maximumRecords = 1000;
        let authenticatedEnterpriseCode = this.resolveEnterpriseCode(request);
        let requestedEnterpriseCode = this.safeOptionalCode(body.enterpriseCode);
        if (requestedEnterpriseCode && authenticatedEnterpriseCode && requestedEnterpriseCode !== authenticatedEnterpriseCode) {
            throw new CLASSES.NodicsError('ERR_EXP_00001', 'Cross-enterprise export is not permitted');
        }
        return {
            moduleName: moduleName,
            schemaName: schemaName,
            enterpriseCode: requestedEnterpriseCode || authenticatedEnterpriseCode,
            format: format,
            query: {
                search: typeof query.search === 'string' ? query.search : '',
                filters: query.filters,
                sort: query.sort,
            },
            pageSize: pageSize,
            maximumRecords: maximumRecords,
        };
    },

    /**
     * Resolves the active data export configuration.
     *
     * @returns {Object} Export configuration.
     */
    getConfiguration: function () {
        return Object.assign(
            {
                enabled: true,
                allowedFormats: ['csv', 'json'],
                defaultFormat: 'csv',
                maximumRecords: 1000,
                pageSize: 50,
                media: {
                    folderCode: 'exportFiles',
                    formatCode: 'exportFile',
                },
            },
            CONFIG && CONFIG.get ? CONFIG.get('dataExport') || {} : {},
        );
    },

    /**
     * Resolves a client-safe descriptor from the existing shared Schema Utility owner.
     *
     * @param {Object} request Runtime request.
     * @param {Object} payload Normalized export payload.
     * @returns {Promise<Object>} Shared client-safe schema descriptor.
     */
    resolveSchemaDescriptor: async function (request, payload) {
        if (!SERVICE.DefaultSchemaUtilityService || typeof SERVICE.DefaultSchemaUtilityService.getSchema !== 'function') {
            throw new CLASSES.NodicsError('ERR_EXP_00001', 'Schema utility service is required for governed exports');
        }
        let response = await SERVICE.DefaultSchemaUtilityService.getSchema(this.buildSchemaRequest(request, payload, {}), payload.schemaName);
        return response.data || response.result || response;
    },

    /**
     * Collects bounded records through the same safe-query owner used by generated APIs.
     *
     * @param {Object} request Runtime request.
     * @param {Object} payload Normalized export payload.
     * @param {Object} descriptor Schema descriptor.
     * @param {Object} provenance Export provenance.
     * @returns {Promise<Object[]>} Export candidate records.
     */
    collectRecords: async function (request, payload, descriptor) {
        if (!SERVICE.DefaultSchemaSafeQueryService || typeof SERVICE.DefaultSchemaSafeQueryService.searchGenerated !== 'function') {
            throw new CLASSES.NodicsError('ERR_EXP_00001', 'Schema safe search is required for governed exports');
        }
        let records = [];
        let totalCount = 0;
        let pageNumber = 1;
        let pageSize = this.resolvePageSize(payload.pageSize, descriptor);
        while (records.length < payload.maximumRecords) {
            let response = await SERVICE.DefaultSchemaSafeQueryService.searchGenerated(
                this.buildSchemaRequest(
                    request,
                    payload,
                    Object.assign({}, payload.query, {
                        pageNumber: pageNumber,
                        pageSize: pageSize,
                    }),
                ),
            );
            let page = response && (response.data || response.result);
            if (!response || response.error || response.acknowledged === false || response.success === false ||
                ['FAILED', 'UNAVAILABLE'].includes(response.status) ||
                response.code !== undefined && !/^SUC_/.test(response.code) ||
                response.errors !== undefined && (!Array.isArray(response.errors) || response.errors.length) ||
                !page || !Array.isArray(page.records) || page.records.length > pageSize ||
                !Number.isSafeInteger(page.totalCount) || page.totalCount < 0 ||
                page.totalCount < records.length + page.records.length ||
                page.pageNumber !== undefined && page.pageNumber !== pageNumber ||
                page.pageSize !== undefined && page.pageSize !== pageSize ||
                pageNumber > 1 && page.totalCount !== totalCount ||
                !page.records.length && records.length < page.totalCount) {
                throw new CLASSES.NodicsError('ERR_EXP_00001',
                    'Export source results could not be confirmed. Preview the current records before generating another file');
            }
            let pageRecords = page.records;
            totalCount = page.totalCount;
            records = records.concat(pageRecords);
            if (pageRecords.length < pageSize || records.length >= totalCount) break;
            pageNumber += 1;
        }
        records = records.slice(0, payload.maximumRecords);
        records.totalCount = totalCount;
        records.truncated = totalCount > records.length;
        return records;
    },

    /**
     * Builds a schema-scoped safe-query request without changing caller authority.
     *
     * @param {Object} request Runtime request.
     * @param {Object} payload Normalized export payload.
     * @param {Object} body Bounded query input.
     * @returns {Object} Shared safe-query request.
     */
    buildSchemaRequest: function (request, payload, body) {
        const result = Object.defineProperties({}, Object.getOwnPropertyDescriptors(request));
        return Object.assign(result, {
            moduleName: payload.moduleName,
            schemaName: payload.schemaName,
            generatedServiceName: 'Default' + payload.schemaName.charAt(0).toUpperCase() + payload.schemaName.slice(1) + 'Service',
            browserQuery: body || {},
        });
    },

    /**
     * Resolves a page size allowed by the schema descriptor.
     *
     * @param {number} configuredPageSize Configured export page size.
     * @param {Object} descriptor Workbench descriptor.
     * @returns {number} Allowed page size.
     */
    resolvePageSize: function (configuredPageSize, descriptor) {
        let capabilities = (descriptor && descriptor.queryCapabilities) || {};
        let allowed = Array.isArray(capabilities.allowedPageSizes) ? capabilities.allowedPageSizes.slice().sort((left, right) => right - left) : [50, 25, 10];
        return allowed.find((size) => size <= configuredPageSize) || capabilities.defaultPageSize || 25;
    },

    /**
     * Resolves the schema model used by export access policy filtering.
     *
     * @param {Object} request Runtime request.
     * @param {Object} payload Normalized export payload.
     * @returns {Object} Runtime schema model descriptor.
     */
    resolveSchemaModel: function (request, payload) {
        let modelName =
            UTILS && typeof UTILS.createModelName === 'function'
                ? UTILS.createModelName(payload.schemaName)
                : payload.schemaName.charAt(0).toUpperCase() + payload.schemaName.slice(1);
        let models = NODICS && typeof NODICS.getModels === 'function' ? NODICS.getModels(payload.moduleName, request.tenant) : undefined;
        return (
            (models && models[modelName]) || {
                schemaName: payload.schemaName,
                moduleName: payload.moduleName,
            }
        );
    },

    /**
     * Renders export-safe records into a generated file buffer.
     *
     * @param {Object} payload Normalized payload.
     * @param {Object[]} records Export-safe records.
     * @param {Object} descriptor Schema descriptor.
     * @returns {Object} Rendered file descriptor.
     */
    render: function (payload, records, descriptor, provenance) {
        let extension = payload.format;
        let mimeType = payload.format === 'json' ? 'application/json' : 'text/csv';
        let fileName =
            [
                payload.schemaName,
                'export',
                new Date()
                    .toISOString()
                    .replace(/[^0-9]/g, '')
                    .substring(0, 14),
            ].join('-') +
            '.' +
            extension;
        let content = payload.format === 'json' ? this.renderJson(payload, records, descriptor, provenance) : this.renderCsv(records, descriptor);
        return {
            fileName: fileName,
            originalFileName: fileName,
            mimeType: mimeType,
            extension: extension,
            buffer: Buffer.from(content, 'utf8'),
            checksum: crypto.createHash('sha256').update(content, 'utf8').digest('hex'),
        };
    },

    /**
     * Renders records as JSON with bounded metadata.
     *
     * @param {Object} payload Normalized payload.
     * @param {Object[]} records Export records.
     * @param {Object} descriptor Schema descriptor.
     * @param {Object} provenance Export provenance.
     * @returns {string} JSON content.
     */
    renderJson: function (payload, records, descriptor, provenance) {
        return JSON.stringify(
            {
                contract: provenance,
                label: descriptor.label,
                records: records,
            },
            null,
            2,
        );
    },

    /**
     * Renders records as CSV using descriptor display fields first.
     *
     * @param {Object[]} records Export records.
     * @param {Object} descriptor Schema descriptor.
     * @returns {string} CSV content.
     */
    renderCsv: function (records, descriptor) {
        let fields = this.resolveCsvFields(records, descriptor);
        let lines = [fields.map(this.escapeCsvValue).join(',')];
        records.forEach((record) => {
            lines.push(fields.map((field) => this.escapeCsvValue(this.readPath(record, field))).join(','));
        });
        return lines.join('\n') + '\n';
    },

    /**
     * Resolves CSV columns from schema fields and observed scalar values.
     *
     * @param {Object[]} records Export records.
     * @param {Object} descriptor Schema descriptor.
     * @returns {string[]} CSV field names.
     */
    resolveCsvFields: function (records, descriptor) {
        let descriptorFields = (descriptor.fields || []).filter((field) => !['array', 'object'].includes(field.type)).map((field) => field.name);
        let observed = [];
        records.forEach((record) => {
            Object.keys(record || {}).forEach((key) => {
                if (!observed.includes(key) && !['object', 'function', 'undefined'].includes(typeof record[key]) && !Array.isArray(record[key])) {
                    observed.push(key);
                }
            });
        });
        return Array.from(new Set(descriptorFields.concat(observed)));
    },

    /**
     * Reads a simple field from a record.
     *
     * @param {Object} record Record.
     * @param {string} field Field name.
     * @returns {*} Value.
     */
    readPath: function (record, field) {
        return record ? record[field] : undefined;
    },

    /**
     * Escapes a CSV cell value.
     *
     * @param {*} value Source value.
     * @returns {string} CSV-safe value.
     */
    escapeCsvValue: function (value) {
        if (value === undefined || value === null) return '';
        let text = value instanceof Date ? value.toISOString() : String(value);
        if (/^[=+\-@]/.test(text)) text = "'" + text;
        return /[",\n\r]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
    },

    /** Builds non-authoritative provenance for one governed schema export. */
    buildProvenance: function (request, payload, descriptor, recordCount) {
        return {
            contractType: 'NODICS_SCHEMA_EXPORT',
            contractVersion: 0,
            moduleName: payload.moduleName,
            schemaName: payload.schemaName,
            schemaVersion: descriptor.contractVersion || descriptor.version || 1,
            owner: descriptor.owner || payload.moduleName,
            enterpriseCode: payload.enterpriseCode,
            tenant: request.tenant,
            recordCount: recordCount,
            classification: 'GOVERNED_SCHEMA_EXPORT',
            destinationRole: 'OWNING_RUNTIME',
            importAuthorization: false,
            publicationAuthorization: false,
            onlineWriteAuthorization: false,
            correlationId: request.correlationId || (request.headers && request.headers['x-correlation-id']),
            exportedAt: new Date().toISOString(),
        };
    },

    /** Returns only media fields needed by an authorized client. */
    projectMedia: function (media) {
        let source = media || {};
        return {
            code: source.code,
            accessUrl: source.accessUrl,
            originalFileName: source.originalFileName,
        };
    },

    /** Builds a safe export-history media query. */
    getHistoryQuery: function (request, mediaConfig) {
        let input = (request.httpRequest && (request.httpRequest.query || request.httpRequest.body)) || request.query || {};
        let query = {
            folderCode: mediaConfig.folderCode || 'exportFiles',
            formatCode: mediaConfig.formatCode || 'exportFile',
        };
        const enterpriseCode = this.resolveEnterpriseCode(request);
        if (input.enterpriseCode !== undefined && this.safeOptionalCode(input.enterpriseCode) !== enterpriseCode) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Export history is limited to the signed enterprise.');
        }
        if (enterpriseCode) query.enterpriseCode = enterpriseCode;
        let mediaCode = this.safeOptionalCode(input.mediaCode);
        if (mediaCode) query.code = mediaCode;
        return query;
    },

    /** Resolves bounded export-history page size. */
    resolveHistoryLimit: function (request) {
        let input = (request.httpRequest && request.httpRequest.query) || request.query || {};
        let limit = Number(input.limit || 50);
        if (!Number.isInteger(limit) || limit < 1) return 50;
        return Math.min(limit, 100);
    },

    /** Resolves bounded export-history skip. */
    resolveHistorySkip: function (request) {
        let input = (request.httpRequest && request.httpRequest.query) || request.query || {};
        let skip = Number(input.skip || 0);
        if (!Number.isInteger(skip) || skip < 0) return 0;
        return Math.min(skip, 10000);
    },

    /** Projects one generated export media record into the shared run summary shape. */
    projectHistoryMedia: function (media) {
        let source = media || {};
        let createdAt = source.created || source.createdAt || source.updatedAt;
        return {
            runId: source.code,
            status: source.status || 'COMPLETED',
            dataType: 'export',
            modules: ['export', source.ownerReference || source.name || source.originalFileName].filter(Boolean),
            requestedBy: typeof source.createdBy === 'string' ? source.createdBy : undefined,
            createdAt: createdAt instanceof Date ? createdAt.toISOString() : createdAt,
            summary: {
                recordsRead: 1,
                recordsSucceeded: 1,
                recordsFailed: 0,
            },
            media: {
                code: source.code,
                originalFileName: source.originalFileName || source.name,
                mimeType: source.mimeType,
                extension: source.extension,
                sizeBytes: source.sizeBytes,
                checksum: source.checksum,
                checksumAlgorithm: source.checksumAlgorithm,
            },
        };
    },

    /**
     * Stores the generated file through media.
     *
     * @param {Object} request Runtime request.
     * @param {Object} payload Export payload.
     * @param {Object} rendered Rendered file descriptor.
     * @returns {Promise<Object>} Stored media model.
     */
    storeMedia: async function (request, payload, rendered) {
        if (!SERVICE.DefaultMediaUploadService || typeof SERVICE.DefaultMediaUploadService.upload !== 'function') {
            throw new CLASSES.NodicsError('ERR_EXP_00001', 'media upload service is required for generated exports');
        }
        let config = this.getConfiguration();
        let mediaConfig = config.media || {};
        return SERVICE.DefaultMediaUploadService.upload({
            tenant: request.tenant,
            authData: request.authData,
            // Artifact identity is independent of second-resolution display names and identical bytes.
            mediaCode: 'data-export-' + crypto.randomUUID(),
            enterpriseCode: payload.enterpriseCode,
            moduleName: payload.moduleName,
            schemaName: payload.schemaName,
            folderCode: mediaConfig.folderCode || 'exportFiles',
            formatCode: mediaConfig.formatCode || 'exportFile',
            name: rendered.originalFileName,
            description: 'Generated ' + payload.schemaName + ' ' + payload.format + ' export',
            files: [
                {
                    fieldName: 'file',
                    originalFileName: rendered.originalFileName,
                    fileName: rendered.fileName,
                    mimeType: rendered.mimeType,
                    sizeBytes: rendered.buffer.length,
                    buffer: rendered.buffer,
                },
            ],
        });
    },

    /**
     * Resolves the effective enterprise code for export path ownership.
     *
     * @param {Object} request Runtime request.
     * @returns {string} Enterprise code.
     */
    resolveEnterpriseCode: function (request) {
        const signed = request.authData?.entCode || request.authData?.enterpriseCode || request.authData?.enterprise?.code;
        if (signed) {
            const headers = request.httpRequest?.headers || {};
            if (Object.entries(headers).some(([name, value]) =>
                ['x-enterprise-code', 'entcode'].includes(name.toLowerCase()) && value !== undefined && value !== signed)) {
                throw new CLASSES.NodicsError('ERR_AUTH_00003', 'The selected enterprise does not match your signed workspace.');
            }
            return signed;
        }
        return (
            request.enterpriseCode ||
            (request.authData && request.authData.enterprise && request.authData.enterprise.code) ||
            (request.headers && request.headers['x-enterprise-code']) ||
            (request.httpRequest && request.httpRequest.headers && request.httpRequest.headers['x-enterprise-code']) ||
            'default'
        );
    },

    /**
     * Validates a required module/schema style code.
     *
     * @param {*} value Value.
     * @param {string} label Error label.
     * @returns {string} Safe code.
     */
    safeCode: function (value, label) {
        if (typeof value !== 'string' || !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(value.trim())) {
            throw new CLASSES.NodicsError('ERR_EXP_00001', label + ' is invalid');
        }
        return value.trim();
    },

    /**
     * Validates an optional code.
     *
     * @param {*} value Value.
     * @returns {string|undefined} Safe code.
     */
    safeOptionalCode: function (value) {
        if (value === undefined || value === null || value === '') return undefined;
        return this.safeCode(value, 'Export enterprise');
    },

    /**
     * Applies schema/property export access policies to exported models.
     *
     * @param {Object} request Export request with schemaModel and authData.
     * @param {Object[]} models Models selected for export.
     * @returns {Promise<Object[]>} Export-safe models.
     */
    applyExportAccessPolicies: function (request, models) {
        if (!SERVICE.DefaultSchemaReadAccessPolicyService || typeof SERVICE.DefaultSchemaReadAccessPolicyService.applyExportPolicies !== 'function') {
            return Promise.reject(new CLASSES.NodicsError('ERR_EXP_00001', 'Export policy service is required for governed exports'));
        }
        let exportModels = this.cloneModels(models || []);
        return SERVICE.DefaultSchemaReadAccessPolicyService.applyExportPolicies(request, {
            success: {
                result: exportModels,
            },
        }).then((response) => {
            return response.success.result;
        });
    },

    /**
     * Creates export-safe model copies before policy filtering and rendering.
     *
     * @param {Object[]} models Source models selected for export.
     * @returns {Object[]} Plain model copies that export policies may mutate safely.
     */
    cloneModels: function (models) {
        return [].concat(models || []).map((model) => {
            if (model && typeof model.toObject === 'function') {
                return model.toObject();
            }
            if (model && typeof model.toJSON === 'function') {
                return model.toJSON();
            }
            return Object.assign({}, model);
        });
    },

    /**
     * Extracts model arrays from standard Nodics service responses.
     *
     * @param {Object} response Service response.
     * @returns {Object[]} Response items.
     */
    items: function (response) {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        if (Array.isArray(response.result)) return response.result;
        if (response.success && Array.isArray(response.success.result)) return response.success.result;
        if (response.data && Array.isArray(response.data.result)) return response.data.result;
        if (response.data && Array.isArray(response.data.records)) return response.data.records;
        return [];
    },
};
