/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialValidationService @description Validates Editorial authoring records without starting workflow or publication. @layer service @owner editorial @override Later modules may add validation rules while preserving the result contract. */
module.exports = {
    /** Validates an article and its supplied localization contributions. */
    validate: function (article, localizations, policy) {
        article = article || {};
        localizations = Array.isArray(localizations) ? localizations : [];
        policy = policy || {};
        let errors = [];
        let required = ['code', 'contentTypeCode', 'internalName', 'slug'];
        required.forEach(field => { if (!article[field]) errors.push({ code: 'REQUIRED_FIELD', field: field, message: field + ' is required' }); });
        if (!Array.isArray(article.siteCodes) || !article.siteCodes.length) errors.push({ code: 'REQUIRED_SITES', field: 'siteCodes', message: 'At least one site is required' });
        if (!Array.isArray(article.authorCodes) || !article.authorCodes.length) errors.push({ code: 'REQUIRED_AUTHORS', field: 'authorCodes', message: 'At least one author is required' });
        if (article.publishFrom && article.publishUntil && new Date(article.publishFrom).getTime() >= new Date(article.publishUntil).getTime()) errors.push({ code: 'INVALID_PUBLICATION_WINDOW', field: 'publishUntil', message: 'publishUntil must be later than publishFrom' });
        let requiredLocales = Array.isArray(policy.requiredLocaleCodes) ? policy.requiredLocaleCodes : [];
        let readyLocales = localizations.filter(item => item && item.status === 'READY' && item.localeCode).map(item => item.localeCode);
        requiredLocales.filter(locale => readyLocales.indexOf(locale) < 0).forEach(locale => errors.push({ code: 'MISSING_LOCALE', field: 'localizations', localeCode: locale, message: 'A ready localization is required for ' + locale }));
        localizations.forEach((item, index) => {
            ['articleCode', 'localeCode', 'title', 'body', 'slug'].forEach(field => { if (!item || !item[field]) errors.push({ code: 'INVALID_LOCALIZATION', field: 'localizations[' + index + '].' + field, message: field + ' is required' }); });
        });
        return { valid: errors.length === 0, errors: errors, warnings: [], checkedAt: new Date().toISOString() };
    }
};
