/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module localizationCore/service/DefaultLocalizationPublicationAdapterService @description Supplies localization validation and completion hooks to nPublish without duplicating its lifecycle. @layer service @owner localizationCore @override Projects may extend completion hooks while keeping events content-free. */
module.exports = {
    /** Localization releases have no cross-domain publication dependency by default. */ resolveDependencies: function () { return []; },
    /** Validates checksum, ICU syntax, parameter contracts, and bounds. */ validate: function (publication, release) { return SERVICE.DefaultLocalizationReleaseManagementService.validate(release); },
    /** Emits one content-free publication event after Online activation. */ afterActivate: function (publication, activation, request) { return this.publish('LOCALIZATION_RELEASE_PUBLISHED', publication, activation, request); },
    /** Emits one content-free rollback event after restoration. */ afterRollback: function (publication, activation, request) { return this.publish('LOCALIZATION_RELEASE_ROLLED_BACK', publication, activation, request); },
    /** Publishes bounded invalidation evidence when an event authority is configured. */ publish: function (type, publication, activation, request) { let name = ((CONFIG.get('localization') || {}).authority || {}).eventService; let publisher = name && SERVICE[name]; if (!publisher || typeof publisher.publish !== 'function') return Promise.resolve(false); return Promise.resolve(publisher.publish({ type: type, tenant: request.tenant, scopeCode: publication.rootCode, releaseVersion: activation && activation.version, correlationId: request.correlationId || request.requestId })).then(result => result !== false); }
};
