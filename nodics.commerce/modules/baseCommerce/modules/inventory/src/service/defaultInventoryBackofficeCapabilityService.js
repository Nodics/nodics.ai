/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module inventory/src/service/defaultInventoryBackofficeCapabilityService @description Publishes Inventory-owned BackOffice navigation and operation actions. @layer service @owner inventory */
module.exports = {
    /** Registers Inventory as the BackOffice capability provider for inventory workspaces and actions. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('inventory', this);
        return Promise.resolve(true);
    },
    /** Completes the provider lifecycle after registration without additional startup work. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the common balance-code input used by Inventory stock actions. */
    balanceCodeInput: function () {
        return { name: 'balanceCode', label: 'Balance code', type: 'TEXT', required: true, valueFromRecord: 'code', maximumLength: 160 };
    },
    /** Returns the quantity input for Inventory stock actions with a safe default quantity. */
    quantityInput: function (defaultValue) {
        return { name: 'quantity', label: 'Quantity', type: 'TEXT', required: true, defaultValue: defaultValue || '1', maximumLength: 32 };
    },
    /** Returns the optional reason or note input captured for Inventory movement evidence. */
    reasonInput: function () {
        return { name: 'reasonCode', label: 'Reason / note', type: 'MULTILINE', required: false, maximumLength: 512 };
    },
    /** Returns the optional reference-code input linked to the current Inventory record. */
    referenceInput: function () {
        return { name: 'referenceCode', label: 'Reference code', type: 'TEXT', required: false, valueFromRecord: 'code', maximumLength: 160 };
    },
    /** Builds the Inventory operation route for a governed stock action code. */
    actionRoute: function (actionCode) { return '/operator/inventory/balances/:balanceCode/actions/' + actionCode; },
    /** Builds one governed Inventory stock lifecycle action descriptor. */
    stockAction: function (options) {
        const actionCode = options.actionCode;
        const model = Object.assign({
            permission: 'commerce.inventory.operate',
            ownerModule: 'inventory',
            handlerAction: actionCode,
            operationRoute: this.actionRoute(actionCode),
            httpMethod: 'POST',
            featureState: 'ACTIVE',
            inputFields: [this.balanceCodeInput(), this.quantityInput(options.defaultQuantity), this.referenceInput(), this.reasonInput()]
        }, options);
        delete model.actionCode;
        delete model.defaultQuantity;
        return model;
    },
    /** Returns the active Inventory stock lifecycle actions exposed to BackOffice. */
    lifecycleActions: function () {
        return [
            this.stockAction({ id: 'receive-stock', label: 'Receive stock', intent: 'CREATE', actionCode: 'RECEIVE', defaultQuantity: '1', summary: 'Receive stock through Inventory-owned operation service and append movement evidence.', order: 10 }),
            this.stockAction({ id: 'adjust-stock', label: 'Adjust stock', intent: 'UPDATE', actionCode: 'ADJUST', defaultQuantity: '1', summary: 'Apply approved positive or negative stock adjustment with movement evidence.', order: 20 }),
            this.stockAction({ id: 'return-to-stock', label: 'Return to stock', intent: 'UPDATE', actionCode: 'RETURN', defaultQuantity: '1', summary: 'Record return-to-stock movement after return inspection/disposition authority approves restock.', order: 30 })
        ];
    },
    /** Returns the Inventory BackOffice capability descriptor, navigation entries, presentations, and actions. */
    getCapability: function () {
        const d = SERVICE.DefaultBackofficeCapabilityDefinitionService;
        const actions = this.lifecycleActions();
        const balance = { defaultColumns: ['code', 'warehouseCode', 'sku', 'onHand', 'reserved', 'allocated', 'available', 'revision'] };
        const movement = { defaultColumns: ['code', 'movementType', 'warehouseCode', 'sku', 'quantity', 'referenceCode', 'balanceRevision', 'occurredAt'], hiddenFields: ['correlationId'] };
        const reservation = { defaultColumns: ['code', 'warehouseCode', 'sku', 'ownerType', 'ownerCode', 'quantity', 'status', 'expiresAt'], hiddenFields: ['idempotencyKey', 'correlationId'] };
        const warehouse = { defaultColumns: ['code', 'name', 'status', 'priority', 'revision'] };
        const entry = (id, parentId, label, route, schemaName, order, summary, presentation, featureState, lifecycleActions) => d.workbench({
            id: id,
            parentId: parentId,
            label: label,
            route: route,
            moduleName: 'inventory',
            schemaName: schemaName,
            order: order,
            permission: 'commerce.inventory.read',
            summary: summary,
            presentation: presentation,
            featureState: featureState,
            lifecycleActions: lifecycleActions,
            group: id === 'inventory-operations' || !parentId ? { id: 'inventory-operations', label: 'Inventory Operations', order: 700 } : undefined
        });
        return d.capability({
            capabilityId: 'commerce-inventory',
            displayName: 'Inventory Operations',
            category: 'commerce',
            icon: 'commerce',
            navigation: [
                entry('inventory-operations', undefined, 'Inventory Workspace', '/commerce/inventory', 'inventoryBalance', 700, 'Find product or SKU, review stock and availability across warehouses, perform supported stock operations, and review reservations, movements, and exceptions.', balance, undefined, actions),
                entry('stock-availability', undefined, 'Stock and Availability', '/commerce/inventory/balances', 'inventoryBalance', 710, 'Inspect stock by product/SKU, warehouse, aggregated availability, and availability history.', balance, undefined, actions),
                entry('inventory-balances', 'stock-availability', 'Stock by Product/SKU', '/commerce/inventory/balances', 'inventoryBalance', 711, 'Inspect on-hand, reserved, allocated, and available stock.', balance, undefined, actions),
                entry('stock-operations', undefined, 'Stock Operations', '/commerce/inventory/operations', 'inventoryMovement', 720, 'Planned receiving, adjustment, hold/release, and operation history workspace.', movement, 'DISABLED'),
                entry('receiving-replenishment', undefined, 'Receiving and Replenishment', '/commerce/inventory/receiving', 'inventoryMovement', 730, 'Planned expected/actual receipts, receipt exceptions, and replenishment requirements.', movement, 'DISABLED'),
                entry('inventory-warehouses', undefined, 'Warehouses and Locations', '/commerce/inventory/warehouses', 'warehouse', 740, 'Review warehouses, locations or bins, store/POS assignments, and sourcing priority.', warehouse),
                entry('stock-transfers', undefined, 'Stock Transfers', '/commerce/inventory/transfers', 'inventoryMovement', 760, 'Planned transfers, dispatch, receipt, and transfer exception workspace.', movement, 'DISABLED'),
                entry('inventory-reservations', undefined, 'Reservations and Allocations', '/commerce/inventory/reservations', 'inventoryReservation', 770, 'Diagnose cart and order reservations, allocations, expiry, release, and exceptions.', reservation),
                entry('inventory-sourcing', undefined, 'Inventory Sourcing', '/commerce/inventory/sourcing', 'inventoryBalance', 780, 'Planned candidate warehouse, sourcing preview, and decision evidence workspace.', balance, 'DISABLED'),
                entry('stock-counts-reconciliation', undefined, 'Stock Counts and Reconciliation', '/commerce/inventory/reconciliation', 'inventoryMovement', 790, 'Planned physical count, cycle count, variance review, and approved reconciliation workspace.', movement, 'DISABLED'),
                entry('returns-stock-disposition', undefined, 'Returns and Stock Disposition', '/commerce/inventory/returns-disposition', 'inventoryMovement', 800, 'Planned return disposition workspace for restock, refurbish, quarantine, scrap, and resulting movement evidence.', movement, 'DISABLED'),
                entry('inventory-movements', undefined, 'Stock Movements and Audit', '/commerce/inventory/movements', 'inventoryMovement', 810, 'Trace receipts, reservations, releases, allocations, shipments, returns, adjustments, and audit evidence.', movement),
                entry('inventory-exceptions-recovery', undefined, 'Inventory Exceptions and Recovery', '/commerce/inventory/exceptions', 'inventoryMovement', 820, 'Planned inventory exceptions and recovery workspace.', movement, 'DISABLED'),
                entry('inventory-planning-insights', undefined, 'Inventory Planning and Insights', '/commerce/inventory/insights', 'inventoryBalance', 830, 'Planned inventory planning and insights workspace.', balance, 'DISABLED')
            ]
        });
    }
};
