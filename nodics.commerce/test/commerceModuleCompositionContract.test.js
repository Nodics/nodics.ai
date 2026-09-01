/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const expected = new Map([
    ['nodics.commerce', '70.99'], ['baseCommerce', '70.19'], ['store', '70.10'],
    ['product', '70.11'], ['pricing', '70.12'], ['tax', '70.13'],
    ['promotion', '70.14'], ['inventory', '70.15'], ['digitalCore', '70.16'],
    ['shoppingList', '70.17'], ['digitalCommerce', '70.18'], ['commerceSearch', '76.17'],
    ['commerceSearchCore', '76.16'], ['checkout', '70.29'],
    ['checkoutCore', '70.20'], ['cart', '70.21'], ['order', '70.22'],
    ['payment', '70.49'], ['paymentCore', '70.30'], ['paymentMethods', '70.35'],
    ['cardPayment', '70.31'], ['walletPayment', '70.32'], ['loyaltyRewardPayment', '70.32.5'],
    ['cashOnDeliveryPayment', '70.33'], ['bankTransferPayment', '70.34'],
    ['paymentProviders', '70.45'], ['paymentProviderCore', '70.36'],
    ['stripeProvider', '70.37'], ['paypalProvider', '70.38'],
    ['cyberSourceProvider', '70.39'], ['visaProvider', '70.40'],
    ['loyaltyRewardProvider', '70.41'],
    ['fulfillment', '70.59'], ['fulfillmentCore', '70.50']
]);
const packages = [];
function visit(folder) {
    const packagePath = path.join(folder, 'package.json');
    if (fs.existsSync(packagePath)) packages.push({ folder, value: JSON.parse(fs.readFileSync(packagePath, 'utf8')) });
    const modulesPath = path.join(folder, 'modules');
    if (fs.existsSync(modulesPath)) fs.readdirSync(modulesPath).sort().forEach(name => visit(path.join(modulesPath, name)));
}
visit(root);
assert.strictEqual(packages.length, expected.size);
const indexes = new Set();
packages.forEach(({ folder, value }) => {
    assert.strictEqual(value.index, expected.get(value.name), value.name + ' index');
    assert(!indexes.has(value.index), 'duplicate index ' + value.index);
    indexes.add(value.index);
    assert.strictEqual(value.nodics.kind, value.name === 'nodics.commerce' || ['baseCommerce', 'digitalCommerce', 'commerceSearch', 'checkout', 'payment', 'paymentMethods', 'paymentProviders', 'fulfillment'].includes(value.name) ? 'group' : 'capability');
    ['README.md', 'AGENTS.md', 'nodics.js', 'config/properties.js', 'config/prescripts.js', 'config/postscripts.js', 'llm/contracts/README.md', 'llm/examples/README.md'].forEach(file => assert(fs.existsSync(path.join(folder, file)), value.name + ' missing ' + file));
});
assert.deepStrictEqual(packages[0].value.requiredModules, ['baseCommerce', 'checkout', 'digitalCommerce', 'payment', 'fulfillment']);
assert.deepStrictEqual(packages.find(item => item.value.name === 'baseCommerce').value.requiredModules, ['store', 'product', 'pricing', 'tax', 'promotion', 'inventory', 'shoppingList']);
assert.deepStrictEqual(packages.find(item => item.value.name === 'checkout').value.requiredModules, ['checkoutCore', 'cart', 'order']);
assert(Number(packages.find(item => item.value.name === 'commerceSearch').value.index) > 75.99,
    'Commerce Search must load after generic Discovery services');
console.log('Commerce module composition contract validated');
