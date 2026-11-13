/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module localizationCore/service/DefaultLocalizationCoreLocalizationContributionService
 * @description Supplies the protected Localization capability's own default messages and navigation labels.
 * @owner localizationCore
 * @layer service
 * @override Later standard Localization layers may replace only entries permitted by contribution policy.
 */
const contribution = { formatVersion: 1, ownerModule: 'localizationCore', entries: [
    { namespace: 'localization', key: 'navigation.title', defaultMessage: 'Localization Operations', parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'navigation.coverage', defaultMessage: 'Coverage', parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'navigation.keys', defaultMessage: 'Translation Keys', parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'navigation.queue', defaultMessage: 'Translation Queue', parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'navigation.releases', defaultMessage: 'Translation Releases', parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'navigation.memory', defaultMessage: 'Translation Memory', parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.intro', defaultMessage: "Check translation coverage and find messages that need review.", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.retry', defaultMessage: "Try again", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.unavailable', defaultMessage: "Translation information is unavailable.", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.loading', defaultMessage: "Loading translations", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.no-keys', defaultMessage: "No translation keys", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.approved', defaultMessage: "{approved, number} of {total, number} approved", parameters: ["approved", "total"], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.breakdown', defaultMessage: "{review, number} in review \u00b7 {draft, number} drafts \u00b7 {fallback, number} using fallback \u00b7 {missing, number} missing", parameters: ["review", "draft", "fallback", "missing"], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.message', defaultMessage: "Message key", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.locale', defaultMessage: "Language", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.status', defaultMessage: "Status", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.state-missing', defaultMessage: "Missing", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.state-draft', defaultMessage: "Draft", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.state-review', defaultMessage: "In review", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.queue-empty', defaultMessage: "No translations need attention for these languages.", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.default-message', defaultMessage: "Default message", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.version', defaultMessage: "Version", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.created', defaultMessage: "Created", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.release-online', defaultMessage: "Online", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.release-inactive', defaultMessage: "Not active", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.no-releases', defaultMessage: "No translation releases for this site and channel", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.approved-translation', defaultMessage: "Approved translation", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.scope', defaultMessage: "Scope", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.scope-standard', defaultMessage: "Standard", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.scope-tenant', defaultMessage: "Tenant", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.no-memory', defaultMessage: "No approved translations are available for reuse", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'operations.memory-disabled', defaultMessage: "Translation memory is disabled", parameters: [], exposure: 'PUBLIC' },
    { namespace: 'localization', key: 'internal.protected', defaultMessage: 'Protected localization contract', parameters: [], exposure: 'INTERNAL', protected: true, overrideScopes: ['STANDARD'] }
] };
module.exports = {
    /** @returns {object} Defensive copy of the Localization core contribution. */
    getLocalizationContribution: function () { return JSON.parse(JSON.stringify(contribution)); }
};
