/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module localizationCore/service/DefaultLocalizationImportExportService @description Imports validated module key contributions and exports bounded translation work packages through the repository port. @layer service @owner localizationCore @override File/provider transports may vary but cannot bypass validation or tenant scope. */
module.exports = {
    /** Validates and idempotently upserts key definitions. */ importContribution: async function (document, request) { if (!request || !request.tenant) throw this.error('ERR_LOC_00002', 'Tenant is required'); let normalized = SERVICE.DefaultLocalizationContributionService.validate(document); return SERVICE.DefaultLocalizationReleaseManagementService.repository().upsertKeys(normalized.entries, request); },
    /** Exports definitions and current values for an authorized bounded scope. */ exportPackage: async function (request) { if (!request || !request.tenant || !request.locale) throw this.error('ERR_LOC_00002', 'Tenant and locale are required'); let repository = SERVICE.DefaultLocalizationReleaseManagementService.repository(); let keys = await repository.listKeys(request); let values = await repository.listValues(request); let byIdentity = new Map(values.map(value => [value.namespace + ':' + value.key, value])); return { formatVersion: 1, tenant: request.tenant, locale: request.locale, entries: keys.map(key => ({ namespace: key.namespace, key: key.key, defaultMessage: key.defaultMessage, parameters: key.parameters, exposure: key.exposure, message: (byIdentity.get(key.namespace + ':' + key.key) || {}).message })) }; },
    /** Creates a stable import/export error. */ error: function (code, message) { let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message); error.code = error.code || code; return error; }
};
