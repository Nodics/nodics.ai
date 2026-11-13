/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/*
    Nodics - governed by the repository LICENSE.
 */

const { isDeepStrictEqual } = require('node:util');

const targetFields = ['site', 'path', 'locale', 'channel', 'accessMode'];


const textFields = ['title', 'heading', 'subtitle', 'body', 'summary', 'description', 'text', 'content', 'markdown', 'label'];

/**
 * @module cms/service/publication/DefaultCmsPublicationReviewService
 * @description Gives a current Process reviewer a private, read-only view of one frozen CMS revision.
 * @layer service
 * @owner cms
 * @override Preserve original employee admission, exact Process binding, and the safe projection.
 */
module.exports = {
    /** Validates a bounded owner publication or Process identity. */
    identity: function (value) { return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(value); },

    /** Projects only the canonical publication target fields. */
    targetOf: function (route) { return Object.fromEntries(targetFields.map(field => [field, route[field]])); },

    /** Compares exact canonical publication target coordinates. */
    sameTarget: function (left, right) { return targetFields.every(field => left?.[field] === right[field]); },

    /** Rejects an unrelated, closed, or inaccessible review without exposing publication identity. */
    deny: function () {
        throw new CLASSES.NodicsError('ERR_AUTH_00003', 'This CMS approval task is unavailable to your reviewer account');
    },

    /** Checks the exact Process-owned task, current assignment, and immutable approval context. */
    binding: async function (request, scope, instanceCode, taskCode) {
        let detail;
        try {
            detail = await SERVICE.DefaultCmsPublicationWorkflowService.readReviewInstance(instanceCode, request);
        } catch (error) {
            if (['ERR_AUTH_00001', 'ERR_AUTH_00003', 'ERR_PROCESS_00007', 'ERR_PROCESS_00008',
                'ERR_PROCESS_00013'].includes(error.code) || [401, 403, 404].includes(Number(error.status))) this.deny();
            throw new CLASSES.NodicsError('ERR_CMS_00115');
        }
        const instance = detail?.instance, context = instance?.context;
        const tasks = detail?.tasks?.filter(task => task.code === taskCode) || [];
        const task = tasks[0], review = task?.reviewContext;
        if (instance?.code !== instanceCode || instance.definitionCode !== 'cmsPublicationApproval' ||
            !['RUNNING', 'WAITING'].includes(instance.status) || tasks.length !== 1 ||
            task.instanceCode !== instanceCode || task.nodeCode !== 'publicationReview' ||
            !['OPEN', 'CLAIMED', 'ESCALATED'].includes(task.status) ||
            task.status === 'CLAIMED' && task.assignee !== request.authData.loginId ||
            task.reviewerEligibility?.eligible === false ||
            review?.contractVersion !== 1 || review.owner !== 'cms' ||
            !context || context.tenantCode !== scope.tenant || context.enterpriseCode !== scope.enterpriseCode ||
            !this.identity(context.publicationCode) || review.publicationCode !== context.publicationCode ||
            review.sourceVersion !== context.sourceVersion || review.rootCode !== context.siteCode ||
            !Number.isSafeInteger(context.publicationRevision) ||
            instanceCode !== SERVICE.DefaultCmsPublicationWorkflowService.reference({
                code: context.publicationCode, revision: context.publicationRevision
            })) this.deny();
        return context;
    },

    /** Reads the pending lifecycle record after Process has admitted the original employee. */
    publication: async function (context, instanceCode, scope, request) {
        const row = await SERVICE.DefaultPublicationLifecycleService.get({
            ...request, publicationCode: context.publicationCode
        });
        if (row.code !== context.publicationCode || row.domain !== 'cms' ||
            row.state !== 'PENDING_APPROVAL' || row.revision !== context.publicationRevision ||
            row.workflowRef !== instanceCode || row.sourceVersion !== context.sourceVersion ||
            row.siteCode !== context.siteCode || row.catalogCode !== context.catalogCode ||
            (row.tenantCode && row.tenantCode !== scope.tenant) ||
            (row.enterpriseCode && row.enterpriseCode !== scope.enterpriseCode)) this.deny();
        return row;
    },

    /** Expands an exact retained route, including a shared component tree or indexed site bundle. */
    route: async function (manifest, target, manifests, request) {
        let snapshot = manifest?.snapshot;
        if (snapshot?.bundleType === 'SITE_INDEX') {
            const match = snapshot.routes.filter(route => this.sameTarget(route, target));
            if (match.length !== 1) return undefined;
            const child = await manifests.getManifest(match[0].manifestCode, request);
            if (child?.publicationCode !== manifest.publicationCode || child.contentHash !== match[0].contentHash)
                return undefined;
            snapshot = child.snapshot;
        }
        if (snapshot?.bundleType === 'SITE') {
            const match = snapshot.routes.filter(route => this.sameTarget(route, target));
            if (match.length !== 1) return undefined;
            snapshot = SERVICE.DefaultCmsDeliveryService.expandSharedComponents(match[0], snapshot.sharedComponents);
        }
        return this.sameTarget(snapshot, target) && snapshot.page ? snapshot : undefined;
    },

    /** Reconciles a legacy site release only against its exact frozen Site catalog, never a latest authoring read. */
    baselineCatalogMatches: async function (publication, predecessor, manifest, manifests, request) {
        if (predecessor.catalogCode !== undefined) return predecessor.catalogCode === publication.catalogCode;
        if (predecessor.rootType !== 'site' || predecessor.rootCode !== publication.siteCode) return false;
        const sites = (manifest.dependencies || []).filter(item => item.schema === 'cmsSite' && item.code === publication.siteCode);
        if (sites.length !== 1) return false;
        const site = await manifests.load(sites[0], request);
        const catalog = typeof site.catalog === 'string' ? site.catalog : site.catalog?.code;
        return site.code === publication.siteCode && catalog === publication.catalogCode;
    },

    /** Captures and rechecks the Online pointer using the configured target authority. */
    baseline: async function (publication, snapshot, provider, manifests, request) {
        try {
            const read = () => publication.rootType === 'site' ? provider.getOnlineVersion(publication, request) :
                provider.transport().getStatus({ scope: this.targetOf(snapshot) }, request);
            const pointer = await read();
            if (pointer === null) return { status: 'NEW' };
            if (typeof pointer?.version !== 'string' || !pointer.version) return { status: 'UNAVAILABLE' };
            const manifest = await manifests.getManifest(pointer.version, request);
            if (manifest?.code !== pointer.version || !manifest.snapshot) return { status: 'UNAVAILABLE' };
            const predecessor = await SERVICE.DefaultPublicationLifecycleService.get({
                ...request, publicationCode: manifest.publicationCode
            });
            if (predecessor.domain !== 'cms' || predecessor.siteCode !== publication.siteCode ||
                !(await this.baselineCatalogMatches(publication, predecessor, manifest, manifests, request)) ||
                (predecessor.enterpriseCode && predecessor.enterpriseCode !==
                    (request.authData.entCode || request.authData.enterpriseCode)) ||
                (await read())?.version !== pointer.version) return { status: 'UNAVAILABLE' };
            return { status: 'AVAILABLE', manifest };
        } catch (_) {
            return { status: 'UNAVAILABLE' };
        }
    },

    /** Projects known documentation blocks as bounded plain text; never exposes arbitrary source metadata or executes markup. */
    documentationBody: function (blocks, limit) {
        const parts = [];
        let remaining = Math.max(0, limit), truncated = false;
        const append = value => {
            if (typeof value !== 'string' || !value) return;
            const separator = parts.length ? '\n' : '';
            const text = separator + value;
            if (text.length > remaining) truncated = true;
            if (remaining > 0) parts.push(text.slice(0, remaining));
            remaining = Math.max(0, remaining - text.length);
        };
        const values = items => {
            if (!Array.isArray(items)) { truncated = true; return; }
            if (items.length > 1000) truncated = true;
            for (const value of items.slice(0, 1000)) {
                if (typeof value !== 'string') { truncated = true; continue; }
                append(value);
            }
        };
        if (blocks.length > 1000) truncated = true;
        for (const block of blocks.slice(0, 1000)) {
            if (!block || typeof block !== 'object') { truncated = true; continue; }
            if (['paragraph', 'heading', 'code', 'diagram', 'quote', 'callout'].includes(block.kind)) append(block.text);
            else if (['ordered-list', 'unordered-list'].includes(block.kind)) values(block.items);
            else if (block.kind === 'table') {
                values(block.headers);
                if (!Array.isArray(block.rows)) { truncated = true; continue; }
                if (block.rows.length > 1000) truncated = true;
                for (const row of block.rows.slice(0, 1000)) values(row);
            } else if (block.kind === 'image') {
                append(block.alt || block.title);
                if (typeof block.mediaCode === 'string') append('Media: ' + block.mediaCode);
            } else truncated = true;
        }
        return { text: parts.join(''), truncated };
    },

    /** Bounds preview text globally; only allowlisted plain content fields leave CMS. */
    component: function (item, budget) {
        const fields = {};
        const source = item.renderer === 'experience.targeting' && item.targeting ? this.targetingFields(item.targeting) : item.properties;
        for (const field of item.renderer === 'experience.targeting' ? Object.keys(source || {}) : textFields) {
            const value = source?.[field];
            if (typeof value !== 'string' || !value) continue;
            const limit = Math.min(budget.remaining, 4000);
            if (value.length > limit) budget.truncated = true;
            if (limit > 0) fields[field] = value.slice(0, limit);
            budget.remaining -= fields[field]?.length || 0;
        }
        if (item.renderer === 'documentation.component.article' && Array.isArray(item.properties?.blocks)) {
            const body = this.documentationBody(item.properties.blocks, Math.min(budget.remaining, 40000));
            if (body.text) fields.documentationBody = body.text;
            budget.remaining -= body.text.length;
            budget.truncated ||= body.truncated;
        }
        return { code: item.code, renderer: item.renderer, slot: item.slot, fields };
    },

    /** Presents frozen targeting as named inert values rather than a backend JSON document. */
    targetingFields: function (placement) {
        const fields = {};
        for (const key of ['code','site','pageType','slot','targetType','targetCode','component','rendererKey','contractVersion','specificity','priority','locale','channel','device','deliveryStatus','revision'])
            if (['string','number','boolean'].includes(typeof placement[key])) fields[key] = String(placement[key]);
        for (const [key, value] of Object.entries(placement.properties || {})) {
            if (['string','number','boolean'].includes(typeof value)) fields['content.' + key] = String(value);
            else if (value !== undefined) fields['content.' + key] = JSON.stringify(value);
        }
        for (const key of ['validFrom','validUntil','restrictions','audiences'])
            if (placement[key] !== undefined) fields[key] = typeof placement[key] === 'string' ? placement[key] : JSON.stringify(placement[key]);
        return fields;
    },

    /** Keeps component placement stable across edits and compares the whole frozen model. */
    components: function (page) {
        const result = new Map();
        const visit = (items, parent) => {
            const occurrences = new Map();
            for (const item of items || []) {
                const count = occurrences.get(item.code) || 0;
                occurrences.set(item.code, count + 1);
                const branch = [...parent, [item.code, count]];
                const { components, ...own } = item;
                result.set(JSON.stringify(branch), own);
                visit(components, branch);
            }
        };
        visit(page.components, []);
        return result;
    },

    /** Compares exact route content and supplies a bounded before/after summary. */
    project: function (route, previous, status, budget, placements = [], priorPlacements = []) {
        const current = this.components(route.page);
        const prior = previous ? this.components(previous.page) : new Map();
        const attach = (map, entries) => {
            const codes = new Set([...map.values()].map(item=>item.code));
            for (const placement of entries) if (placement.site === route.site && codes.has(placement.component) && (!placement.locale || placement.locale === route.locale) && (!placement.channel || placement.channel === route.channel)) {
                map.set('placement:'+placement.code,{code:placement.code,renderer:'experience.targeting',slot:placement.slot,
                    targeting: placement});
            }
        };
        attach(current,placements);attach(prior,priorPlacements);
        const changes = [];
        const components = [];
        const limit = Math.min(budget.components, 40);
        if (current.size > limit || prior.size > limit) budget.truncated = true;
        for (const [key, item] of [...current].slice(0, limit)) {
            const component = this.component(item, budget);
            components.push(component);
            if (previous && !isDeepStrictEqual(item, prior.get(key))) changes.push({
                kind: prior.has(key) ? 'UPDATED' : 'ADDED', component,
                ...(prior.has(key) ? { before: this.component(prior.get(key), budget) } : {})
            });
        }
        if (previous) {
            for (const [key, item] of [...prior].slice(0, limit)) {
                if (!current.has(key)) changes.push({ kind: 'REMOVED', before: this.component(item, budget) });
            }
        }
        budget.components -= Math.min(limit, Math.max(current.size, prior.size));
        return {
            target: this.targetOf(route),
            page: { code: route.page.code, name: route.page.name, renderer: route.page.renderer,
                template: route.page.templateContract?.code },
            components,
            changes: {
                status: previous ? (isDeepStrictEqual(route, previous) && isDeepStrictEqual(current,prior) ? 'UNCHANGED' : 'CHANGED') : status,
                previousPageName: previous?.page.name,
                navigationChanged: previous ? !isDeepStrictEqual(route.navigation, previous.navigation) : false,
                components: changes
            }
        };
    },

    /** Returns only frozen evidence, with no generic lifecycle response or write operation. */
    inspect: async function (original) {
        const { instanceCode, taskCode } = original.httpRequest?.params || {};
        if (!this.identity(instanceCode) || !this.identity(taskCode)) this.deny();
        const headers = original.httpRequest?.headers || {};
        const request = { ...original, authorization: headers.authorization || headers.Authorization };
        const scope = SERVICE.DefaultCmsDesignerAccessService.authorize(request, 'cms.publication.approve');
        const provider = SERVICE.DefaultCmsPublicationVersionProviderService;
        provider.assertStagedRuntime();
        const context = await this.binding(request, scope, instanceCode, taskCode);
        // Privileged calls below are private exact reads. No HTTP payload, filters or flags enter them.
        const read = { tenant: scope.tenant, authData: { ...request.authData,
            ...SERVICE.DefaultIdentityGovernanceService.getSystemAuthData() } };
        const publication = await this.publication(context, instanceCode, scope, read);
        const manifests = provider.manifests();
        const snapshot = await manifests.buildSnapshot(publication, read);
        const baseline = await this.baseline(publication, snapshot, provider, manifests, read);
        const placements = await manifests.publicationExperiencePlacements(publication, snapshot, read);
        const budget = { remaining: 160000, components: 300, truncated: false };
        const routes = [];
        for (const target of snapshot.routes || [snapshot]) {
            const route = snapshot.routes ? await this.route({ snapshot }, target, manifests, read) : target;
            const previous = baseline.manifest && await this.route(baseline.manifest, target, manifests, read);
            routes.push(this.project(route, previous, baseline.status === 'NEW' ? 'NEW' : 'UNAVAILABLE', budget, placements, baseline.manifest?.cmsExperiencePlacements || []));
        }
        const fresh = await this.binding(request, scope, instanceCode, taskCode);
        await this.publication(fresh, instanceCode, scope, read);
        if (!isDeepStrictEqual(context, fresh)) this.deny();
        const dependencies = publication.dependencies || [];
        const media = manifests.publicationMediaCodes(publication, snapshot);
        return {
            contractVersion: 1, publicationCode: publication.code, sourceVersion: publication.sourceVersion,
            revision: publication.revision, taskCode, instanceCode, catalogCode: publication.catalogCode,
            prerequisites: { validated: publication.validation?.valid === true,
                dependencyCount: dependencies.length,
                dependencies: dependencies.slice(0, 100).map(({ schema, code, version }) => ({ schema, code, version })),
                media: media.slice(0, 100), mediaCount: media.length },
            routes, truncated: budget.truncated
        };
    }
};
