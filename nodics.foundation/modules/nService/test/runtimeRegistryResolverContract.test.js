/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nService/test/RuntimeRegistryResolverContract */
const assert = require('assert');
const resolver = require('../src/service/module/defaultRuntimeRegistryResolverService');

let selected = resolver.resolveFromOwners({
    moduleName: 'system',
    connectionName: 'wcmsStaged',
    targetAuthority: {
        server: 'wcmsStagedServer',
        publication: 'STAGED'
    }
}, [
    { moduleName: 'system', instanceId: 'process-1', environment: 'kickoffLocal', server: 'processServer',
        runtimeRole: { code: 'PROCESS', publication: 'OPERATIONAL' }, endpoint: 'http://localhost:4330/nodics/system',
        clientCallable: true, state: 'UP', lastSeenAt: '2026-08-24T13:43:28.000Z' },
    { moduleName: 'system', instanceId: 'wcms-staged-1', environment: 'kickoffLocal', server: 'wcmsStagedServer',
        runtimeRole: { code: 'WCMS_STAGED', publication: 'STAGED' }, endpoint: 'http://localhost:4312/nodics/system',
        clientCallable: true, state: 'UP', lastSeenAt: '2026-08-24T13:43:20.000Z' }
]);

assert.strictEqual(selected.instanceId, 'wcms-staged-1');
assert.strictEqual(selected.server, 'wcmsStagedServer');
assert.strictEqual(selected.endpoint, 'http://localhost:4312/nodics/system');

console.log('Runtime registry resolver contract validated');

const hostedOwner = { moduleName: 'wallet', endpoint: 'http://localhost:4350/wallet',
    runtimeRole: { code: 'COMMERCE', publication: 'OPERATIONAL' } };
for(const targetAuthority of ['LOYALTY',{code:'LOYALTY'},{runtimeRole:{publication:'ONLINE'}},{server:'one'},{publication:'ONLINE',unknown:true},null]) {
    assert.throws(()=>resolver.resolveFromOwners({moduleName:'wallet',targetAuthority},[]),/authority/);
}
assert.equal(resolver.ownerMatches({moduleName:'wallet',targetAuthority:{publication:'STAGED'}},hostedOwner),false);

assert.throws(()=>resolver.resolveFromOwners({moduleName:'wallet'},[
    {...hostedOwner,server:'one'}, {...hostedOwner,server:'two'}]),/Ambiguous/);
assert.ok(resolver.resolveFromOwners({moduleName:'wallet'},[
    {...hostedOwner,server:'one',instanceId:'replica1'}, {...hostedOwner,server:'one',instanceId:'replica2'}]));
assert.throws(()=>resolver.resolveFromOwners({moduleName:'wallet'},[
    {...hostedOwner,server:'one',runtimeRole:{code:'AUTHOR',publication:'STAGED'}},
    {...hostedOwner,server:'two',runtimeRole:{code:'DELIVERY',publication:'ONLINE'}}]),/publication context/);


const previousNodics = global.NODICS;
try {
    global.NODICS = {getRawModule: name => name === 'system' ? {metaData:require('../../nSystem/package.json')} : undefined};
    const local = server => ({moduleName:'system',server,environment:'local',projectCode:'p',
        runtimeRole:{publication:'OPERATIONAL'},endpoint:'http://localhost:4400/system',clientCallable:true});
    assert.throws(()=>resolver.resolveFromOwners({moduleName:'system'},[local('one'),local('two')]),/explicit logical server/);
    assert.equal(resolver.resolveFromOwners({moduleName:'system',targetAuthority:{server:'two',publication:'OPERATIONAL'}},[local('one'),local('two')]).server,'two');
    const agent=require('../src/service/module/defaultModuleRegistrationAgentService');
    const functional={moduleName:'wallet',ownershipScope:'runtimeLocal',runtime:{ownership:'runtimeLocal'}};
    const coordinates={projectCode:'p',environment:'local',server:'one',runtimeRole:{publication:'ONLINE'}};
    assert.equal(agent.getModuleOwnershipKey(coordinates,functional),agent.getModuleOwnershipKey({...coordinates,server:'two'},functional));
} finally {global.NODICS=previousNodics;}
