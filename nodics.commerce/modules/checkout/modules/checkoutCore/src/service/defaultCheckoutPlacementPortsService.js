/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module checkoutCore/src/service/defaultCheckoutPlacementPortsService @description Binds placement orchestration to generated domain repositories and owner services. @layer service @owner checkoutCore */
module.exports = {
  /** Routes only exact calculated domain strategies to Digital Core; incomplete ownership metadata never becomes physical stock. @param {Object} entry Canonical calculated entry. @returns {boolean} Digital domain reservation required. */
  digitalReservationEntry: function (entry) {
    const a = entry?.availability || {};
    if (a.inventoryStrategy === "COUPON_CODE_POOL") return true;
    if (a.inventoryStrategy === "DIGITAL_COMMERCE" || a.digitalDeliveryType === "DIGITAL_OWNERSHIP") {
      if (a.inventoryStrategy !== "DIGITAL_COMMERCE" || a.digitalDeliveryType !== "DIGITAL_OWNERSHIP" ||
          a.productType !== "DIGITAL") throw new Error("Unsupported digital reservation classification");
      return true;
    }
    if (a.productType === "DIGITAL") throw new Error("Unsupported digital reservation classification");
    return false;
  },
  /** Unwraps a standard result envelope while preserving raw provider values. */
  unwrap: function (response) {
    return response && Object.prototype.hasOwnProperty.call(response, "result")
      ? response.result
      : response;
  },
  /**
   * Executes `serviceAuthData` as a loader-visible operation owned by this module.
   * @param {*} request Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  serviceAuthData: function (request) {
    return Object.assign({}, request.authData || {}, {
      enterpriseCode: request.enterpriseCode,
      principalId: "commerceCheckoutPlacementService",
      code: "commerceCheckoutPlacementService",
      loginId: "commerceCheckoutPlacementService",
      principalType: "service",
      userGroups: ["serviceAccountUserGroup"],
      groups: ["serviceAccountUserGroup"],
    });
  },
  /**
   * Executes `persistenceModel` as a loader-visible operation owned by this module.
   * @param {*} model Value defined by the owning module contract.
   * @returns {*} Result defined by the owning module contract.
   * @override Later-loaded modules may replace this member through the standard merge contract.
   */
  persistenceModel: function (model) {
    const now = new Date();
    return Object.assign({}, model, {
      active: model.active !== undefined ? model.active : true,
      created: model.created instanceof Date ? model.created : now,
      updated: now,
      occurredAt: model.occurredAt instanceof Date ? model.occurredAt : now,
    });
  },
  /** Reads a bounded generated projection. @param {Object} service Service. @param {string} tenant Tenant. @param {Object} query Query. @param {Object} authData Auth context. @param {number} limit Limit. @returns {Promise<Array>} Records. */
  get: function (service, tenant, query, authData, limit) {
    return service
      .get({
        tenant,
        authData,
        query: Object.assign({ tenant }, query),
        pageSize: limit || 20,
      })
      .then(this.unwrap)
      .then((value) => (Array.isArray(value) ? value : value ? [value] : []));
  },
  /** Persists an owner model. @param {Object} service Service. @param {string} tenant Tenant. @param {Object} model Model. @param {Object} authData Auth context. @returns {Promise<Object>} Stored model. */
  save: function (service, tenant, model, authData) {
    return service
      .save({ tenant, authData, model: this.persistenceModel(model) })
      .then(this.unwrap);
  },
  /** Applies an optimistic owner update. @param {Object} service Service. @param {string} tenant Tenant. @param {Object} model Current model. @param {Object} patch Patch. @param {Object} authData Auth context. @returns {Promise<Object>} Updated model. */
  update: function (service, tenant, model, patch, authData) {
    return service
      .update({
        tenant,
        authData,
        query: { tenant, code: model.code, revision: model.revision },
        model: { $set: patch },
      })
      .then(this.unwrap);
  },
  /** Retires the customer Cart intake after successful Order placement. @param {Object} request Checkout request. @returns {Promise<Object>} Retirement evidence. */
  closeCart: async function (request) {
    const authData = this.serviceAuthData(request);
    const cartQuery = {
      code: request.payload.cartCode,
      ownerId: request.ownerId,
    };
    if (request.enterpriseCode)
      cartQuery.enterpriseCode = request.enterpriseCode;
    const carts = await this.get(
      SERVICE.DefaultCartService,
      request.tenant,
      cartQuery,
      authData,
      1,
    );
    const cart = carts[0];
    const entryQuery = {
      cartCode: request.payload.cartCode,
      ownerId: request.ownerId,
      status: "ACTIVE",
    };
    if (request.enterpriseCode)
      entryQuery.enterpriseCode = request.enterpriseCode;
    const entries = await this.get(
      SERVICE.DefaultCartEntryService,
      request.tenant,
      entryQuery,
      authData,
      500,
    );
    for (const entry of entries) {
      await this.update(
        SERVICE.DefaultCartEntryService,
        request.tenant,
        entry,
        { status: "REMOVED", active: false },
        authData,
      );
    }
    if (cart)
      await this.update(
        SERVICE.DefaultCartService,
        request.tenant,
        cart,
        { status: "PLACED", active: false },
        authData,
      );
    return {
      cartCode: request.payload.cartCode,
      cartClosed: Boolean(cart),
      orderedEntryCount: entries.length,
    };
  },
  /** Selects a Payment-owned customer payment method service. @param {Object} request Checkout request. @param {Object} calculation Cart calculation. @returns {Object} Prepared method. */
  preparePaymentMethod: function (request, calculation) {
    const payload = request.payload || {};
    const base = {
      tenant: request.tenant,
      authData: request.authData,
      ownerId: request.ownerId,
      orderCode: payload.orderCode,
      cartCode: payload.cartCode,
      providerToken: payload.providerToken,
      walletCode: payload.walletCode,
      programCode: payload.programCode,
      rewardTypeCode: payload.rewardTypeCode,
      rewardAmount: payload.rewardAmount,
      rewardCurrency: payload.rewardCurrency,
      amount: calculation.totalAmount,
      currency: calculation.currency,
      idempotencyKey: request.idempotencyKey + ":payment",
      correlationId: request.correlationId,
    };
    if (payload.paymentMethod === "LOYALTY_REWARD")
      return SERVICE.DefaultLoyaltyRewardPaymentMethodService.prepare({
        ...base,
        authorization: request.httpRequest?.headers?.authorization || request.authorization,
      });
    if (payload.paymentMethod === "WALLET")
      return SERVICE.DefaultWalletPaymentMethodService.prepare(base);
    if (payload.paymentMethod === "CASH_ON_DELIVERY")
      return SERVICE.DefaultCashOnDeliveryPaymentMethodService.prepare(
        Object.assign({}, base, { acceptTerms: true }),
      );
    return SERVICE.DefaultCardPaymentMethodService.prepare(base);
  },
  /** Selects a Payment-owned provider adapter for the prepared method. @param {Object} method Prepared payment method. @returns {Object} Provider adapter. */
  paymentAdapter: function (method) {
    if (method && method.providerCode === "loyalty-reward-points")
      return SERVICE.DefaultLoyaltyRewardPaymentProviderService;
    return SERVICE.DefaultStripeSandboxAdapterService;
  },
  /** Returns true when the prepared method needs provider execution. @param {Object} method Prepared payment method. @returns {boolean} Provider execution flag. */
  requiresProviderAuthorization: function (method) {
    return method && method.methodCode !== "CASH_ON_DELIVERY";
  },
  /** Builds a generated Payment transaction repository for placement. @param {Object} request Checkout request. @param {string} codeSeed Stable code seed. @returns {Object} Repository adapter. */
  paymentRepository: function (request, codeSeed) {
    const self = this;
    return {
      find: async (tenant, key) =>
        (
          await self.get(
            SERVICE.DefaultPaymentTransactionEntryService,
            tenant,
            { idempotencyKey: key },
            self.serviceAuthData(request),
            1,
          )
        )[0],
      record: (model) =>
        self.save(
          SERVICE.DefaultPaymentTransactionEntryService,
          request.tenant,
          Object.assign(
            {
              code: codeSeed,
              ownerId: request.ownerId,
              orderCode: request.payload.orderCode,
              cartCode: request.payload.cartCode,
              revision: 0,
            },
            model,
          ),
          self.serviceAuthData(request),
        ),
    };
  },
  /** Records a non-provider payment authorization for methods that do not expose external credentials. @param {Object} request Checkout request. @param {Object} method Prepared method. @returns {Promise<Object>} Transaction entry. */
  recordOfflineAuthorization: function (request, method) {
    return this.save(
      SERVICE.DefaultPaymentTransactionEntryService,
      request.tenant,
      {
        code: request.payload.orderCode + ":authorization",
        tenant: request.tenant,
        ownerId: request.ownerId,
        orderCode: request.payload.orderCode,
        cartCode: request.payload.cartCode,
        status: "AUTHORIZED",
        revision: 0,
        operation: "AUTHORIZE",
        amount: method.amount,
        currency: method.currency,
        idempotencyKey: method.idempotencyKey,
        correlationId: method.correlationId,
        evidence: { methodCode: method.methodCode, providerRequired: false },
      },
      this.serviceAuthData(request),
    );
  },
  /** Creates placement and compensation ports. @returns {Object} Owner-delegating placement ports. */
  create: function () {
    const self = this;
    return {
      findPlacement: async (request) => {
        await SERVICE.DefaultCheckoutCompensationRecoveryService.assertPlacementAllowed(request);
        return (
          await self.get(
            SERVICE.DefaultCheckoutCheckpointService,
            request.tenant,
            Object.assign(
              {
                ownerId: request.ownerId,
                idempotencyKey: request.idempotencyKey,
                status: "COMPLETED",
              },
              request.enterpriseCode
                ? { enterpriseCode: request.enterpriseCode }
                : {},
            ),
            request.authData,
            1,
          )
        )[0];
      },
      validateCart: async (request) => {
        if (SERVICE.DefaultNegotiatedPriceService) {
          const cart = await SERVICE.DefaultCartOperationService.cartSnapshot({
            ...request,
            cartCode: request.payload.cartCode,
          });
          await SERVICE.DefaultNegotiatedPriceService.validateCheckout(
            request,
            cart,
          );
        }
        return SERVICE.DefaultCartOperationService.validateDirect(
          Object.assign({}, request, {
            internalUse: true,
            cartCode: request.payload.cartCode,
            ownerId: request.ownerId,
            payload: {
              expectedRevision: request.payload.expectedCartRevision,
              couponCode: request.payload.couponCode,
              customerGroup: request.payload.customerGroup,
              idempotencyKey: request.idempotencyKey,
            },
          }),
        );
      },
      calculateCart: (request) =>
        SERVICE.DefaultCartOperationService.calculate(
          Object.assign({}, request, {
            internalUse: true,
            cartCode: request.payload.cartCode,
            ownerId: request.ownerId,
            payload: {
              expectedRevision: request.payload.expectedCartRevision,
              calculationCode: request.payload.calculationCode,
              couponCode: request.payload.couponCode,
              customerGroup: request.payload.customerGroup,
              idempotencyKey: request.idempotencyKey,
            },
          }),
        ),
      reserveInventory: async (request, calculation) => {
        const reservations = [];
        for (const entry of calculation.entries) {
          if (self.digitalReservationEntry(entry)) continue;
          const candidate = (entry.availability.candidates || [])[0];
          if (!candidate) throw new Error("No warehouse candidate");
          const model =
            SERVICE.DefaultInventoryReservationPolicyService.prepare(
              {
                tenant: request.tenant,
                enterpriseCode: request.enterpriseCode,
                quantity: entry.quantity,
                ownerType: "ORDER",
                ownerCode: request.payload.orderCode,
                idempotencyKey:
                  request.idempotencyKey + ":inventory:" + entry.code,
                correlationId: request.correlationId,
              },
              {
                tenant: request.tenant,
                enterpriseCode: request.enterpriseCode,
                warehouseCode: candidate.warehouseCode,
                sku: entry.sku,
                revision: candidate.revision,
              },
              SERVICE.DefaultExactAmountService,
            );
          reservations.push({ ...model, code: request.payload.orderCode + ':' + entry.code });
        }
        if (!reservations.length) return [];
        const inventory = SERVICE.DefaultInventoryReservationOperationService;
        if (!inventory?.reserveAll) throw new Error('Inventory reservation owner unavailable');
        return inventory.reserveAll(request, reservations);
      },
      reserveDigitalUnits: async (request, calculation) => {
        const digital = SERVICE.DefaultDigitalCommerceCheckoutService;
        if (!digital?.reserveForCheckout) {
          if ((calculation.entries || []).some(entry => self.digitalReservationEntry(entry)))
            throw new Error("Digital reservation owner unavailable");
          return [];
        }
        const cart = await SERVICE.DefaultCartOperationService.cartSnapshot({
          ...request, cartCode: request.payload.cartCode,
        });
        if (cart?.code !== request.payload.cartCode ||
            typeof cart.storeCode !== "string" || !cart.storeCode.trim())
          throw new Error("Persisted Cart Store is required for digital reservation");
        const ownership = (calculation.entries || []).some(entry =>
          entry.availability?.digitalDeliveryType === "DIGITAL_OWNERSHIP");
        if (ownership && (typeof cart.locale !== "string" || !cart.locale.trim()))
          throw new Error("Persisted Cart locale is required for digital ownership reservation");
        return digital.reserveForCheckout({ ...request, storeCode: cart.storeCode,
          ...(ownership ? { locale: cart.locale } : {}) }, calculation);
      },
      authorizePayment: async (request, calculation) => {
        const method = self.preparePaymentMethod(request, calculation);
        if (method.methodCode === "CASH_ON_DELIVERY")
          return self.recordOfflineAuthorization(request, method);
        const adapter = self.paymentAdapter(method);
        if (
          adapter === SERVICE.DefaultStripeSandboxAdapterService &&
          !(CONFIG.get("stripeProvider") || {}).enabled
        )
          throw new Error("Reference payment sandbox is disabled");
        const authorization =
          await SERVICE.DefaultPaymentExecutionService.execute(
            Object.assign({ operation: "AUTHORIZE" }, method),
            adapter,
            self.paymentRepository(
              request,
              request.payload.orderCode + ":authorization",
            ),
          );
        if (authorization?.status !== "AUTHORIZED") {
          const code =
            authorization?.status === "DECLINED"
              ? "ERR_CHECKOUT_PAYMENT_DECLINED"
              : authorization?.status === "CANCELLED"
                ? "ERR_CHECKOUT_PAYMENT_CANCELLED"
                : "ERR_CHECKOUT_PAYMENT_UNCONFIRMED";
          const definition = require("../utils/statusDefinitions")[code];
          if (typeof CLASSES !== "undefined" && CLASSES.NodicsError)
            throw new CLASSES.NodicsError(code);
          throw Object.assign(new Error(definition.message), {
            code,
            responseCode: Number(definition.code),
          });
        }
        return authorization;
      },
      createOrder: async (
        request,
        calculation,
        reservations,
        authorization,
        digitalReservations,
      ) => {
        const cart = await SERVICE.DefaultCartOperationService.cartSnapshot({ ...request, cartCode: request.payload.cartCode });
        if (!cart?.storeCode || cart.code !== request.payload.cartCode || cart.ownerId !== request.ownerId ||
          cart.enterpriseCode !== request.enterpriseCode || cart.tenant !== request.tenant)
          throw new Error("Order requires its authoritative persisted Cart Store");
        const discount =
          (calculation.decisions && calculation.decisions.discount) || {};
        const model = {
          code: request.payload.orderCode,
          tenant: request.tenant,
          enterpriseCode: request.enterpriseCode || calculation.enterpriseCode,
          ownerId: request.ownerId,
          cartCode: request.payload.cartCode,
          status: "PLACED",
          revision: 0,
          idempotencyKey: request.idempotencyKey,
          correlationId: request.correlationId,
          currency: calculation.currency,
          subtotalAmount: calculation.subtotal,
          promotionDiscountAmount:
            calculation.discountAmount || discount.discountAmount,
          taxAmount: calculation.taxAmount,
          totalAmount: calculation.totalAmount,
          promotionCode: discount.promotionCode,
          couponCode: discount.couponCode,
          evidence: {
            storeCode: cart.storeCode,
            calculationCode: calculation.code,
            reservationCodes: reservations.map((value) => value.code),
            digitalReservationCodes: (digitalReservations || []).map(
              (value) => value.code,
            ),
            paymentReference: authorization.providerReference,
            paymentMethod: authorization.methodCode,
            paymentProvider: authorization.providerCode,
          },
        };
        const serviceAuthData = self.serviceAuthData(request);
        const order = await self.save(
          SERVICE.DefaultCommerceOrderService,
          request.tenant,
          model,
          serviceAuthData,
        );
        for (const entry of calculation.entries) {
          await self.save(
            SERVICE.DefaultCommerceOrderEntryService,
            request.tenant,
            {
              code: order.code + ":" + entry.code,
              tenant: request.tenant,
              enterpriseCode:
                request.enterpriseCode || calculation.enterpriseCode,
              ownerId: request.ownerId,
              orderCode: order.code,
              cartCode: request.payload.cartCode,
              status: "PLACED",
              revision: 0,
              idempotencyKey:
                request.idempotencyKey + ":order-entry:" + entry.code,
              correlationId: request.correlationId,
              productCode: entry.productCode,
              sku: entry.sku,
              quantity: entry.quantity,
              unitAmount: entry.unitAmount,
              evidence: {
                lineAmount: entry.lineAmount,
                pricingDecisionCode: entry.pricingDecisionCode,
                promotionDecisionCode: entry.promotionDecisionCode,
                taxDecisionCode: entry.taxDecisionCode,
                digitalReservationCodes: (digitalReservations || [])
                  .filter((value) => value.entryCode === entry.code)
                  .map((value) => value.code),
              },
            },
            serviceAuthData,
          );
        }
        return order;
      },
      capturePayment: async (request, order, authorization) => {
        if (!self.requiresProviderAuthorization(authorization))
          return authorization;
        const role = CONFIG.get("runtimeRole"), policy = CONFIG.get("stripeProvider") || {};
        const adapter = self.paymentAdapter(authorization);
        const offlineCapture = (typeof role === "string" ? role : role?.code) === "COMMERCE" &&
          authorization.methodCode === "CARD" && authorization.providerCode === "stripe-sandbox" &&
          adapter === SERVICE.DefaultStripeSandboxAdapterService && policy.enabled === true &&
          policy.sandboxOnly === true && policy.liveQualified === false && policy.maturity === "OFFLINE_CONFORMANCE";
        return SERVICE.DefaultPaymentExecutionService.execute(
          {
            tenant: request.tenant,
            authData: self.serviceAuthData(request),
            enterpriseCode: request.enterpriseCode || request.authData?.entCode || request.authData?.enterpriseCode,
            ownerId: request.ownerId,
            orderCode: order.code,
            cartCode: order.cartCode || request.payload.cartCode,
            operation: "CAPTURE",
            ...(offlineCapture ? { sandboxMode: "LOCAL_SANDBOX_DEMO" } : {}),
            methodCode: authorization.methodCode,
            providerCode: authorization.providerCode,
            providerToken: request.payload.providerToken,
            providerReference: authorization.providerReference,
            walletCode:
              (authorization.evidence && authorization.evidence.walletCode) ||
              request.payload.walletCode,
            programCode:
              (authorization.evidence && authorization.evidence.programCode) ||
              request.payload.programCode,
            rewardTypeCode:
              (authorization.evidence &&
                authorization.evidence.rewardTypeCode) ||
              request.payload.rewardTypeCode,
            amount: authorization.amount,
            currency: authorization.currency,
            idempotencyKey: request.idempotencyKey + ":payment:capture",
            correlationId: request.correlationId,
          },
          adapter,
          self.paymentRepository(
            request,
            request.payload.orderCode + ":capture",
          ),
        );
      },
      commitPromotions: async (request, calculation, order) => {
        const discount =
          (calculation.decisions && calculation.decisions.discount) || {};
        if (
          !SERVICE.DefaultPromotionOperationService ||
          !SERVICE.DefaultPromotionOperationService.apply ||
          Number(discount.discountAmount || 0) <= 0
        )
          return undefined;
        const cart = await SERVICE.DefaultCartOperationService.cartSnapshot({
          ...request,
          cartCode: request.payload.cartCode,
        });
        if (cart?.code !== request.payload.cartCode ||
            typeof cart.storeCode !== "string" || !cart.storeCode.trim())
          throw new Error("Persisted Cart Store is required for promotion commitment");
        const result = await SERVICE.DefaultPromotionOperationService.apply({
          tenant: request.tenant,
          enterpriseCode: request.enterpriseCode || calculation.enterpriseCode,
          storeCode: cart.storeCode,
          ownerId: request.ownerId,
          authData: self.serviceAuthData(request),
          correlationId: request.correlationId,
          idempotencyKey: request.idempotencyKey + ":promotion",
          payload: {
            cartCode: request.payload.cartCode,
            storeCode: cart.storeCode,
            orderCode: (order && order.code) || request.payload.orderCode,
            couponCode: request.payload.couponCode,
            customerGroup: request.payload.customerGroup,
            subtotal: calculation.subtotal,
            productCodes: (calculation.entries || []).map(
              (entry) => entry.productCode,
            ),
            currency: calculation.currency,
            idempotencyKey: request.idempotencyKey + ":promotion",
          },
        });
        return result && result.redemption ? result : undefined;
      },
      confirmDigitalSale: async (request, order, reservations) => {
        if (!reservations?.length) return reservations;
        const digital = SERVICE.DefaultDigitalCommerceCheckoutService;
        if (!digital?.confirmSale) throw new Error("Digital sale owner is required");
        const cart = await SERVICE.DefaultCartOperationService.cartSnapshot({
          ...request, cartCode: request.payload.cartCode,
        });
        return digital.confirmSale({ ...request, storeCode: cart.storeCode }, order, reservations);
      },
      releaseFulfillment: (request, order) =>
        self.save(
          SERVICE.DefaultConsignmentService,
          request.tenant,
          {
            code: order.code + ":1",
            tenant: request.tenant,
            enterpriseCode: request.enterpriseCode || order.enterpriseCode,
            orderCode: order.code,
            ownerId: request.ownerId,
            status: "READY",
            revision: 0,
            idempotencyKey: request.idempotencyKey + ":fulfillment",
            correlationId: request.correlationId,
            currency: order.currency,
            totalAmount: order.totalAmount,
          },
          self.serviceAuthData(request),
        ),
      deliverDigitalUnits: (request, order, sales) =>
        SERVICE.DefaultDigitalCommerceCheckoutService &&
        SERVICE.DefaultDigitalCommerceCheckoutService.deliver
          ? SERVICE.DefaultDigitalCommerceCheckoutService.deliver(
              request,
              order,
              sales,
            )
          : sales,
      complete: async (checkpoint, result) => {
        const cartClosure = await self.closeCart({
          tenant: checkpoint.tenant,
          ownerId: checkpoint.ownerId,
          authData: checkpoint.authData,
          payload: {
            cartCode: result.order.cartCode,
            orderCode: result.order.code,
          },
        });
        return self.save(
          SERVICE.DefaultCheckoutCheckpointService,
          checkpoint.tenant,
          {
            code: result.order.code,
            tenant: checkpoint.tenant,
            enterpriseCode: checkpoint.enterpriseCode,
            ownerId: checkpoint.ownerId,
            cartCode: result.order.cartCode,
            status: "COMPLETED",
            revision: 0,
            idempotencyKey: checkpoint.idempotencyKey,
            correlationId: checkpoint.correlationId,
            evidence: {
              completed: checkpoint.completed,
              orderCode: result.order.code,
              promotionRedemptionCode:
                result.promotionCommit &&
                result.promotionCommit.redemption &&
                result.promotionCommit.redemption.code,
              promotionCode:
                result.promotionCommit &&
                result.promotionCommit.redemption &&
                result.promotionCommit.redemption.promotionCode,
              couponCode:
                result.promotionCommit &&
                result.promotionCommit.redemption &&
                result.promotionCommit.redemption.couponCode,
              digitalReservationCodes: (result.digitalReservation || []).map(
                (value) => value.code,
              ),
              digitalSaleCodes: (result.digitalSale || []).map(
                (value) => value.code,
              ),
              digitalDeliveryCodes: (result.digitalDelivery || []).map(
                (value) => value.code,
              ),
              cartClosure,
            },
          },
          checkpoint.authData,
        );
      },
      notifyCommitted: (request, result) =>
        SERVICE.DefaultDigitalCommerceNotificationService?.request(
          {
            ...request,
            orderCode: result?.evidence?.orderCode || result?.code,
          },
          "PURCHASED",
        ),
      compensate: async (checkpoint, error, request) => {
        const outcomes = [];
        const paymentReversalTarget = checkpoint.results.capture || checkpoint.results.authorization;
        const reversalOperation = checkpoint.results.capture ? "REFUND" : "VOID";
        const paymentRequired = paymentReversalTarget && self.requiresProviderAuthorization(paymentReversalTarget);
        const paymentCompensationIntent = paymentRequired ? JSON.parse(JSON.stringify({
          tenant: checkpoint.tenant, enterpriseCode: checkpoint.enterpriseCode, ownerId: checkpoint.ownerId,
          orderCode: paymentReversalTarget.orderCode || checkpoint.results.order?.code || request?.payload?.orderCode,
          cartCode: paymentReversalTarget.cartCode || request?.payload?.cartCode,
          operation: reversalOperation, idempotencyKey: checkpoint.idempotencyKey + ":payment:" + reversalOperation.toLowerCase(),
          originalPaymentTransactionCode: paymentReversalTarget.code,
          originalIdempotencyKey: paymentReversalTarget.idempotencyKey,
          originalProviderReference: paymentReversalTarget.providerReference || paymentReversalTarget.evidence?.providerReference,
          providerCode: paymentReversalTarget.providerCode || paymentReversalTarget.evidence?.providerCode,
          methodCode: paymentReversalTarget.methodCode || paymentReversalTarget.evidence?.methodCode,
          amount: paymentReversalTarget.amount || paymentReversalTarget.totalAmount || paymentReversalTarget.evidence?.originalCaptureReceipt?.amount,
          currency: paymentReversalTarget.currency || paymentReversalTarget.evidence?.originalCaptureReceipt?.currency,
          sandboxMode: paymentReversalTarget.evidence?.sandboxMode, maturity: paymentReversalTarget.evidence?.maturity,
        })) : undefined;
        if (paymentRequired) {
          const owner = SERVICE.DefaultCheckoutCheckpointService;
          if (typeof owner?.get !== "function") throw new Error("Checkout payment recovery read owner is unavailable");
          let retained = await owner.get({ tenant: checkpoint.tenant, authData: self.serviceAuthData(request || checkpoint),
            query: { tenant: checkpoint.tenant, code: checkpoint.idempotencyKey, ownerId: checkpoint.ownerId, idempotencyKey: checkpoint.idempotencyKey },
            options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 3 } });
          for (let n = 0; n < 8 && !Array.isArray(retained); n++) {
            if (!retained || retained.error || retained.success === false || retained.acknowledged === false ||
              (retained.errors && (!Array.isArray(retained.errors) || retained.errors.length)) ||
              (retained.code !== undefined && (typeof retained.code !== "string" || !/^SUC_/.test(retained.code))))
              throw new Error("Checkout payment recovery read failed");
            retained = retained.result !== undefined ? retained.result : retained.data;
          }
          if (!Array.isArray(retained) || retained.length > 1) throw new Error("Checkout payment recovery read is unconfirmed");
          if (retained[0]) {
            const row = retained[0];
            if (row.tenant !== checkpoint.tenant || row.ownerId !== checkpoint.ownerId || row.code !== checkpoint.idempotencyKey ||
              row.idempotencyKey !== checkpoint.idempotencyKey || !["COMPENSATED", "COMPENSATION_REQUIRED"].includes(row.status) ||
              !require("node:util").isDeepStrictEqual(row.evidence?.paymentCompensationIntent, paymentCompensationIntent))
              throw new Error("Retained Checkout payment recovery intent requires manual reconciliation");
            if (row.status === "COMPENSATED") {
              const payment = row.evidence.compensation?.filter(value => value.type === "PAYMENT_" + reversalOperation);
              if (payment?.length !== 1 || payment[0].status !== "COMPLETED" ||
                typeof payment[0].providerReference !== "string" || !payment[0].providerReference.trim() ||
                payment[0].idempotencyKey !== paymentCompensationIntent.idempotencyKey ||
                !(reversalOperation === "VOID" ? ["VOIDED"] : ["REFUNDED", "REFUND_SUCCEEDED"]).includes(payment[0].paymentStatus))
                throw new Error("Retained Checkout compensation lacks terminal Payment confirmation; reconcile manually");
            }
            return row;
          }
        }
        const promotionCommit = checkpoint.results.promotionCommit;
        const redemptionCode =
          promotionCommit &&
          promotionCommit.redemption &&
          promotionCommit.redemption.code;
        if (
          redemptionCode &&
          SERVICE.DefaultPromotionOperationService &&
          SERVICE.DefaultPromotionOperationService.reverse
        ) {
          try {
            await SERVICE.DefaultPromotionOperationService.reverse({
              tenant: checkpoint.tenant,
              enterpriseCode: checkpoint.enterpriseCode,
              ownerId: checkpoint.ownerId,
              authData: self.serviceAuthData(request || checkpoint),
              correlationId: checkpoint.correlationId,
              redemptionCode,
              payload: { reasonCode: "CHECKOUT_COMPENSATION" },
            });
            outcomes.push({
              type: "PROMOTION_REVERSAL",
              code: redemptionCode,
              status: "COMPLETED",
            });
          } catch (reverseError) {
            outcomes.push({
              type: "PROMOTION_REVERSAL",
              code: redemptionCode,
              status: "FAILED",
              errorCode: reverseError.code || "PROMOTION_REVERSAL_FAILED",
            });
          }
        }
        if (
          SERVICE.DefaultDigitalCommerceCheckoutService &&
          SERVICE.DefaultDigitalCommerceCheckoutService.releaseReservations
        ) {
          outcomes.push(
            ...(await SERVICE.DefaultDigitalCommerceCheckoutService.releaseReservations(
              request || checkpoint,
              checkpoint.results.digitalReservation || [],
            )),
          );
        }
        for (const reservation of checkpoint.results.reservation || []) {
          try {
            const inventory = SERVICE.DefaultInventoryReservationOperationService;
            if (!inventory?.release) throw new Error('Inventory release owner unavailable');
            await inventory.release(request || checkpoint, reservation.code);
            outcomes.push({
              type: "INVENTORY_RELEASE",
              code: reservation.code,
              status: "COMPLETED",
            });
          } catch (releaseError) {
            outcomes.push({
              type: "INVENTORY_RELEASE",
              code: reservation.code,
              status: "FAILED",
              errorCode: releaseError.code || "RELEASE_FAILED",
            });
          }
        }
        if (paymentRequired) {
          let reversal;
          try {
            if (!request?.payload || request.payload.orderCode !== paymentCompensationIntent.orderCode ||
              request.payload.cartCode !== paymentCompensationIntent.cartCode)
              throw new Error("Original Checkout payment reversal context is unavailable");
            const authorization =
              checkpoint.results.authorization || paymentReversalTarget;
            reversal = await SERVICE.DefaultPaymentExecutionService.execute(
              {
                tenant: checkpoint.tenant,
                authData: self.serviceAuthData(request),
                ownerId: checkpoint.ownerId,
                orderCode: request.payload.orderCode,
                cartCode: request.payload.cartCode,
                operation: reversalOperation,
                methodCode: paymentReversalTarget.methodCode,
                providerCode: paymentReversalTarget.providerCode,
                providerToken: request.payload.providerToken,
                providerReference: paymentReversalTarget.providerReference,
                walletCode:
                  (authorization.evidence &&
                    authorization.evidence.walletCode) ||
                  (paymentReversalTarget.evidence &&
                    paymentReversalTarget.evidence.walletCode) ||
                  request.payload.walletCode,
                programCode:
                  (authorization.evidence &&
                    authorization.evidence.programCode) ||
                  (paymentReversalTarget.evidence &&
                    paymentReversalTarget.evidence.programCode) ||
                  request.payload.programCode,
                rewardTypeCode:
                  (authorization.evidence &&
                    authorization.evidence.rewardTypeCode) ||
                  (paymentReversalTarget.evidence &&
                    paymentReversalTarget.evidence.rewardTypeCode) ||
                  request.payload.rewardTypeCode,
                amount: paymentReversalTarget.amount,
                currency: paymentReversalTarget.currency,
                idempotencyKey:
                  checkpoint.idempotencyKey +
                  ":payment:" +
                  reversalOperation.toLowerCase(),
                correlationId: checkpoint.correlationId,
              },
              self.paymentAdapter(paymentReversalTarget),
              self.paymentRepository(
                request,
                checkpoint.idempotencyKey +
                  ":" +
                  reversalOperation.toLowerCase(),
              ),
            );
            for (let n = 0; n < 8; n++) {
              if (!reversal || reversal.error || reversal.success === false || reversal.acknowledged === false ||
                (reversal.errors && (!Array.isArray(reversal.errors) || reversal.errors.length)) ||
                (typeof reversal.code === "string" && reversal.code.startsWith("ERR_")) ||
                ((reversal.result !== undefined || reversal.data !== undefined || !reversal.status) && reversal.code !== undefined &&
                  (typeof reversal.code !== "string" || !/^SUC_/.test(reversal.code))))
                throw new Error("Payment reversal response is unconfirmed");
              if (reversal.result !== undefined) reversal = reversal.result;
              else if (reversal.data !== undefined) reversal = reversal.data;
              else break;
            }
            const reference = reversal?.providerReference || reversal?.evidence?.providerReference;
            if (!(reversalOperation === "VOID" ? ["VOIDED"] : ["REFUNDED", "REFUND_SUCCEEDED"]).includes(reversal?.status) ||
              reversal.reconciliationRequired === true || typeof reference !== "string" || !reference.trim() ||
              reversal.tenant !== checkpoint.tenant || reversal.ownerId !== checkpoint.ownerId ||
              reversal.orderCode !== paymentCompensationIntent.orderCode || reversal.idempotencyKey !== paymentCompensationIntent.idempotencyKey ||
              (reversal.evidence?.providerStatus !== undefined &&
                !(reversalOperation === "VOID" ? ["VOIDED"] : ["REFUNDED", "REFUND_SUCCEEDED"]).includes(reversal.evidence.providerStatus)) ||
              (reversal.totalAmount !== undefined && reversal.totalAmount !== paymentCompensationIntent.amount) ||
              (reversal.currency !== undefined && reversal.currency !== paymentCompensationIntent.currency))
              throw new Error("Payment reversal lacks terminal original-intent confirmation");
            outcomes.push({
              type: "PAYMENT_" + reversalOperation,
              status: "COMPLETED",
              paymentStatus: reversal.status, providerReference: reference,
              paymentTransactionCode: reversal.code, idempotencyKey: paymentCompensationIntent.idempotencyKey,
              ...(reversal.evidence?.sandbox === true ? { sandbox: true, maturity: reversal.evidence.maturity, sandboxMode: reversal.evidence.sandboxMode } : {}),
            });
          } catch (voidError) {
            outcomes.push({
              type: "PAYMENT_" + reversalOperation,
              status: "FAILED",
              errorCode: voidError.code || reversalOperation + "_UNCONFIRMED",
              idempotencyKey: paymentCompensationIntent.idempotencyKey,
              paymentStatus: ["VOIDED", "REFUNDED", "REFUND_SUCCEEDED", "REFUND_PENDING", "REFUND_DELAYED", "REFUND_FAILED",
                "REFUND_RECONCILIATION_REQUIRED", "SUBMITTED"].includes(reversal?.status) ? reversal.status : "UNCONFIRMED",
              reconciliationRequired: true,
            });
          }
        }
        if (checkpoint.results.digitalReservationRecoveryRequired === true) {
          outcomes.push({
            type: "DIGITAL_COUPON_RELEASE",
            status: "FAILED",
            errorCode: "DIGITAL_RESERVATION_UNCERTAIN",
          });
        }
        if (checkpoint.results.inventoryReservationRecoveryRequired === true) {
          outcomes.push({ type: 'INVENTORY_RELEASE', status: 'FAILED', errorCode: 'INVENTORY_RESERVATION_UNCERTAIN' });
        }
        const saved = await self.save(
          SERVICE.DefaultCheckoutCheckpointService,
          checkpoint.tenant,
          {
            code: checkpoint.idempotencyKey,
            tenant: checkpoint.tenant,
            ownerId: checkpoint.ownerId,
            status: outcomes.every((value) => value.status === "COMPLETED")
              ? "COMPENSATED"
              : "COMPENSATION_REQUIRED",
            revision: 0,
            idempotencyKey: checkpoint.idempotencyKey,
            correlationId: checkpoint.correlationId,
            evidence: {
              completed: checkpoint.completed,
              compensation: JSON.parse(JSON.stringify(outcomes)),
              ...(paymentCompensationIntent ? { paymentCompensationIntent } : {}),
              inventoryReservationRecoveryRequired: checkpoint.results.inventoryReservationRecoveryRequired === true,
              digitalReservationRecoveryRequired:
                checkpoint.results.digitalReservationRecoveryRequired === true,
              digitalReservationUncertainKey:
                checkpoint.results.digitalReservationUncertainKey,
              errorCode: error.code || "PLACEMENT_FAILED",
            },
          },
          checkpoint.authData,
        );
        if (!paymentRequired) return saved;
        let readback = await SERVICE.DefaultCheckoutCheckpointService.get({
          tenant: checkpoint.tenant, authData: self.serviceAuthData(request || checkpoint),
          query: { tenant: checkpoint.tenant, code: checkpoint.idempotencyKey, ownerId: checkpoint.ownerId, idempotencyKey: checkpoint.idempotencyKey },
          options: { recursive: false, skipItemCache: true }, searchOptions: { pageSize: 3 },
        });
        for (let n = 0; n < 8 && !Array.isArray(readback); n++) {
          if (!readback || readback.error || readback.success === false || readback.acknowledged === false ||
            (readback.errors && (!Array.isArray(readback.errors) || readback.errors.length)) ||
            (readback.code !== undefined && (typeof readback.code !== "string" || !/^SUC_/.test(readback.code))))
            throw new Error("Checkout payment recovery persistence readback failed");
          readback = readback.result !== undefined ? readback.result : readback.data;
        }
        const expectedStatus = outcomes.every(value => value.status === "COMPLETED") ? "COMPENSATED" : "COMPENSATION_REQUIRED";
        if (!Array.isArray(readback) || readback.length !== 1 || readback[0].tenant !== checkpoint.tenant ||
          readback[0].ownerId !== checkpoint.ownerId || readback[0].code !== checkpoint.idempotencyKey ||
          readback[0].idempotencyKey !== checkpoint.idempotencyKey || readback[0].status !== expectedStatus ||
          !require("node:util").isDeepStrictEqual(readback[0].evidence?.paymentCompensationIntent, paymentCompensationIntent) ||
          !require("node:util").isDeepStrictEqual(readback[0].evidence?.compensation, JSON.parse(JSON.stringify(outcomes))))
          throw new Error("Checkout payment recovery persistence is unconfirmed");
        return readback[0];
      },
    };
  },
};
