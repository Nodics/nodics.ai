/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/test/eWasteMarketplaceContract @description Preserves deployment order identity and completed-purchase replay during accelerator relocation. @layer test @owner eWaste */
const test=require("node:test"),assert=require("node:assert/strict"),crypto=require("node:crypto");
const marketplace=require("../src/service/defaultEWasteMarketplaceService");
test.afterEach(()=>{delete global.SERVICE;});
test("a completed purchase reuses the configured historical identity without another charge",async()=>{
 const prefix="PARTNER_ORDER_",key="existing-command",owner={code:"buyer"},paths=[];
 const expected=prefix+crypto.createHash("sha256").update(owner.code+":"+key).digest("hex").slice(0,24).toUpperCase();
 const store={customer:()=>owner,one:async()=>null,fail:(code)=>{throw Error(code);}};
 global.SERVICE={DefaultWasteAssetTransferOperationService:{eventCode:()=>"transfer"}};
 const service=Object.assign({},marketplace,{settings:()=>({orderCodePrefix:prefix}),experience:()=>({store:()=>store}),customerRemote:async(_r,module,route,method)=>{paths.push(route);assert.equal(method,"GET");if(module==="checkoutCore")return {status:"COMPLETED"};if(module==="order")return {entries:[{productCode:"offer"}]};throw Error("Unexpected mutation");},list:()=>{throw Error("Completed replay must not create another checkout");}});
 const result=await service.purchase({confirmed:true,idempotencyKey:key,code:"offer"});
 assert.equal(result.code,expected);assert.deepEqual(paths,["/checkouts/"+expected,"/orders/"+expected]);
 await assert.rejects(()=>service.purchase({confirmed:true,idempotencyKey:key,code:"different-offer"}),/ERR_EWASTE_COMMAND_CONFLICT/);
});
