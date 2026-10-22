/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module loyaltyWallet/service/backoffice @description Registers implemented participant and isolated test-credit views without grants or activation. @layer service @owner loyaltyWallet */
module.exports = {
    /**
     * Uses the canonical module registration lifecycle.
     * @returns {Promise<boolean>} Successful module hook completion; registration effects are described above.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    init: function () { SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('loyaltyWallet', this); return Promise.resolve(true); },
    /**
     * Describes implemented source contracts; every request remains independently authorized by LoyaltyAPI and Wallet.
     * @returns {Object} Inert source capability description; never grants authority.
     * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
     */
    getCapability: function () {
        const definition = SERVICE.DefaultBackofficeCapabilityDefinitionService;
        const views = [
            { id: 'wallet', label: 'Participant Wallet', route: '/loyalty/wallet', permission: 'loyalty.wallet.read',
                method: 'GET', operation: '/participant/wallet' },
            { id: 'transferSettings', label: 'Transfer Settings', route: '/loyalty/transfer-settings', permission: 'loyalty.transfers.manage',
                method: 'PUT', operation: '/participant/transfer-policy' },
            { id: 'enterpriseTestCredit', label: 'Enterprise Test Credits', route: '/loyalty/enterprise-test-credits', permission: 'loyalty.wallet.testCredit',
                method: 'POST', operation: '/admin/enterprise-test-credits' }
        ];
        return definition.capability({ capabilityId: 'loyalty-participation', displayName: 'Loyalty Participation', category: 'loyalty',
            navigation: views.map((view, index) => definition.nativeWorkspace({
                id: 'loyalty-' + view.id, label: view.label, route: view.route, order: 1700 + index,
                permission: view.permission, featureState: 'ACTIVE',
                summary: 'Original participant authority and owner-governed Loyalty commands.',
                backendWorkspace: { contractVersion: 1, renderer: 'axis.workspace.native', workspaceCode: 'loyalty.participation',
                    viewCode: 'loyalty.' + view.id, title: view.label },
                lifecycleActions: [{ id: view.id, label: view.label, ownerModule: 'loyaltyApi',
                    intent: view.method === 'GET' ? 'READ' : 'WRITE', httpMethod: view.method,
                    operationRoute: view.operation, permission: view.permission, featureState: 'ACTIVE' }]
            })) });
    }
};
