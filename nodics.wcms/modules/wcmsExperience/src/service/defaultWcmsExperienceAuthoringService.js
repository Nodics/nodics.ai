/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const crypto = require('node:crypto');
const _ = require('lodash');
const vocabulary = require('../utils/enums');
/** @module wcmsExperience/service/defaultWcmsExperienceAuthoringService
 * @description Guided edits of existing scoped experience placements with exact source and revision checks.
 * @owner wcmsExperience @layer service
 * @override Extend declared choices through this owner, preserving CMS scope and one-attempt writes. */
module.exports = {
    /** Returns a stable conflict without disclosing transport or storage details. */
    fail: function () { throw new CLASSES.NodicsError('ERR_WCMS_EXPERIENCE_AUTHORING_CONFLICT'); },
    /** Reads inert scope input only; authority always comes from the original employee request. */
    input: function (request) { return request.httpRequest?.body && Object.keys(request.httpRequest.body).length
        ? request.httpRequest.body : request.httpRequest?.query || request.body || request.query || {}; },
    /** Hashes exact owner evidence, including the complete saved page tree and placement values. */
    stamp: function (value) { return crypto.createHash('sha256').update(SERVICE.DefaultCmsDesignerReadService.stable(value)).digest('hex'); },
    /** Inspects only explicitly owned CMS page roots and their existing Site placements. */
    inspect: async function (request) {
        const input = this.input(request), access = SERVICE.DefaultCmsDesignerAccessService;
        if (CONFIG.get('runtimeRole')?.publication !== 'STAGED') access.deny();
        const selection = _.pick(input, ['catalogCode', 'siteCode', 'pageCode']);
        request.cmsDesigner = selection;
        access.authorize(request, 'WCMS_EXPERIENCE_VIEW');
        const scoped = { ...request, cmsDesigner: selection, body: selection };
        const scope = await access.scope(scoped, 'cms.backoffice.view');
        const saved = (await SERVICE.DefaultCmsDesignerReadService.getDraft(scoped)).result;
        if (!saved.editable) this.fail();
        const roots = saved.draft.sections.flatMap(section => section.components);
        const all = await access.records('DefaultCmsExperiencePlacementService', scoped, { site: scope.siteCode, active: true });
        if (all.length > (CONFIG.get('wcmsExperience')?.stagedPreview?.maximumPlacements || 100) ||
            new Set(all.map(row => row.code)).size !== all.length) this.fail();
        for (const row of all) if (row.authoringScope && !access.matches(row, scope, 'DefaultCmsExperiencePlacementService')) access.deny();
        const rows = all.filter(row => roots.some(component => component.code === row.component));
        const project = row => {
            if (!Number.isSafeInteger(row.revision) || row.revision < 0 || !Number.isSafeInteger(row.priority) ||
                !Number.isSafeInteger(row.contractVersion) || row.contractVersion < 0) this.fail();
            return _.pick(row, ['code','site','pageType','slot','targetType','targetCode','component','rendererKey','contractVersion','priority','locale','channel','revision','authoringScope']);
        };
        const placements = rows.map(project), competingPlacements = all.map(project);
        const targets = [{ targetType: 'DEFAULT', targetCode: '*', label: 'Default fallback' }];
        for (const row of all) if (!targets.some(item => item.targetType === row.targetType && item.targetCode === row.targetCode))
            targets.push({ targetType: row.targetType, targetCode: row.targetCode, label: row.targetType + ' · ' + row.targetCode });
        const security = SERVICE.DefaultSecuredRequestPipelineService;
        const canEdit = ['WCMS_EXPERIENCE_EDIT','cms.authoring.write'].every(permission => security.isPermissionGranted(permission, security.getGrantedPermissions(request), {}));
        access.authorize(request, 'WCMS_EXPERIENCE_VIEW');
        return { contractVersion: 1, ...selection, sourceVersion: this.stamp([saved.sourceVersion, all]),
            pageSourceVersion: saved.sourceVersion, pageName: saved.draft.page.name, route: saved.draft.route,
            pageTypes: Object.values(vocabulary.WcmsExperiencePageType.definition), slots: Object.values(vocabulary.WcmsExperienceSlot.definition),
            targets, components: roots.map(row => ({ code: row.code, label: row.properties?.title || row.code })),
            placements, competingPlacements, canEdit, maximumAbsolutePriority: CONFIG.get('wcmsExperience').authoring.maximumAbsolutePriority, presentation: { targetHelp: 'Select a configured target for this website. Product and collection identities remain owned by their business modules.' } };
    },
    /** Saves one inspected placement once. A changed page or competing placement requires a fresh review. */
    save: async function (request) {
        const input = this.input(request), access = SERVICE.DefaultCmsDesignerAccessService;
        const allowed = ['catalogCode','siteCode','pageCode','sourceVersion','code','expectedRevision','slot','targetType','targetCode','priority'];
        if (Object.keys(input).some(key => !allowed.includes(key))) this.fail();
        request.cmsDesigner = _.pick(input, ['catalogCode', 'siteCode', 'pageCode']);
        access.authorize(request, 'WCMS_EXPERIENCE_EDIT'); access.authorize(request, 'cms.authoring.write');
        const current = await this.inspect(request);
        const selected = current.placements.find(row => row.code === input.code);
        if (!current.canEdit || !selected || current.sourceVersion !== input.sourceVersion || selected.revision !== input.expectedRevision ||
            !current.slots.includes(input.slot) || !Number.isSafeInteger(input.priority) || Math.abs(input.priority) > current.maximumAbsolutePriority ||
            !current.targets.some(row => row.targetType === input.targetType && row.targetCode === input.targetCode)) this.fail();
        // Equal-priority overlaps need an explicit business choice, not a silent timestamp/code tie-break.
        if (current.competingPlacements.some(row => row.code !== input.code && row.pageType === selected.pageType && row.slot === input.slot &&
            row.targetType === input.targetType && row.targetCode === input.targetCode && row.priority === input.priority &&
            row.locale === selected.locale && row.channel === selected.channel)) throw new CLASSES.NodicsError('ERR_WCMS_EXPERIENCE_PRIORITY_CONFLICT');
        access.authorize(request, 'WCMS_EXPERIENCE_EDIT'); access.authorize(request, 'cms.authoring.write');
        const changes = _.pick(input, ['slot','targetType','targetCode','priority']);
        const service = SERVICE.DefaultCmsExperiencePlacementService;
        const response = await service.update({ tenant: request.tenant, authData: access.persistenceAuth(),
            query: { code: selected.code, site: input.siteCode, revision: input.expectedRevision },
            model: { $set: { ...changes, revision: input.expectedRevision + 1 } } });
        const result = response?.result;
        if (!response || response.error || response.success === false || response.acknowledged === false ||
            !result || result.acknowledged === false || result.modifiedCount !== 1) this.fail();
        const after = await this.inspect(request), saved = after.placements.find(row => row.code === input.code);
        if (!saved || saved.revision !== input.expectedRevision + 1 || Object.entries(changes).some(([key, value]) => !_.isEqual(saved[key], value))) this.fail();
        return { status: 'SAVED', code: saved.code, revision: saved.revision, sourceVersion: after.sourceVersion, onlineChanged: false };
    }
};
