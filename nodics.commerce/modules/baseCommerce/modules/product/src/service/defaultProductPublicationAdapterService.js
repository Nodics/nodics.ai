/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module product/service/defaultProductPublicationAdapterService @description Contributes exact Product catalogue validation to nPublish without owning lifecycle state. @layer service @owner product */
module.exports = {
    /** Supplies immutable dependency identities to nPublish's authoritative journal. */
    resolveDependencies: function (publication, manifest) { return manifest.references; },
    /** Validates exact graph evidence; activation must resolve the same manifest again. */
    validate: function (publication, manifest, request, dependencies) {
        const service = SERVICE.DefaultProductPublicationGraphService;
        if (manifest.scope.tenant !== request.tenant || manifest.root.code !== publication.rootCode ||
            service.hash(dependencies) !== service.hash(manifest.references)) throw new Error('Product publication graph mismatch');
        return { valid: true, manifestVersion: manifest.version, dependencyCount: dependencies.length };
    }
};
