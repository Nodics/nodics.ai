/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module checkoutCore/src/service/defaultCheckoutOperationService @description Starts idempotent checkout placement through the standard Commerce owner ports. @layer service @owner checkoutCore */
module.exports = {
    /** Reads only a completed checkout owned by the authenticated customer. */
    status: async function(request) {
        let value=await SERVICE.DefaultCheckoutCheckpointService.get({tenant:request.tenant,authData:request.authData,query:{code:request.orderCode,ownerId:request.ownerId,status:'COMPLETED',...(request.enterpriseCode?{enterpriseCode:request.enterpriseCode}:{})},searchOptions:{pageSize:1},options:{recursive:false}});
        for(let i=0;i<6&&value&&!Array.isArray(value);i++){if(value.result!==undefined)value=value.result;else if(value.data!==undefined)value=value.data;else break;}
        const record=Array.isArray(value)?value[0]:value;
        return record?{code:record.code,status:record.status,evidence:record.evidence}:{status:'NOT_COMPLETED'};
    }, place: function (request) {
    if (!request.payload || !request.payload.cartCode || !request.payload.orderCode || !request.idempotencyKey) return Promise.reject(new Error('Cart, Order, and Idempotency-Key are required'));
    return SERVICE.DefaultOrderPlacementService.place(request, SERVICE.DefaultCheckoutPlacementPortsService.create());
} };
