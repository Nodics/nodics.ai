/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
class NodicsError extends Error {}
global.CLASSES = { NodicsError };
const properties = require('../config/properties').publish;
global.CONFIG = { get: name => name === 'publish' ? properties : {} };
let current = { code: 'publication', domain: 'editorial', rootCode: 'article', state: 'ONLINE', revision: 4 };
let withdrawn = false;
global.SERVICE = {
    Repository: {
        get: () => Promise.resolve(current),
        transitionWithAudit: (publication, expected, patch) => { current = Object.assign({}, publication, patch, { revision: publication.revision + 1 }); return Promise.resolve(current); }
    },
    VersionProvider: { withdraw: publication => { withdrawn = publication.rootCode === 'article'; return Promise.resolve({ withdrawn: 1 }); } },
    Adapter: { afterWithdraw: () => Promise.resolve(true) }
};
properties.providers.repositoryProvider = 'Repository';
properties.providers.versionProviders.editorial = 'VersionProvider';
properties.providers.domainAdapters.editorial = 'Adapter';
const lifecycle = require('../src/service/defaultPublicationLifecycleService');
(async () => {
    let result = await lifecycle.withdraw({ publicationCode: 'publication', expectedRevision: 4 });
    assert.equal(withdrawn, true);
    assert.equal(result.state, 'WITHDRAWN');
})().catch(error => { console.error(error); process.exitCode = 1; });
