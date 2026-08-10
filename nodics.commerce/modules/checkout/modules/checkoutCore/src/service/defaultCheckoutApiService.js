/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module checkoutCore/src/service/defaultCheckoutApiService @description Starts idempotent customer placement through the standard Commerce owner ports. @layer service @owner checkoutCore */
module.exports = { place: function (request) {
    if (!request.payload || !request.payload.cartCode || !request.payload.orderCode || !request.idempotencyKey) return Promise.reject(new Error('Cart, Order, and Idempotency-Key are required'));
    return SERVICE.DefaultOrderPlacementService.place(request, SERVICE.DefaultCheckoutPlacementPortsService.create());
} };
