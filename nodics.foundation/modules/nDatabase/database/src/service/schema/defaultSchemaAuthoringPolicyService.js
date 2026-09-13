/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/service/schema/DefaultSchemaAuthoringPolicyService
 * @description Resolves generic authoring authority from the effective schema and runtime role.
 * @layer service
 * @owner nDatabase
 * @override Extend effective backoffice metadata, not a separate schema or server-name registry.
 */
module.exports = {
    /** Projects the existing schema lifecycle without inferring it from version fields. */
    describe: function (schema) {
        let config = schema && schema.backoffice || {};
        let policy = config.mutationPolicy || {};
        let publishRequired = policy.publishRequired === true || policy.lifecycle === 'PUBLISHABLE' ||
            config.lifecycle === 'PUBLISHABLE' || config.mutationMode === 'PUBLISHABLE';
        let role = CONFIG.get('runtimeRole') || {};
        let stage = ['STAGED', 'ONLINE', 'OPERATIONAL'].includes(role.publication) ? role.publication : 'UNASSIGNED';
        return {
            publishRequired: publishRequired,
            stage: stage,
            authoringAllowed: config.mutationMode !== 'READ_ONLY' && (!publishRequired || stage === 'STAGED'),
        };
    },

    /** Rejects generic HTTP mutations; trusted domain services retain their owning publication path. */
    assertMutationAllowed: function (moduleName, schemaName, operation) {
        let moduleObject = NODICS.getModule(moduleName);
        let schema = moduleObject && moduleObject.rawSchema && moduleObject.rawSchema[schemaName];
        if (!schema) throw new CLASSES.NodicsError('ERR_DBS_00004', 'Schema authoring authority is unavailable');
        if (operation === 'create' && schema.backoffice && schema.backoffice.form && schema.backoffice.form.createOperation) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Create this record through its owning business setup operation.');
        }
        let operations = schema.backoffice && schema.backoffice.operations;
        if (Array.isArray(operations) && operation && !operations.includes(operation)) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'This schema does not allow the requested generic operation.');
        }
        let authority = this.describe(schema);
        if (!authority.authoringAllowed) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', authority.publishRequired
                ? 'This schema can be authored only in Staged. Online changes must use the owning publication workflow.'
                : 'This schema is read-only for generic authoring.');
        }
    },
};
