/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialPublicationVersionProviderService @description Supplies exact Editorial versions and atomic Online projection operations to nPublish. @layer service @owner editorial */
module.exports = {
    /** Loads the exact approved Editorial revision. */
    getVersion: async function (publication, request) {
        let response = await SERVICE.DefaultEditorialArticleService.get({ tenant: request.tenant, authData: request.authData, query: { code: publication.rootCode, revision: Number(publication.sourceVersion) }, searchOptions: { limit: 1 } });
        let article = response && response.result && response.result[0];
        if (!article) throw new CLASSES.NodicsError('ERR_EDT_00003', 'Editorial article revision was not found');
        return article;
    },
    /** Returns the active Online projection for the publication scope. */
    getOnlineVersion: function (publication, request) { return SERVICE.DefaultEditorialOnlineProjectionService.getActive(publication, request); },
    /** Builds and atomically activates Online projections. */
    activate: function (publication, request) { return SERVICE.DefaultEditorialOnlineProjectionService.activate(publication, request); },
    /** Restores the previous Online projection version. */
    rollback: function (publication, targetVersion, request) { return SERVICE.DefaultEditorialOnlineProjectionService.rollback(publication, targetVersion, request); },
    /** Withdraws active Online projections for this publication. */ withdraw: function (publication, request) { return SERVICE.DefaultEditorialOnlineProjectionService.withdraw(publication.rootCode, request); }
};
