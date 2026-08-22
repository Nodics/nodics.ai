/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('assert');
const path = require('path');

const root = path.resolve(__dirname, '../../../..');

global.SERVICE = {
    DefaultBackofficeCapabilityDefinitionService: require(path.join(
        root,
        'nodics.foundation/modules/nService/src/service/module/defaultBackofficeCapabilityDefinitionService.js'
    ))
};
global.CLASSES = { NodicsError: class NodicsError extends Error {} };

const providerFiles = [
    'nodics.platform/modules/backoffice/src/service/defaultBackofficeBackofficeCapabilityService.js',
    'nodics.platform/modules/axis/src/service/defaultAxisBackofficeCapabilityService.js',
    'nodics.wcms/modules/cms/src/service/defaultCmsBackofficeCapabilityService.js',
    'nodics.wcms/modules/media/src/service/defaultMediaBackofficeCapabilityService.js',
    'nodics.wcms/modules/editorial/src/service/defaultEditorialBackofficeCapabilityService.js',
    'nodics.platform/modules/profile/src/service/defaultProfileBackofficeCapabilityService.js',
    'nodics.engagement/modules/engagementCore/src/service/defaultEngagementCoreBackofficeCapabilityService.js',
    'nodics.engagement/modules/customerReview/src/service/defaultCustomerReviewBackofficeCapabilityService.js',
    'nodics.engagement/modules/testimonial/src/service/defaultTestimonialBackofficeCapabilityService.js',
    'nodics.engagement/modules/contactSubmission/src/service/defaultContactSubmissionBackofficeCapabilityService.js',
    'nodics.engagement/modules/customerFeedback/src/service/defaultCustomerFeedbackBackofficeCapabilityService.js',
    'nodics.commerce/modules/baseCommerce/modules/product/src/service/defaultProductBackofficeCapabilityService.js',
    'nodics.commerce/modules/baseCommerce/modules/pricing/src/service/defaultPricingBackofficeCapabilityService.js',
    'nodics.commerce/modules/baseCommerce/modules/tax/src/service/defaultTaxBackofficeCapabilityService.js',
    'nodics.commerce/modules/baseCommerce/modules/store/src/service/defaultStoreBackofficeCapabilityService.js',
    'nodics.commerce/modules/baseCommerce/modules/inventory/src/service/defaultInventoryBackofficeCapabilityService.js',
    'nodics.commerce/modules/checkout/modules/order/src/service/defaultOrderBackofficeCapabilityService.js',
    'nodics.commerce/modules/checkout/modules/cart/src/service/defaultCartBackofficeCapabilityService.js',
    'nodics.commerce/modules/fulfillment/modules/fulfillmentCore/src/service/defaultFulfillmentCoreBackofficeCapabilityService.js',
    'nodics.commerce/modules/payment/modules/paymentCore/src/service/defaultPaymentCoreBackofficeCapabilityService.js',
    'nodics.commerce/modules/baseCommerce/modules/promotion/src/service/defaultPromotionBackofficeCapabilityService.js',
    'nodics.discovery/modules/discoveryConfig/src/service/defaultDiscoveryBackofficeCapabilityService.js',
    'nodics.commerce/modules/baseCommerce/modules/commerceSearch/modules/commerceSearchCore/src/service/defaultCommerceSearchBackofficeCapabilityService.js',
    'nodics.process/modules/workflow/modules/flowCore/src/service/defaultFlowCoreBackofficeCapabilityService.js',
    'nodics.cron/modules/cronjob/src/service/defaultCronjobBackofficeCapabilityService.js',
    'nodics.foundation/modules/nPublish/src/service/defaultPublishBackofficeCapabilityService.js'
];

const expected = {
    'system-integrations': ['System Workspace', 'Runtime Operations', 'Modules and Capabilities', 'Configuration and Environments', 'Integrations and Connections', 'APIs, Webhooks, and Events', 'Data Exchange', 'Schema and Data Administration', 'Operational Monitoring and Recovery', 'Platform Policies and Reference Settings'],
    content: ['Content Workspace', 'Websites and Content Catalogs', 'Page Designer', 'Pages and Routes', 'Components and Content Blocks', 'Templates and Layout', 'Navigation and Menus', 'Visibility and Experience Rules', 'Content Types and Rendering', 'Themes and Branding', 'Content Preview and Readiness', 'Content History and Insights'],
    'media-management': ['Media Workspace', 'Media Library', 'Folders and Intake Policies', 'Formats and Variants', 'Media Sets and Galleries', 'Usage and References', 'Storage and Delivery'],
    organization: ['Customer Workspace', 'Customers and Profiles', 'Segments and Audiences', 'Organisations and Business Accounts', 'Employees and Teams', 'Roles and Access', 'Customer Service and Engagement', 'Reviews and Reputation', 'Testimonials and Advocacy', 'Privacy and Customer Rights', 'Engagement Insights'],
    'products-merchandising': ['Product Workspace', 'Product Information', 'Categories and Classification', 'Catalogs and Assortments', 'Pricing', 'Tax Configuration', 'Product Readiness'],
    'search-discovery': ['Search Workspace', 'Search Experiences', 'Search Sources and Indexes', 'Query and Result Configuration', 'Facets and Filters', 'Search Merchandising and Ranking', 'Search Language and Relevance', 'Search Publication and Index Operations', 'Search Analytics and Optimization'],
    'inventory-operations': ['Inventory Workspace', 'Stock and Availability', 'Stock Operations', 'Receiving and Replenishment', 'Warehouses and Locations', 'Stock Transfers', 'Reservations and Allocations', 'Inventory Sourcing', 'Stock Counts and Reconciliation', 'Returns and Stock Disposition', 'Stock Movements and Audit', 'Inventory Exceptions and Recovery', 'Inventory Planning and Insights'],
    'orders-checkouts': ['Order and Checkout Workspace', 'Carts', 'Checkout Sessions', 'Checkout Validation', 'Checkout Placement', 'Orders', 'Order Details and Evidence', 'Order Placement Exceptions', 'Order and Checkout Insights'],
    'order-lifecycle-operations': ['Lifecycle Workspace', 'Cancellations', 'Returns', 'Refund Requests', 'Exchanges and Replacements', 'Appeals and Exceptions', 'Lifecycle Recovery', 'Lifecycle History and Audit'],
    'fulfillment-operations': ['Fulfillment Workspace', 'Fulfillment Orders', 'Fulfillment Planning', 'Picking Operations', 'Packing Operations', 'Dispatch Handover', 'Pickup and Collection', 'Return Receipt and Inspection', 'Fulfillment Exceptions and Recovery', 'Fulfillment History and Insights'],
    'shipping-operations': ['Shipping Workspace', 'Shipments and Consignments', 'Packages', 'Carriers and Services', 'Shipping Rates and Promises', 'Labels and Documents', 'Dispatch and Carrier Handover', 'Tracking and Delivery', 'Delivery Exceptions', 'Return Shipping', 'Shipping Reconciliation and Insights'],
    'payment-operations': ['Payment Workspace', 'Payment Transactions', 'Authorizations', 'Captures', 'Voids and Reversals', 'Refund Execution', 'Payment Methods', 'Payment Providers', 'Reconciliation and Settlement', 'Disputes and Chargebacks', 'Payment Exceptions and Recovery', 'Payment Audit and Insights'],
    'promotions-discounts': ['Promotion Workspace', 'Promotions', 'Discount Rules', 'Coupons and Promotion Codes', 'Eligibility and Qualification', 'Priority, Combination, and Stacking', 'Schedules and Budgets', 'Promotion Evaluation', 'Promotion Governance', 'Promotion Insights'],
    'editorial-space': ['Editorial Workspace', 'Editorial Content', 'Article Editor', 'Editorial Review and Approval', 'Languages and Localization', 'Authors', 'Taxonomy', 'Series', 'Featured and Special Content', 'Corrections and Governance', 'Content Type Policies', 'Editorial Calendar', 'Editorial Preview and Distribution', 'Editorial History and Insights'],
    'process-and-automations': ['Operations Workspace', 'Workflow Management', 'Pipeline Management', 'Cron Job Management', 'Triggers and Relationships', 'Automation Monitoring', 'Advanced Configuration'],
    documentation: ['Framework', 'Swaggers', 'Nodics Axis', 'Nodics Kickoff'],
    publishing: ['Publishing Workspace', 'Publication Requests', 'Approval Queue', 'Scheduled Publications', 'Publication Manifests', 'Staged-to-Online Operations', 'Online Publications', 'Publication Dependencies', 'Failures and Recovery', 'Withdrawals and Rollbacks', 'Publishing History', 'Publishing Audit', 'Publishing Configuration']
};

const rootLabelsByGroup = {};
providerFiles.forEach(file => {
    const capability = require(path.join(root, file)).getCapability();
    (capability.navigation || []).forEach(item => {
        if (!item.group || item.featureState === 'HIDDEN' || item.parentId) return;
        rootLabelsByGroup[item.group.id] = rootLabelsByGroup[item.group.id] || [];
        rootLabelsByGroup[item.group.id].push(item.label);
    });
});

Object.entries(expected).forEach(([groupId, expectedLabels]) => {
    assert.deepStrictEqual(
        new Set(rootLabelsByGroup[groupId] || []),
        new Set(expectedLabels),
        `Locked first-level hierarchy mismatch for ${groupId}`
    );
});

console.log('Axis locked first-level navigation hierarchy contract passed');
