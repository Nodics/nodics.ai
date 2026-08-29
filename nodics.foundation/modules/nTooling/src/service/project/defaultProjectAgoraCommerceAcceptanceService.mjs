#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const projectRoot = process.env.NODICS_PROJECT_ROOT || process.cwd();
const platformUrl = process.env.NODICS_PLATFORM_URL || "http://127.0.0.1:4300";
const commerceUrl = process.env.NODICS_COMMERCE_URL || "http://127.0.0.1:4350";
const axisOrigin = process.env.AXIS_ORIGIN || "http://127.0.0.1:3100";
const managed = [];

function log(message) {
  console.log(`[agora-commerce-acceptance] ${message}`);
}

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : undefined;
  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status}: ${text}`);
  }
  return body;
}

function dataOf(body) {
  return body?.data || body?.result || body;
}

function requireAutomationStep(preview, step, owner, label) {
  const plan = preview?.automationPlan;
  if (!Array.isArray(plan) || !plan.some((item) => item.step === step && (!owner || item.owner === owner))) {
    throw new Error(`${label} did not expose automation step ${step}: ${JSON.stringify(preview)}`);
  }
}

async function listening(port) {
  return new Promise((resolve) => {
    const child = spawn("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN"], {
      stdio: ["ignore", "ignore", "ignore"],
    });
    child.on("close", (code) => resolve(code === 0));
    child.on("error", () => resolve(false));
  });
}

async function waitReady(baseUrl, label) {
  const deadline = Date.now() + Number(process.env.NODICS_ACCEPTANCE_READY_TIMEOUT_MS || 90000);
  let lastError;
  while (Date.now() < deadline) {
    try {
      const health = await request(baseUrl, "/nodics/system/v0/health/ready");
      if (health?.status === "UP" || health?.data?.status === "UP" || health?.ready === true || health?.success === true) {
        log(`${label} ready`);
        return;
      }
    } catch (error) {
      lastError = error;
    }
    await delay(1000);
  }
  throw new Error(`${label} did not become ready: ${lastError?.message || "unknown readiness failure"}`);
}

async function ensureRuntime(label, port, script, baseUrl) {
  if (!(await listening(port))) {
    const child = spawn("npm", ["run", script], {
      cwd: projectRoot,
      env: process.env,
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.exitPromise = new Promise((resolve) => child.once("close", resolve));
    child.stdout.on("data", (chunk) => process.stdout.write(`[${label}] ${chunk}`));
    child.stderr.on("data", (chunk) => process.stderr.write(`[${label}] ${chunk}`));
    managed.push(child);
  }
  await waitReady(baseUrl, label);
}

function portOf(baseUrl, fallback) {
  try {
    const url = new URL(baseUrl);
    return Number(url.port || (url.protocol === "https:" ? 443 : 80));
  } catch {
    return fallback;
  }
}

async function authenticateEmployee() {
  const suppliedToken = process.env.AXIS_AUTH_TOKEN || process.env.NODICS_AUTH_TOKEN;
  if (suppliedToken) return { Authorization: `Bearer ${suppliedToken}` };
  const credentials = {
    loginId: process.env.AXIS_LOGIN_ID || "admin",
    password: process.env.AXIS_PASSWORD || "adminPassword",
  };
  const headers = { Origin: axisOrigin, "x-enterprise-code": process.env.NODICS_ENTERPRISE_CODE || "default" };
  let lastError;
  for (const path of ["/nodics/profile/v0/employee/browser/authenticate", "/nodics/profile/v0/employee/authenticate"]) {
    try {
      const result = await request(platformUrl, path, {
        method: "POST",
        headers,
        body: JSON.stringify(credentials),
      });
      const authToken = result?.authToken || result?.result?.authToken || result?.data?.authToken;
      if (authToken) return { Authorization: `Bearer ${authToken}` };
      lastError = new Error(`${path} returned no employee auth token`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Platform employee authentication returned no token");
}

function storefrontCustomerCredentials(scope = "PRIMARY") {
  const prefix = scope === "SECONDARY" ? "NODICS_STOREFRONT_SECONDARY_CUSTOMER" : "NODICS_STOREFRONT_CUSTOMER";
  const loginId = process.env[`${prefix}_LOGIN_ID`];
  const password = process.env[`${prefix}_PASSWORD`];
  if (loginId && password) {
    return {
      loginId,
      password,
      generated: false,
      register: process.env[`${prefix}_REGISTER`] === "true" || process.env.NODICS_STOREFRONT_CUSTOMER_REGISTER === "true",
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
      firstName: process.env.NODICS_STOREFRONT_CUSTOMER_FIRST_NAME || `Storefront ${scope}`,
      lastName: process.env.NODICS_STOREFRONT_CUSTOMER_LAST_NAME || "Customer",
    },
    password: { loginId: credentials.loginId, password: credentials.password, confirmPassword: credentials.password, active: true },
  };
  try {
    await request(platformUrl, "/nodics/profile/v0/customer/signup", {
      method: "POST",
      headers: employeeHeaders,
      body: JSON.stringify(payload),
    });
    log(`storefront ${scope} customer ${credentials.loginId} registered for local acceptance`);
  } catch (error) {
    if (!String(error.message || error).match(/exist|duplicate|already/i) && credentials.generated) throw error;
    log(`storefront ${scope} customer ${credentials.loginId} already exists`);
  }
}

async function authenticateCustomer(credentials, scope = "primary") {
  const result = await request(platformUrl, "/nodics/profile/v0/customer/authenticate", {
    method: "POST",
    headers: { "x-enterprise-code": process.env.NODICS_ENTERPRISE_CODE || "default" },
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
  const required = [
    "/nodics/product/v0/customer/products/discovery",
    "/nodics/product/v0/customer/products/{productCode}",
    "/nodics/cart/v0/customer/carts",
    "/nodics/cart/v0/customer/carts/{cartCode}",
    "/nodics/cart/v0/customer/carts/{cartCode}/entries",
    "/nodics/cart/v0/customer/carts/{cartCode}/entries/{entryCode}",
    "/nodics/cart/v0/customer/carts/{cartCode}/calculations",
    "/nodics/checkoutCore/v0/customer/checkouts/place",
    "/nodics/fulfillmentCore/v0/customer/shipping/methods",
    "/nodics/fulfillmentCore/v0/customer/returns/methods",
    "/nodics/order/v0/customer/orders/{orderCode}",
    "/nodics/order/v0/customer/orders",
    "/nodics/order/v0/customer/orders/{orderCode}/lifecycle/preview",
    "/nodics/order/v0/customer/orders/{orderCode}/lifecycle",
    "/nodics/customerList/v0/customer/lists/{listType}",
    "/nodics/customerList/v0/customer/lists/{listType}/entries",
    "/nodics/customerList/v0/customer/lists/{listType}/entries/{entryCode}",
    "/nodics/promotion/v0/customer/promotions/preview",
    "/nodics/promotion/v0/customer/promotions/apply",
    "/nodics/promotion/v0/backoffice/promotions/drafts",
  ];
  const effectiveCommercePaths = Object.keys(paths)
    .filter((route) => /\/(product|cart|checkoutCore|fulfillmentCore|order|customerList|promotion)\//.test(route))
    .sort();
  for (const route of required) {
    if (!paths[route]) {
      throw new Error(`Agora Commerce contract is missing ${route}; effective commerce paths: ${effectiveCommercePaths.join(", ") || "none"}`);
    }
  }
  log("product discovery, PDP, cart, checkout placement, and order lifecycle routes are effective");
}

async function exerciseProductDiscovery(headers) {
  const productCode = process.env.NODICS_STOREFRONT_PRODUCT_CODE || "agoraLinenWrapDress";
  const categoryCode = process.env.NODICS_STOREFRONT_CATEGORY_CODE || "agoraWomen";
  const storeCode = process.env.NODICS_STOREFRONT_STORE_CODE || "agoraMainStore";
  const locale = process.env.NODICS_STOREFRONT_LOCALE || "en";
  const listing = dataOf(await request(commerceUrl, `/nodics/product/v0/customer/products/discovery?storeCode=${encodeURIComponent(storeCode)}&locale=${encodeURIComponent(locale)}&categoryCode=${encodeURIComponent(categoryCode)}&pageSize=4`, { headers }));
  if (!Array.isArray(listing?.products)) throw new Error(`Product discovery returned unexpected response: ${JSON.stringify(listing)}`);
  if (listing.discovery && listing.discovery.source !== "SEARCH_INDEX") throw new Error(`Product discovery is not search-index backed: ${JSON.stringify(listing.discovery)}`);
  const detail = dataOf(await request(commerceUrl, `/nodics/product/v0/customer/products/${encodeURIComponent(productCode)}?storeCode=${encodeURIComponent(storeCode)}&locale=${encodeURIComponent(locale)}`, { headers }));
  if (detail?.product?.productCode !== productCode) throw new Error(`Product detail returned unexpected response: ${JSON.stringify(detail)}`);
  const serializedListing = JSON.stringify(listing);
  const serializedDetail = JSON.stringify(detail);
  for (const forbidden of ["priceRowCode", "warehouseCode", "supplierCost", "internalOnly"]) {
    if (serializedListing.includes(forbidden) || serializedDetail.includes(forbidden)) {
      throw new Error(`Customer Product discovery/PDP leaked backend-only field ${forbidden}`);
    }
  }
  await request(commerceUrl, "/nodics/fulfillmentCore/v0/customer/shipping/methods", { headers });
  await request(commerceUrl, "/nodics/fulfillmentCore/v0/customer/returns/methods", { headers });
  log("search-backed product discovery, PDP, shipping methods, and return methods are reachable");
}

async function exerciseCustomerCart(headers) {
  const journeyId = randomUUID();
  const commonHeaders = { ...headers, "x-correlation-id": `agora-commerce-${journeyId}` };
  const primaryProductCode = process.env.NODICS_STOREFRONT_PRODUCT_CODE || "agoraLinenWrapDress";
  const primaryVariantCode = process.env.NODICS_STOREFRONT_VARIANT_CODE || "agoraLinenWrapDressIvoryS";
  const secondaryProductCode = process.env.NODICS_STOREFRONT_SECONDARY_PRODUCT_CODE || "agoraOxfordShirt";
  const secondaryVariantCode = process.env.NODICS_STOREFRONT_SECONDARY_VARIANT_CODE || "agoraOxfordShirtIvoryM";
  const body = {
    cartCode: `storefront_cart_${journeyId}`,
    storeCode: process.env.NODICS_STOREFRONT_STORE_CODE || "agoraMainStore",
    channelCode: process.env.NODICS_STOREFRONT_CHANNEL_CODE || "web",
    locale: process.env.NODICS_STOREFRONT_LOCALE || "en",
    jurisdiction: process.env.NODICS_STOREFRONT_JURISDICTION || "AE",
    currency: process.env.NODICS_STOREFRONT_CURRENCY || "USD",
  };
  const created = dataOf(await request(commerceUrl, "/nodics/cart/v0/customer/carts", {
    method: "POST",
    headers: commonHeaders,
    body: JSON.stringify(body),
  }));
  if (created?.cart?.code !== body.cartCode) {
    throw new Error(`Customer cart creation returned unexpected response: ${JSON.stringify(created)}`);
  }
  const read = dataOf(await request(commerceUrl, `/nodics/cart/v0/customer/carts/${encodeURIComponent(body.cartCode)}`, {
    headers: commonHeaders,
  }));
  if (read?.cart?.code !== body.cartCode) {
    throw new Error(`Customer cart read returned unexpected response: ${JSON.stringify(read)}`);
  }
  const added = dataOf(await request(commerceUrl, `/nodics/cart/v0/customer/carts/${encodeURIComponent(body.cartCode)}/entries`, {
    method: "POST",
    headers: commonHeaders,
    body: JSON.stringify({ productCode: primaryProductCode, variantCode: primaryVariantCode, quantity: "1" }),
  }));
  const primaryEntry = added?.entries?.find((entry) => entry.productCode === primaryProductCode);
  if (!primaryEntry?.code) throw new Error(`Customer cart add primary item returned unexpected response: ${JSON.stringify(added)}`);
  const secondaryAdded = dataOf(await request(commerceUrl, `/nodics/cart/v0/customer/carts/${encodeURIComponent(body.cartCode)}/entries`, {
    method: "POST",
    headers: commonHeaders,
    body: JSON.stringify({ productCode: secondaryProductCode, variantCode: secondaryVariantCode, quantity: "1" }),
  }));
  const secondaryEntry = secondaryAdded?.entries?.find((entry) => entry.productCode === secondaryProductCode);
  if (!secondaryEntry?.code) throw new Error(`Customer cart add secondary item returned unexpected response: ${JSON.stringify(secondaryAdded)}`);
  const updated = dataOf(await request(commerceUrl, `/nodics/cart/v0/customer/carts/${encodeURIComponent(body.cartCode)}/entries/${encodeURIComponent(primaryEntry.code)}`, {
    method: "PATCH",
    headers: commonHeaders,
    body: JSON.stringify({ quantity: "2", expectedRevision: String(secondaryAdded?.cart?.revision || added?.cart?.revision || read.cart.revision || "0") }),
  }));
  const removed = dataOf(await request(commerceUrl, `/nodics/cart/v0/customer/carts/${encodeURIComponent(body.cartCode)}/entries/${encodeURIComponent(secondaryEntry.code)}`, {
    method: "DELETE",
    headers: commonHeaders,
    body: JSON.stringify({ expectedRevision: String(updated?.cart?.revision || secondaryAdded?.cart?.revision || "0") }),
  }));
  const revision = String(removed?.cart?.revision || updated?.cart?.revision || "0");
  const calculated = dataOf(await request(commerceUrl, `/nodics/cart/v0/customer/carts/${encodeURIComponent(body.cartCode)}/calculations`, {
    method: "POST",
    headers: commonHeaders,
    body: JSON.stringify({ expectedRevision: revision, calculationCode: `calc-${body.cartCode}` }),
  }));
  const serializedCart = JSON.stringify(calculated);
  for (const forbidden of ["priceRowCode", "warehouseCode", "supplierCost", "internalOnly"]) {
    if (serializedCart.includes(forbidden)) throw new Error(`Customer cart leaked backend-only field ${forbidden}`);
  }
  log(`customer cart add/update/remove/calculate smoke passed for ${body.cartCode}`);
  return {
    headers: commonHeaders,
    cartCode: body.cartCode,
    revision: String(calculated?.cart?.revision || revision),
    calculationCode: `calc-${body.cartCode}`,
    productCode: primaryProductCode,
    variantCode: primaryVariantCode,
  };
}

async function exerciseCustomerLists(headers) {
  const productCode = process.env.NODICS_STOREFRONT_PRODUCT_CODE || "agoraLinenWrapDress";
  const variantCode = process.env.NODICS_STOREFRONT_VARIANT_CODE || "agoraLinenWrapDressIvoryS";
  const storeCode = process.env.NODICS_STOREFRONT_STORE_CODE || "agoraMainStore";
  const locale = process.env.NODICS_STOREFRONT_LOCALE || "en";
  const touched = [];
  for (const listType of ["WISHLIST", "COMPARE"]) {
    const added = dataOf(await request(commerceUrl, `/nodics/customerList/v0/customer/lists/${encodeURIComponent(listType)}/entries`, {
      method: "POST",
      headers,
      body: JSON.stringify({ productCode, variantCode, storeCode, locale }),
    }));
    const entry = added?.entries?.find((item) => item.productCode === productCode && item.variantCode === variantCode);
    if (!entry?.code) throw new Error(`Customer ${listType} add returned unexpected response: ${JSON.stringify(added)}`);
    const read = dataOf(await request(commerceUrl, `/nodics/customerList/v0/customer/lists/${encodeURIComponent(listType)}?storeCode=${encodeURIComponent(storeCode)}&locale=${encodeURIComponent(locale)}`, { headers }));
    if (!read?.entries?.some((item) => item.code === entry.code)) throw new Error(`Customer ${listType} read did not include added entry: ${JSON.stringify(read)}`);
    touched.push(`${listType}:${entry.code}`);
  }
  log(`customer wishlist and compare smoke passed for ${touched.length} entries`);
}

async function ensureAcceptancePromotion(employeeHeaders) {
  const code = process.env.NODICS_STOREFRONT_PROMOTION_CODE || `agoraAcceptanceWelcome10`;
  const promotion = dataOf(await request(commerceUrl, "/nodics/promotion/v0/backoffice/promotions/drafts", {
    method: "PUT",
    headers: employeeHeaders,
    body: JSON.stringify({
      code,
      name: "Agora Acceptance Welcome 10",
      status: "ACTIVE",
      priority: 50,
      conditions: { minimumSubtotal: "100.00" },
      actions: { discountAmount: "10.00", reasonCode: "ACCEPTANCE10" },
      revision: 0,
    }),
  }));
  const saved = promotion?.promotion || {};
  const updatedExisting = saved.acknowledged === true && Number(saved.matchedCount || 0) > 0;
  if (!updatedExisting && (saved.code !== code || saved.status !== "ACTIVE")) {
    throw new Error(`Promotion draft save returned unexpected response: ${JSON.stringify(promotion)}`);
  }
  return { code };
}

async function exerciseCustomerPromotions(headers, promotion) {
  const cartCode = `promotion_cart_${randomUUID()}`;
  const payload = {
    cartCode,
    currency: process.env.NODICS_STOREFRONT_CURRENCY || "USD",
    subtotal: "150.00",
    entries: [{
      productCode: process.env.NODICS_STOREFRONT_PRODUCT_CODE || "agoraLinenWrapDress",
      quantity: 1,
      totalPrice: "150.00",
    }],
  };
  const preview = dataOf(await request(commerceUrl, "/nodics/promotion/v0/customer/promotions/preview", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  }));
  if (!preview?.selected?.some((item) => item.code === promotion.code) || preview.redemptionStateMutation !== "NONE") {
    throw new Error(`Promotion preview returned unexpected response: ${JSON.stringify(preview)}`);
  }
  const applied = dataOf(await request(commerceUrl, "/nodics/promotion/v0/customer/promotions/apply", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  }));
  if (!applied?.applied || applied.redemptionStateMutation !== "COMMITTED" || !applied?.redemption?.code) {
    throw new Error(`Promotion apply returned unexpected response: ${JSON.stringify(applied)}`);
  }
  log(`customer promotion preview/apply smoke passed for ${promotion.code}`);
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
  const placed = dataOf(await request(commerceUrl, "/nodics/checkoutCore/v0/customer/checkouts/place", {
    method: "POST",
    headers: { ...cartSmoke.headers, "idempotency-key": `${orderCode}:place` },
    body: JSON.stringify({
      cartCode: cartSmoke.cartCode,
      orderCode,
      expectedCartRevision: cartSmoke.revision,
      calculationCode: cartSmoke.calculationCode,
      providerToken: "tok_test_storefront_4242",
      customer: { email: customer.credentials.loginId, firstName: "Storefront", lastName: "Customer" },
      shippingAddress: { line1: "549 Oak St", city: "Crystal Lake", region: "IL", postalCode: "60014", country: "US" },
      shippingMethod: "STANDARD",
      paymentMethod: "CARD",
    }),
  }));
  const placedOrderCode = placed?.orderCode || placed?.code || placed?.evidence?.orderCode || orderCode;
  const order = dataOf(await request(commerceUrl, `/nodics/order/v0/customer/orders/${encodeURIComponent(placedOrderCode)}`, {
    headers: cartSmoke.headers,
  }));
  if (order?.order?.code !== placedOrderCode) {
    throw new Error(`Customer order read returned unexpected response: ${JSON.stringify(order)}`);
  }
  const cancellationPayload = {
    code: `${placedOrderCode}:cancellation`,
    requestType: "CANCELLATION",
    reasonCode: "CUSTOMER_CHANGED_MIND",
    policyVersion: "1",
    evidence: { source: "agora-commerce-acceptance", quantity: "1", productCodes: [cartSmoke.productCode], refundMethod: "ORIGINAL_PAYMENT" },
  };
  const cancellationPreview = dataOf(await request(commerceUrl, `/nodics/order/v0/customer/orders/${encodeURIComponent(placedOrderCode)}/lifecycle/preview`, {
    method: "POST",
    headers: cartSmoke.headers,
    body: JSON.stringify(cancellationPayload),
  }));
  requireAutomationStep(cancellationPreview, "reservation-release", "inventory", "Customer cancellation preview");
  const lifecycle = dataOf(await request(commerceUrl, `/nodics/order/v0/customer/orders/${encodeURIComponent(placedOrderCode)}/lifecycle`, {
    method: "POST",
    headers: { ...cartSmoke.headers, "idempotency-key": `${placedOrderCode}:cancellation` },
    body: JSON.stringify(cancellationPayload),
  }));
  if (lifecycle?.status !== "SUBMITTED") {
    throw new Error(`Customer lifecycle create returned unexpected response: ${JSON.stringify(lifecycle)}`);
  }
  const returnPreview = dataOf(await request(commerceUrl, `/nodics/order/v0/customer/orders/${encodeURIComponent(placedOrderCode)}/lifecycle/preview`, {
    method: "POST",
    headers: cartSmoke.headers,
    body: JSON.stringify({
      code: `${placedOrderCode}:return`,
      requestType: "RETURN",
      reasonCode: "DAMAGED_ITEM",
      policyVersion: "1",
      evidence: { source: "agora-commerce-acceptance", quantity: "1", productCodes: [cartSmoke.productCode], returnMethod: "DROP_OFF", refundMethod: "ORIGINAL_PAYMENT" },
    }),
  }));
  if (returnPreview?.eligible === false || !returnPreview?.rmaCode && !Array.isArray(returnPreview?.returnMethods)) {
    throw new Error(`Customer return preview returned unexpected response: ${JSON.stringify(returnPreview)}`);
  }
  requireAutomationStep(returnPreview, "return-logistics", "fulfillment", "Customer return preview");
  requireAutomationStep(returnPreview, "inspection-disposition", "fulfillment+inventory", "Customer return preview");
  requireAutomationStep(returnPreview, "refund-reconciliation", "payment", "Customer return preview");
  const returnLifecycle = dataOf(await request(commerceUrl, `/nodics/order/v0/customer/orders/${encodeURIComponent(placedOrderCode)}/lifecycle`, {
    method: "POST",
    headers: { ...cartSmoke.headers, "idempotency-key": `${placedOrderCode}:return` },
    body: JSON.stringify({
      code: `${placedOrderCode}:return`,
      requestType: "RETURN",
      reasonCode: "DAMAGED_ITEM",
      policyVersion: "1",
      evidence: { source: "agora-commerce-acceptance", quantity: "1", productCodes: [cartSmoke.productCode], returnMethod: "DROP_OFF", refundMethod: "ORIGINAL_PAYMENT" },
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
    evidence: { source: "agora-commerce-acceptance", quantity: "1", productCodes: [cartSmoke.productCode], refundMethod: "ORIGINAL_PAYMENT" },
  };
  const refundPreview = dataOf(await request(commerceUrl, `/nodics/order/v0/customer/orders/${encodeURIComponent(placedOrderCode)}/lifecycle/preview`, {
    method: "POST",
    headers: cartSmoke.headers,
    body: JSON.stringify(refundPayload),
  }));
  if (refundPreview?.eligible === false || !refundPreview?.refundPreview && !Array.isArray(refundPreview?.refundMethods)) {
    throw new Error(`Customer refund preview returned unexpected response: ${JSON.stringify(refundPreview)}`);
  }
  requireAutomationStep(refundPreview, "refund-reconciliation", "payment", "Customer refund preview");
  const refundLifecycle = dataOf(await request(commerceUrl, `/nodics/order/v0/customer/orders/${encodeURIComponent(placedOrderCode)}/lifecycle`, {
    method: "POST",
    headers: { ...cartSmoke.headers, "idempotency-key": `${placedOrderCode}:refund` },
    body: JSON.stringify(refundPayload),
  }));
  if (refundLifecycle?.status !== "SUBMITTED") {
    throw new Error(`Customer refund lifecycle create returned unexpected response: ${JSON.stringify(refundLifecycle)}`);
  }
  const exchangePreview = dataOf(await request(commerceUrl, `/nodics/order/v0/customer/orders/${encodeURIComponent(placedOrderCode)}/lifecycle/preview`, {
    method: "POST",
    headers: cartSmoke.headers,
    body: JSON.stringify({
      code: `${placedOrderCode}:exchange`,
      requestType: "EXCHANGE",
      reasonCode: "SIZE_EXCHANGE",
      policyVersion: "1",
      evidence: { source: "agora-commerce-acceptance", quantity: "1", productCodes: [cartSmoke.productCode], returnMethod: "STORE_RETURN", replacementProductCode: cartSmoke.productCode },
    }),
  }));
  requireAutomationStep(exchangePreview, "replacement-reservation", "inventory", "Customer exchange preview");
  requireAutomationStep(exchangePreview, "exchange-shipment", "fulfillment", "Customer exchange preview");
  const appealPreview = dataOf(await request(commerceUrl, `/nodics/order/v0/customer/orders/${encodeURIComponent(placedOrderCode)}/lifecycle/preview`, {
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

async function cleanup() {
  for (const child of managed.reverse()) {
    if (!child.pid || child.exitCode !== null) continue;
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      child.kill("SIGTERM");
    }
    await Promise.race([
      child.exitPromise,
      delay(Number(process.env.NODICS_ACCEPTANCE_SHUTDOWN_TIMEOUT_MS || 5000)).then(() => {
        if (child.exitCode !== null) return;
        try {
          process.kill(-child.pid, "SIGKILL");
        } catch {
          child.kill("SIGKILL");
        }
      }),
    ]);
  }
}

async function run() {
  try {
    await ensureRuntime("Platform", portOf(platformUrl, 4300), "start:platform", platformUrl);
    await ensureRuntime("Commerce", portOf(commerceUrl, 4350), "start:commerce", commerceUrl);
    const employeeHeaders = await authenticateEmployee();
    await validateCommerceContract(employeeHeaders);
    await exerciseProductDiscovery(employeeHeaders);
    const acceptancePromotion = await ensureAcceptancePromotion(employeeHeaders);
    const primaryCredentials = storefrontCustomerCredentials("PRIMARY");
    await ensureStorefrontCustomer(employeeHeaders, primaryCredentials, "primary");
    const primaryCustomer = await authenticateCustomer(primaryCredentials, "primary");
    await exerciseCustomerLists(primaryCustomer.headers);
    await exerciseCustomerPromotions(primaryCustomer.headers, acceptancePromotion);
    const cartSmoke = await exerciseCustomerCart(primaryCustomer.headers);
    const checkoutSmoke = await exerciseCustomerCheckout(cartSmoke, primaryCustomer);
    const secondaryCredentials = storefrontCustomerCredentials("SECONDARY");
    await ensureStorefrontCustomer(employeeHeaders, secondaryCredentials, "secondary");
    const secondaryCustomer = await authenticateCustomer(secondaryCredentials, "secondary");
    await expectReadRejected(secondaryCustomer.headers, `/nodics/order/v0/customer/orders/${encodeURIComponent(checkoutSmoke.orderCode)}`, "customer order read");
    await expectReadRejected(secondaryCustomer.headers, `/nodics/cart/v0/customer/carts/${encodeURIComponent(checkoutSmoke.cartCode)}`, "customer cart read");
    log("Agora Commerce acceptance passed");
  } finally {
    await cleanup();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
