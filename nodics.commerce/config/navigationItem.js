/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module nodics.commerce/config/navigationItem @description Builds browser-safe Commerce navigation configuration without executable helpers in properties.js. @layer config @owner nodics.commerce */
module.exports = {
    /** Creates one navigation item. @param {string} id Identifier. @param {string} parentId Parent. @param {string} label Label. @param {string} route Route. @param {string} moduleName Module. @param {string} schemaName Schema. @param {number} order Order. @param {string} permission Permission. @param {string} summary Help. @returns {Object} Navigation item. */
    item: function (id, parentId, label, route, moduleName, schemaName, order, permission, summary) {
        return {
            id, parentId, label, route, icon: 'commerce', order, perspectives: ['business', 'operations'],
            contexts: ['environment', 'tenant', 'enterprise'], featureState: 'ACTIVE',
            requiredPermissions: [permission], workbenchTarget: { moduleName, schemaName },
            workbenchPresentation: { defaultColumns: ['code', 'status', 'revision', 'correlationId'], hiddenFields: ['evidence', 'idempotencyKey'] },
            help: { summary }
        };
    },
    /** Adds Order-owned lifecycle preview actions. @param {Array<Object>} navigation Navigation records. @returns {Array<Object>} Enriched records. */
    lifecycle: function (navigation) {
        navigation.forEach(function (entry) {
            if (entry.id.startsWith('order-')) entry.lifecycleActions = [{ id: 'preview', label: 'Preview decision', intent: 'VALIDATE', permission: 'commerce.lifecycle.read', ownerModule: 'order', operationRoute: '/customer/orders/:orderCode/lifecycle/preview', order: 10 }];
        });
        return navigation;
    }
};
