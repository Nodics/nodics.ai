/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyRewardProvider/acceptance/defaultLoyaltyRewardCheckoutAcceptanceService
 * @description Opt-in Commerce/Loyalty checkout conformance through existing owner APIs.
 * @owner loyaltyRewardProvider @layer tooling
 */
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import { createAcceptanceContext } from "../../../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs";
import { projectRuntimeAcceptance } from "../../../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectEnvironmentConfigurationService.mjs";
import amounts from "../../../../../../../../../../nodics.loyalty/modules/loyaltyCore/src/service/defaultLoyaltyAmountService.js";

const evidenceGaps = Object.freeze([
  "No explicit read API independently exposes reservation/redemption status or payment transaction entries for this journey; ledger references and checkout checkpoints are checked instead.",
  "Digital delivery is evidenced by the owned checkout checkpoint and entitlement, not an independent delivery-record read.",
  "API projections cannot prove absence of tenant/request context in persisted rows; that invariant belongs to Loyalty persistence tests.",
]);

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function requiredString(value, label, maximum = 256) {
  requireValue(
    typeof value === "string" &&
      value.trim().length > 0 &&
      value.length <= maximum,
    label + " is required",
  );
  return value;
}

function validateFixture(fixture) {
  requireValue(
    fixture && typeof fixture === "object",
    "tooling.acceptance.loyaltyRewardCheckout fixture is required",
  );
  for (const field of [
    "customerCode",
    "walletCode",
    "productCode",
    "variantCode",
    "programCode",
    "rewardTypeCode",
    "rewardCurrency",
    "providerCode",
  ])
    requiredString(fixture[field], "fixture." + field);
  for (const field of [
    "storeCode",
    "channelCode",
    "locale",
    "jurisdiction",
    "currency",
  ])
    requiredString(fixture.cart?.[field], "fixture.cart." + field);
  for (const field of ["email", "firstName", "lastName"])
    requiredString(fixture.customer?.[field], "fixture.customer." + field);
  for (const field of ["line1", "city", "region", "postalCode", "country"])
    requiredString(
      fixture.shippingAddress?.[field],
      "fixture.shippingAddress." + field,
    );
  requireValue(
    Number.isInteger(fixture.rewardScale) &&
      fixture.rewardScale >= 0 &&
      fixture.rewardScale <= 8,
    "fixture.rewardScale must be 0..8",
  );
  requiredString(fixture.maximumRewardAmount, "fixture.maximumRewardAmount");
  amounts.assertPositive(fixture.maximumRewardAmount, fixture.rewardScale);
  return fixture;
}

function walletProjection(projection, fixture) {
  const wallet = projection?.wallet;
  requireValue(
    wallet?.code === fixture.walletCode &&
      wallet.ownerType === "CUSTOMER" &&
      wallet.ownerCode === fixture.customerCode &&
      wallet.status === "OPEN",
    "Provisioning prerequisite: an OPEN wallet belonging to the fixture customer is required",
  );
  const balances = projection.balances?.filter(
    (row) =>
      row.walletCode === fixture.walletCode &&
      row.programCode === fixture.programCode &&
      row.rewardTypeCode === fixture.rewardTypeCode,
  );
  requireValue(
    balances?.length === 1 && Array.isArray(projection.entries),
    "Wallet projection must contain one selected reward balance and ledger entries",
  );
  for (const field of ["available", "reserved", "spent"]) {
    requireValue(
      amounts.compare(balances[0][field], "0", fixture.rewardScale) >= 0,
      "Invalid wallet " + field,
    );
  }
  for (const row of [wallet, ...projection.balances, ...projection.entries]) {
    requireValue(
      !["tenant", "enterpriseCode", "authData", "payload", "httpRequest"].some(
        (key) => Object.hasOwn(row, key),
      ),
      "Loyalty projection exposes forbidden request context",
    );
  }
  return balances[0];
}

/** Runs only after explicit execution consent; accepts injected runtime configuration, fixtures and fetch for isolated tests. */
export async function runLoyaltyRewardCheckoutAcceptance({
  execute = false,
  fixture,
  configuration,
  environment = process.env,
  projectRoot = environment.NODICS_PROJECT_ROOT || process.cwd(),
  fetch: fetchRequest = globalThis.fetch,
  journeyId = randomUUID(),
} = {}) {
  requireValue(
    execute === true,
    "Loyalty reward checkout requires --execute; it spends rewards and allocates a digital coupon",
  );
  requireValue(
    /^[a-zA-Z0-9_-]{1,64}$/.test(journeyId),
    "A bounded journeyId is required",
  );
  const context = await createAcceptanceContext({
    projectRoot,
    environment,
    configuration,
    fetch: fetchRequest,
  });
  const selected = validateFixture(
    fixture ||
      projectRuntimeAcceptance(projectRoot, context.configuration, {
        role: "PLATFORM",
      }).loyaltyRewardCheckout,
  );
  const serviceToken = requiredString(
    environment.NODICS_LOYALTY_ACCEPTANCE_SERVICE_TOKEN,
    "Provisioning prerequisite: NODICS_LOYALTY_ACCEPTANCE_SERVICE_TOKEN with existing loyalty.wallet.read authority",
    32768,
  );
  // Credentials are supplied by the caller, never generated or elevated by acceptance.
  const customerToken = environment.NODICS_LOYALTY_CHECKOUT_CUSTOMER_TOKEN;
  if (!customerToken) {
    requiredString(
      environment.NODICS_LOYALTY_CHECKOUT_CUSTOMER_LOGIN_ID,
      "Provisioning prerequisite: customer login",
    );
    requiredString(
      environment.NODICS_LOYALTY_CHECKOUT_CUSTOMER_PASSWORD,
      "Provisioning prerequisite: customer password",
    );
  }
  const { request } = context;
  const serviceHeaders = { Authorization: "Bearer " + serviceToken };
  const employeeHeaders = await context.authenticate();
  for (const [role, paths] of [
    [
      "COMMERCE",
      [
        "/nodics/cart/v0/carts",
        "/nodics/cart/v0/carts/{cartCode}/entries",
        "/nodics/cart/v0/carts/{cartCode}/calculations",
        "/nodics/checkoutCore/v0/checkouts/place",
        "/nodics/checkoutCore/v0/checkouts/{orderCode}",
        "/nodics/order/v0/orders/{orderCode}",
        "/nodics/digitalCore/v0/entitlements",
      ],
    ],
    [
      "LOYALTY",
      [
        "/nodics/loyaltyApi/v0/wallets/{walletCode}",
        "/nodics/loyaltyApi/v0/wallet-projections",
        "/nodics/loyaltyApi/v0/reward-reservations",
        "/nodics/loyaltyApi/v0/reward-reservations/{reservationCode}/capture",
      ],
    ],
  ]) {
    const contract = await request(role, "/nodics/system/v0/contract/openapi", {
      headers: employeeHeaders,
    });
    for (const route of paths)
      requireValue(
        contract?.paths?.[route],
        role + " contract is missing " + route,
      );
    if (role === "COMMERCE") {
      for (const name of ["loyaltyRewardPayment", "loyaltyRewardProvider"])
        requireValue(
          contract?.["x-nodics"]?.activeModules?.includes(name),
          "Commerce must activate " + name,
        );
    }
  }
  const token =
    customerToken ||
    (
      await request("PLATFORM", "/nodics/profile/v0/customer/authenticate", {
        method: "POST",
        body: JSON.stringify({
          loginId: environment.NODICS_LOYALTY_CHECKOUT_CUSTOMER_LOGIN_ID,
          password: environment.NODICS_LOYALTY_CHECKOUT_CUSTOMER_PASSWORD,
        }),
      })
    )?.authToken;
  requireValue(
    typeof token === "string" && token.length > 0,
    "Customer authentication returned no token",
  );
  const headers = {
    Authorization: "Bearer " + token,
    "x-correlation-id": "loyalty-reward-checkout-" + journeyId,
  };
  const post = (role, route, body, auth = headers) =>
    request(role, route, {
      method: "POST",
      headers: auth,
      body: JSON.stringify(body),
    });
  const wallet = await request(
    "LOYALTY",
    "/nodics/loyaltyApi/v0/wallets/" + encodeURIComponent(selected.walletCode),
    { headers: serviceHeaders },
  );
  requireValue(
    wallet?.code === selected.walletCode &&
      wallet.ownerType === "CUSTOMER" &&
      wallet.ownerCode === selected.customerCode &&
      wallet.status === "OPEN",
    "Provisioning prerequisite: pre-existing customer wallet is missing or mismatched",
  );
  const projectWallet = () =>
    post(
      "LOYALTY",
      "/nodics/loyaltyApi/v0/wallet-projections",
      { ownerType: "CUSTOMER", ownerCode: selected.customerCode },
      serviceHeaders,
    );
  const beforeProjection = await projectWallet();
  const before = walletProjection(beforeProjection, selected);
  requireValue(
    amounts.compare(before.available, "0", selected.rewardScale) > 0,
    "Provisioning prerequisite: fund the test wallet through the authorized Loyalty reward-earnings workflow",
  );
  const cartCode = "loyalty_reward_cart_" + journeyId;
  const orderCode = "loyalty_reward_order_" + journeyId;
  try {
    const calculationCode = "calc-" + cartCode;
    const created = await post("COMMERCE", "/nodics/cart/v0/carts", {
      cartCode,
      storeCode: selected.cart.storeCode,
      channelCode: selected.cart.channelCode,
      locale: selected.cart.locale,
      jurisdiction: selected.cart.jurisdiction,
      currency: selected.cart.currency,
    });
    requireValue(
      created?.cart?.code === cartCode,
      "Cart creation identity mismatch",
    );
    const cartRoute = "/nodics/cart/v0/carts/" + encodeURIComponent(cartCode);
    const added = await post("COMMERCE", cartRoute + "/entries", {
      productCode: selected.productCode,
      variantCode: selected.variantCode,
      quantity: "1",
    });
    requireValue(
      added?.entries?.some(
        (row) => row.code && row.productCode === selected.productCode,
      ),
      "Expected coupon cart entry is missing",
    );
    requireValue(
      added?.cart?.revision !== undefined,
      "Cart revision is missing",
    );
    const revision = String(added.cart.revision);
    const calculated = await post("COMMERCE", cartRoute + "/calculations", {
      expectedRevision: revision,
      calculationCode,
    });
    const amount = amounts.assertPositive(
      calculated?.totalAmount,
      selected.rewardScale,
    );
    requireValue(
      calculated.currency === selected.cart.currency &&
        calculated.entries?.some(
          (row) =>
            row.productCode === selected.productCode &&
            row.availability?.inventoryStrategy === "COUPON_CODE_POOL",
        ),
      "Coupon calculation currency or availability mismatch",
    );
    requireValue(
      amounts.compare(
        amount,
        selected.maximumRewardAmount,
        selected.rewardScale,
      ) <= 0,
      "Calculated reward amount exceeds the explicit spending limit",
    );
    requireValue(
      amounts.compare(before.available, amount, selected.rewardScale) >= 0,
      "Provisioning prerequisite: insufficient funded rewards for this checkout",
    );
    const placed = await post(
      "COMMERCE",
      "/nodics/checkoutCore/v0/checkouts/place",
      {
        cartCode,
        orderCode,
        expectedCartRevision: revision,
        calculationCode,
        customer: selected.customer,
        shippingAddress: selected.shippingAddress,
        shippingMethod: "DIGITAL",
        paymentMethod: "LOYALTY_REWARD",
        walletCode: selected.walletCode,
        programCode: selected.programCode,
        rewardTypeCode: selected.rewardTypeCode,
        rewardAmount: amount,
        rewardCurrency: selected.rewardCurrency,
      },
      { ...headers, "idempotency-key": orderCode + ":place" },
    );
    requireValue(
      placed?.code === orderCode && placed.status === "COMPLETED",
      "Checkout did not return the correlated completed checkpoint",
    );
    const checkpoint = await request(
      "COMMERCE",
      "/nodics/checkoutCore/v0/checkouts/" + encodeURIComponent(orderCode),
      { headers },
    );
    requireValue(
      checkpoint?.code === orderCode &&
        checkpoint.status === "COMPLETED" &&
        checkpoint.evidence?.orderCode === orderCode,
      "Persisted checkout checkpoint mismatch",
    );
    for (const step of ["AUTHORIZED", "PAYMENT_CAPTURED", "DIGITAL_DELIVERED"])
      requireValue(
        checkpoint.evidence.completed?.includes(step),
        "Checkout evidence is missing " + step,
      );
    requireValue(
      checkpoint.evidence.digitalDeliveryCodes?.length > 0,
      "Checkout has no digital delivery references",
    );
    const { order } = await request(
      "COMMERCE",
      "/nodics/order/v0/orders/" + encodeURIComponent(orderCode),
      { headers },
    );
    requireValue(
      order?.code === orderCode &&
        order.cartCode === cartCode &&
        order.evidence?.paymentProvider === selected.providerCode &&
        order.evidence?.paymentMethod === "LOYALTY_REWARD",
      "Order payment evidence mismatch",
    );
    const entitlements = await request(
      "COMMERCE",
      "/nodics/digitalCore/v0/entitlements?orderCode=" +
        encodeURIComponent(orderCode),
      { headers },
    );
    const owned = entitlements?.entitlements?.filter(
      (row) =>
        row.code &&
        row.orderCode === orderCode &&
        row.ownerId === selected.customerCode &&
        row.productCode === selected.productCode &&
        row.status === "ACTIVE",
    );
    requireValue(
      owned?.length > 0,
      "Correlated customer coupon entitlement is missing",
    );
    const afterProjection = await projectWallet();
    const after = walletProjection(afterProjection, selected);
    requireValue(
      amounts.compare(
        after.available,
        amounts.subtract(before.available, amount, selected.rewardScale),
        selected.rewardScale,
      ) === 0 &&
        amounts.compare(
          after.spent,
          amounts.add(before.spent, amount, selected.rewardScale),
          selected.rewardScale,
        ) === 0 &&
        amounts.compare(
          after.reserved,
          before.reserved,
          selected.rewardScale,
        ) === 0,
      "Wallet balance delta does not match checkout capture",
    );
    const entries = afterProjection.entries.filter(
      (row) =>
        row.walletCode === selected.walletCode &&
        row.targetCode === orderCode &&
        row.programCode === selected.programCode &&
        row.rewardTypeCode === selected.rewardTypeCode,
    );
    const reserve = entries.filter((row) => row.entryType === "RESERVE");
    const capture = entries.filter((row) => row.entryType === "CAPTURE");
    requireValue(
      reserve.length === 1 && capture.length === 1,
      "Correlated reserve/capture ledger entries are missing or duplicated",
    );
    requireValue(
      reserve[0].reservationCode &&
        reserve[0].reservationCode === capture[0].reservationCode &&
        capture[0].redemptionCode &&
        !beforeProjection.entries.some((row) =>
          [reserve[0].code, capture[0].code].includes(row.code),
        ) &&
        [reserve[0], capture[0]].every(
          (row) =>
            row.code &&
            amounts.compare(row.amount, amount, selected.rewardScale) === 0,
        ),
      "Ledger amount, freshness or reservation/redemption reference mismatch",
    );
    return {
      status: "API_CHECKS_PASSED",
      fullAcceptance: false,
      evidenceGaps: [...evidenceGaps],
      cartCode,
      orderCode,
      walletCode: selected.walletCode,
      amount,
      reservationCode: capture[0].reservationCode,
      redemptionCode: capture[0].redemptionCode,
      ledgerCodes: entries.map((row) => row.code),
      entitlementCodes: owned.map((row) => row.code),
      deliveryReferences: checkpoint.evidence.digitalDeliveryCodes,
    };
  } catch (error) {
    throw new Error(
      error.message +
        " [cart=" +
        cartCode +
        "; order=" +
        orderCode +
        "; inspect owner evidence before retrying]",
      { cause: error },
    );
  }
}

/** CLI is import-inert; unmet evidence coverage remains visibly non-successful for full qualification. */
export async function main(argv = process.argv.slice(2)) {
  if (argv.includes("--help")) {
    console.log(
      "acceptance:loyalty-reward-checkout --execute\nRequires running PLATFORM/COMMERCE/LOYALTY, customer fixture, funded wallet and pre-authorized service token. No permission grants or wallet seeding. API evidence gaps yield exit 2.",
    );
    return;
  }
  requireValue(
    argv.every((arg) => arg === "--execute"),
    "Unsupported reward checkout argument",
  );
  const report = await runLoyaltyRewardCheckoutAcceptance({
    execute: argv.includes("--execute"),
  });
  console.log(JSON.stringify(report, null, 2));
  return report.fullAcceptance ? 0 : 2;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main()
    .then((code) => {
      process.exitCode = code || 0;
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
