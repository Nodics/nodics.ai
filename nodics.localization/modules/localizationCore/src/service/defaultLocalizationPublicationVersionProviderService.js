/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module localizationCore/service/DefaultLocalizationPublicationVersionProviderService @description Adapts immutable localization releases and Online pointers to the generic nPublish version-provider contract. @layer service @owner localizationCore @override Persistence may be replaced while preserving CAS, tenant, activation, and rollback behavior. */
module.exports = {
    /** Resolves the localization repository. */ repository: function () { return SERVICE.DefaultLocalizationReleaseManagementService.repository(); },
    /** Gets the staged immutable release. */ getVersion: function (publication, request) { return this.repository().getRelease(publication.sourceVersion, request); },
    /** Gets the current Online pointer. */ getOnlineVersion: function (publication, request) { return this.repository().getOnline(publication.rootCode, request); },
    /** Activates the release idempotently through repository CAS. */ activate: async function (publication, request) { let release = await this.getVersion(publication, request); SERVICE.DefaultLocalizationReleaseManagementService.validate(release); return this.repository().activateRelease(release, publication, request); },
    /** Restores a captured prior Online release. */ rollback: function (publication, target, request) { if (!target) throw this.error('ERR_LOC_00004', 'Previous localization release is unavailable'); return this.repository().rollbackRelease(publication.rootCode, target, publication, request); },
    /** Creates a stable provider error. */ error: function (code, message) { let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message); error.code = error.code || code; return error; }
};
