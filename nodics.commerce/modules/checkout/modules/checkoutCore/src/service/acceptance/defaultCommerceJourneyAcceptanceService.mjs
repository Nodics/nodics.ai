/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module checkoutCore/acceptance/defaultCommerceJourneyAcceptanceService @description Canonical customer journey and isolation acceptance. @owner checkoutCore @layer tooling */
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createAcceptanceContext } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs';
import { projectRuntimeAcceptance } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs';

/** Runs all customer contract assertions with customer-selected fixtures; no runtime startup or implicit execution. */
export async function runCommerceJourneyAcceptance(options = {}) {
  if (options.execute !== true) throw new Error('Explicit --execute is required for the mutating Commerce journey');
  const context = await createAcceptanceContext(options);
  const environment = context.environment;
  const config = options.acceptance || projectRuntimeAcceptance(context.projectRoot, context.configuration, { role: 'COMMERCE' }).commerceJourney || {};
  for (const field of ["productCode","categoryCode","storeCode","variantCode","secondaryProductCode","secondaryVariantCode","locale","channelCode","jurisdiction","currency","promotionCode","providerToken","shippingMethod","paymentMethod"]) {
    if (typeof config[field] !== 'string' || !config[field].trim()) throw new Error('Commerce journey requires fixture ' + field);
  }
  if (!config.shippingAddress || !config.shippingAddress.country || !config.shippingAddress.line1) throw new Error('Commerce journey requires shippingAddress');
  if (config.couponCode !== undefined && (typeof config.couponCode !== 'string' || !config.couponCode.trim())) {
    throw new Error('Commerce journey couponCode must be a purchased customer coupon token');
  }
  const log = options.log || (() => {});
  const platformUrl = 'PLATFORM';
  const commerceUrl = 'COMMERCE';
  const request = context.request;
  function dataOf(body) {
    return body?.data || body?.result || body;
  }

  function requireAutomationStep(preview, step, owner, label) {
    const plan = preview?.automationPlan;
    if (!Array.isArray(plan) || !plan.some((item) => item.step === step && (!owner || item.owner === owner))) {
      throw new Error(`${label} did not expose automation step ${step}: ${JSON.stringify(preview)}`);
    }
  }

  function storefrontCustomerCredentials(scope = "PRIMARY") {
    const prefix = scope === "SECONDARY" ? "NODICS_STOREFRONT_SECONDARY_CUSTOMER" : "NODICS_STOREFRONT_CUSTOMER";
    const loginId = environment[`${prefix}_LOGIN_ID`];
    const password = environment[`${prefix}_PASSWORD`];
    if (loginId && password) {
      return {
        loginId,
        password,
        generated: false,
        register: environment[`${prefix}_REGISTER`] === "true" || environment.NODICS_STOREFRONT_CUSTOMER_REGISTER === "true",
      };
    }
    const suffix = randomUUID().slice(0, 12);
    return {
      loginId: `storefront.customer.${scope.toLowerCase()}.${suffix}@example.com`,
      password: `NodicsStorefront#${suffix}1a`,
      generated: true,
      register: true,
    };
  }

  async function ensureStorefrontCustomer(employeeHeaders, credentials, scope = "primary") {
    if (!credentials?.register) return;
    const payload = {
      code: credentials.loginId,
      loginId: credentials.loginId,
      name: {
        title: "Mx.",
        firstName: environment.NODICS_STOREFRONT_CUSTOMER_FIRST_NAME || `Storefront ${scope}`,
        lastName: environment.NODICS_STOREFRONT_CUSTOMER_LAST_NAME || "Customer",
      },
      password: { loginId: credentials.loginId, password: credentials.password, confirmPassword: credentials.password, active: true },
    };
    await request(platformUrl, "/nodics/profile/v0/customer/signup", {
        method: "POST",
        headers: employeeHeaders,
        body: JSON.stringify(payload),
    });
  }

  async function authenticateCustomer(credentials, scope = "primary") {
    const result = await request(platformUrl, "/nodics/profile/v0/customer/authenticate", {
      method: "POST",
      body: JSON.stringify({ loginId: credentials.loginId, password: credentials.password }),
    });
    const authToken = result?.authToken || result?.result?.authToken || result?.data?.authToken;
    if (!authToken) throw new Error(`Platform ${scope} customer authentication returned no token`);
    log(`storefront ${scope} customer ${credentials.loginId} authenticated`);
    return { headers: { Authorization: `Bearer ${authToken}` }, credentials };
  }

  async function validateCommerceContract(headers) {
    const contract = await request(commerceUrl, "/nodics/system/v0/contract/openapi", { headers });
    const paths = contract?.paths || contract?.openapi?.paths || {};
    const required = {
      "/nodics/product/v0/products/discovery": ['get'],
      "/nodics/product/v0/products/{productCode}": ['get'],
      "/nodics/cart/v0/carts": ['post'],
      "/nodics/cart/v0/carts/{cartCode}": ['get'],
      "/nodics/cart/v0/carts/{cartCode}/entries": ['post'],
      "/nodics/cart/v0/carts/{cartCode}/entries/{entryCode}": ['patch', 'delete'],
      "/nodics/cart/v0/carts/{cartCode}/calculations": ['post'],
      "/nodics/checkoutCore/v0/checkouts/place": ['post'],
      "/nodics/fulfillmentCore/v0/shipping/methods": ['get'],
      "/nodics/fulfillmentCore/v0/returns/methods": ['get'],
      "/nodics/order/v0/orders/{orderCode}": ['get'],
      "/nodics/order/v0/orders": ['get'],
      "/nodics/order/v0/orders/{orderCode}/lifecycle/preview": ['post'],
      "/nodics/order/v0/orders/{orderCode}/lifecycle": ['post'],
      "/nodics/shoppingList/v0/lists/{listType}": ['get'],
      "/nodics/shoppingList/v0/lists/{listType}/entries": ['post'],
      "/nodics/shoppingList/v0/lists/{listType}/entries/{entryCode}": ['delete'],
      "/nodics/promotion/v0/promotions/preview": ['post'],
      "/nodics/promotion/v0/promotions/apply": ['post'],
    };
    const effectiveCommercePaths = Object.keys(paths)
      .filter((route) => /\/(product|cart|checkoutCore|fulfillmentCore|order|shoppingList|promotion)\//.test(route))
      .sort();
    for (const [route, methods] of Object.entries(required)) {
      if (!methods.every(method => paths[route]?.[method] && typeof paths[route][method] === 'object' && !Array.isArray(paths[route][method]))) {
        throw new Error(`Commerce contract is missing ${route}; effective commerce paths: ${effectiveCommercePaths.join(", ") || "none"}`);
      }
    }
    log("product discovery, PDP, cart, checkout placement, and order lifecycle routes are effective");
  }

  async function exerciseProductDiscovery(headers) {
    const productCode = config.productCode;
    const categoryCode = config.categoryCode;
    const storeCode = config.storeCode;
    const locale = config.locale;
    const listing = dataOf(await request(commerceUrl, `/nodics/product/v0/products/discovery?storeCode=${encodeURIComponent(storeCode)}&locale=${encodeURIComponent(locale)}&categoryCode=${encodeURIComponent(categoryCode)}&pageSize=4`, { headers }));
    if (!Array.isArray(listing?.products)) throw new Error(`Product discovery returned unexpected response: ${JSON.stringify(listing)}`);
    if (listing.discovery?.source !== "SEARCH_INDEX") throw new Error(`Product discovery is not search-index backed: ${JSON.stringify(listing.discovery)}`);
    const detail = dataOf(await request(commerceUrl, `/nodics/product/v0/products/${encodeURIComponent(productCode)}?storeCode=${encodeURIComponent(storeCode)}&locale=${encodeURIComponent(locale)}`, { headers }));
    if (detail?.product?.productCode !== productCode) throw new Error(`Product detail returned unexpected response: ${JSON.stringify(detail)}`);
    const serializedListing = JSON.stringify(listing);
    const serializedDetail = JSON.stringify(detail);
    for (const forbidden of ["priceRowCode", "warehouseCode", "supplierCost", "internalOnly"]) {
      if (serializedListing.includes(forbidden) || serializedDetail.includes(forbidden)) {
        throw new Error(`Customer Product discovery/PDP leaked backend-only field ${forbidden}`);
      }
    }
    await request(commerceUrl, "/nodics/fulfillmentCore/v0/shipping/methods", { headers });
    await request(commerceUrl, "/nodics/fulfillmentCore/v0/returns/methods", { headers });
    log("search-backed product discovery, PDP, shipping methods, and return methods are reachable");
  }

  async function exerciseCustomerCart(headers) {
    const journeyId = randomUUID();
    const commonHeaders = { ...headers, "x-correlation-id": `commerce-journey-${journeyId}` };
    const primaryProductCode = config.productCode;
    const primaryVariantCode = config.variantCode;
    const secondaryProductCode = config.secondaryProductCode;
    const secondaryVariantCode = config.secondaryVariantCode;
    const body = {
      cartCode: `storefront_cart_${journeyId}`,
      storeCode: config.storeCode,
      channelCode: config.channelCode,
      locale: config.locale,
      jurisdiction: config.jurisdiction,
      currency: config.currency,
    };
    const created = dataOf(await request(commerceUrl, "/nodics/cart/v0/carts", {
      method: "POST",
      headers: commonHeaders,
      body: JSON.stringify(body),
    }));
    if (created?.cart?.code !== body.cartCode || created.cart.storeCode !== config.storeCode) {
      throw new Error(`Customer cart creation returned unexpected response: ${JSON.stringify(created)}`);
    }
    const read = dataOf(await request(commerceUrl, `/nodics/cart/v0/carts/${encodeURIComponent(body.cartCode)}`, {
      headers: commonHeaders,
    }));
    if (read?.cart?.code !== body.cartCode || read.cart.storeCode !== config.storeCode || read.cart.currency !== config.currency) {
      throw new Error(`Customer cart read returned unexpected response: ${JSON.stringify(read)}`);
    }
    const added = dataOf(await request(commerceUrl, `/nodics/cart/v0/carts/${encodeURIComponent(body.cartCode)}/entries`, {
      method: "POST",
      headers: commonHeaders,
      body: JSON.stringify({ productCode: primaryProductCode, variantCode: primaryVariantCode, quantity: "1" }),
    }));
    const primaryEntry = added?.entries?.find((entry) => entry.productCode === primaryProductCode);
    if (!primaryEntry?.code) throw new Error(`Customer cart add primary item returned unexpected response: ${JSON.stringify(added)}`);
    const secondaryAdded = dataOf(await request(commerceUrl, `/nodics/cart/v0/carts/${encodeURIComponent(body.cartCode)}/entries`, {
      method: "POST",
      headers: commonHeaders,
      body: JSON.stringify({ productCode: secondaryProductCode, variantCode: secondaryVariantCode, quantity: "1" }),
    }));
    const secondaryEntry = secondaryAdded?.entries?.find((entry) => entry.productCode === secondaryProductCode);
    if (!secondaryEntry?.code) throw new Error(`Customer cart add secondary item returned unexpected response: ${JSON.stringify(secondaryAdded)}`);
    const updated = dataOf(await request(commerceUrl, `/nodics/cart/v0/carts/${encodeURIComponent(body.cartCode)}/entries/${encodeURIComponent(primaryEntry.code)}`, {
      method: "PATCH",
      headers: commonHeaders,
      body: JSON.stringify({ quantity: "2", expectedRevision: String(secondaryAdded?.cart?.revision || added?.cart?.revision || read.cart.revision || "0") }),
    }));
    const removed = dataOf(await request(commerceUrl, `/nodics/cart/v0/carts/${encodeURIComponent(body.cartCode)}/entries/${encodeURIComponent(secondaryEntry.code)}`, {
      method: "DELETE",
      headers: commonHeaders,
      body: JSON.stringify({ expectedRevision: String(updated?.cart?.revision || secondaryAdded?.cart?.revision || "0") }),
    }));
    const revision = String(removed?.cart?.revision || updated?.cart?.revision || "0");
    const calculated = dataOf(await request(commerceUrl, `/nodics/cart/v0/carts/${encodeURIComponent(body.cartCode)}/calculations`, {
      method: "POST",
      headers: commonHeaders,
      body: JSON.stringify({ expectedRevision: revision, calculationCode: `calc-${body.cartCode}`, couponCode: config.couponCode }),
    }));
    const serializedCart = JSON.stringify(calculated);
    for (const forbidden of ["priceRowCode", "warehouseCode", "supplierCost", "internalOnly"]) {
      if (serializedCart.includes(forbidden)) throw new Error(`Customer cart leaked backend-only field ${forbidden}`);
    }
    if (calculated?.cartCode !== body.cartCode || calculated.currency !== read.cart.currency ||
        typeof calculated.subtotal !== 'string' || !/^\d+(?:\.\d+)?$/.test(calculated.subtotal) ||
        !Array.isArray(calculated.entries) || !calculated.entries.length ||
        calculated.entries.some(entry => typeof entry.productCode !== 'string' || !entry.productCode)) {
      throw new Error('Customer cart calculation returned no owned cart pricing context');
    }
    log(`customer cart add/update/remove/calculate smoke passed for ${body.cartCode}`);
    return {
      headers: commonHeaders,
      cartCode: body.cartCode,
      revision: String(calculated.cartRevision ?? calculated.revision ?? revision),
      calculationCode: `calc-${body.cartCode}`,
      storeCode: read.cart.storeCode,
      currency: calculated.currency,
      subtotal: calculated.subtotal,
      productCodes: calculated.entries.map(entry => entry.productCode),
      discount: calculated.decisions?.discount,
      productCode: primaryProductCode,
      variantCode: primaryVariantCode,
    };
  }

  async function exerciseShoppingLists(headers) {
    const productCode = config.productCode;
    const variantCode = config.variantCode;
    const storeCode = config.storeCode;
    const locale = config.locale;
    const touched = [];
    for (const listType of ["WISHLIST", "COMPARE", "SAVE_FOR_LATER"]) {
      const added = dataOf(await request(commerceUrl, `/nodics/shoppingList/v0/lists/${encodeURIComponent(listType)}/entries`, {
        method: "POST",
        headers,
        body: JSON.stringify({ productCode, variantCode, storeCode, locale }),
      }));
      const entry = added?.entries?.find((item) => item.productCode === productCode && item.variantCode === variantCode);
      if (!entry?.code) throw new Error(`Shopping list ${listType} add returned unexpected response: ${JSON.stringify(added)}`);
      const read = dataOf(await request(commerceUrl, `/nodics/shoppingList/v0/lists/${encodeURIComponent(listType)}?storeCode=${encodeURIComponent(storeCode)}&locale=${encodeURIComponent(locale)}`, { headers }));
      if (!read?.entries?.some((item) => item.code === entry.code)) throw new Error(`Shopping list ${listType} read did not include added entry: ${JSON.stringify(read)}`);
      touched.push(`${listType}:${entry.code}`);
    }
    log(`shopping-list smoke passed for ${touched.length} entries`);
  }

  function requirePromotionSelection(result, label) {
    const selected = result?.selected?.find(item => item.code === config.promotionCode);
    if (!selected) throw new Error(`${label} did not select configured campaign ${config.promotionCode}`);
    if (selected.versionId !== undefined && (!Number.isSafeInteger(selected.versionId) || selected.versionId < 0)) {
      throw new Error(`${label} returned invalid campaign versionId`);
    }
    return selected;
  }

  function requirePromotionDecision(decision, cartSmoke, selected, label) {
    if (decision?.promotionCode !== config.promotionCode || decision.targetType !== 'CART' ||
        decision.targetCode !== cartSmoke.cartCode ||
        (selected.revision !== undefined && decision.ruleVersion !== String(selected.revision)) ||
        (decision.versionId !== undefined && selected.versionId !== undefined && decision.versionId !== selected.versionId)) {
      throw new Error(`${label} did not prove configured campaign and cart/version binding`);
    }
  }

  async function exerciseCustomerPromotions(cartSmoke) {
    const payload = {
      cartCode: cartSmoke.cartCode,
      storeCode: cartSmoke.storeCode,
      currency: cartSmoke.currency,
      subtotal: cartSmoke.subtotal,
      productCodes: cartSmoke.productCodes,
      couponCode: config.couponCode,
    };
    const preview = dataOf(await request(commerceUrl, "/nodics/promotion/v0/promotions/preview", {
      method: "POST",
      headers: cartSmoke.headers,
      body: JSON.stringify(payload),
    }));
    const selected = requirePromotionSelection(preview, 'Promotion preview');
    if (preview.cartCode !== cartSmoke.cartCode || preview.redemptionStateMutation !== "NONE") {
      throw new Error('Promotion preview did not prove non-mutating owned cart context');
    }
    requirePromotionDecision(cartSmoke.discount, cartSmoke, selected, 'Cart promotion quote');
    // Checkout alone commits after payment, avoiding duplicate campaign budget/coupon consumption.
    return selected;
  }

  async function expectReadRejected(headers, path, label) {
    try {
      await request(commerceUrl, path, { headers });
    } catch (error) {
      if (String(error.message || error).match(/HTTP (403|404)/)) {
        log(`${label} correctly rejected for non-owner`);
        return;
      }
      throw error;
    }
    throw new Error(`${label} unexpectedly allowed non-owner access`);
  }

  async function exerciseCustomerCheckout(cartSmoke, customer) {
    const orderCode = `storefront_order_${randomUUID()}`;
    const placed = dataOf(await request(commerceUrl, "/nodics/checkoutCore/v0/checkouts/place", {
      method: "POST",
      headers: { ...cartSmoke.headers, "idempotency-key": `${orderCode}:place` },
      body: JSON.stringify({
        cartCode: cartSmoke.cartCode,
        orderCode,
        expectedCartRevision: cartSmoke.revision,
        calculationCode: cartSmoke.calculationCode,
        couponCode: config.couponCode,
        providerToken: config.providerToken,
        customer: { email: customer.credentials.loginId, firstName: "Storefront", lastName: "Customer" },
        shippingAddress: config.shippingAddress,
        shippingMethod: config.shippingMethod,
        paymentMethod: config.paymentMethod,
      }),
    }));
    if (placed?.status !== 'COMPLETED' ||
        !placed.evidence?.completed?.includes('PROMOTION_COMMITTED') ||
        placed.evidence.promotionCode !== config.promotionCode ||
        !placed.evidence.promotionRedemptionCode || (config.couponCode && !placed.evidence.couponCode)) {
      throw new Error('Checkout promotion apply did not commit configured campaign/redemption or required coupon');
    }
    const placedOrderCode = placed?.orderCode || placed?.code || placed?.evidence?.orderCode || orderCode;
    const order = dataOf(await request(commerceUrl, `/nodics/order/v0/orders/${encodeURIComponent(placedOrderCode)}`, {
      headers: cartSmoke.headers,
    }));
    if (order?.order?.code !== placedOrderCode) {
      throw new Error(`Customer order read returned unexpected response: ${JSON.stringify(order)}`);
    }
    if (order.order.cartCode !== cartSmoke.cartCode || order.order.promotionCode !== config.promotionCode ||
        (config.couponCode && order.order.couponCode !== placed.evidence.couponCode)) {
      throw new Error('Customer order did not retain configured campaign/cart or required coupon evidence');
    }
    log(`customer promotion preview/checkout apply smoke passed for ${config.promotionCode}`);
    const cancellationPayload = {
      code: `${placedOrderCode}:cancellation`,
      requestType: "CANCELLATION",
      reasonCode: "CUSTOMER_CHANGED_MIND",
      policyVersion: "1",
      evidence: { source: "commerce-journey-acceptance", quantity: "1", productCodes: [cartSmoke.productCode], refundMethod: "ORIGINAL_PAYMENT" },
    };
    const cancellationPreview = dataOf(await request(commerceUrl, `/nodics/order/v0/orders/${encodeURIComponent(placedOrderCode)}/lifecycle/preview`, {
      method: "POST",
      headers: cartSmoke.headers,
      body: JSON.stringify(cancellationPayload),
    }));
    requireAutomationStep(cancellationPreview, "reservation-release", "inventory", "Customer cancellation preview");
    const lifecycle = dataOf(await request(commerceUrl, `/nodics/order/v0/orders/${encodeURIComponent(placedOrderCode)}/lifecycle`, {
      method: "POST",
      headers: { ...cartSmoke.headers, "idempotency-key": `${placedOrderCode}:cancellation` },
      body: JSON.stringify(cancellationPayload),
    }));
    if (lifecycle?.status !== "SUBMITTED") {
      throw new Error(`Customer lifecycle create returned unexpected response: ${JSON.stringify(lifecycle)}`);
    }
    const returnPreview = dataOf(await request(commerceUrl, `/nodics/order/v0/orders/${encodeURIComponent(placedOrderCode)}/lifecycle/preview`, {
      method: "POST",
      headers: cartSmoke.headers,
      body: JSON.stringify({
        code: `${placedOrderCode}:return`,
        requestType: "RETURN",
        reasonCode: "DAMAGED_ITEM",
        policyVersion: "1",
        evidence: { source: "commerce-journey-acceptance", quantity: "1", productCodes: [cartSmoke.productCode], returnMethod: "DROP_OFF", refundMethod: "ORIGINAL_PAYMENT" },
      }),
    }));
    if (returnPreview?.eligible === false || !returnPreview?.rmaCode && !Array.isArray(returnPreview?.returnMethods)) {
      throw new Error(`Customer return preview returned unexpected response: ${JSON.stringify(returnPreview)}`);
    }
    requireAutomationStep(returnPreview, "return-logistics", "fulfillment", "Customer return preview");
    requireAutomationStep(returnPreview, "inspection-disposition", "fulfillment+inventory", "Customer return preview");
    requireAutomationStep(returnPreview, "refund-reconciliation", "payment", "Customer return preview");
    const returnLifecycle = dataOf(await request(commerceUrl, `/nodics/order/v0/orders/${encodeURIComponent(placedOrderCode)}/lifecycle`, {
      method: "POST",
      headers: { ...cartSmoke.headers, "idempotency-key": `${placedOrderCode}:return` },
      body: JSON.stringify({
        code: `${placedOrderCode}:return`,
        requestType: "RETURN",
        reasonCode: "DAMAGED_ITEM",
        policyVersion: "1",
        evidence: { source: "commerce-journey-acceptance", quantity: "1", productCodes: [cartSmoke.productCode], returnMethod: "DROP_OFF", refundMethod: "ORIGINAL_PAYMENT" },
      }),
    }));
    if (returnLifecycle?.status !== "SUBMITTED") {
      throw new Error(`Customer return lifecycle create returned unexpected response: ${JSON.stringify(returnLifecycle)}`);
    }
    const refundPayload = {
      code: `${placedOrderCode}:refund`,
      requestType: "REFUND",
      reasonCode: "REFUND_STATUS_REQUESTED",
      policyVersion: "1",
      evidence: { source: "commerce-journey-acceptance", quantity: "1", productCodes: [cartSmoke.productCode], refundMethod: "ORIGINAL_PAYMENT" },
    };
    const refundPreview = dataOf(await request(commerceUrl, `/nodics/order/v0/orders/${encodeURIComponent(placedOrderCode)}/lifecycle/preview`, {
      method: "POST",
      headers: cartSmoke.headers,
      body: JSON.stringify(refundPayload),
    }));
    if (refundPreview?.eligible === false || !refundPreview?.refundPreview && !Array.isArray(refundPreview?.refundMethods)) {
      throw new Error(`Customer refund preview returned unexpected response: ${JSON.stringify(refundPreview)}`);
    }
    requireAutomationStep(refundPreview, "refund-reconciliation", "payment", "Customer refund preview");
    const refundLifecycle = dataOf(await request(commerceUrl, `/nodics/order/v0/orders/${encodeURIComponent(placedOrderCode)}/lifecycle`, {
      method: "POST",
      headers: { ...cartSmoke.headers, "idempotency-key": `${placedOrderCode}:refund` },
      body: JSON.stringify(refundPayload),
    }));
    if (refundLifecycle?.status !== "SUBMITTED") {
      throw new Error(`Customer refund lifecycle create returned unexpected response: ${JSON.stringify(refundLifecycle)}`);
    }
    const exchangePreview = dataOf(await request(commerceUrl, `/nodics/order/v0/orders/${encodeURIComponent(placedOrderCode)}/lifecycle/preview`, {
      method: "POST",
      headers: cartSmoke.headers,
      body: JSON.stringify({
        code: `${placedOrderCode}:exchange`,
        requestType: "EXCHANGE",
        reasonCode: "SIZE_EXCHANGE",
        policyVersion: "1",
        evidence: { source: "commerce-journey-acceptance", quantity: "1", productCodes: [cartSmoke.productCode], returnMethod: "STORE_RETURN", replacementProductCode: cartSmoke.productCode },
      }),
    }));
    requireAutomationStep(exchangePreview, "replacement-reservation", "inventory", "Customer exchange preview");
    requireAutomationStep(exchangePreview, "exchange-shipment", "fulfillment", "Customer exchange preview");
    const appealPreview = dataOf(await request(commerceUrl, `/nodics/order/v0/orders/${encodeURIComponent(placedOrderCode)}/lifecycle/preview`, {
      method: "POST",
      headers: cartSmoke.headers,
      body: JSON.stringify({
        code: `${placedOrderCode}:appeal`,
        requestType: "APPEAL",
        reasonCode: "RETURN_REJECTED",
        policyVersion: "1",
        appealReferenceCode: `${placedOrderCode}:return`,
        appealReason: "Acceptance appeal smoke",
      }),
    }));
    requireAutomationStep(appealPreview, "appeal-sla-review", "workflow+order", "Customer appeal preview");
    log(`customer checkout/order/cancellation/return/refund/exchange/appeal smoke passed for ${placedOrderCode}`);
    return { orderCode: placedOrderCode, cartCode: cartSmoke.cartCode };
  }


    const primaryCredentials = storefrontCustomerCredentials("PRIMARY");
    if (config.couponCode && primaryCredentials.generated) {
      throw new Error('Purchased coupon acceptance requires existing primary customer login/password fixtures');
    }
    const employeeHeaders = await context.authenticate();
    await validateCommerceContract(employeeHeaders);
    await ensureStorefrontCustomer(employeeHeaders, primaryCredentials, "primary");
    const primaryCustomer = await authenticateCustomer(primaryCredentials, "primary");
    await exerciseProductDiscovery(primaryCustomer.headers);
    await exerciseShoppingLists(primaryCustomer.headers);
    const cartSmoke = await exerciseCustomerCart(primaryCustomer.headers);
    await exerciseCustomerPromotions(cartSmoke);
    const checkoutSmoke = await exerciseCustomerCheckout(cartSmoke, primaryCustomer);
    const secondaryCredentials = storefrontCustomerCredentials("SECONDARY");
    await ensureStorefrontCustomer(employeeHeaders, secondaryCredentials, "secondary");
    const secondaryCustomer = await authenticateCustomer(secondaryCredentials, "secondary");
    await expectReadRejected(secondaryCustomer.headers, `/nodics/order/v0/orders/${encodeURIComponent(checkoutSmoke.orderCode)}`, "customer order read");
    await expectReadRejected(secondaryCustomer.headers, `/nodics/cart/v0/carts/${encodeURIComponent(checkoutSmoke.cartCode)}`, "customer cart read");

  return { state: 'PASSED', orderCode: checkoutSmoke.orderCode, cartCode: checkoutSmoke.cartCode };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--help')) console.log('acceptance:commerce-journey --execute; requires tooling.acceptance.commerceJourney fixtures and running PLATFORM/COMMERCE roles. Creates customers, carts, orders and lifecycle requests.');
  else runCommerceJourneyAcceptance({ execute: process.argv.includes('--execute'), log: console.log }).then(result => console.log(JSON.stringify(result))).catch(error => { console.error(error.message); process.exitCode = 1; });
}
