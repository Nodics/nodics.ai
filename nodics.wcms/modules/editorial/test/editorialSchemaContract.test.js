/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const schemas = require('../src/schemas/schemas').editorial;
const expected = ['editorialContentType', 'editorialArticle', 'editorialArticleLocalization', 'editorialAuthor', 'editorialTaxonomyTerm', 'editorialArticleTaxonomy', 'editorialSeries', 'editorialCorrection', 'editorialOnlineArticle', 'editorialPublicationReceipt'];
assert.deepEqual(Object.keys(schemas), expected);
assert.equal(schemas.editorialArticle.router.enabled, true);
assert.equal(schemas.editorialOnlineArticle.router.enabled, true);
assert.equal(schemas.editorialPublicationReceipt.router.enabled, true);

for (const name of ['editorialOnlineArticle', 'editorialPublicationReceipt']) {
    assert.deepEqual(schemas[name].router.groups, { schemaOperations: true });
    assert.deepEqual(schemas[name].backoffice.operations, ['search', 'read']);
}
