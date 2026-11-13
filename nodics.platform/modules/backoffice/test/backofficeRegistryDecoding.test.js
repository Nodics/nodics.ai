/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const definition = require('../src/service/registry/defaultBackofficeRegistryStoreService');
/** Fresh provider bytes are the only admission to this derived immutable optimization. */
test('reuses identical decoding, observes another writer and refuses stale fallback', async () => {
 const config = { mode: 'distributed', moduleName: 'backoffice', engineName: 'redis', keyPrefix: 'lease:', maximumDecodedBytes: 1024 };
 const records = new Map([['lease:a', JSON.stringify({ moduleName:'cms', expiresAt:100, backoffice:{ permission:'VIEW' } })]]);
 let reads=0, unavailable=false;
 const client={ get:async key=>{reads++; if(unavailable)throw Error('offline'); return records.get(key);}, mGet:async keys=>Promise.all(keys.map(k=>client.get(k))), scanIterator:async function*(){if(unavailable)throw Error('offline'); yield* records.keys();} };
 global.SERVICE = {};
 const store=Object.assign({},definition,{_instances:new Map(),_metrics:{...definition._metrics},getConfiguration:()=>config,getDistributedClient:()=>client});
 const one=await store.get('a'),two=(await store.values())[0].value;
 assert.equal(reads,2); assert.equal(one,two); assert(Object.isFrozen(two.backoffice));
 assert.throws(()=>{two.backoffice.permission='*';},TypeError);
 records.set('lease:a',JSON.stringify({...one,expiresAt:200,backoffice:{permission:'NONE'}}));
 const newer=await store.get('a'); assert.notEqual(newer,one); assert.equal(newer.backoffice.permission,'NONE');
 unavailable=true; await assert.rejects(store.get('a'),/offline/); await assert.rejects(store.values(),/offline/);
 unavailable=false; records.delete('lease:a'); assert.equal(await store.get('a'),undefined); assert.equal((await store.values()).length,0);
});
test('bounds retained bytes, isolates stores and adopts disabled or changed policy',()=>{
 const config={maximumDecodedBytes:60}; const make=()=>Object.assign({},definition,{_instances:new Map(),getConfiguration:()=>config});
 const a=make(),b=make(), first=JSON.stringify({title:'one',nested:{ready:true}}),second=JSON.stringify({title:'two',nested:{ready:true}});
 const value=a.decodeLease('one',first); assert.equal(a.decodeLease('one',first),value); assert.notEqual(b.decodeLease('one',first),value);
 a.decodeLease('two',second); assert.notEqual(a.decodeLease('one',first),value);
 config.maximumDecodedBytes=0; const uncached=a.decodeLease('one',first); assert.notEqual(a.decodeLease('one',first),uncached);
 config.maximumDecodedBytes=100; const cached=a.decodeLease('one',first); a.clear(); assert.notEqual(a.decodeLease('one',first),cached);
 config.maximumDecodedBytes=-1; assert.throws(()=>a.decodeLease('one',first),/budget/);
});
