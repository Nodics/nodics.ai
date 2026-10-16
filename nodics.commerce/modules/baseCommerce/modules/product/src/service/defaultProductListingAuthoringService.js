/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const crypto = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");
// Only verified handoff can mint exact-request graph admission; inspect mode never writes.
const humanAdmissions = new WeakMap();
const handoffReads = new WeakMap();
/** @module product/service/defaultProductListingAuthoringService @description Authors a source-referenced listing using Product-owned records without taking ownership of prices or inventory. @layer service @owner product */
module.exports = {
  /** Reads only the independently proven original graph and genuine sealed publication evidence, without authoring or repair. */
  sourceEvidence: async function (request) {
    if (humanAdmissions.has(request) || handoffReads.has(request)) throw new Error('Listing request is already admitted');
    const originalScope = this.runtimeScope(request, 'commerce.product.read'), state = this.requestState(request), selectors = this.proofSelectors(request.payload);
    const settings = structuredClone(CONFIG.get('product')?.marketplaceAuthoring), role = structuredClone(CONFIG.get('runtimeRole'));
    const enterprisePolicy = structuredClone(CONFIG.get('publish')?.approvalWorkflow?.runtimeEnterpriseScope);
    if (settings?.enabled !== true) throw new Error('Marketplace authoring is not enabled on this runtime');
    let store;
    const check = () => {
      if (!isDeepStrictEqual(this.runtimeScope(request, 'commerce.product.read'), originalScope) || !isDeepStrictEqual(this.requestState(request), state) ||
          !isDeepStrictEqual(CONFIG.get('product')?.marketplaceAuthoring, settings) || !isDeepStrictEqual(CONFIG.get('runtimeRole'), role) ||
          !isDeepStrictEqual(CONFIG.get('publish')?.approvalWorkflow?.runtimeEnterpriseScope, enterprisePolicy))
        throw new Error('Listing source read authority changed');
      if (store && store.enterpriseCode !== originalScope.enterpriseCode) {
        const workflow = SERVICE.DefaultPublicationApprovalWorkflowService;
        if (!workflow?.requireRuntimeEnterprise) throw new Error('Listing source business enterprise is not qualified');
        workflow.requireRuntimeEnterprise(request.authData, store.enterpriseCode);
      }
    };
    handoffReads.set(request, { selectors, check });
    try {
      const proof = await this.readIntentProof(request, selectors); check();
      store = await this.readStore(request, selectors.storeCode); check();
      if (!isDeepStrictEqual(store, proof.storeContext) || proof.authoringContext.catalogVersion !== settings.catalogVersion ||
          !Array.isArray(settings.locales) || !isDeepStrictEqual([...proof.authoringContext.locales].sort(), [...settings.locales].sort()))
        throw new Error('Listing source Store or authoring terms changed');
      const binding = { contractVersion: 1, assetCode: proof.assetCode, listingKey: proof.listingKey,
        requestRevision: proof.requestRevision, intentDigest: proof.intentDigest, storeContext: proof.storeContext };
      const admitted = { mode: 'inspect', scope: { tenant: originalScope.tenant, enterpriseCode: store.enterpriseCode },
        command: proof.productCommand, binding, check };
      humanAdmissions.set(request, admitted);
      const graph = await this.create(request); check(); admitted.inspection = graph;
      const publication = await this.listingPublicationEvidence(request, graph); check();
      const freshProof = await this.readIntentProof(request, selectors); check();
      const freshStore = await this.readStore(request, selectors.storeCode); check();
      const freshGraph = await this.create(request); check();
      if (!isDeepStrictEqual(freshProof, proof) || !isDeepStrictEqual(freshStore, store) || !isDeepStrictEqual(freshGraph, graph))
        throw new Error('Listing source evidence changed during readback');
      return { contractVersion: 1, tenant: originalScope.tenant, assetCode: selectors.assetCode,
        listingKey: selectors.listingKey, intentDigest: selectors.intentDigest, storeCode: selectors.storeCode,
        product: graph.present ? { productCode: graph.productCode, variantCode: graph.variantCode, sku: graph.sku,
          catalogVersion: settings.catalogVersion, locales: [...settings.locales].sort(), versionId: graph.root.versionId } : null,
        ...publication };
    } finally { humanAdmissions.delete(request); handoffReads.delete(request); }
  },
  /** Reads the sealed root's exact publication and fresh target receipt; never discovers a latest publication or fabricates Process references. */
  listingPublicationEvidence: async function (request, graph) {
    const admitted = humanAdmissions.get(request);
    if (!admitted || admitted.mode !== 'inspect' || admitted.inspection !== graph) throw new Error('Private listing publication read admission is required');
    admitted.check();
    if (!graph.present) return { productReference: null, publicationReferences: [] };
    const sealed = graph.root.publicationReferences;
    if (!sealed && graph.root.versionId === 0) return { productReference: null, publicationReferences: [] };
    if (!sealed || typeof sealed.publicationCode !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/.test(sealed.publicationCode) ||
        sealed.storeCode !== admitted.binding.storeContext.code) throw new Error('Listing sealed publication is unavailable');
    const lifecycle = SERVICE.DefaultPublicationLifecycleService, provider = SERVICE.DefaultProductPublicationVersionProviderService;
    if (!lifecycle?.get || !provider?.getVersion) throw new Error('Listing publication owner is unavailable');
    const context = { ...admitted.scope, authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(), publicationCode: sealed.publicationCode };
    const publication = await lifecycle.get(context); admitted.check();
    if (publication?.code !== sealed.publicationCode || publication.domain !== 'product' || publication.rootType !== 'product' ||
        publication.rootCode !== graph.productCode || publication.tenantCode !== admitted.scope.tenant ||
        publication.enterpriseCode !== admitted.scope.enterpriseCode || publication.sourceVersion !== String(graph.root.versionId) ||
        typeof publication.state !== 'string' || !/^[A-Z_]{1,32}$/.test(publication.state)) throw new Error('Listing publication identity mismatch');
    const manifest = await provider.getVersion(publication, context); admitted.check();
    const scope = { tenant: admitted.scope.tenant, productCode: graph.productCode, storeCode: admitted.binding.storeContext.code };
    if (!/^[a-f0-9]{64}$/.test(manifest?.version || '') || !isDeepStrictEqual(manifest.scope, scope) ||
        manifest.root?.code !== graph.productCode || manifest.root.enterpriseCode !== admitted.scope.enterpriseCode ||
        manifest.root.versionId !== graph.root.versionId || !isDeepStrictEqual(manifest.root.listingAuthoring, graph.root.listingAuthoring))
      throw new Error('Listing immutable publication graph mismatch');
    const process = publication.workflow?.instanceCode;
    if (process !== undefined && (typeof process !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/.test(process)))
      throw new Error('Listing Process reference is invalid');
    const publicationReferences = [{ domain: 'product', code: publication.code, state: publication.state,
      ...(process !== undefined ? { processCode: process } : {}) }];
    let productReference = null;
    if (publication.state === 'ONLINE') {
      if (!publication.auditTrail?.some(entry => entry.toState === 'APPROVED') || !publication.activationOperation?.key ||
          publication.targetVersion !== manifest.version || !provider.transport) throw new Error('Listing publication approval is unconfirmed');
      const input = { scope, operationKey: publication.activationOperation.key };
      const status = await provider.transport().getStatus(input, context); admitted.check();
      const receipt = status?.receipt;
      if (status?.version !== manifest.version || !Number.isSafeInteger(status.revision) || status.revision < 1 ||
          !isDeepStrictEqual(status.scope, scope) || receipt?.committed !== true || !isDeepStrictEqual(receipt.scope, scope) ||
          receipt.operationKey !== publication.activationOperation.key || receipt.publicationCode !== publication.code ||
          receipt.sourceVersion !== publication.sourceVersion || receipt.targetVersion !== manifest.version)
        throw new Error('Listing Product activation is unconfirmed');
      const fresh = await provider.transport().getStatus(input, context); admitted.check();
      if (!isDeepStrictEqual(fresh, status)) throw new Error('Listing Product activation changed during readback');
      productReference = { publicationCode: publication.code, productCode: graph.productCode, storeCode: scope.storeCode,
        sourceVersion: publication.sourceVersion, targetVersion: manifest.version };
    }
    const freshPublication = await lifecycle.get(context); admitted.check();
    if (!isDeepStrictEqual(freshPublication, publication)) throw new Error('Listing publication changed during readback');
    return { productReference, publicationReferences };
  },
  /** Resolves read-only source placement for an admitted Staged runtime; returns no catalogue or grant authority. */
  storeContext: async function (request) {
    if (handoffReads.has(request) || humanAdmissions.has(request)) throw new Error('Listing request is already admitted');
    const scope = this.runtimeScope(request, 'commerce.product.read'), state = this.requestState(request);
    const p = request.payload || {}, settings = structuredClone(CONFIG.get('product')?.marketplaceAuthoring);
    const role = structuredClone(CONFIG.get('runtimeRole'));
    if (Object.keys(p).sort().join(',') !== 'contractVersion,storeCode' || p.contractVersion !== 1 ||
        Object.keys(request.query || {}).length || Object.keys(request.httpRequest?.query || {}).length ||
        typeof p.storeCode !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/.test(p.storeCode) || settings?.enabled !== true ||
        typeof settings.catalogVersion !== 'string' || !settings.catalogVersion || !Array.isArray(settings.locales) ||
        !settings.locales.length || settings.locales.length > 32 || new Set(settings.locales).size !== settings.locales.length ||
        settings.locales.some(locale => typeof locale !== 'string' || !/^[A-Za-z0-9_-]{1,32}$/.test(locale)))
      throw new Error('Exact listing Store selection is required');
    const check = () => {
      if (!isDeepStrictEqual(this.runtimeScope(request, 'commerce.product.read'), scope) || !isDeepStrictEqual(this.requestState(request), state) ||
          !isDeepStrictEqual(CONFIG.get('runtimeRole'), role) || !isDeepStrictEqual(CONFIG.get('product')?.marketplaceAuthoring, settings))
        throw new Error('Listing Store read authority changed');
    };
    handoffReads.set(request, { selectors: structuredClone(p), check });
    try {
      const store = await this.readStore(request, p.storeCode); check();
      return { contractVersion: 1, tenant: scope.tenant, store: { ...store, active: true, status: 'ACTIVE' },
        authoring: { catalogVersion: settings.catalogVersion, locales: [...settings.locales].sort() } };
    } finally { handoffReads.delete(request); }
  },
  /** Captures business/auth coordinates without retaining raw bearer headers. */
  requestState: function (request) {
    const headers = request.httpRequest?.headers || {};
    return structuredClone({ tenant: request.tenant, tenantCode: request.tenantCode,
      enterpriseCode: request.enterpriseCode, entCode: request.entCode, authData: request.authData,
      payload: request.payload, query: request.query, body: request.httpRequest?.body, router: request.router,
      headers: Object.fromEntries(['tenant', 'x-tenant-code', 'X-Tenant-Code', 'entCode', 'x-enterprise-code', 'X-Enterprise-Code']
        .map(key => [key, headers[key]])) });
  },
  /** Admits an original private human publisher without adding groups or service claims. */
  humanScope: function (request) {
    const auth = request.authData || {}, security = SERVICE.DefaultSecuredRequestPipelineService;
    const enterpriseCode = auth.enterpriseCode || auth.entCode;
    if (CONFIG.get('runtimeRole')?.publication !== 'STAGED' || auth.tokenType !== 'access' ||
        auth.principalType !== 'human' || auth.isSystem || !(auth.principalId || auth.loginId || auth.code) ||
        SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(request) !== true ||
        !security?.isPermissionGranted?.('commerce.product.publish', security.getGrantedPermissions(request), {}) ||
        typeof auth.tenant !== 'string' || !auth.tenant || request.tenant !== auth.tenant ||
        typeof enterpriseCode !== 'string' || !enterpriseCode ||
        [request.tenantCode, auth.tenantCode, request.httpRequest?.headers?.['tenant'], request.httpRequest?.headers?.['x-tenant-code'],
          request.httpRequest?.headers?.['X-Tenant-Code']]
          .some(value => value !== undefined && value !== auth.tenant) ||
        [auth.entCode, auth.enterpriseCode, request.entCode, request.enterpriseCode,
          request.httpRequest?.headers?.['x-enterprise-code'], request.httpRequest?.headers?.['X-Enterprise-Code']]
          .some(value => value !== undefined && value !== enterpriseCode))
      throw new Error('Original scoped human Product publisher is required');
    return { tenant: auth.tenant, enterpriseCode };
  },
  /** Validates selector-only source proof input; expectedRevision is the current asset revision, not requestRevision. */
  proofSelectors: function (input) {
    const identifier = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/.test(value);
    if (!input || Object.keys(input).sort().join(',') !== 'assetCode,contractVersion,expectedRevision,intentDigest,listingKey,storeCode' ||
        input.contractVersion !== 1 || !identifier(input.assetCode) || !identifier(input.storeCode) ||
        !/^[a-f0-9]{64}$/.test(input.listingKey || '') || !/^[a-f0-9]{64}$/.test(input.intentDigest || '') ||
        !Number.isSafeInteger(input.expectedRevision) || input.expectedRevision < 1)
      throw new Error('Exact retained listing proof selectors are required');
    return structuredClone(input);
  },
  /** Reads the configured operational Store owner's fixed placement route; there is no Staged-local or current Store fallback. */
  readStore: async function (request, storeCode) {
    const admitted = handoffReads.get(request);
    if (!admitted || admitted.selectors.storeCode !== storeCode) throw new Error('Private listing Store read admission is required');
    admitted.check();
    const source = structuredClone(CONFIG.get('product')?.marketplaceAuthoring?.storeSource);
    const originalAuth = request.authData, originalRouter = request.router, originalState = this.requestState(request);
    const check = () => {
      admitted.check();
      if (request.authData !== originalAuth || request.router !== originalRouter ||
          !isDeepStrictEqual(this.requestState(request), originalState) ||
          !isDeepStrictEqual(CONFIG.get('product')?.marketplaceAuthoring?.storeSource, source))
        throw new Error('Product Store placement authority changed');
    };
    const identifier = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(value);
    if (!source || Object.keys(source).sort().join(',') !== 'allowInsecureLoopback,connectionName,connectionType,moduleName,runtimeRole,timeoutMs' ||
        source.moduleName !== 'store' || !identifier(source.connectionName) || source.connectionName === 'default' ||
        source.connectionType !== 'abstract' || !/^[A-Z][A-Z0-9_]{0,63}$/.test(source.runtimeRole || '') ||
        !Number.isInteger(source.timeoutMs) || source.timeoutMs < 1 || source.timeoutMs > 15000 ||
        typeof source.allowInsecureLoopback !== 'boolean' || !SERVICE.DefaultModuleService?.invokeModule)
      throw new Error('Product Store placement transport is not qualified');
    const token = NODICS.getInternalAuthToken?.(request.tenant);
    if (typeof token !== 'string' || !token) throw new Error('Product Store runtime authentication is unavailable');
    check();
    let response;
    try {
      response = await SERVICE.DefaultModuleService.invokeModule({ local: false, moduleName: 'store',
        connectionName: source.connectionName, connectionType: source.connectionType,
        targetAuthority: { runtimeRole: source.runtimeRole }, tenant: request.tenant, methodName: 'POST',
        apiName: '/internal/stores/placement', requestBody: { contractVersion: 1, storeCode }, maxAttempts: 1, timeoutMs: source.timeoutMs,
        secureTransport: { required: true, allowInsecureLoopback: source.allowInsecureLoopback },
        followRedirects: false, rejectUnauthorized: true, header: { Authorization: 'Bearer ' + token, tenant: request.tenant } });
    } catch (_) {
      check();
      throw new Error('Product Store placement is unavailable');
    }
    check();
    for (let depth = 0; depth < 6; depth++) {
      if (!response || typeof response !== 'object' || Array.isArray(response) || response.error || response.success === false ||
          response.acknowledged === false || (response.code !== undefined &&
            (typeof response.code !== 'string' || !/^SUC_/.test(response.code))) ||
          (response.statusCode !== undefined && (!Number.isInteger(response.statusCode) || response.statusCode < 200 || response.statusCode >= 300)) ||
          (Object.hasOwn(response, 'result') && Object.hasOwn(response, 'data')) ||
          response.errors && (!Array.isArray(response.errors) || response.errors.length)) throw new Error('Product Store placement is unavailable');
      if (Object.hasOwn(response, 'result')) response = response.result;
      else if (Object.hasOwn(response, 'data')) response = response.data;
      else break;
    }
    const row = response?.store;
    if (!response || Object.keys(response).sort().join(',') !== 'contractVersion,store,tenant' || response.contractVersion !== 1 ||
        response.tenant !== request.tenant || !row || typeof row !== 'object' || Array.isArray(row) ||
        Object.keys(row).sort().join(',') !== 'active,code,enterpriseCode,revision,status' ||
        row.code !== storeCode || row.active !== true || row.status !== 'ACTIVE' || !Number.isSafeInteger(row.revision) || row.revision < 1 ||
        typeof row.enterpriseCode !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/.test(row.enterpriseCode))
      throw new Error('Exact active Product Store placement is unavailable');
    check();
    return { code: row.code, enterpriseCode: row.enterpriseCode, revision: row.revision };
  },
  /** Consumes only the fixed read-only source proof route with this runtime's token, never the human bearer or an enterprise override. */
  readIntentProof: async function (request, selectors) {
    selectors = this.proofSelectors(selectors);
    const admitted = handoffReads.get(request);
    if (!admitted || !isDeepStrictEqual(admitted.selectors, selectors)) throw new Error('Private listing proof read admission is required');
    admitted.check();
    const source = CONFIG.get('product')?.marketplaceAuthoring?.intentSource;
    const identifier = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(value);
    if (!source || !identifier(source.moduleName) || !identifier(source.connectionName) || source.connectionName === 'default' ||
        source.connectionType !== 'abstract' || !/^[A-Z][A-Z0-9_]{0,63}$/.test(source.runtimeRole || '') ||
        !Number.isInteger(source.timeoutMs) || source.timeoutMs < 1 || source.timeoutMs > 15000 ||
        typeof source.allowInsecureLoopback !== 'boolean' || !SERVICE.DefaultModuleService?.invokeModule)
      throw new Error('Listing intent read transport is not qualified');
    const token = NODICS.getInternalAuthToken?.(request.tenant);
    if (typeof token !== 'string' || !token) throw new Error('Listing intent runtime authentication is unavailable');
    let response = await SERVICE.DefaultModuleService.invokeModule({ local: false, moduleName: source.moduleName,
      connectionName: source.connectionName, connectionType: source.connectionType,
      targetAuthority: { runtimeRole: source.runtimeRole }, tenant: request.tenant, methodName: 'POST',
      apiName: '/internal/listing-requests/proof', requestBody: selectors, maxAttempts: 1, timeoutMs: source.timeoutMs,
      secureTransport: { required: true, allowInsecureLoopback: source.allowInsecureLoopback },
      followRedirects: false, rejectUnauthorized: true,
      header: { Authorization: 'Bearer ' + token, tenant: request.tenant } });
    admitted.check();
    for (let depth = 0; depth < 6; depth++) {
      if (!response || typeof response !== 'object' || Array.isArray(response) || response.error || response.success === false ||
          response.acknowledged === false || /^ERR_/.test(response.code || '') ||
          response.errors && (!Array.isArray(response.errors) || response.errors.length)) throw new Error('Listing intent proof is unavailable');
      if (Object.hasOwn(response, 'result')) response = response.result;
      else if (Object.hasOwn(response, 'data')) response = response.data;
      else break;
    }
    return this.validateIntentProof(response, selectors, request.tenant);
  },
  /** Checks only bounded Product authoring evidence; the source owner qualifies its own business terms behind the opaque intent digest. */
  validateIntentProof: function (proof, selectors, tenant) {
    const identifier = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/.test(value);
    const reference = value => value && Object.keys(value).sort().join(',') === 'code,module,schema' &&
      ['code', 'module', 'schema'].every(key => identifier(value[key]));
    const keys = 'assetCode,assetRevision,authoringContext,contractVersion,intentDigest,listingKey,ownerRef,productCommand,requestRevision,sourceRef,storeContext,tenant';
    if (!proof || Object.keys(proof).sort().join(',') !== keys || Buffer.byteLength(JSON.stringify(proof)) > 32768 ||
        typeof tenant !== 'string' || !tenant || proof.tenant !== tenant ||
        proof.contractVersion !== 1 || proof.assetCode !== selectors.assetCode || proof.assetRevision !== selectors.expectedRevision ||
        proof.listingKey !== selectors.listingKey || proof.intentDigest !== selectors.intentDigest ||
        !Number.isSafeInteger(proof.requestRevision) || proof.requestRevision < 1 || proof.requestRevision > proof.assetRevision ||
        !reference(proof.sourceRef) || proof.sourceRef.code !== selectors.assetCode || !reference(proof.ownerRef) ||
        proof.ownerRef.module !== 'profile' || proof.ownerRef.schema !== 'customer' ||
        Object.keys(proof.storeContext || {}).sort().join(',') !== 'code,enterpriseCode,revision' ||
        proof.storeContext.code !== selectors.storeCode || !identifier(proof.storeContext.enterpriseCode) ||
        !Number.isSafeInteger(proof.storeContext.revision) || proof.storeContext.revision < 1 ||
        Object.keys(proof.authoringContext || {}).sort().join(',') !== 'catalogVersion,locales' ||
        !identifier(proof.authoringContext.catalogVersion) || !Array.isArray(proof.authoringContext.locales) ||
        !proof.authoringContext.locales.length || proof.authoringContext.locales.length > 32 ||
        new Set(proof.authoringContext.locales).size !== proof.authoringContext.locales.length ||
        proof.authoringContext.locales.some(locale => typeof locale !== 'string' || !/^[A-Za-z0-9_-]{1,32}$/.test(locale)))
      throw new Error('Exact retained listing proof is invalid');
    const p = proof.productCommand;
    const allowed = ['sourceRef', 'ownerRef', 'name', 'description', 'issuer', 'imageUrl', 'biddingEnabled', 'sample', 'idempotencyKey'];
    if (!p || Object.keys(p).some(key => !allowed.includes(key)) ||
        !isDeepStrictEqual(p.sourceRef, proof.sourceRef) || !isDeepStrictEqual(p.ownerRef, proof.ownerRef) ||
        p.idempotencyKey !== selectors.listingKey || typeof p.name !== 'string' || !p.name.trim() || p.name.length > 180 ||
        ['description', 'issuer', 'imageUrl'].some(key => p[key] !== undefined && (typeof p[key] !== 'string' || p[key].length > 2000)) ||
        ['biddingEnabled', 'sample'].some(key => p[key] !== undefined && typeof p[key] !== 'boolean'))
      throw new Error('Retained listing Product command is invalid');
    return structuredClone(proof);
  },
  /** Authors only the independent original intent in the authenticated Store enterprise; approval/activation remain separate. */
  createHuman: async function (request) {
    if (humanAdmissions.has(request) || handoffReads.has(request)) throw new Error('Listing authoring request is already admitted');
    const scope = this.humanScope(request), state = this.requestState(request), selectors = this.proofSelectors(request.payload);
    const settings = structuredClone(CONFIG.get('product')?.marketplaceAuthoring), role = structuredClone(CONFIG.get('runtimeRole'));
    if (settings?.enabled !== true) throw new Error('Marketplace authoring is not enabled on this runtime');
    const check = () => {
      if (!isDeepStrictEqual(this.humanScope(request), scope) || !isDeepStrictEqual(this.requestState(request), state) ||
          !isDeepStrictEqual(CONFIG.get('product')?.marketplaceAuthoring, settings) || !isDeepStrictEqual(CONFIG.get('runtimeRole'), role))
        throw new Error('Human listing authority changed');
    };
    handoffReads.set(request, { selectors, check });
    try {
      const proof = await this.readIntentProof(request, selectors); check();
      const store = await this.readStore(request, selectors.storeCode); check();
      if (!isDeepStrictEqual(store, proof.storeContext) || store.enterpriseCode !== scope.enterpriseCode ||
          proof.authoringContext.catalogVersion !== settings.catalogVersion || !Array.isArray(settings.locales) ||
          !isDeepStrictEqual([...proof.authoringContext.locales].sort(), [...settings.locales].sort()))
        throw new Error('Listing intent does not match the authenticated Store publisher');
      const binding = { contractVersion: 1, assetCode: proof.assetCode, listingKey: proof.listingKey,
        requestRevision: proof.requestRevision, intentDigest: proof.intentDigest, storeContext: proof.storeContext };
      humanAdmissions.set(request, { mode: 'human', scope, command: proof.productCommand, binding, check });
      const result = await this.create(request); check();
      const freshProof = await this.readIntentProof(request, selectors); check();
      const freshStore = await this.readStore(request, selectors.storeCode); check();
      if (!isDeepStrictEqual(freshProof, proof) || !isDeepStrictEqual(freshStore, store)) throw new Error('Listing source proof changed during authoring');
      return { ...result, locales: [...settings.locales].sort(), sourceProof: structuredClone(binding), publicationRequired: true };
    } finally { humanAdmissions.delete(request); handoffReads.delete(request); }
  },
  /** Admits only the original private Staged runtime request in its signed tenant and enterprise. */
  scope: function (request) {
    const admitted = humanAdmissions.get(request);
    if (admitted) { admitted.check(); return { ...admitted.scope }; }
    return this.runtimeScope(request);
  },
  /** Preserves service-only admission: existing creates require publish; fixed read operations require only the existing read permission. */
  runtimeScope: function (request, permission = 'commerce.product.publish') {
    const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, "product");
    if (SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(request) !== true ||
      CONFIG.get("runtimeRole")?.publication !== "STAGED" ||
      auth.principalType !== "service" || auth.isSystem ||
      !['commerce.product.publish', 'commerce.product.read'].includes(permission) || !auth.permissions?.includes(permission) ||
      [request.tenantCode, auth.tenantCode, request.httpRequest?.headers?.tenant,
        request.httpRequest?.headers?.['x-tenant-code'], request.httpRequest?.headers?.['X-Tenant-Code']]
        .some(value => value !== undefined && value !== auth.tenant) ||
      [auth.enterpriseCode, request.enterpriseCode, request.entCode, request.httpRequest?.headers?.entCode,
        request.httpRequest?.headers?.['x-enterprise-code'], request.httpRequest?.headers?.['X-Enterprise-Code']]
        .some(value => value !== undefined && value !== auth.entCode))
      throw new Error("Scoped Product listing authority is required");
    return { tenant: auth.tenant, enterpriseCode: auth.entCode };
  },
  /** Authors immutable listing identity after a trusted application confirmed its source asset. */
  create: async function (request) {
    const scope = this.scope(request);
    const policy = (CONFIG.get("product") || {}).marketplaceAuthoring || {},
      original = humanAdmissions.get(request)?.command || request.payload || {},
      p = structuredClone(original),
      originalBody = structuredClone(request.payload || {}),
      auth = structuredClone(request.authData),
      pinnedPolicy = structuredClone(policy),
      runtime = structuredClone(CONFIG.get("runtimeRole"));
    const storage = [];
    if (policy.enabled !== true)
      throw new Error("Marketplace authoring is not enabled on this runtime");
    if (
      !p.sourceRef ||
      !p.sourceRef.module ||
      !p.sourceRef.schema ||
      !p.sourceRef.code ||
      !p.ownerRef ||
      !p.ownerRef.code ||
      typeof p.name !== "string" ||
      !p.name.trim() ||
      p.name.length > 180 ||
      !p.idempotencyKey
    )
      throw new Error(
        "A source, owner, title and listing reference are required",
      );
    if ([p, p.sourceRef, p.ownerRef].some(value =>
      [value.tenant, value.tenantCode].some(tenant => tenant !== undefined && tenant !== scope.tenant) ||
      [value.enterpriseCode, value.entCode].some(enterprise => enterprise !== undefined && enterprise !== scope.enterpriseCode)) ||
      typeof policy.catalogVersion !== "string" || !policy.catalogVersion.trim() ||
      !Array.isArray(policy.locales || ["en"]) || !(policy.locales || ["en"]).length ||
      (policy.locales || ["en"]).length > 32 ||
      (policy.locales || ["en"]).some(locale => typeof locale !== "string" || !/^[A-Za-z0-9_-]{1,32}$/.test(locale)) ||
      new Set(policy.locales || ["en"]).size !== (policy.locales || ["en"]).length)
      throw new Error("Product listing scope or locale configuration is invalid");
    const check = () => {
      if (!isDeepStrictEqual(this.scope(request), scope) ||
        !isDeepStrictEqual(request.authData, auth) ||
        !isDeepStrictEqual(request.payload || {}, originalBody) ||
        !isDeepStrictEqual(CONFIG.get("runtimeRole"), runtime) ||
        !isDeepStrictEqual((CONFIG.get("product") || {}).marketplaceAuthoring || {}, pinnedPolicy) ||
        storage.some(entry => NODICS.getModels("product", scope.tenant)?.[entry.modelName] !== entry.wrapper ||
          entry.wrapper.versioned !== entry.versioned ||
          entry.wrapper.rawSchema !== entry.rawSchema ||
          entry.versioned === true && (entry.wrapper.rawSchema?.versionedReadMode !== "CURRENT" ||
            entry.wrapper.primaryKey !== "code" || entry.wrapper.getCurrentVersionItems !== entry.getCurrentVersionItems ||
            entry.wrapper.saveVersionedItems !== entry.saveVersionedItems ||
            SERVICE.DefaultModelSaveInitializerService?.resolveSaveMethod?.({ schemaModel: entry.wrapper }) !== "saveVersionedItems")))
        throw new Error("Product listing authority changed");
    };
    const code =
        "LISTING_" +
        crypto
          .createHash("sha256")
          .update(
            request.tenant +
              ":" +
              p.sourceRef.module +
              ":" +
              p.sourceRef.code +
              ":" +
              p.idempotencyKey,
          )
          .digest("hex")
          .slice(0, 24)
          .toUpperCase(),
      variantCode = code + "_VARIANT",
      sku = code + "_SKU";
    const context = {
      tenant: scope.tenant,
      options: { recursive: false },
    };
    // Only this fixed Product graph uses local owner authority; the runtime principal remains unchanged.
    const local = () => {
      check();
      const owner = SERVICE.DefaultIdentityGovernanceService;
      if (!owner?.getSystemAuthData) throw new Error("Product listing persistence owner is unavailable");
      return { ...context, authData: { ...auth, ...owner.getSystemAuthData() } };
    };
    const read = async (entry) => {
      const response = await entry.service.get({ ...local(),
        query: { ...scope, code: entry.model.code },
        options: { recursive: false, skipItemCache: true },
        searchOptions: { pageSize: 2, pageNumber: 1 } });
      check();
      if (!/^SUC_/.test(response?.code || "") || response.error || response.success === false ||
        (response.errors && (!Array.isArray(response.errors) || response.errors.length)) ||
        !Array.isArray(response.result) || response.result.length > 1 ||
        [response.count, response.total, response.totalCount].some(value => value !== undefined && value !== response.result.length))
        throw new Error("Product listing readback is unconfirmed");
      return response.result[0];
    };
    const canonical = value => JSON.parse(JSON.stringify(value));
    const matches = (entry, row) => {
      if (!row || row.tenant !== scope.tenant || row.enterpriseCode !== scope.enterpriseCode ||
        entry.versioned && (!Number.isSafeInteger(row.versionId) || row.versionId < 0) ||
        Object.keys(entry.model).filter(key => !["created", "updated", "revision"].includes(key))
          .some(key => !isDeepStrictEqual(canonical({ value: row[key] }), canonical({ value: entry.model[key] }))))
        throw new Error("Product listing idempotency conflict");
    };
    const now = new Date(),
      base = {
        tenant: scope.tenant,
        enterpriseCode: scope.enterpriseCode,
        active: true,
        revision: 1,
        created: now,
        updated: now,
        status: "ACTIVE",
      };
    const product = Object.assign({}, base, {
      code,
      name: p.name.trim(),
      catalogVersion: policy.catalogVersion,
      productType: "DIGITAL",
      fulfillmentStrategy: "DIGITAL_COMMERCE",
      digitalDeliveryType: "DIGITAL_OWNERSHIP",
      listingAuthoring: canonical({ contractVersion: 1, idempotencyKey: p.idempotencyKey,
        sourceRef: p.sourceRef, ownerRef: p.ownerRef, name: p.name.trim(),
        description: String(p.description || "").slice(0, 2000), issuer: p.issuer || "Community asset",
        imageUrl: p.imageUrl, biddingEnabled: p.biddingEnabled === true, sample: p.sample === true,
        catalogVersion: policy.catalogVersion, locales: policy.locales || ["en"],
        ...(humanAdmissions.has(request) ? { sourceProof: humanAdmissions.get(request).binding } : {}) }),
    });
    const graph = [{ service: SERVICE.DefaultProductService, modelName: "ProductModel", model: product }];
    const attributes = {
      productType: "DIGITAL",
      digitalDeliveryType: "DIGITAL_OWNERSHIP",
      inventoryStrategy: "DIGITAL_COMMERCE",
      kind: "ASSET",
      assetCode: p.sourceRef.code,
      sourceRef: p.sourceRef,
      ownerRef: p.ownerRef,
      ...(p.biddingEnabled === true
        ? { commerceBidding: { enabled: true, sellerRef: p.ownerRef } }
        : {}),
      issuer: p.issuer || "Community asset",
      imageUrl: p.imageUrl,
      sample: p.sample === true,
    };
    graph.push({ service: SERVICE.DefaultProductVariantService, modelName: "ProductVariantModel",
      model: Object.assign({}, base, {
          code: variantCode,
          productCode: code,
          sku,
          attributes,
      }) });
    for (const locale of policy.locales || ["en"]) {
      const localization = Object.assign({}, base, {
        code: code + "-" + locale,
        productCode: code,
        locale,
        name: p.name.trim(),
        description: String(p.description || "").slice(0, 2000),
        slug: code.toLowerCase(),
        attributes,
        status: "READY",
      });
      graph.push({ service: SERVICE.DefaultProductLocalizationService, modelName: "ProductLocalizationModel", model: localization });
      const variantLocalization = Object.assign({}, base, {
        code: variantCode + "-" + locale,
        variantCode,
        productCode: code,
        locale,
        attributes,
        status: "READY",
      });
      graph.push({ service: SERVICE.DefaultProductVariantLocalizationService, modelName: "ProductVariantLocalizationModel", model: variantLocalization });
    }
    // Version zero uses the canonical immutable writer, never ordinary upsert or insertOnly bypass.
    for (const entry of graph) {
      const wrapper = NODICS.getModels("product", scope.tenant)?.[entry.modelName];
      if (!wrapper || !wrapper.rawSchema || humanAdmissions.has(request) && wrapper.versioned !== true ||
        wrapper.versioned === true && (wrapper.primaryKey !== "code" ||
          wrapper.rawSchema.versionedReadMode !== "CURRENT" ||
          typeof wrapper.getCurrentVersionItems !== "function" ||
          typeof wrapper.saveVersionedItems !== "function" ||
          SERVICE.DefaultModelSaveInitializerService?.resolveSaveMethod?.({ schemaModel: wrapper }) !== "saveVersionedItems"))
        throw new Error("Product listing persistence capability is unavailable");
      entry.versioned = wrapper.versioned === true;
      storage.push({ modelName: entry.modelName, wrapper, versioned: wrapper.versioned,
        rawSchema: wrapper.rawSchema, getCurrentVersionItems: wrapper.getCurrentVersionItems,
        saveVersionedItems: wrapper.saveVersionedItems });
    }
    // Validate every existing component before creating any missing part of the original graph.
    const existing = [];
    for (const entry of graph) {
      const row = await read(entry);
      if (row) matches(entry, row);
      existing.push(row);
    }
    if (!existing[0] && existing.some(Boolean))
      throw new Error("Product listing graph has no original root");
    if (humanAdmissions.get(request)?.mode === 'inspect') {
      if (existing.some(Boolean) && existing.some(row => !row)) throw new Error('Listing source graph is incomplete');
      return { present: Boolean(existing[0]), productCode: code, variantCode, sku,
        ...(existing[0] ? { root: existing[0] } : {}) };
    }
    for (let index = 0; index < graph.length; index++) {
      if (existing[index]) continue;
      const entry = graph[index];
      try {
        await entry.service.save({ ...local(), query: { ...scope, code: entry.model.code },
          options: { recursive: false, ...(entry.versioned ? {} : { insertOnly: true }) },
          model: entry.versioned ? { ...entry.model, versionId: 0 } : entry.model });
      } catch (error) {
        check();
        const row = await read(entry);
        if (!row) throw error;
        matches(entry, row);
        continue;
      }
      check();
      matches(entry, await read(entry));
    }
    let versionId;
    if (humanAdmissions.has(request)) {
      const root = await read(graph[0]); matches(graph[0], root); versionId = root.versionId;
    }
    return {
      productCode: code,
      variantCode,
      sku,
      catalogVersion: policy.catalogVersion,
      ...(versionId !== undefined ? { versionId } : {}),
    };
  },
};
