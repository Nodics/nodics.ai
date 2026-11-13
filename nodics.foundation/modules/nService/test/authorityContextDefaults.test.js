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

test('nService supplies safe empty authority-context defaults before deployment selections', t => {
    const defaults = require('../config/properties').runtimeAuthorityContexts;
    assert.deepEqual(defaults, { default: null, modules: {}, schemas: {} });
    const previous = global.CONFIG;
    t.after(() => { if (previous === undefined) delete global.CONFIG; else global.CONFIG = previous; });
    global.CONFIG = { get: () => defaults };
    assert.equal(agent.getAuthorityContext('stock', 'item', {}), 'stock.item');
    const bindings = require('../../nConfig/src/service/defaultConfigurationBindingService');
    const later = bindings.merge(defaults, { modules: { stock: true } });
    global.CONFIG = { get: () => later };
    assert.throws(() => agent.getAuthorityContext('stock', 'item', {}), /explicit default/);
    later.default = 'partner.operational';
    assert.equal(agent.getAuthorityContext('stock', 'item', {}), 'partner.operational');
    assert.deepEqual(defaults.modules, {}, 'deployment selection never mutates owner defaults');
});
