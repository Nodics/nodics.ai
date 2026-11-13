/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/test/editorialExactProjectionWithdrawal @description Qualifies source-revision isolation for both local and remote Online withdrawal owners. @owner editorial @layer test @override Preserve exact publication scope and acknowledged writes. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const source = require('../src/service/defaultEditorialOnlineProjectionService');
const { fixture } = require('./helpers/editorialOnlineTargetFixture');

for (const directTarget of [false, true]) {
    test((directTarget ? 'Online target' : 'Online source adapter') + ' exact old withdrawal preserves newer visible languages and unrelated articles', async t => {
        const f = fixture(t);
        global.SERVICE.DefaultEditorialPublicationTargetService = f.target;
        const first = f.publish('story', 1); first.result = await f.deploy(first);
        const second = f.publish('story', 2, await f.status('story')); second.result = await f.deploy(second);
        const other = f.publish('other', 1, undefined, undefined, { en: 'other-en', ar: 'other-ar' }); other.result = await f.deploy(other);
        const withdraw = input => {
            const publication = f.commandPublication(input, 'WITHDRAWAL');
            return directTarget ? f.target.withdraw(f.request({ publication, operationKey: publication.code + ':withdraw:6' }))
                : source.withdraw(publication, f.request({}));
        };
        assert.equal((await withdraw(first)).withdrawn, 0);
        assert.equal((await f.status('story')).version, second.result.version);
        assert.equal((await f.status('other')).version, other.result.version);
        const result = await withdraw(second);
        assert.equal(result.withdrawn, 2);
        assert.equal((await f.status('story')).version, null);
        assert.equal((await f.status('other')).version, other.result.version);
        const writes = f.state.writes.length;
        assert.deepEqual(await withdraw(second), result);
        assert.equal(f.state.writes.length, writes, 'original successful result is returned without replaying writes');
        await assert.rejects(withdraw({ ...second, publication: { ...second.publication, sourceVersion: '0' } }));
    });
}
