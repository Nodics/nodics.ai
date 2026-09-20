/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module nService/test/authorityContextDefaults @description Proves bounded authority defaults without expanding the selected module scope. @layer test @owner nService */
const assert = require('node:assert/strict');
const test = require('node:test');
const agent = require('../src/service/module/defaultModuleRegistrationAgentService');
test('only explicitly selected modules use the shared context and higher-priority claims remain authoritative', () => {
    let settings = {
        default: 'warehouse.operational',
        modules: { stock: true, pricing: 'pricing.staged' },
        schemas: { 'stock.reservation': 'stock.reservation.special' },
    };
    global.CONFIG = { get: () => settings };
    assert.equal(agent.getAuthorityContext('stock', 'item', {}), 'warehouse.operational');
    assert.equal(agent.getAuthorityContext('unselected', 'item', {}), 'unselected.item');
    assert.equal(agent.getAuthorityContext('pricing', 'row', {}), 'pricing.staged');
    assert.equal(agent.getAuthorityContext('stock', 'reservation', {}), 'stock.reservation.special');
    assert.equal(
        agent.getAuthorityContext('stock', 'reservation', {
            authorityContext: 'schema.override',
        }),
        'schema.override',
    );
    settings.default = 'anotherCustomer.staged';
    assert.equal(agent.getAuthorityContext('stock', 'item', {}), 'anotherCustomer.staged');
    settings.modules.stock = false;
    assert.equal(agent.getAuthorityContext('stock', 'item', {}), 'stock.item');
    settings = { modules: { stock: true } };
    assert.throws(() => agent.getAuthorityContext('stock', 'item', {}), /explicit default/);
});
