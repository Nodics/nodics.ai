/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('node:assert/strict');
const http = require('node:http');
const zlib = require('node:zlib');
const express = require('express');
const defaults = require('../config/properties').responseHandler.publicJsonCompression;
const owner = require('../src/service/handlers/response/defaultJsonResponseHandlerService');
// @nodics-capability-behavior @nodics-area router
let policy = { ...defaults };
global.CONFIG = { get: key => key === 'responseHandler' ? { publicJsonCompression: policy } : undefined };
global.SERVICE = { DefaultLoggerService: { isSensitiveRequest: req => req.fixturePrivate === true } };
const payload = { code:'SUC_TEST', responseCode:200, message:'Published content', data:{text:'Published guide العربية '.repeat(3000)} };
const app = express();
app.all('/:kind', (req,res) => {
  const kind=req.params.kind;
  res.setHeader('Vary','Origin');
  if(kind==='cookie')res.setHeader('Set-Cookie','test=1');
  if(kind==='no-transform')res.setHeader('Cache-Control','private, no-transform');
  if(kind==='private')req.fixturePrivate=true;
  const route=kind==='unknown'?undefined:{secured:kind==='secured',requestPrivacy:{sensitive:kind==='sensitive'}};
  if(kind==='error') { res.status(400); owner.sendJson(req,res,payload,route); }
  else owner.handleSuccess(req,res,kind==='small'?{...payload,data:{text:'ok'}}:{...payload},route);
});
const request=(port,kind,headers={},method='GET')=>new Promise((resolve,reject)=>{
  const req=http.request({host:'127.0.0.1',port,path:'/'+kind,headers:{'accept-encoding':'gzip',...headers},method},res=>{
    const chunks=[];res.on('data',c=>chunks.push(c));res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks)}));
  });req.on('error',reject);req.end();
});
(async()=>{
  const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));const port=server.address().port;
  try {
    const compressed=await request(port,'public');assert.equal(compressed.headers['content-encoding'],'gzip');assert.deepEqual(JSON.parse(zlib.gunzipSync(compressed.body)),payload);assert.ok(compressed.body.length<JSON.stringify(payload).length/10);assert.match(compressed.headers.vary,/Origin/);assert.match(compressed.headers.vary,/Accept-Encoding/);
    for(const [kind,headers,method] of [['secured',{},'GET'],['sensitive',{},'GET'],['private',{},'GET'],['cookie',{},'GET'],['unknown',{},'GET'],['no-transform',{},'GET'],['error',{},'GET'],['public',{authorization:'synthetic'},'GET'],['public',{cookie:'synthetic'},'GET'],['public',{authToken:'synthetic'},'GET'],['public',{apiKey:'synthetic'},'GET'],['public',{'X-API-Key':'synthetic'},'GET'],['public',{},'POST'],['public',{'accept-encoding':'gzip;q=0, identity;q=1'},'GET'],['public',{'accept-encoding':'identity'},'GET'],['small',{},'GET']]) {
      const r=await request(port,kind,headers,method);assert.equal(r.headers['content-encoding'],undefined,kind);assert.equal(JSON.parse(r.body).code,payload.code,kind);
    }
    policy={...defaults,enabled:false};assert.equal((await request(port,'public')).headers['content-encoding'],undefined);
    policy={...defaults,maximumBytes:2048};assert.equal((await request(port,'public')).headers['content-encoding'],undefined);
    policy={...defaults,level:99};assert.equal((await request(port,'public')).headers['content-encoding'],undefined);
    policy={...defaults};const original=zlib.gzip;try{zlib.gzip=(bytes,options,done)=>done(new Error('synthetic compression unavailable'));const r=await request(port,'public');assert.equal(r.headers['content-encoding'],undefined);assert.deepEqual(JSON.parse(r.body),payload);}finally{zlib.gzip=original;}
    console.log(JSON.stringify({status:'PASSED',compressionBytes:compressed.body.length,originalBytes:Buffer.byteLength(JSON.stringify(payload)),refusalAndOverrideCases:20}));
  } finally { await new Promise(resolve=>server.close(resolve));delete global.CONFIG;delete global.SERVICE; }
})().catch(error=>{console.error(error);process.exitCode=1;});
