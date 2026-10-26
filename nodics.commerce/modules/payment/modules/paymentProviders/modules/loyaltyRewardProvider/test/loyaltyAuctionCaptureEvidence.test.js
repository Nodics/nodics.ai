/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module loyaltyRewardProvider/test/loyaltyAuctionCaptureEvidence @description Canonical auction capture ledger handoff and persisted Payment evidence. @layer test @owner loyaltyRewardProvider */
const test=require('node:test'),assert=require('node:assert/strict');
const provider=require('../src/service/defaultLoyaltyAuctionPaymentProviderService');
const payment=require('../../../../paymentCore/src/service/defaultPaymentExecutionService');
const exact=require('../../../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService');
function fixture(t){
 const old=global.SERVICE;t.after(()=>global.SERVICE=old);
 const command={walletCode:'wallet',programCode:'program',rewardTypeCode:'points',amount:'1',reservationCode:'hold',
  roundCode:'round',sourceCode:'bid',ownerRef:{module:'profile',schema:'enterprise',code:'buyer'},idempotencyKey:'original:capture'};
 const evidence={contractVersion:1,redemptionCode:'redemption',captureLedgerEntryCode:'ledger',roundCode:'round',bidCode:'bid',
  reservationCode:'hold',idempotencyKey:command.idempotencyKey,sourceType:'BIDDING',sourceCode:'bid',targetType:'AUCTION_ROUND',targetCode:'round'};
 const result={confirmed:true,redemptionCode:'redemption',captureLedgerEntryCode:'ledger',captureEvidence:evidence,
  reservation:{code:'hold',status:'CAPTURED',expiresAt:null,holdUntilRelease:true,walletCode:'wallet',programCode:'program',rewardTypeCode:'points',amount:'1.00'}};
 global.SERVICE={DefaultExactAmountService:exact,DefaultLoyaltyRewardPaymentProviderService:{normalizeLoyaltyResponse:r=>r,
  providerConfig:()=>({providerCode:'loyalty',auctionPaths:{capture:'/auction-funds/capture'},loyaltyTarget:{}})},
  DefaultCheckoutAuctionService:{paymentTerms:async()=>({request:{tenant:'t',authorization:'Bearer original',participantEnterpriseCode:'buyer'},row:{code:'commitment',orderCode:'order'},command}),fence:async()=>{}},
  DefaultModuleService:{invokeModule:async()=>structuredClone(result)}};
 return {command,result,evidence};
}
test('capture reference is verified ledger; Payment retains exact auction binding separately from redemption',async t=>{
 const f=fixture(t),response=await provider.execute({...f.command,operation:'CAPTURE',providerReference:'hold'});
 assert.equal(response.reference,'ledger');assert.equal(response.loyalty.redemptionCode,'redemption');
 assert.deepEqual(response.auctionCapture,{...f.evidence,commitmentCode:'commitment'});
 const owner={...payment,participantIdentity:()=>undefined,auctionIdentity:()=>({commitmentCode:'commitment'}),operationEnterprise:()=> 'buyer'};
 const model=owner.transactionModel({operation:'CAPTURE',amount:'1',methodCode:'LOYALTY_REWARD',currency:'POINTS'}, {code:'loyalty'},response);
 assert.equal(model.evidence.providerReference,'ledger');assert.deepEqual(model.evidence.auctionCapture,response.auctionCapture);
 response.auctionCapture.bidCode='changed';assert.equal(model.evidence.auctionCapture.bidCode,'bid');
});
for(const field of ['captureLedgerEntryCode','redemptionCode','roundCode','bidCode','reservationCode','idempotencyKey','sourceType','sourceCode','targetType','targetCode'])
 test('reject mismatched canonical capture '+field,t=>{const f=fixture(t);f.result.captureEvidence[field]='foreign';
 assert.throws(()=>provider.receipt(f.result,f.command,'capture'),/capture ledger evidence/);});
test('legacy redemption-only capture is not silently accepted as ledger proof',t=>{const f=fixture(t);delete f.result.captureEvidence;delete f.result.captureLedgerEntryCode;
 assert.throws(()=>provider.receipt(f.result,f.command,'capture'),/capture ledger evidence/);});
