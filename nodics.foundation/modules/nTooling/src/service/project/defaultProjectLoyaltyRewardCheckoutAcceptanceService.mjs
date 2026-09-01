#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import { execFile, spawn } from "node:child_process";
import { randomUUID, createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { promisify } from "node:util";
import { MongoClient } from "mongodb";

const execFileAsync = promisify(execFile);
const projectRoot = process.env.NODICS_PROJECT_ROOT || process.cwd();
const platformUrl = process.env.NODICS_PLATFORM_URL || "http://127.0.0.1:4300";
const commerceUrl = process.env.NODICS_COMMERCE_URL || "http://127.0.0.1:4350";
const loyaltyUrl = process.env.NODICS_LOYALTY_URL || "http://127.0.0.1:4360";
const axisOrigin = process.env.AXIS_ORIGIN || "http://127.0.0.1:3100";
const enterprise = process.env.NODICS_ENTERPRISE_CODE || process.env.AXIS_ENTERPRISE || "default";
const mongoUri = process.env.NODICS_MONGODB_URI || "mongodb://127.0.0.1:27017/?replicaSet=nodicsLocal";
const platformDbName = process.env.NODICS_PLATFORM_DB || "kickoffLocalPlatform";
const commerceDbName = process.env.NODICS_COMMERCE_DB || "kickoffLocalCommerce";
const loyaltyDbName = process.env.NODICS_LOYALTY_DB || "kickoffLocalLoyalty";
const managed = [];
const loyaltyPermissions = [
  "loyalty.wallet.read",
  "loyalty.rewards.reserve",
  "loyalty.rewards.capture",
  "loyalty.rewards.release",
  "loyalty.rewards.reverse",
];

function log(message) {
  console.log(`[loyalty-reward-checkout] ${message}`);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderList(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

async function writeVisualEvidence(evidence) {
  const outputDir = path.join(projectRoot, ".nodics", "tmp", "loyalty-reward-checkout-live");
  const generatedAt = new Date().toISOString();
  const report = {
    generatedAt,
    services: { platformUrl, commerceUrl, loyaltyUrl },
    assertions: [
      "Commerce, Loyalty, and Platform were live over HTTP.",
      "Commerce checkout called Loyalty through the payment provider boundary.",
      "Loyalty wallet balance captured reward points and cleared reservation.",
      "Reward reservation, redemption, and ledger evidence were persisted.",
      "Commerce payment, order evidence, digital entitlement, and delivery were persisted.",
      "Loyalty wallet rows did not store tenant, enterprise, token, or request context.",
    ],
    ...evidence,
  };
  await fs.promises.mkdir(outputDir, { recursive: true });
  await fs.promises.writeFile(
    path.join(outputDir, "evidence.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Loyalty Reward Checkout Evidence</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #17202a;
      --muted: #5a6472;
      --line: #cfd8e3;
      --panel: #ffffff;
      --canvas: #f5f7fb;
      --ok: #147d64;
      --commerce: #255c99;
      --loyalty: #8a4f16;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background: var(--canvas);
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.45;
    }
    main {
      width: min(1120px, calc(100vw - 32px));
      margin: 0 auto;
      padding: 28px 0 36px;
    }
    header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
      border-bottom: 1px solid var(--line);
      padding-bottom: 16px;
      margin-bottom: 18px;
    }
    h1 {
      margin: 0 0 6px;
      font-size: 28px;
      letter-spacing: 0;
    }
    h2 {
      margin: 0 0 10px;
      font-size: 17px;
      letter-spacing: 0;
    }
    p { margin: 0; color: var(--muted); }
    .status {
      flex: 0 0 auto;
      border: 1px solid rgba(20, 125, 100, 0.28);
      color: var(--ok);
      background: #eef9f5;
      border-radius: 8px;
      padding: 8px 12px;
      font-weight: 700;
      white-space: nowrap;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin: 18px 0;
    }
    .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      min-height: 118px;
    }
    .label {
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0;
      margin-bottom: 8px;
    }
    .value {
      font-size: 24px;
      font-weight: 800;
      overflow-wrap: anywhere;
    }
    .journey {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin: 18px 0;
    }
    .step {
      border-left: 4px solid var(--commerce);
    }
    .step.loyalty {
      border-left-color: var(--loyalty);
    }
    code {
      display: block;
      margin-top: 8px;
      color: var(--ink);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      overflow-wrap: anywhere;
    }
    ul {
      margin: 0;
      padding-left: 20px;
      color: var(--ink);
    }
    li + li {
      margin-top: 6px;
    }
    @media (max-width: 860px) {
      header { flex-direction: column; }
      .grid, .journey { grid-template-columns: 1fr; }
      .status { white-space: normal; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>Loyalty Reward Checkout Evidence</h1>
        <p>Generated ${escapeHtml(generatedAt)} from the live acceptance command.</p>
      </div>
      <div class="status">ACCEPTANCE PASSED</div>
    </header>
    <section class="grid" aria-label="Reward balance">
      <article class="panel">
        <div class="label">Available Points</div>
        <div class="value">${escapeHtml(report.balance.available)}</div>
      </article>
      <article class="panel">
        <div class="label">Reserved Points</div>
        <div class="value">${escapeHtml(report.balance.reserved)}</div>
      </article>
      <article class="panel">
        <div class="label">Spent Points</div>
        <div class="value">${escapeHtml(report.balance.spent)}</div>
      </article>
      <article class="panel">
        <div class="label">Digital Delivery</div>
        <div class="value">${escapeHtml(report.deliveryCount)} / ${escapeHtml(report.entitlementCount)}</div>
      </article>
    </section>
    <section class="journey" aria-label="Checkout journey">
      <article class="panel step">
        <h2>Commerce Cart</h2>
        <p>Coupon product cart was calculated before checkout.</p>
        <code>${escapeHtml(report.cartCode)}</code>
      </article>
      <article class="panel step loyalty">
        <h2>Loyalty Ledger</h2>
        <p>${escapeHtml(report.ledgerTypes.join(" + "))} entries were recorded.</p>
        <code>${escapeHtml(report.reservationCode || "missing-reservation-code")}</code>
      </article>
      <article class="panel step">
        <h2>Commerce Order</h2>
        <p>${escapeHtml(report.paymentOperations.join(" + "))} payment operations were recorded.</p>
        <code>${escapeHtml(report.orderCode)}</code>
      </article>
    </section>
    <section class="panel" aria-label="Acceptance assertions">
      <h2>Assertions</h2>
      <ul>${renderList(report.assertions)}</ul>
    </section>
  </main>
</body>
</html>
`;
  await fs.promises.writeFile(path.join(outputDir, "index.html"), html, "utf8");
  log(`visual evidence written to ${path.join(outputDir, "index.html")}`);
}

function portOf(baseUrl, fallback) {
  try {
    const url = new URL(baseUrl);
    return Number(url.port || (url.protocol === "https:" ? 443 : 80));
  } catch {
    return fallback;
  }
}

async function listening(port) {
  const result = await execFileAsync("lsof", [
    "-nP",
    `-iTCP:${String(port)}`,
    "-sTCP:LISTEN",
  ]).catch(() => ({ stdout: "" }));
  return result.stdout.includes(`:${String(port)} `);
}

async function request(baseUrl, route, options = {}) {
  const response = await fetch(new URL(route, baseUrl), {
    ...options,
    headers: {
      Accept: "application/json",
      "x-enterprise-code": enterprise,
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    throw new Error(`${route} returned a non-JSON response`);
  }
  if (!response.ok) {
    throw new Error(`${route} returned HTTP ${String(response.status)}: ${text.slice(0, 800)}`);
  }
  return body?.data ?? body?.result ?? body;
}

async function waitReady(baseUrl, label) {
  const deadline = Date.now() + Number(process.env.NODICS_ACCEPTANCE_READY_TIMEOUT_MS || 90000);
  let lastError;
  while (Date.now() < deadline) {
    try {
      const health = await request(baseUrl, "/nodics/system/v0/health/ready");
      if (health?.status === "UP" || health?.ready === true || health?.success === true) {
        log(`${label} ready`);
        return;
      }
    } catch (error) {
      lastError = error;
    }
    await delay(1000);
  }
  throw new Error(`${label} did not become ready: ${lastError?.message || "timeout"}`);
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

async function withMongo(operation) {
  const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  try {
    return await operation(client);
  } finally {
    await client.close();
  }
}

async function ensureServiceAccountLoyaltyPermissions() {
  await withMongo(async (client) => {
    const result = await client.db(platformDbName).collection("UserGroupModel").updateOne(
      { code: "serviceAccountUserGroup" },
      {
        $set: { updated: new Date() },
        $addToSet: { permissions: { $each: loyaltyPermissions } },
      },
    );
    if (!result.matchedCount) {
      throw new Error("serviceAccountUserGroup was not found in the local Platform database");
    }
  });
  log("service account group has Loyalty internal permissions");
}

async function authenticateEmployee() {
  const suppliedToken = process.env.AXIS_AUTH_TOKEN || process.env.NODICS_AUTH_TOKEN;
  if (suppliedToken) return { Authorization: `Bearer ${suppliedToken}` };
  const credentials = {
    loginId: process.env.AXIS_LOGIN_ID || "admin",
    password: process.env.AXIS_PASSWORD || "adminPassword",
  };
  let lastError;
  for (const route of ["/nodics/profile/v0/employee/browser/authenticate", "/nodics/profile/v0/employee/authenticate"]) {
    try {
      const result = await request(platformUrl, route, {
        method: "POST",
        headers: { Origin: axisOrigin },
        body: JSON.stringify(credentials),
      });
      const authToken = result?.authToken || result?.result?.authToken || result?.data?.authToken;
      if (authToken) return { Authorization: `Bearer ${authToken}` };
      lastError = new Error(`${route} returned no employee auth token`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Platform employee authentication returned no token");
}

function customerCredentials() {
  const loginId = process.env.NODICS_LOYALTY_CHECKOUT_CUSTOMER_LOGIN_ID;
  const password = process.env.NODICS_LOYALTY_CHECKOUT_CUSTOMER_PASSWORD;
  if (loginId && password) return { loginId, password, register: process.env.NODICS_LOYALTY_CHECKOUT_CUSTOMER_REGISTER !== "false" };
  const suffix = randomUUID().slice(0, 12);
  return {
    loginId: `loyalty.checkout.${suffix}@example.com`,
    password: `NodicsLoyalty#${suffix}1a`,
    register: true,
  };
}

async function ensureCustomer(employeeHeaders, credentials) {
  if (!credentials.register) return;
  const payload = {
    code: credentials.loginId,
    loginId: credentials.loginId,
    name: { title: "Mx.", firstName: "Loyalty", lastName: "Checkout" },
    password: {
      loginId: credentials.loginId,
      password: credentials.password,
      confirmPassword: credentials.password,
      active: true,
    },
  };
  try {
    await request(platformUrl, "/nodics/profile/v0/customer/signup", {
      method: "POST",
      headers: employeeHeaders,
      body: JSON.stringify(payload),
    });
    log(`customer ${credentials.loginId} registered`);
  } catch (error) {
    if (!String(error.message || error).match(/exist|duplicate|already/i)) throw error;
    log(`customer ${credentials.loginId} already exists`);
  }
}

async function authenticateCustomer(credentials) {
  const result = await request(platformUrl, "/nodics/profile/v0/customer/authenticate", {
    method: "POST",
    body: JSON.stringify({ loginId: credentials.loginId, password: credentials.password }),
  });
  const authToken = result?.authToken || result?.result?.authToken || result?.data?.authToken;
  if (!authToken) throw new Error("Platform customer authentication returned no token");
  log(`customer ${credentials.loginId} authenticated`);
  return { Authorization: `Bearer ${authToken}` };
}

async function validateRuntimeContracts(headers) {
  const [commerceContract, loyaltyContract] = await Promise.all([
    request(commerceUrl, "/nodics/system/v0/contract/openapi", { headers }),
    request(loyaltyUrl, "/nodics/system/v0/contract/openapi", { headers }),
  ]);
  const commercePaths = commerceContract?.paths || {};
  const loyaltyPaths = loyaltyContract?.paths || {};
  [
    "/nodics/cart/v0/carts",
    "/nodics/cart/v0/carts/{cartCode}/entries",
    "/nodics/cart/v0/carts/{cartCode}/calculations",
    "/nodics/checkoutCore/v0/checkouts/place",
    "/nodics/digitalCore/v0/entitlements",
  ].forEach((route) => {
    if (!commercePaths[route]) throw new Error(`Commerce contract is missing ${route}`);
  });
  [
    "/nodics/loyaltyApi/v0/wallets/{walletCode}",
    "/nodics/loyaltyApi/v0/reward-reservations",
    "/nodics/loyaltyApi/v0/reward-reservations/{reservationCode}/capture",
    "/nodics/loyaltyApi/v0/reward-ledger-entries/{entryCode}/reverse",
  ].forEach((route) => {
    if (!loyaltyPaths[route]) throw new Error(`Loyalty contract is missing ${route}`);
  });
  const activeModules = commerceContract?.["x-nodics"]?.activeModules || [];
  if (!activeModules.includes("loyaltyRewardPayment") || !activeModules.includes("loyaltyRewardProvider")) {
    throw new Error("Commerce runtime did not activate loyaltyRewardPayment and loyaltyRewardProvider");
  }
  log("Commerce checkout, digital entitlement, and Loyalty internal APIs are effective");
}

async function seedWallet(ownerCode, journeyId) {
  const walletCode = `loyalty-acceptance-wallet-${journeyId}`;
  const balanceCode = `${walletCode}:default:points`;
  const now = new Date();
  await withMongo(async (client) => {
    const db = client.db(loyaltyDbName);
    await Promise.all([
      db.collection("RewardReservationModel").deleteMany({ walletCode }),
      db.collection("RewardLedgerEntryModel").deleteMany({ walletCode }),
      db.collection("RewardRedemptionModel").deleteMany({ walletCode }),
      db.collection("LoyaltyWalletModel").updateOne(
        { code: walletCode },
        {
          $set: {
            code: walletCode,
            ownerType: "CUSTOMER",
            ownerCode,
            status: "OPEN",
            openedAt: now,
            revision: 0,
            active: true,
            created: now,
            updated: now,
          },
        },
        { upsert: true },
      ),
      db.collection("LoyaltyWalletRewardBalanceModel").updateOne(
        { code: balanceCode },
        {
          $set: {
            code: balanceCode,
            walletCode,
            programCode: "default",
            rewardTypeCode: "points",
            available: "250.00",
            reserved: "0.00",
            earned: "250.00",
            spent: "0.00",
            expired: "0.00",
            reversed: "0.00",
            updatedAt: now,
            revision: 0,
            active: true,
            created: now,
            updated: now,
          },
        },
        { upsert: true },
      ),
    ]);
  });
  log(`seeded Loyalty wallet ${walletCode}`);
  return walletCode;
}

async function exerciseCart(customerHeaders, journeyId) {
  const cartCode = `loyalty_reward_cart_${journeyId}`;
  const productCode = process.env.NODICS_LOYALTY_CHECKOUT_PRODUCT_CODE || "agoraStylePass5Coupon";
  const variantCode = process.env.NODICS_LOYALTY_CHECKOUT_VARIANT_CODE || "agoraStylePass5CouponDigital";
  const commonHeaders = { ...customerHeaders, "x-correlation-id": `loyalty-reward-checkout-${journeyId}` };
  const created = await request(commerceUrl, "/nodics/cart/v0/carts", {
    method: "POST",
    headers: commonHeaders,
    body: JSON.stringify({
      cartCode,
      storeCode: process.env.NODICS_STOREFRONT_STORE_CODE || "agoraMainStore",
      channelCode: process.env.NODICS_STOREFRONT_CHANNEL_CODE || "web",
      locale: process.env.NODICS_STOREFRONT_LOCALE || "en",
      jurisdiction: process.env.NODICS_STOREFRONT_JURISDICTION || "AE",
      currency: process.env.NODICS_STOREFRONT_CURRENCY || "USD",
    }),
  });
  if (created?.cart?.code !== cartCode) throw new Error(`Cart creation returned unexpected response: ${JSON.stringify(created)}`);
  const added = await request(commerceUrl, `/nodics/cart/v0/carts/${encodeURIComponent(cartCode)}/entries`, {
    method: "POST",
    headers: commonHeaders,
    body: JSON.stringify({ productCode, variantCode, quantity: "1" }),
  });
  const entry = added?.entries?.find((item) => item.productCode === productCode);
  if (!entry?.code) throw new Error(`Coupon cart entry was not added: ${JSON.stringify(added)}`);
  const calculationCode = `calc-${cartCode}`;
  const calculated = await request(commerceUrl, `/nodics/cart/v0/carts/${encodeURIComponent(cartCode)}/calculations`, {
    method: "POST",
    headers: commonHeaders,
    body: JSON.stringify({ expectedRevision: String(added?.cart?.revision || 0), calculationCode }),
  });
  if (!calculated?.totalAmount || !Array.isArray(calculated.entries)) {
    throw new Error(`Cart calculation returned unexpected response: ${JSON.stringify(calculated)}`);
  }
  if (!calculated.entries.some((item) => item.availability?.inventoryStrategy === "COUPON_CODE_POOL")) {
    throw new Error(`Cart calculation did not identify coupon-code pool availability: ${JSON.stringify(calculated.entries)}`);
  }
  log(`coupon cart calculated at ${calculated.totalAmount} ${calculated.currency}`);
  return {
    headers: commonHeaders,
    cartCode,
    calculationCode,
    revision: String(added?.cart?.revision || 0),
    amount: String(calculated.totalAmount),
    productCode,
    variantCode,
  };
}

async function placeLoyaltyCheckout(cart, walletCode, journeyId, customer) {
  const orderCode = `loyalty_reward_order_${journeyId}`;
  const placed = await request(commerceUrl, "/nodics/checkoutCore/v0/checkouts/place", {
    method: "POST",
    headers: { ...cart.headers, "idempotency-key": `${orderCode}:place` },
    body: JSON.stringify({
      cartCode: cart.cartCode,
      orderCode,
      expectedCartRevision: cart.revision,
      calculationCode: cart.calculationCode,
      customer: { email: customer.loginId, firstName: "Loyalty", lastName: "Checkout" },
      shippingAddress: { line1: "Acceptance Street 1", city: "Dubai", region: "DU", postalCode: "00000", country: "AE" },
      shippingMethod: "DIGITAL",
      paymentMethod: "LOYALTY_REWARD",
      walletCode,
      programCode: "default",
      rewardTypeCode: "points",
      rewardAmount: cart.amount,
      rewardCurrency: "POINTS",
    }),
  });
  const placedOrderCode = placed?.order?.code || placed?.orderCode || placed?.code || orderCode;
  if (placedOrderCode !== orderCode) throw new Error(`Checkout returned unexpected order code: ${JSON.stringify(placed)}`);
  log(`checkout placed with Loyalty reward payment for ${orderCode}`);
  return orderCode;
}

async function verifyEvidence(orderCode, cartCode, walletCode, amount, ownerId) {
  return withMongo(async (client) => {
    const loyaltyDb = client.db(loyaltyDbName);
    const commerceDb = client.db(commerceDbName);
    const [balance, reservations, ledger, redemptions, payments, order, entitlements, deliveries] = await Promise.all([
      loyaltyDb.collection("LoyaltyWalletRewardBalanceModel").findOne({ walletCode, programCode: "default", rewardTypeCode: "points" }),
      loyaltyDb.collection("RewardReservationModel").find({ walletCode, targetCode: orderCode }).toArray(),
      loyaltyDb.collection("RewardLedgerEntryModel").find({ walletCode, targetCode: orderCode }).toArray(),
      loyaltyDb.collection("RewardRedemptionModel").find({ walletCode, targetCode: orderCode }).toArray(),
      commerceDb.collection("PaymentTransactionEntryModel").find({ orderCode }).toArray(),
      commerceDb.collection("CommerceOrderModel").findOne({ code: orderCode }),
      commerceDb.collection("DigitalEntitlementModel").find({ ownerId, status: "ACTIVE" }).toArray(),
      commerceDb.collection("DigitalDeliveryModel").find({ ownerId, status: "DELIVERED" }).toArray(),
    ]);
    const forbiddenStoredContext = [balance, ...reservations, ...ledger, ...redemptions]
      .filter(Boolean)
      .some((row) => row.tenant !== undefined || row.enterpriseCode !== undefined || row.authData !== undefined || row.payload !== undefined || row.httpRequest !== undefined);
    const reserve = ledger.find((entry) => entry.entryType === "RESERVE");
    const capture = ledger.find((entry) => entry.entryType === "CAPTURE");
    const authorization = payments.find((entry) => entry.operation === "AUTHORIZE" && entry.providerCode === "loyalty-reward-points");
    const capturePayment = payments.find((entry) => entry.operation === "CAPTURE" && entry.providerCode === "loyalty-reward-points");
    if (!balance || balance.spent !== amount || balance.reserved !== "0.00") throw new Error(`Loyalty balance did not capture ${amount}: ${JSON.stringify(balance)}`);
    if (!reservations.some((entry) => entry.status === "CAPTURED")) throw new Error(`Loyalty reservation was not captured: ${JSON.stringify(reservations)}`);
    if (!reserve || !capture) throw new Error(`Loyalty ledger did not record reserve and capture: ${JSON.stringify(ledger)}`);
    if (!redemptions.some((entry) => entry.status === "CAPTURED")) throw new Error(`Loyalty redemption was not captured: ${JSON.stringify(redemptions)}`);
    if (!authorization || !capturePayment) throw new Error(`Payment did not record Loyalty authorize and capture: ${JSON.stringify(payments)}`);
    if (!order || order.evidence?.paymentProvider !== "loyalty-reward-points" || order.evidence?.paymentMethod !== "LOYALTY_REWARD") {
      throw new Error(`Order evidence did not retain Loyalty payment details: ${JSON.stringify(order)}`);
    }
    if (!entitlements.some((entry) => entry.orderCode === orderCode) || !deliveries.some((entry) => entry.orderCode === orderCode)) {
      throw new Error(`Digital coupon entitlement was not delivered: ${JSON.stringify({ entitlements, deliveries })}`);
    }
    if (forbiddenStoredContext) throw new Error("Loyalty rows stored tenant, enterprise, or request context");
    return {
      balance: { available: balance.available, reserved: balance.reserved, spent: balance.spent },
      reservationCode: reservations[0]?.code,
      ledgerTypes: ledger.map((entry) => entry.entryType).sort(),
      paymentOperations: payments.map((entry) => entry.operation).sort(),
      entitlementCount: entitlements.filter((entry) => entry.orderCode === orderCode).length,
      deliveryCount: deliveries.filter((entry) => entry.orderCode === orderCode).length,
      cartCode,
      orderCode,
    };
  });
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
    await ensureServiceAccountLoyaltyPermissions();
    await ensureRuntime("Loyalty", portOf(loyaltyUrl, 4360), "start:loyalty", loyaltyUrl);
    await ensureRuntime("Commerce", portOf(commerceUrl, 4350), "start:commerce", commerceUrl);
    const employeeHeaders = await authenticateEmployee();
    await validateRuntimeContracts(employeeHeaders);
    const credentials = customerCredentials();
    await ensureCustomer(employeeHeaders, credentials);
    const customerHeaders = await authenticateCustomer(credentials);
    const journeyId = createHash("sha1").update(`${credentials.loginId}:${Date.now()}:${randomUUID()}`).digest("hex").slice(0, 12);
    const walletCode = await seedWallet(credentials.loginId, journeyId);
    const cart = await exerciseCart(customerHeaders, journeyId);
    const orderCode = await placeLoyaltyCheckout(cart, walletCode, journeyId, credentials);
    const evidence = await verifyEvidence(orderCode, cart.cartCode, walletCode, cart.amount, credentials.loginId);
    log(`evidence ${JSON.stringify(evidence)}`);
    await writeVisualEvidence(evidence);
    log("Loyalty reward checkout acceptance passed");
  } finally {
    await cleanup();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
