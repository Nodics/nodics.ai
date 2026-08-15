/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module discoveryConfig/service/defaultDiscoveryBackofficeCapabilityService @description Publishes generic Discovery Axis capability metadata. @layer service @owner discoveryConfig */
module.exports = {
    /** Registers Discovery as a BackOffice capability provider. @returns {Promise<boolean>} Registration result. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('discoveryConfig', this);
        return Promise.resolve(true);
    },

    /** Completes provider lifecycle. @returns {Promise<boolean>} Post-init result. */
    postInit: function () { return Promise.resolve(true); },

    /** Builds Axis/BackOffice capability metadata for Discovery configuration. @returns {Object} Capability definition. */
    getCapability: function () {
        let d = SERVICE.DefaultBackofficeCapabilityDefinitionService;
        return d.capability({ capabilityId: 'discovery-management', displayName: 'Discovery', category: 'platform', icon: 'search', navigation: [
            d.workbench({ id: 'discovery-management', label: 'Discovery', route: '/discovery/config', moduleName: 'discoveryConfig', schemaName: 'discoveryIndexConfiguration', order: 240, permission: 'discovery.config.read', summary: 'Manage generic index configurations, source mixes, field mappings, query profiles, facets, ranking profiles, and publication policies.', presentation: { defaultColumns: ['code', 'name', 'ownerType', 'indexType', 'engine', 'indexName', 'status', 'revision'] } }),
            d.workbench({ id: 'discovery-source-mixes', parentId: 'discovery-management', label: 'Source Mixes', route: '/discovery/source-mixes', moduleName: 'discoveryConfig', schemaName: 'discoverySourceMixConfiguration', order: 241, permission: 'discovery.config.read', summary: 'Configure approved domain source mixes used to build Discovery documents.', presentation: { defaultColumns: ['code', 'ownerType', 'status', 'revision'] } }),
            d.workbench({ id: 'discovery-query-profiles', parentId: 'discovery-management', label: 'Query Profiles', route: '/discovery/query-profiles', moduleName: 'discoveryConfig', schemaName: 'discoveryQueryProfile', order: 242, permission: 'discovery.config.read', summary: 'Configure searchable fields, filters, sorts, and page-size policy.', presentation: { defaultColumns: ['code', 'ownerType', 'defaultSort', 'pageSizeLimit', 'status', 'revision'] } }),
            d.workbench({ id: 'discovery-facet-profiles', parentId: 'discovery-management', label: 'Facet Profiles', route: '/discovery/facet-profiles', moduleName: 'discoveryConfig', schemaName: 'discoveryFacetProfile', order: 243, permission: 'discovery.config.read', summary: 'Configure facet groups available to Product and content search experiences.', presentation: { defaultColumns: ['code', 'ownerType', 'status', 'revision'] } }),
            d.workbench({ id: 'discovery-ranking-profiles', parentId: 'discovery-management', label: 'Ranking Profiles', route: '/discovery/ranking-profiles', moduleName: 'discoveryConfig', schemaName: 'discoveryRankingProfile', order: 244, permission: 'discovery.config.read', summary: 'Configure generic ranking profile policy; domain modules own domain-specific rules.', presentation: { defaultColumns: ['code', 'ownerType', 'conflictPolicy', 'status', 'revision'] } }),
            d.workbench({ id: 'discovery-publication-policies', parentId: 'discovery-management', label: 'Publication Policies', route: '/discovery/publication-policies', moduleName: 'discoveryConfig', schemaName: 'discoveryPublicationPolicy', order: 245, permission: 'discovery.config.read', summary: 'Configure batch, alias switch, and rollback behavior for Discovery index publication.', presentation: { defaultColumns: ['code', 'ownerType', 'batchSize', 'aliasSwitch', 'rollbackEnabled', 'status', 'revision'] } })
        ] });
    }
};
