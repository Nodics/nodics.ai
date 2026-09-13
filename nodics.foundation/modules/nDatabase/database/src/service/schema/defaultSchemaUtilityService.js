/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/service/schema/DefaultSchemaUtilityService
 * @description Shared client-safe schema discovery and generated utility operations.
 * Canonical collection/detail and generated capabilities use the same effective
 * schema owner for every consumer.
 * @layer service
 * @owner nDatabase
 * @override Domain modules still own business lifecycle operations. This
 * service owns effective client-safe schema metadata and generic utilities.
 * Override metadata helpers here so every consumer observes the same contract.
 */
module.exports = {
    /**
     * Returns the generated schema's browser-safe capability descriptor.
     * @param {Object} request Generated schema service request.
     * @returns {Promise<Object>} Client-safe schema capabilities.
     */
    capabilitiesGenerated: function (request) {
        return this.getSchema(request, request.schemaName);
    },

    /**
     * Lists the selected active module's authorized effective model descriptors.
     * @param {Object} request Trusted module/tenant/principal context.
     * @returns {Promise<Object>} Existing client-safe collection envelope.
     * @override Extend shared metadata here; canonical discovery delegates to this owner.
     */
    listSchemas: function (request) {
        let schemaModule = this.resolveSchemaModule(request.moduleName);
        let schemas = Object.keys(schemaModule.moduleObject.rawSchema || {})
            .map((schemaName) => {
                return this.buildDescriptor(request, schemaModule.moduleObject, schemaName, schemaModule.moduleName);
            })
            .filter(Boolean);
        return Promise.resolve({
            code: 'SUC_DBS_00000',
            data: {
                moduleName: schemaModule.moduleName,
                schemas: schemas,
            },
        });
    },

    /**
     * Reads one authorized descriptor without depending on a consumer transport.
     * @param {Object} request Trusted module/tenant/principal context.
     * @param {string} schemaName Schema identity supplied by the owning transport.
     * @returns {Promise<Object>} Existing descriptor envelope or unavailable error.
     */
    getSchema: function (request, schemaName) {
        let descriptor = this.resolveDescriptor(request, request.moduleName, schemaName);
        if (!descriptor) {
            return Promise.reject(new CLASSES.NodicsError('ERR_DBS_00004', 'Schema capabilities are not available'));
        }
        return Promise.resolve({ code: 'SUC_DBS_00000', data: descriptor });
    },

    /**
     * Executes a generated schema delete-impact preview without mutating data.
     * @param {Object} request Generated schema service request.
     * @returns {Promise<Object>} Safe delete-impact response.
     */
    deleteImpactGenerated: function (request) {
        let descriptor = this.resolveDescriptor(request, request.moduleName, request.schemaName);
        if (!descriptor || !descriptor.operations || !descriptor.operations.includes('delete')) {
            return Promise.reject(new CLASSES.NodicsError('ERR_DBS_00004', 'Generated delete impact is not available for schema'));
        }
        let identity = this.buildIdentityQuery((request.utilityBody || {}).identity, descriptor);
        if (!request.schemaModel) {
            return Promise.reject(new CLASSES.NodicsError('ERR_DBS_00004', 'Schema model is not available'));
        }
        return SERVICE.DefaultReferenceIntegrityService.inspectRemove({
            tenant: request.tenant,
            authData: request.authData,
            schemaModel: request.schemaModel,
            query: identity,
        }).then((impact) => {
            return { code: 'SUC_DBS_00000', data: impact };
        });
    },

    /** Executes schema-explicit bounded bulk deletion through its generated remove lifecycle. */
    bulkGenerated: function (request) {
        const descriptor = this.resolveDescriptor(request, request.moduleName, request.schemaName);
        const body = request.utilityBody || {};
        if (!descriptor || !descriptor.operations.includes('delete') || body.operation !== 'DELETE' ||
            !descriptor.bulkCapabilities.operations.includes('DELETE') || descriptor.concurrency.managed === true) {
            throw new CLASSES.NodicsError('ERR_DBS_00004', 'Bulk deletion is not available for this schema');
        }
        if (!Array.isArray(body.identities) || !body.identities.length || body.identities.length > descriptor.bulkCapabilities.maximumItems) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Bulk identity count is invalid');
        }
        const key = this.getIdempotencyKey(request);
        if (!key) throw new CLASSES.NodicsError('ERR_DBS_00003', 'Bulk deletion requires an idempotency key');
        const identities = body.identities.map(identity => this.buildIdentityQuery(identity, descriptor));
        const service = SERVICE[request.generatedServiceName];
        if (!service || typeof service.remove !== 'function') throw new CLASSES.NodicsError('ERR_DBS_00004', 'Generated remove service is unavailable');
        request.query = { $or: Array.from(new Map(identities.map(identity => [JSON.stringify(identity), identity])).values()) };
        request.options = Object.assign({}, request.options, { recursive: false, returnModified: false });
        request.idempotencyKey = key;
        return Promise.resolve(service.remove(request)).then(result => ({ code: 'SUC_DBS_00000', data: result }));
    },

    /**
     * Resolves the effective client-safe descriptor for a generated schema.
     * @param {Object} request Authenticated request.
     * @param {string} moduleName Owning module name.
     * @param {string} schemaName Logical schema name.
     * @returns {Object|undefined} Client-safe schema descriptor.
     */
    resolveDescriptor: function (request, moduleName, schemaName) {
        let schemaModule = this.resolveSchemaModule(moduleName);
        return this.buildDescriptor(request, schemaModule.moduleObject, schemaName, schemaModule.moduleName);
    },

    /**
     * Builds a safe single-record identity query for utility operations.
     * @param {Object} identity Browser-provided identity envelope.
     * @param {Object} descriptor Client-safe schema descriptor.
     * @returns {Object} Internal generated-service query.
     */
    buildIdentityQuery: function (identity, descriptor) {
        if (!identity || typeof identity !== 'object' || Array.isArray(identity)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema utility identity is invalid');
        }
        let primary = descriptor.fields.find((field) => field.primary) ||
            descriptor.fields.find((field) => field.name === descriptor.displayProperty) || { name: descriptor.displayProperty };
        let value = identity[primary.name];
        if (!primary.name || !['string', 'number', 'boolean'].includes(typeof value)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema utility identity is invalid');
        }
        let query = { [primary.name]: value };
        if (descriptor.concurrency && descriptor.concurrency.mode === 'COMPARE_AND_SET' && descriptor.concurrency.required === true) {
            let expected = identity[descriptor.concurrency.field];
            if (descriptor.concurrency.managed === true) {
                if (expected === undefined) throw new CLASSES.NodicsError('ERR_CONCURRENCY_00002');
                if (!Number.isSafeInteger(expected) || expected < 0) throw new CLASSES.NodicsError('ERR_CONCURRENCY_00003');
            } else if (!['string', 'number'].includes(typeof expected)) {
                throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema utility concurrency value is required');
            }
            query[descriptor.concurrency.field] = expected;
        }
        return query;
    },

    /**
     * Returns true when shared schema utilities may expose local descriptors.
     *
     * @param {string} moduleName Module name to check.
     * @returns {boolean} True when the module is active locally.
     */
    isLocalActiveModule: function (moduleName) {
        return !NODICS.isModuleActive || NODICS.isModuleActive(moduleName);
    },

    /**
     * Resolves the active schema-owning module and its effective schemas.
     * API modules may expose a public prefix for a semantic module whose schemas
     * are contributed by another implementation module. Shared schema metadata follows
     * the exported schema hierarchy, not the physical contributor or router host.
     * @param {string} moduleName Requested route module name.
     * @returns {Object} Resolved schema module context.
     */
    resolveSchemaModule: function (moduleName) {
        let moduleObject = NODICS.getModule(moduleName);
        if (moduleObject && moduleObject.rawSchema && this.isLocalActiveModule(moduleName)) {
            return {
                moduleName: moduleName,
                moduleObject: moduleObject,
            };
        }
        let metadata = moduleObject && moduleObject.metaData ? moduleObject.metaData : {};
        let globalWorkbenchConfig = CONFIG.get('schemaApi') || {};
        let configuredAliases = globalWorkbenchConfig.moduleAliases || {};
        let configuredAlias = configuredAliases[moduleName] || {};
        if (typeof configuredAlias === 'string') {
            configuredAlias = { schemaModule: configuredAlias };
        }
        let legacyWorkbenchConfig = metadata.nodics && metadata.nodics.schemaApi || {};
        let aliasedModuleName = configuredAlias.schemaModule ||
            configuredAlias.moduleName ||
            legacyWorkbenchConfig.schemaModule ||
            metadata.schemaModule ||
            metadata.prefix;
        if (aliasedModuleName && aliasedModuleName !== moduleName) {
            let prefixedModule = NODICS.getModule(aliasedModuleName);
            if (prefixedModule && prefixedModule.rawSchema && this.isLocalActiveModule(moduleName) &&
                this.isLocalActiveModule(aliasedModuleName)) {
                return {
                    moduleName: aliasedModuleName,
                    moduleObject: prefixedModule,
                };
            }
        }
        throw new CLASSES.NodicsError('ERR_DBS_00004', 'Module schemas are not available');
    },

    /**
     * Builds a descriptor when the schema is an eligible model and the caller
     * can read it. Explicit metadata may disable discovery or add governed
     * mutation operations.
     * @param {Object} request Authenticated Nodics request.
     * @param {Object} moduleObject Active owning module.
     * @param {string} schemaName Schema name.
     * @param {string} moduleName Resolved schema-owning module name.
     * @returns {Object|undefined} Safe descriptor or undefined.
     */
    buildDescriptor: function (request, moduleObject, schemaName, moduleName) {
        let schema = moduleObject.rawSchema[schemaName];
        moduleName = moduleName || request.moduleName;
        if (!this.isLocalActiveModule(moduleName)) {
            return undefined;
        }
        let workbenchConfig = CONFIG.get('schemaApi') || {};
        let explicitConfig = schema && schema.backoffice;
        let discoverByDefault = workbenchConfig.discoverModelsByDefault !== false;
        if (
            !schema ||
            schema.model !== true ||
            (explicitConfig && explicitConfig.enabled === false) ||
            (!discoverByDefault && (!explicitConfig || explicitConfig.enabled !== true))
        ) {
            return undefined;
        }
        if (!Array.isArray(workbenchConfig.defaultModelOperations) || !workbenchConfig.defaultMutationMode) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema API configuration is incomplete');
        }
        let config = Object.assign(
            {
                operations: workbenchConfig.defaultModelOperations,
                mutationMode: workbenchConfig.defaultMutationMode,
                defaultRelationshipActions: workbenchConfig.defaultRelationshipActions,
            },
            explicitConfig || {},
        );
        let authority = this.getAuthoringAuthority(schema);
        let operations = this.getAllowedOperations(request, schema, config);
        if (operations.length === 0) {
            return undefined;
        }
        let displayProperty = config.displayProperty || (schema.definition.code ? 'code' : '_id');
        let displayProperties =
            Array.isArray(config.displayProperties) && config.displayProperties.length > 0
                ? config.displayProperties.slice()
                : this.getDefaultDisplayProperties(schema, displayProperty);
        return {
            moduleName: moduleName,
            schemaName: schemaName,
            label: config.label || this.humanize(schemaName),
            description: config.description || '',
            origin: this.buildSchemaOrigin(moduleName, schema, config),
            hierarchy: this.buildSchemaHierarchy(moduleName, schema, config),
            displayProperty: displayProperty,
            displayProperties: displayProperties,
            apiOperations: this.buildApiOperations(request.moduleName, schemaName),
            queryCapabilities: this.buildQueryCapabilities(schema, config, displayProperty),
            bulkCapabilities: this.buildBulkCapabilities(operations.includes('delete') ? config : Object.assign({}, config, { bulkOperations: [] })),
            concurrency: this.buildConcurrency(schema, config),
            aggregateOperations: authority.authoringAllowed ? this.buildAggregateOperations(config, request.moduleName) : [],
            mutationMode: authority.authoringAllowed ? config.mutationMode : 'READ_ONLY',
            mutationPolicy: this.buildMutationPolicy(config),
            authoring: authority,
            operations: operations,
            fields: this.buildFields(moduleName, schema, config),
            form: this.buildForm(moduleName, schema, config),
            relationships: this.buildRelationships(moduleName, schema, config),
        };
    },

    /**
     * Projects selected generated-controller contracts from prepared runtime routes.
     * This is discovery, not another registry or an authorization grant. Disabled
     * declarations remain explicit so clients cannot retry through a legacy route.
     * Missing operations retain legacy compatibility until their owner is migrated.
     * @param {string} moduleName Requested local module or route alias.
     * @param {string} schemaName Effective schema identity.
     * @returns {Object|undefined} Relative module routes, or absent optional metadata.
     * @override Preserve the generated body contract and fail closed on ambiguity.
     */
    buildApiOperations: function (moduleName, schemaName) {
        if (!NODICS.getRouters) return undefined;
        let operations = {};
        let contracts = { capabilities: ['capabilities', 'GET'], safeSearch: ['search', 'POST'],
            save: ['create', 'PUT'], update: ['update', 'PATCH'], remove: ['delete', 'DELETE'],
            deleteImpact: ['deleteImpact', 'POST'], bulk: ['bulk', 'POST'] };
        for (let route of Object.values(NODICS.getRouters(moduleName) || {})) {
            if (String(route.controller).toLowerCase() !== ('default' + schemaName + 'controller').toLowerCase()) continue;
            let contract = contracts[route.operation];
            if (!contract || String(route.method).toUpperCase() !== contract[1]) continue;
            let target = this.projectOperationRoute(route);
            let existing = operations[contract[0]];
            if (existing && JSON.stringify(existing) !== JSON.stringify(target)) {
                throw new CLASSES.NodicsError('ERR_DBS_00004', 'Schema API operation has ambiguous routes');
            }
            operations[contract[0]] = target;
        }
        return Object.keys(operations).length ? operations : undefined;
    },

    /** Projects one prepared relative route without exposing implementation or accepting external URLs. */
    projectOperationRoute: function (route) {
        const version = route.apiVersion || 'v0';
        const method = String(route.method).toUpperCase();
        if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ||
            !/^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(route.key) || !/^v[0-9]+$/.test(version)) {
            throw new CLASSES.NodicsError('ERR_DBS_00004', 'Schema API route cannot be represented safely');
        }
        return { method, path: route.key, apiVersion: version, active: route.active !== false };
    },

    /** Resolves a declared owning command from prepared routes, never from another route registry. */
    findOperationRoute: function (moduleName, controller, operation) {
        if (!NODICS.getRouters || !moduleName) return undefined;
        let result;
        for (const route of Object.values(NODICS.getRouters(moduleName) || {})) {
            if (route.controller !== controller || route.operation !== operation) continue;
            const target = this.projectOperationRoute(route);
            if (result && JSON.stringify(result) !== JSON.stringify(target)) throw new CLASSES.NodicsError('ERR_DBS_00004', 'Owning command has ambiguous routes');
            result = target;
        }
        return result;
    },

    /**
     * Advertises only schema-explicit bulk operations. Generated CRUD remains
     * the execution authority and the framework does not enable mutation in
     * bulk merely because single-record mutation is available.
     */
    buildBulkCapabilities: function (config) {
        let workbenchConfig = CONFIG.get('schemaApi') || {};
        let requested = Array.isArray(config.bulkOperations) ? config.bulkOperations : [];
        return {
            operations: config.concurrency && config.concurrency.managed === true ? [] : requested.filter((operation) => operation === 'DELETE'),
            maximumItems: workbenchConfig.maximumBulkItems || 100,
            idempotencyRequired: true,
            outcomeMode: 'AUTHORITATIVE_RESULT',
        };
    },

    /**
     * Projects an explicit or schema-derived compare-and-set contract.
     * Revision is used only when it is an effective schema field.
     */
    buildConcurrency: function (schema, config) {
        let configured = config.concurrency || {};
        let field = configured.field || (schema.definition && schema.definition.revision ? 'revision' : undefined);
        if (!field || !schema.definition || !schema.definition[field] || configured.enabled === false) {
            return { mode: 'NONE', field: '', required: false };
        }
        return {
            mode: 'COMPARE_AND_SET',
            field: field,
            required: configured.managed === true || configured.required !== false,
            ...(configured.managed === true ? { managed: true } : {}),
        };
    },

    /**
     * Advertises inert aggregate metadata while keeping service and method
     * implementation details private. The owning module remains authority.
     */
    buildAggregateOperations: function (config, moduleName) {
        let operations = config.aggregateOperations || {};
        return Object.keys(operations)
            .filter((name) => {
                let operation = operations[name];
                return operation && operation.enabled !== false && operation.controller && operation.operation;
            })
            .map((name) => {
                let operation = operations[name];
                return {
                    name: name,
                    label: operation.label || this.humanize(name),
                    purpose: operation.purpose || 'CUSTOM',
                    consistency: operation.consistency || 'MODULE_OWNED',
                    confirmationRequired: operation.confirmationRequired === true,
                    api: this.findOperationRoute(moduleName, operation.controller, operation.operation),
                };
            });
    },

    /**
     * Projects the effective schema origin without becoming a second schema
     * registry. Custom layers may provide richer origin evidence through
     * backoffice metadata when available.
     */
    buildSchemaOrigin: function (moduleName, schema, config) {
        let origin = config.origin || schema.origin || {};
        return {
            source: origin.source || config.source || 'MODULE',
            moduleName: origin.moduleName || moduleName,
            layer: origin.layer || config.layer || 'EFFECTIVE',
            status: origin.status || 'EFFECTIVE',
        };
    },

    /**
     * Returns the optional schema contribution chain used by Axis definition
     * views. The effective schema stays the executable source of truth.
     */
    buildSchemaHierarchy: function (moduleName, schema, config) {
        let hierarchy = Array.isArray(config.hierarchy)
            ? config.hierarchy
            : Array.isArray(schema.hierarchy)
              ? schema.hierarchy
              : [];
        if (hierarchy.length === 0) {
            hierarchy = [{
                source: 'MODULE',
                moduleName: moduleName,
                status: 'EFFECTIVE',
            }];
        }
        return hierarchy
            .filter((item) => item && typeof item === 'object')
            .map((item) => {
                return {
                    source: item.source || 'MODULE',
                    moduleName: item.moduleName || moduleName,
                    schemaName: item.schemaName || undefined,
                    layer: item.layer || '',
                    status: item.status || 'EFFECTIVE',
                };
            });
    },

    /**
     * Advertises mutation routing semantics for Axis. Backend services remain
     * responsible for validation, versioning, publishing and persistence.
     */
    buildMutationPolicy: function (config) {
        let policy = config.mutationPolicy || {};
        return {
            mode: policy.mode || config.mutationMode,
            savePath: policy.savePath || config.savePath || config.mutationMode,
            lifecycle: policy.lifecycle || config.lifecycle || 'DIRECT',
            createStrategy: policy.createStrategy || 'TOP_LEVEL_WITH_REFERENCES',
            updateStrategy: policy.updateStrategy || 'DIRECT_OR_REFERENCED',
            deleteStrategy: policy.deleteStrategy || 'TOP_LEVEL_ONLY',
            aggregateSave: policy.aggregateSave === true,
            publishRequired: this.getAuthoringAuthority({ backoffice: config }).publishRequired,
        };
    },

    /** Uses the shared authoring policy, including project service overrides. */
    getAuthoringAuthority: function (schema) {
        return (SERVICE.DefaultSchemaAuthoringPolicyService || require('./defaultSchemaAuthoringPolicyService')).describe(schema);
    },

    /**
     * Intersects configured operations with schema access points.
     * @param {Object} request Authenticated Nodics request.
     * @param {Object} schema Effective schema.
     * @param {Object} config Schema Workbench configuration.
     * @returns {string[]} Authorized operations.
     */
    getAllowedOperations: function (request, schema, config) {
        let requested = Array.isArray(config.operations) ? config.operations : ['read', 'search'];
        if (!this.getAuthoringAuthority(schema).authoringAllowed) {
            requested = requested.filter(operation => ['read', 'search'].includes(operation));
        }
        let accessPoint = SERVICE.DefaultSchemaAccessHandlerService.getAccessPoint(request.authData, schema.accessGroups);
        let points = CONFIG.get('accessPoints');
        let allowed = [];
        if (accessPoint >= points.readAccessPoint) {
            allowed = requested.filter((operation) => ['read', 'search'].includes(operation));
        }
        if (accessPoint >= points.writeAccessPoint) {
            allowed = allowed.concat(requested.filter((operation) => ['create', 'update'].includes(operation)));
        }
        if (accessPoint >= points.removeAccessPoint) {
            allowed = allowed.concat(requested.filter((operation) => operation === 'delete'));
        }
        return Array.from(new Set(allowed));
    },

    /**
     * Projects effective schema fields without service or secret metadata.
     * @param {Object} schema Effective schema.
     * @param {Object} config Schema Workbench configuration.
     * @returns {Object[]} Client-safe fields.
     */
    buildFields: function (moduleName, schema, config) {
        let excluded = new Set((config.excludedFields || []).concat(['password', 'apiKey', 'apiKeyHash', 'accessGroups']));
        let managedFields = new Set(['created', 'updated', 'ownerId', 'ownerType', 'createdBy', 'updatedBy']);
        if (config.concurrency && config.concurrency.managed === true) {
            managedFields.add(config.concurrency.field || 'revision');
        }
        let fieldConfig = config.fields || {};
        return Object.keys(schema.definition || {})
            .filter((name) => !excluded.has(name))
            .map((name) => {
                let property = schema.definition[name] || {};
                let override = fieldConfig[name] || {};
                let fixedValue = this.resolveFixedValue(property, override);
                let reference = this.buildRelationship(moduleName, schema, config, name);
                let field = {
                    name: name,
                    label: override.label || property.label || this.humanize(name),
                    type: property.type || (Array.isArray(property.enum) ? 'string' : 'object'),
                    required: property.required === true,
                    readOnly: property.readOnly === true || override.readOnly === true || managedFields.has(name) || fixedValue !== undefined,
                    primary: property.primary === true,
                    description: override.description || property.description || '',
                    enum: Array.isArray(property.enum) ? property.enum.slice() : undefined,
                    enumOptions: this.buildEnumOptions(property, override),
                    default: this.isSafeDefault(property.default) ? property.default : undefined,
                    fixedValue: fixedValue,
                    component: this.resolveFieldComponent(name, property, override, schema),
                    validation: this.buildFieldValidation(property, override),
                    origin: this.buildFieldOrigin(moduleName, name, property, override, schema, config),
                    searchable: !!(property.searchOptions && property.searchOptions.enabled === true),
                };
                if (reference) field.reference = reference;
                return field;
            });
    },

    /**
     * Projects schema references into module-aware relationship descriptors.
     * @param {string} moduleName Source module name.
     * @param {Object} schema Effective schema.
     * @param {Object} config Schema Workbench configuration.
     * @returns {Object[]} Relationship descriptors.
     */
    buildRelationships: function (moduleName, schema, config) {
        return Object.keys(schema.refSchema || {})
            .filter((name) => {
                return schema.refSchema[name] && schema.refSchema[name].enabled !== false;
            })
            .map((name) => this.buildRelationship(moduleName, schema, config, name));
    },

    /**
     * Builds a single schema relationship descriptor for both schema-level and
     * field-level projections.
     */
    buildRelationship: function (moduleName, schema, config, name) {
        let reference = schema.refSchema && schema.refSchema[name];
        if (!reference || reference.enabled === false) return undefined;
        let relationshipConfig = config.relationships || {};
        let override = relationshipConfig[name] || {};
        let property = schema.definition[name] || {};
        return {
            field: name,
            label: override.label || property.label || this.humanize(name),
            description: override.description || property.description || '',
            targetModule: override.targetModule || reference.moduleName || moduleName,
            targetSchema: override.targetSchema || reference.schemaName,
            cardinality: reference.type === 'many' ? 'MANY' : 'ONE',
            referenceProperty: reference.propertyName || 'code',
            component: override.component || (reference.type === 'many' ? 'multiReferenceSelector' : 'referenceSelector'),
            resolution: override.resolution || 'LOCAL_OR_REMOTE',
            actions: Array.isArray(override.actions)
                ? override.actions.slice()
                : Array.isArray(config.defaultRelationshipActions)
                  ? config.defaultRelationshipActions.slice()
                  : ['SELECT_EXISTING'],
            required: !!(schema.definition[name] && schema.definition[name].required),
            relationshipType: override.relationshipType || reference.relationshipType || 'ASSOCIATION',
            ownership: override.ownership || reference.ownership || 'SOURCE',
            inverseField: override.inverseField || reference.inverseField || '',
            onTargetDelete: String(reference.onTargetDelete || 'NONE').toUpperCase(),
            maximumDepth: Number.isSafeInteger(override.maximumDepth) ? override.maximumDepth : 3,
            cycleHandling: override.cycleHandling || 'SELECT_EXISTING',
            deleteImpactAvailable: String(reference.onTargetDelete || '').toUpperCase() === 'RESTRICT',
        };
    },

    /** Returns a safe fixed field value declared by schema or Workbench metadata. */
    resolveFixedValue: function (property, override) {
        let value = override.fixedValue !== undefined ? override.fixedValue : property.fixedValue !== undefined ? property.fixedValue : property.fixed;
        return this.isSafeDefault(value) ? value : undefined;
    },

    /** Converts raw enum strings or richer option metadata into display options. */
    buildEnumOptions: function (property, override) {
        let options = Array.isArray(override.enumOptions)
            ? override.enumOptions
            : Array.isArray(property.enumOptions)
              ? property.enumOptions
              : undefined;
        if (options) {
            return options
                .filter((item) => item && typeof item === 'object' && this.isSafeDefault(item.value))
                .map((item) => {
                    let value = item.value;
                    return {
                        value: value,
                        label: typeof item.label === 'string' && item.label.trim() ? item.label : this.humanize(value),
                        description: typeof item.description === 'string' ? item.description : '',
                        disabled: item.disabled === true,
                    };
                });
        }
        if (!Array.isArray(property.enum)) {
            return undefined;
        }
        return property.enum.map((value) => {
            return {
                value: value,
                label: this.humanize(value),
                description: '',
                disabled: false,
            };
        });
    },

    /**
     * Projects the existing backoffice.form metadata into a non-executable editor contract.
     * Removed fields disappear and ungrouped project fields remain editable. Presentation
     * cannot hide a required field unless the owning create operation manages it.
     * @param {string} moduleName Effective owning module.
     * @param {Object} schema Effective layered schema.
     * @param {Object} config Effective backoffice metadata.
     * @returns {Object} Safe labels, ordered sections and managed-create metadata.
     */
    buildForm: function (moduleName, schema, config) {
        let defaults = (CONFIG.get('schemaApi') || {}).form || {};
        let form = config.form || {};
        let fields = this.buildFields(moduleName, schema, config);
        let names = new Set(fields.map(field => field.name));
        let createOperation = this.buildAggregateOperations(config, moduleName).find(operation =>
            operation.name === form.createOperation && operation.purpose === 'CREATE');
        let managed = createOperation && Array.isArray(form.managedCreateFields)
            ? form.managedCreateFields.filter(name => names.has(name)) : [];
        let hidden = (Array.isArray(form.hiddenFields) ? form.hiddenFields : []).filter(name =>
            fields.some(field => field.name === name && !field.required));
        let available = fields.filter(field => (!field.readOnly || field.fixedValue !== undefined) && !hidden.includes(field.name));
        let assigned = new Set();
        let sections = Object.entries(form.sections || {}).flatMap(([id, section]) => {
            if (!section || section.enabled === false || typeof section.label !== 'string') return [];
            let sectionFields = (Array.isArray(section.fields) ? section.fields : []).filter(name =>
                available.some(field => field.name === name) && !assigned.has(name));
            sectionFields.forEach(name => assigned.add(name));
            return sectionFields.length ? [{ id, label: section.label, fields: sectionFields }] : [];
        });
        let remaining = available.filter(field => !assigned.has(field.name));
        if (!sections.length) {
            let direct = remaining.filter(field => !field.reference);
            if (direct.length) sections.push({ id: 'details', label: defaults.detailsLabel || 'Details', fields: direct.map(field => field.name) });
            let references = remaining.filter(field => field.reference);
            if (references.length) sections.push({ id: 'relationships', label: defaults.relationshipsLabel || 'Related records', fields: references.map(field => field.name) });
        } else if (remaining.length) {
            sections.push({ id: 'additional', label: defaults.additionalLabel || 'Additional details', fields: remaining.map(field => field.name) });
        }
        let copy = {};
        Object.keys(defaults).forEach(key => {
            if (typeof defaults[key] === 'string') copy[key] = typeof form[key] === 'string' ? form[key] : defaults[key];
        });
        return {
            contractVersion: 1, sections, hiddenFields: hidden, managedCreateFields: managed, copy,
            createOperation: createOperation ? createOperation.name : undefined,
            completionAction: form.completionAction && typeof form.completionAction.label === 'string' &&
                typeof form.completionAction.path === 'string' && /^\/(?!\/)[^\\]*$/.test(form.completionAction.path)
                ? { label: form.completionAction.label, path: form.completionAction.path } : undefined,
            defaultColumns: (Array.isArray(form.defaultColumns) ? form.defaultColumns :
                (config.displayProperties || ['name', config.displayProperty || 'code', 'description', 'active'])).filter(name => names.has(name)),
        };
    },

    /** Chooses a backend-declared renderer component for Axis. */
    resolveFieldComponent: function (name, property, override, schema) {
        if (override.component) return override.component;
        if (property.component) return property.component;
        if (schema.refSchema && schema.refSchema[name]) {
            return schema.refSchema[name].type === 'many' ? 'multiReferenceSelector' : 'referenceSelector';
        }
        if (Array.isArray(property.enum)) return 'select';
        if (property.readOnly === true || property.fixedValue !== undefined || property.fixed !== undefined) return 'readonly';
        if ((property.type || 'string') === 'object' && this.isLocalizedTextField(name)) {
            return 'localizedText';
        }
        switch (property.type || 'string') {
            case 'bool':
            case 'boolean':
                return 'checkbox';
            case 'date':
                return 'date';
            case 'float':
            case 'int':
            case 'integer':
            case 'number':
                return 'number';
            case 'array':
                return 'array';
            case 'object':
                return 'json';
            default:
                return property.multiline === true ? 'textarea' : 'text';
        }
    },

    /** Identifies structured business text fields that are localized by value. */
    isLocalizedTextField: function (name) {
        return ['name', 'description'].includes(name);
    },

    /** Projects common validation constraints as UI hints, not final authority. */
    buildFieldValidation: function (property, override) {
        let source = Object.assign({}, property.validation || {}, override.validation || {});
        ['min', 'max', 'minLength', 'maxLength', 'precision'].forEach((name) => {
            if (source[name] === undefined && property[name] !== undefined) source[name] = property[name];
        });
        ['pattern', 'format', 'message'].forEach((name) => {
            if (source[name] === undefined && typeof property[name] === 'string') source[name] = property[name];
        });
        if (source.unique === undefined && property.unique !== undefined) source.unique = property.unique === true;
        let validation = {};
        ['min', 'max', 'minLength', 'maxLength', 'precision'].forEach((name) => {
            if (typeof source[name] === 'number' && Number.isFinite(source[name])) validation[name] = source[name];
        });
        ['pattern', 'format', 'message'].forEach((name) => {
            if (typeof source[name] === 'string' && source[name].trim()) validation[name] = source[name];
        });
        if (source.unique === true) validation.unique = true;
        return validation;
    },

    /** Projects optional field contribution metadata for effective-schema review. */
    buildFieldOrigin: function (moduleName, name, property, override, schema, config) {
        let origins = config.fieldOrigins || schema.fieldOrigins || {};
        let origin = override.origin || property.origin || origins[name] || {};
        let schemaOrigin = config.origin || schema.origin || {};
        return {
            source: origin.source || 'MODULE',
            moduleName: origin.moduleName || schemaOrigin.moduleName || moduleName,
            layer: origin.layer || '',
            status: origin.status || 'EFFECTIVE',
        };
    },

    /**
     * Projects bounded search, sorting, and paging capabilities.
     * @param {Object} schema Effective schema.
     * @param {Object} config Workbench schema configuration.
     * @param {string} displayProperty Stable identity field.
     * @returns {Object} Query capability descriptor.
     */
    buildQueryCapabilities: function (schema, config, displayProperty) {
        let workbenchConfig = CONFIG.get('schemaApi') || {};
        let fields = Object.keys(schema.definition || {});
        let excluded = new Set((config.excludedFields || []).concat(['password', 'apiKey', 'apiKeyHash', 'accessGroups']));
        let configuredSearchableFields = this.configuredFieldList(config.searchableFields, fields, excluded);
        let searchableFields = (configuredSearchableFields || fields).filter((name) => {
            let property = schema.definition[name] || {};
            return !excluded.has(name) && ['string', undefined].includes(property.type) && (configuredSearchableFields || (property.searchOptions && property.searchOptions.enabled === true));
        });
        let configuredSortableFields = this.configuredFieldList(config.sortableFields, fields, excluded);
        let sortableFields = (configuredSortableFields || fields).filter((name) => {
            let property = schema.definition[name] || {};
            return !excluded.has(name) && !['array', 'object'].includes(property.type);
        });
        if (!sortableFields.includes(displayProperty)) {
            sortableFields.unshift(displayProperty);
        }
        let configuredFilterFields = this.configuredFieldList(config.filterFields, fields, excluded);
        let filterFields = (configuredFilterFields || fields)
            .filter((name) => {
                let property = schema.definition[name] || {};
                return !excluded.has(name) && !['array', 'object'].includes(property.type) && this.getFilterOperators(property).length > 0;
            })
            .map((name) => {
                let property = schema.definition[name] || {};
                return {
                    field: name,
                    label: property.label || this.humanize(name),
                    type: property.type || 'string',
                    operators: this.getFilterOperators(property),
                    enum: Array.isArray(property.enum) ? property.enum.slice() : undefined,
                };
            });
        return {
            searchableFields: searchableFields,
            sortableFields: sortableFields,
            filterFields: filterFields,
            groupOperators: ['AND', 'OR'],
            textOperator: 'CONTAINS',
            allowedPageSizes: (workbenchConfig.allowedPageSizes || [10, 25, 50]).slice(),
            defaultPageSize: workbenchConfig.defaultPageSize || 25,
            maximumPageSize: workbenchConfig.maximumPageSize || 50,
            defaultSort: {
                field: config.defaultSortField || displayProperty,
                direction: config.defaultSortDirection || 'ASC',
            },
        };
    },

    /**
     * Returns configured Workbench field names that exist on the effective
     * schema and are not explicitly excluded. Undefined means use schema
     * defaults; an empty configured list intentionally produces no fields.
     * @param {string[]|undefined} configured Explicit field names.
     * @param {string[]} fields Effective schema field names.
     * @param {Set<string>} excluded Browser-hidden field names.
     * @returns {string[]|undefined} Safe configured field list.
     */
    configuredFieldList: function (configured, fields, excluded) {
        if (!Array.isArray(configured)) {
            return undefined;
        }
        return Array.from(new Set(configured)).filter((name) => fields.includes(name) && !excluded.has(name));
    },

    /**
     * Returns the browser-safe operators supported by one scalar property.
     * @param {Object} property Effective schema property.
     * @returns {string[]} Stable operator names.
     */
    getFilterOperators: function (property) {
        if (Array.isArray(property.enum)) {
            return ['EQUALS', 'NOT_EQUALS', 'IN'];
        }
        switch (property.type || 'string') {
            case 'string':
                return ['EQUALS', 'NOT_EQUALS', 'CONTAINS', 'STARTS_WITH'];
            case 'number':
            case 'int':
            case 'integer':
                return ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'GREATER_OR_EQUAL', 'LESS_THAN', 'LESS_OR_EQUAL'];
            case 'boolean':
            case 'bool':
                return ['EQUALS', 'NOT_EQUALS'];
            case 'date':
                return ['EQUALS', 'BEFORE', 'AFTER', 'BETWEEN'];
            default:
                return [];
        }
    },

    /**
     * Selects a bounded, client-safe record identity without requiring every
     * model to repeat the same BackOffice metadata. Explicit
     * `backoffice.displayProperties` always takes precedence.
     * @param {Object} schema Effective schema.
     * @param {string} displayProperty Stable fallback identity property.
     * @returns {string[]} Ordered record presentation properties.
     */
    getDefaultDisplayProperties: function (schema, displayProperty) {
        let definition = schema.definition || {};
        let excluded = new Set(['password', 'apiKey', 'apiKeyHash', 'accessGroups']);
        let candidates = [displayProperty, 'description'];
        return Array.from(
            new Set(
                candidates.filter((name) => {
                    return name === displayProperty || (!excluded.has(name) && !!definition[name]);
                }),
            ),
        );
    },

    /**
     * Checks whether a default can be sent safely as inert JSON metadata.
     * @param {*} value Configured default.
     * @returns {boolean} True for scalar or empty defaults.
     */
    isSafeDefault: function (value) {
        return value === undefined || value === null || ['string', 'number', 'boolean'].includes(typeof value);
    },

    /**
     * Converts a technical identifier into a readable fallback label.
     * @param {string} value Technical identifier.
     * @returns {string} Human-readable label.
     */
    humanize: function (value) {
        let text = String(value || '')
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
            .replace(/[_-]+/g, ' ')
            .trim();
        return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
    },
    /**
     * Normalizes generated HTTP model fields through the same effective metadata
     * as Workbench without turning discovery exclusion into a new access policy.
     * Schema access and ownership remain enforced by generated pipelines.
     * @param {Object} input Submitted model.
     * @param {Object} request Secured request context.
     * @param {string} schemaName Compiled schema identity.
     * @returns {Object} Writable model with trusted scope and original counters.
     */
    buildGeneratedMutationModel: function (input, request, schemaName) {
        let owner = this.resolveSchemaModule(request.moduleName);
        let schema = owner.moduleObject.rawSchema[schemaName];
        if (!schema || schema.model !== true) throw new CLASSES.NodicsError('ERR_DBS_00004', 'Schema mutation metadata is unavailable');
        let config = schema.backoffice || {};
        return this.buildMutationModel(input, {
            fields: this.buildFields(owner.moduleName, schema, config),
            concurrency: this.buildConcurrency(schema, config),
        }, request);
    },

    /** Returns a bounded request idempotency key. */
    getIdempotencyKey: function (request) {
        let headers = request.headers || (request.httpRequest && request.httpRequest.headers) || {};
        let value = request.idempotencyKey || headers['idempotency-key'] || headers['Idempotency-Key'];
        return typeof value === 'string' && /^[A-Za-z0-9._:-]{8,128}$/.test(value) ? value : undefined;
    },

    /** Returns the enterprise context supplied by secured request processing. */
    getEnterpriseCode: function (request) {
        let headers = request.headers || (request.httpRequest && request.httpRequest.headers) || {};
        let authData = request.authData || {};
        let value = request.enterpriseCode || request.entCode || authData.enterpriseCode || authData.entCode ||
            headers['x-enterprise-code'] || headers['X-Enterprise-Code'] || headers.entCode;
        return typeof value === 'string' && value.trim() ? value.trim() : undefined;
    },

    /** Builds a mutation model from editable schema fields plus runtime scope. */
    buildMutationModel: function (input, descriptor, request) {
        if (!input || typeof input !== 'object' || Array.isArray(input)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema mutation model is invalid');
        }
        if (Object.keys(input).some(name => name.startsWith('$') || name.includes('.'))) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema HTTP mutation models require plain fields');
        }
        let fieldNames = new Set(descriptor.fields.map((field) => field.name));
        let model = {};
        descriptor.fields.forEach((field) => {
            let originalCounter = descriptor.concurrency && descriptor.concurrency.managed === true &&
                descriptor.concurrency.field === field.name;
            if ((!field.readOnly || originalCounter) && !['tenant', 'enterpriseCode'].includes(field.name) &&
                Object.prototype.hasOwnProperty.call(input, field.name)) {
                model[field.name] = input[field.name];
            }
        });
        descriptor.fields.forEach((field) => {
            let originalCounter = descriptor.concurrency && descriptor.concurrency.managed === true &&
                descriptor.concurrency.field === field.name;
            if (field.fixedValue !== undefined && !originalCounter) {
                model[field.name] = field.fixedValue;
            }
        });
        if (fieldNames.has('tenant')) {
            model.tenant = request.tenant;
        }
        if (fieldNames.has('enterpriseCode')) {
            let enterpriseCode = this.getEnterpriseCode(request);
            if (enterpriseCode) {
                model.enterpriseCode = enterpriseCode;
            }
        }
        return model;
    },
};
