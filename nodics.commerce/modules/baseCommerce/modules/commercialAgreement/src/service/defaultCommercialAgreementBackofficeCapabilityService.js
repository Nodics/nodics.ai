/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commercialAgreement/service/backoffice @description Contributes agreement command metadata without granting raw schema writes. @layer service @owner commercialAgreement */
module.exports = {
    /** Registers the concrete capability with existing Axis discovery. */
    init: function () { SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('commercialAgreement', this); return Promise.resolve(true); },
    /** Describes canonical command contracts and read-only history. */
    getCapability: function () {
        const definition = SERVICE.DefaultBackofficeCapabilityDefinitionService;
        return definition.capability({ capabilityId: 'commercial-agreements', displayName: 'Commercial Agreements', category: 'commerce',
            navigation: [definition.nativeWorkspace({ id: 'commercial-agreements', label: 'Commercial Agreements',
                route: '/commerce/agreements', order: 1550, permission: CONFIG.get('commercialAgreement').readPermission,
                featureState: 'ACTIVE', summary: 'Agreed packages and retained commercial amendments.',
                backendWorkspace: { contractVersion: 1, renderer: 'axis.workspace.native', workspaceCode: 'commerce.agreements',
                    viewCode: 'commercialAgreement.history', title: 'Commercial Agreements' },
                lifecycleActions: [
                    { id: 'record', label: 'Record Agreed Terms', intent: 'WRITE', ownerModule: 'commercialAgreement', httpMethod: 'POST',
                        operationRoute: '/agreements/record', permission: CONFIG.get('commercialAgreement').writePermission, featureState: 'ACTIVE' },
                    { id: 'read', label: 'Read Agreement History', intent: 'READ', ownerModule: 'commercialAgreement', httpMethod: 'POST',
                        operationRoute: '/agreements/read', permission: CONFIG.get('commercialAgreement').readPermission, featureState: 'ACTIVE' }
                ] })] });
    }
};
