/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics source-available software. See root LICENSE. */
/** @module fulfillmentCore/service/DefaultFulfillmentCoreBackofficeCapabilityService @description Publishes Fulfillment-owned BackOffice operations, shipment, and return-receipt workspaces. @layer service @owner fulfillmentCore */
module.exports = {
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('fulfillmentCore', this);
        return Promise.resolve(true);
    },
    postInit: function () { return Promise.resolve(true); },
    getCapability: function () {
        let d = SERVICE.DefaultBackofficeCapabilityDefinitionService;
        let consignmentColumns = { defaultColumns: ['code', 'orderCode', 'status', 'currency', 'totalAmount', 'revision', 'occurredAt'], hiddenFields: ['ownerId', 'idempotencyKey', 'correlationId', 'evidence'] };
        let shipmentColumns = { defaultColumns: ['code', 'orderCode', 'status', 'revision', 'occurredAt'], hiddenFields: ['ownerId', 'idempotencyKey', 'correlationId', 'evidence'] };
        let returnColumns = { defaultColumns: ['code', 'orderCode', 'requestType', 'reasonCode', 'status', 'revision', 'occurredAt'], hiddenFields: ['ownerId', 'idempotencyKey', 'correlationId', 'evidence'] };
        let item = (id, label, route, schemaName, order, permission, summary, group, columns, state) => d.workbench({
            id: id,
            label: label,
            route: route,
            moduleName: 'fulfillmentCore',
            schemaName: schemaName,
            order: order,
            permission: permission,
            summary: summary,
            group: group,
            presentation: columns,
            featureState: state
        });
        let fulfillmentGroup = { id: 'fulfillment-operations', label: 'Fulfillment Operations', order: 1000 };
        let shippingGroup = { id: 'shipping-operations', label: 'Shipping Operations', order: 1100 };
        return d.capability({
            capabilityId: 'commerce-fulfillment',
            displayName: 'Fulfillment Operations',
            category: 'commerce',
            icon: 'commerce',
            navigation: [
                item('fulfillment-operations', 'Fulfillment Workspace', '/commerce/fulfillment', 'consignment', 1000, 'commerce.fulfillment.read', 'Review fulfillment orders, planning, picking, packing, dispatch handover, pickup, returns, exceptions, and insights.', fulfillmentGroup, consignmentColumns),
                item('fulfillment-orders', 'Fulfillment Orders', '/commerce/fulfillment/orders', 'consignment', 1010, 'commerce.fulfillment.read', 'Inspect open, partial, completed, and cancelled fulfillments.', fulfillmentGroup, consignmentColumns),
                item('fulfillment-planning', 'Fulfillment Planning', '/commerce/fulfillment/planning', 'consignment', 1020, 'commerce.fulfillment.read', 'Planned fulfillment location, item grouping, split/partial fulfillment, backorder, and allocation status workspace.', fulfillmentGroup, consignmentColumns, 'DISABLED'),
                item('picking-operations', 'Picking Operations', '/commerce/fulfillment/picking', 'consignment', 1030, 'commerce.fulfillment.read', 'Planned picking operations workspace.', fulfillmentGroup, consignmentColumns, 'DISABLED'),
                item('packing-operations', 'Packing Operations', '/commerce/fulfillment/packing', 'consignment', 1040, 'commerce.fulfillment.read', 'Planned packing operations workspace.', fulfillmentGroup, consignmentColumns, 'DISABLED'),
                item('dispatch-handover', 'Dispatch Handover', '/commerce/fulfillment/dispatch', 'consignment', 1050, 'commerce.fulfillment.read', 'Planned carrier handover, store pickup handover, and confirmation workspace.', fulfillmentGroup, consignmentColumns, 'DISABLED'),
                item('pickup-collection', 'Pickup and Collection', '/commerce/fulfillment/pickup', 'consignment', 1060, 'commerce.fulfillment.read', 'Planned pickup and collection workspace.', fulfillmentGroup, consignmentColumns, 'DISABLED'),
                item('return-receipts', 'Return Receipt and Inspection', '/commerce/fulfillment/returns', 'returnInspection', 1080, 'commerce.fulfillment.return', 'Record returned-goods receipt and inspection before Inventory disposition.', fulfillmentGroup, returnColumns),
                item('fulfillment-exceptions-recovery', 'Fulfillment Exceptions and Recovery', '/commerce/fulfillment/exceptions', 'consignment', 1090, 'commerce.fulfillment.read', 'Planned fulfillment exceptions and recovery workspace.', fulfillmentGroup, consignmentColumns, 'DISABLED'),
                item('fulfillment-history-insights', 'Fulfillment History and Insights', '/commerce/fulfillment/insights', 'consignment', 1095, 'commerce.fulfillment.read', 'Planned fulfillment history and insights workspace.', fulfillmentGroup, consignmentColumns, 'DISABLED'),
                item('shipping-operations', 'Shipping Workspace', '/commerce/shipping', 'shipment', 1100, 'commerce.fulfillment.read', 'Inspect shipments, packages, carrier services, rates, labels, tracking, delivery events, exceptions, returns, and reconciliation.', shippingGroup, shipmentColumns),
                item('shipments', 'Shipments and Consignments', '/commerce/fulfillment/shipments', 'shipment', 1110, 'commerce.fulfillment.read', 'Inspect partial shipment and carrier-safe tracking evidence.', shippingGroup, shipmentColumns),
                item('shipping-packages', 'Packages', '/commerce/shipping/packages', 'shipment', 1120, 'commerce.fulfillment.read', 'Planned packages workspace.', shippingGroup, shipmentColumns, 'DISABLED'),
                item('shipping-carriers-services', 'Carriers and Services', '/commerce/shipping/carriers', 'shipment', 1130, 'commerce.fulfillment.read', 'Planned carriers and services workspace.', shippingGroup, shipmentColumns, 'DISABLED'),
                item('shipping-rates-promises', 'Shipping Rates and Promises', '/commerce/shipping/rates', 'shipment', 1140, 'commerce.fulfillment.read', 'Planned shipping rates and promises workspace.', shippingGroup, shipmentColumns, 'DISABLED'),
                item('shipping-labels-documents', 'Labels and Documents', '/commerce/shipping/labels', 'shipment', 1150, 'commerce.fulfillment.read', 'Planned labels and documents workspace.', shippingGroup, shipmentColumns, 'DISABLED'),
                item('shipping-dispatch-handover', 'Dispatch and Carrier Handover', '/commerce/shipping/dispatch', 'shipment', 1160, 'commerce.fulfillment.read', 'Planned dispatch and carrier handover workspace.', shippingGroup, shipmentColumns, 'DISABLED'),
                item('tracking-delivery', 'Tracking and Delivery', '/commerce/shipping/tracking', 'shipment', 1170, 'commerce.fulfillment.read', 'Planned tracking and delivery workspace.', shippingGroup, shipmentColumns, 'DISABLED'),
                item('delivery-exceptions', 'Delivery Exceptions', '/commerce/shipping/exceptions', 'shipment', 1180, 'commerce.fulfillment.read', 'Planned delayed, failed, lost, damaged, address-problem, re-delivery, and return-to-sender workspace.', shippingGroup, shipmentColumns, 'DISABLED'),
                item('return-shipping', 'Return Shipping', '/commerce/shipping/returns', 'shipment', 1190, 'commerce.fulfillment.read', 'Planned return-shipping workspace.', shippingGroup, shipmentColumns, 'DISABLED'),
                item('shipping-reconciliation-insights', 'Shipping Reconciliation and Insights', '/commerce/shipping/insights', 'shipment', 1195, 'commerce.fulfillment.read', 'Planned shipping reconciliation and insights workspace.', shippingGroup, shipmentColumns, 'DISABLED')
            ]
        });
    }
};
