/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module media/test/mediaEncodedPhotoContract @description Verifies bounded encoded customer intake, immutable replay and retained Media ownership. @owner media @layer test */
const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict"), crypto = require("node:crypto");
const service = require("../src/service/storage/defaultCustomerMediaService");
class NodicsError extends Error { constructor(code, message) { super(message); this.code = code; } }
let saved, writes;
const ownerService = { ...service, owner: async request => request.authData.code };
const request = () => ({ authData: { tenant: "test", code: "owner" }, payload: {
  mimeType: "image/png", contentBase64: Buffer.from("photo").toString("base64"), idempotencyKey: "upload-command", originalFileName: "my-phone.png", ownerReference: "attacker", storageKey: "/untrusted" } });
beforeEach(() => {
  saved = null; writes = 0;
  global.CLASSES = { NodicsError };
  global.CONFIG = { get: () => ({ customerUploads: { enabled: true, maximumBytes: 1024, folderCode: "customerPhotos" } }) };
  global.SERVICE = {
    DefaultMediaReferenceLookupService: { loadReference: async () => { if (!saved) throw new NodicsError("ERR_MED_00008"); return saved; } },
    DefaultMediaUploadService: { upload: async input => {
      writes++; assert.equal(input.ownerReference, "owner"); assert.equal(input.storageKey, undefined);
      saved = { code: input.mediaCode, ownerType: "CUSTOMER", ownerReference: input.ownerReference, mimeType: "image/png",
        originalFileName: input.files[0].originalFileName, checksumAlgorithm: "sha512", checksum: crypto.createHash("sha512").update(input.files[0].buffer).digest("hex") };
      return saved;
    } },
  };
});
afterEach(() => { delete global.CLASSES; delete global.CONFIG; delete global.SERVICE; });
test("encoded intake retains original filename and reuses the same owner-bound photo", async () => {
  const first = await ownerService.uploadEncoded(request());
  assert.equal(first.originalFileName, "my-phone.png");
  assert.equal((await ownerService.uploadEncoded(request())).code, first.code);
  assert.equal(writes, 1);
});
test("oversize, invalid formats, altered bytes and foreign replay cannot write media", async () => {
  for (const delta of [{ mimeType: "text/html" }, { contentBase64: "invalid" }, { contentBase64: Buffer.alloc(1025).toString("base64") }]) {
    const input = request(); Object.assign(input.payload, delta);
    await assert.rejects(ownerService.uploadEncoded(input), { code: "ERR_MED_00007" });
  }
  assert.equal(writes, 0);
  await ownerService.uploadEncoded(request());
  const changed = request(); changed.payload.contentBase64 = Buffer.from("other-photo").toString("base64");
  await assert.rejects(ownerService.uploadEncoded(changed), { code: "ERR_MED_00007" });
  saved.ownerReference = "other";
  await assert.rejects(ownerService.uploadEncoded(request()), { code: "ERR_MED_00007" });
  assert.equal(writes, 1);
});


test("customer lookup forwards the verified caller credential rather than runtime authority", async () => {
 const input = {tenant:'test',authData:{tenant:'test',principalType:'customer',loginId:'person'},authorization:'Bearer customer-test-token',payload:{authorization:'Bearer attacker'}};
 SERVICE.DefaultModuleService = {invokeModule:async call=>{
  assert.deepEqual(call.header,{Authorization:'Bearer customer-test-token'});
  assert.equal(call.tenant,'test');assert.deepEqual(call.requestBody.query,{loginId:'person'});
  return {result:[{code:'CUSTOMER_CODE',loginId:'person'}]};
 }};
 assert.equal(await service.owner(input),'CUSTOMER_CODE');
 for(const delta of [{authorization:undefined},{tenant:'other'},{authData:{tenant:'test',principalType:'service',loginId:'person'}}])
  await assert.rejects(service.owner({...input,...delta}),{code:'ERR_MED_00007'});
 SERVICE.DefaultModuleService.invokeModule=async()=>({result:[{code:'OTHER',loginId:'other'}]});
 await assert.rejects(service.owner(input),{code:'ERR_MED_00007'});
});


test("controller forwards transport authorization and ignores body credentials", async () => {
  const controller = require("../src/controller/storage/defaultCustomerMediaController");
  SERVICE.DefaultCustomerMediaService = { uploadEncoded: async input => {
    assert.equal(input.authorization, "Bearer trusted-session");
    assert.equal(input.tenant, "test");
    return { code: "PHOTO" };
  } };
  assert.deepEqual(await controller.uploadEncoded({ tenant: "test", authData: { principalType: "customer" },
    httpRequest: { headers: { authorization: "Bearer trusted-session" }, body: { authorization: "Bearer attacker" } }
  }), { data: { code: "PHOTO" } });
});
