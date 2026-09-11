/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const adapter = require('../src/service/defaultOpenAiCopilotProviderAdapterService');
const defaults = require('../config/properties').copilot.providers.adapters.openai;
const jpeg = Buffer.from([255,216,255,224,0,0]).toString('base64');
const request = () => ({ adapter: {...defaults, generation:{reasoningEffort:'none'}}, profile:{structuredOutput:true,maximumOutputTokens:1200,imageDetail:'high'}, limits:{maximumRequestBytes:8000000}, messages:[{role:'user',content:'Return JSON metadata.',images:[jpeg]}] });

test('photo mapping preserves evidence and JSON intent without provider state or sampling conflicts', () => {
    const source=request(), before=JSON.stringify(source), body=adapter.body(source);
    assert.equal(body.input[0].content[1].image_url,'data:image/jpeg;base64,'+jpeg);
    assert.equal(body.input[0].content[1].detail,'high');
    assert.equal(body.input[0].images,undefined);
    assert.deepEqual(body.text,{format:{type:'json_object'}});
    assert.deepEqual(body.reasoning,{effort:'none'});
    assert.equal(body.store,false); assert.equal(body.max_output_tokens,1200);
    assert.equal(body.temperature,undefined); assert.equal(JSON.stringify(source),before);
});
test('later profiles customize image detail and text-only requests retain their shape', () => {
    const source=request();source.profile.imageDetail='low';assert.equal(adapter.body(source).input[0].content[1].detail,'low');
    source.messages=[{role:'user',content:'hello'}];source.profile.structuredOutput=false;
    assert.deepEqual(adapter.body(source).input,source.messages);assert.equal(adapter.body(source).text,undefined);
    assert.match(adapter.imageUrl(Buffer.from([137,80,78,71,13,10,26,10]).toString('base64')),/^data:image\/png/);
    assert.match(adapter.imageUrl(Buffer.from('RIFF0000WEBP').toString('base64')),/^data:image\/webp/);
});
test('invalid images and incompatible image messages fail closed', () => {
    for(const image of ['https://private.example/image.jpg','garbage',Buffer.from('plain text').toString('base64')]) assert.throws(()=>adapter.imageUrl(image),/COPILOT_OPENAI_IMAGE/);
    const source=request();source.messages[0].role='assistant';assert.throws(()=>adapter.body(source),/IMAGE_MESSAGE_INVALID/);
    source.messages[0].role='user';source.profile.imageDetail='invalid';assert.throws(()=>adapter.body(source),/IMAGE_DETAIL_INVALID/);
});
test('partial and refused output never becomes usable metadata', () => {
    assert.throws(()=>adapter.normalize({status:'incomplete',output:[]}),/RESPONSE_INCOMPLETE/);
    assert.throws(()=>adapter.normalize({status:'completed',output:[{content:[{type:'refusal',refusal:'no'}]}]}),/RESPONSE_REFUSED/);
});
test('size rejection happens before credentials and fetch; cancellation reaches transport', async () => {
    const source=request();source.limits.maximumRequestBytes=1;
    const service={...adapter,secret:async()=>{throw new Error('must not resolve');}};
    await assert.rejects(service.invoke(source),/REQUEST_LIMIT_EXCEEDED/);
    source.limits.maximumRequestBytes=8000000;source.adapter={...source.adapter,connection:{...source.adapter.connection,timeoutMs:5}};
    service.secret=async()=> 'test-secret';
    await assert.rejects(service.invoke(source,{fetch:async(url,init)=>new Promise((resolve,reject)=>init.signal.addEventListener('abort',()=>reject(new Error('aborted'))))}),/aborted/);
});

test('domain-owned response schemas reach Responses as strict JSON Schema without changing JSON-only callers', () => {
    const source = request();
    source.responseSchema = { name: 'example_metadata', schema: { type: 'object', properties: { name: { type: ['string', 'null'] } }, required: ['name'], additionalProperties: false } };
    const before = JSON.stringify(source);
    assert.deepEqual(adapter.body(source).text.format, { type: 'json_schema', strict: true, ...source.responseSchema });
    assert.equal(JSON.stringify(source), before);
    source.responseSchema.schema.additionalProperties = true;
    assert.throws(() => adapter.body(source), /RESPONSE_SCHEMA_INVALID/);
});
