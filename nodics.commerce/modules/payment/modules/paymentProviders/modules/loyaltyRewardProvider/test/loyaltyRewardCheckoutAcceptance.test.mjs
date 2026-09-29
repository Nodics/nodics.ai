/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module loyaltyRewardProvider/test/loyaltyRewardCheckoutAcceptance @description API-only success and rejection conformance. @owner loyaltyRewardProvider @layer test */
import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { runLoyaltyRewardCheckoutAcceptance } from "../src/service/acceptance/defaultLoyaltyRewardCheckoutAcceptanceService.mjs";

const fixture = {
  customerCode: "partner-customer",
  walletCode: "partner-wallet",
  productCode: "partner-pass",
  variantCode: "partner-digital",
  programCode: "partner-program",
  rewardTypeCode: "partner-reward",
  rewardCurrency: "CREDITS",
  rewardScale: 2,
  providerCode: "partner-loyalty-provider",
  maximumRewardAmount: "10.00",
  cart: {
    storeCode: "partner-store",
    channelCode: "web",
    locale: "en",
    jurisdiction: "GB",
    currency: "GBP",
  },
  customer: {
    email: "customer@example.test",
    firstName: "Test",
    lastName: "Customer",
  },
  shippingAddress: {
    line1: "1 Test Street",
    city: "London",
    region: "London",
    postalCode: "TEST",
    country: "GB",
  },
};
const configuration = {
  topology: {
    groups: {
      backends: ["PLATFORM", "COMMERCE", "LOYALTY"].map((role, i) => ({
        code: role,
        role,
        host: "127.0.0.1",
        port: 19000 + i,
      })),
    },
  },
};
const environment = {
  NODICS_ACCEPTANCE_ORIGIN: "http://127.0.0.1:18000",
  AXIS_AUTH_TOKEN: "employee-token",
  NODICS_LOYALTY_ACCEPTANCE_SERVICE_TOKEN: "service-token",
  NODICS_LOYALTY_CHECKOUT_CUSTOMER_TOKEN: "customer-token",
};

test('every required fixture string rejects missing or empty values before owner API access', async () => {
  const fields = Object.entries(fixture).flatMap(([key, value]) => typeof value === 'string' ? [key]
    : value && typeof value === 'object' ? Object.keys(value).map(child => key + '.' + child) : []);
  let calls = 0;
  for (const field of fields) {
    for (const value of [undefined, '']) {
      const invalid = structuredClone(fixture);
      const keys = field.split('.');
      const target = keys.length === 1 ? invalid : invalid[keys[0]];
      if (value === undefined) delete target[keys.at(-1)];
      else target[keys.at(-1)] = value;
      await assert.rejects(runLoyaltyRewardCheckoutAcceptance({
        execute: true, fixture: invalid, configuration, environment,
        fetch: async () => { calls++; throw new Error('Unexpected request'); },
      }), /fixture\./, field);
    }
  }
  assert.equal(calls, 0);
});

function harness(mode = "") {
  const calls = [];
  let projected = 0;
  const cartCode = "loyalty_reward_cart_test";
  const orderCode = "loyalty_reward_order_test";
  const checkpoint = {
    code: orderCode,
    status: "COMPLETED",
    evidence: {
      orderCode,
      completed: ["AUTHORIZED", "PAYMENT_CAPTURED", "DIGITAL_DELIVERED"],
      digitalDeliveryCodes: ["delivery-test"],
    },
  };
  const wallet = {
    code: fixture.walletCode,
    ownerType: "CUSTOMER",
    ownerCode: fixture.customerCode,
    status: "OPEN",
  };
  const fetch = async (url, options) => {
    const route = url.pathname;
    const body = options.body ? JSON.parse(options.body) : undefined;
    calls.push({
      role: url.port,
      route,
      body,
      headers: options.headers,
      method: options.method || "GET",
    });
    if (mode === "denied" && route.endsWith("/wallet-projections"))
      return Response.json({ error: "Permission denied" }, { status: 403 });
    if (mode === "checkout-denied" && route.endsWith("/checkouts/place"))
      return Response.json({ error: "Wallet owner denied" }, { status: 403 });
    let result;
    if (route.endsWith("/contract/openapi")) {
      result = {
        paths: Object.fromEntries(
          [
            "/nodics/cart/v0/carts",
            "/nodics/cart/v0/carts/{cartCode}/entries",
            "/nodics/cart/v0/carts/{cartCode}/calculations",
            "/nodics/checkoutCore/v0/checkouts/place",
            "/nodics/checkoutCore/v0/checkouts/{orderCode}",
            "/nodics/order/v0/orders/{orderCode}",
            "/nodics/digitalCore/v0/entitlements",
            "/nodics/loyaltyApi/v0/wallets/{walletCode}",
            "/nodics/loyaltyApi/v0/wallet-projections",
            "/nodics/loyaltyApi/v0/reward-reservations",
            "/nodics/loyaltyApi/v0/reward-reservations/{reservationCode}/capture",
          ].map((key) => [key, {}]),
        ),
        "x-nodics": {
          activeModules: ["loyaltyRewardPayment", "loyaltyRewardProvider"],
        },
      };
      if (mode === "contract")
        delete result.paths["/nodics/checkoutCore/v0/checkouts/place"];
    } else if (route.includes("/wallets/")) {
      result = {
        ...wallet,
        ...(mode === "owner" ? { ownerCode: "someone-else" } : {}),
      };
    } else if (route.endsWith("/wallet-projections")) {
      projected++;
      result = {
        wallet,
        balances: [
          {
            walletCode: fixture.walletCode,
            programCode: fixture.programCode,
            rewardTypeCode: fixture.rewardTypeCode,
            available:
              mode === "unfunded"
                ? "0.00"
                : projected === 1
                  ? "100.00"
                  : mode === "balance"
                    ? "96.00"
                    : "95.00",
            reserved: "0.00",
            spent: projected === 1 ? "20.00" : "25.00",
          },
        ],
        entries:
          projected === 1
            ? []
            : ["RESERVE", "CAPTURE"].map((entryType) => ({
                code: entryType,
                entryType,
                walletCode: fixture.walletCode,
                programCode: fixture.programCode,
                rewardTypeCode: fixture.rewardTypeCode,
                targetCode:
                  mode === "correlation" ? "another-order" : orderCode,
                amount: mode === "ledger-amount" ? "1.00" : "5.00",
                reservationCode: "reservation-test",
                redemptionCode:
                  entryType === "CAPTURE" ? "redemption-test" : undefined,
              })),
      };
      if (mode === "context")
        result.balances[0].authData = { token: "must-not-leak" };
    } else if (route === "/nodics/cart/v0/carts") {
      result = { cart: { code: cartCode } };
    } else if (route.endsWith("/entries")) {
      result = {
        cart: { code: cartCode, revision: 1 },
        entries: [{ code: "entry", productCode: fixture.productCode }],
      };
    } else if (route.endsWith("/calculations")) {
      result = {
        totalAmount: mode === "over-limit" ? "50.00" : "5.00",
        currency: "GBP",
        entries: [
          {
            productCode: fixture.productCode,
            availability: { inventoryStrategy: "COUPON_CODE_POOL" },
          },
        ],
      };
    } else if (
      route.endsWith("/checkouts/place") ||
      route.includes("/checkouts/")
    ) {
      result = structuredClone(checkpoint);
      if (mode === "checkpoint") result.evidence.completed = ["AUTHORIZED"];
    } else if (route.includes("/orders/")) {
      result = {
        order: {
          code: orderCode,
          cartCode,
          evidence: {
            paymentMethod: "LOYALTY_REWARD",
            paymentProvider:
              mode === "provider" ? "wrong-provider" : fixture.providerCode,
          },
        },
      };
    } else if (route.endsWith("/entitlements")) {
      result = {
        entitlements: [
          {
            code: "entitlement-test",
            orderCode,
            productCode: fixture.productCode,
            ownerId:
              mode === "entitlement"
                ? "another-customer"
                : fixture.customerCode,
            status: "ACTIVE",
          },
        ],
      };
    } else throw new Error("Unexpected route " + route);
    return Response.json({ data: result });
  };
  return {
    calls,
    run: (overrides) =>
      runLoyaltyRewardCheckoutAcceptance({
        execute: true,
        fixture,
        configuration,
        environment,
        fetch,
        journeyId: "test",
        ...overrides,
      }),
  };
}

test("uses partner fixtures, scoped API credentials and exact balance deltas without claiming full storage acceptance", async () => {
  const { run, calls } = harness();
  const result = await run();
  assert.equal(result.status, "API_CHECKS_PASSED");
  assert.equal(result.fullAcceptance, false);
  assert.equal(result.evidenceGaps.length, 3);
  assert.equal(result.amount, "5.00");
  assert.deepEqual(result.ledgerCodes, ["RESERVE", "CAPTURE"]);
  assert.ok(
    calls
      .filter(
        (call) => call.role === "19002" && !call.route.endsWith("/openapi"),
      )
      .every((call) => call.headers.Authorization === "Bearer service-token"),
  );
  assert.ok(
    calls
      .filter(
        (call) => call.role === "19001" && !call.route.endsWith("/openapi"),
      )
      .every((call) => call.headers.Authorization === "Bearer customer-token"),
  );
  assert.ok(
    calls.every(
      (call) =>
        !/signup|reward-earnings|\/permissions|\/auth\/token/.test(call.route),
    ),
  );
  assert.ok(!JSON.stringify(result).includes("token"));
  assert.equal(
    calls.find((call) => call.route.endsWith("/checkouts/place")).body
      .programCode,
    "partner-program",
  );
});

test("execution and credential prerequisites reject before API activity", async () => {
  for (const overrides of [
    { execute: false },
    {
      environment: {
        ...environment,
        NODICS_LOYALTY_ACCEPTANCE_SERVICE_TOKEN: "",
      },
    },
    { fixture: { ...fixture, maximumRewardAmount: "0" } },
  ]) {
    const { run, calls } = harness();
    await assert.rejects(run(overrides));
    assert.equal(calls.length, 0);
  }
});

for (const [mode, pattern] of [
  ["denied", /HTTP 403/],
  ["checkout-denied", /HTTP 403/],
  ["contract", /contract is missing/],
  ["owner", /wallet is missing or mismatched/],
  ["unfunded", /fund the test wallet/],
  ["balance", /balance delta/],
  ["correlation", /ledger entries/],
  ["ledger-amount", /Ledger amount/],
  ["context", /forbidden request context/],
  ["checkpoint", /PAYMENT_CAPTURED/],
  ["provider", /Order payment evidence/],
  ["entitlement", /entitlement is missing/],
  ["over-limit", /spending limit/],
])
  test(
    "rejects " + mode + " without suppressing errors or repairing authority",
    async () => {
      const { run, calls } = harness(mode);
      await assert.rejects(run(), pattern);
      if (["denied", "owner", "contract", "unfunded", "context"].includes(mode))
        assert.ok(
          !calls.some((call) => call.route === "/nodics/cart/v0/carts"),
        );
      if (mode === "over-limit")
        assert.ok(
          !calls.some((call) => call.route.endsWith("/checkouts/place")),
        );
    },
  );

test("module import and CLI help are inert without project configuration or credentials", () => {
  const file = fileURLToPath(
    new URL(
      "../src/service/acceptance/defaultLoyaltyRewardCheckoutAcceptanceService.mjs",
      import.meta.url,
    ),
  );
  const imported = execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `globalThis.fetch = () => { throw new Error('network forbidden'); }; await import(${JSON.stringify(file)});`,
    ],
    { cwd: "/tmp", encoding: "utf8" },
  );
  assert.equal(imported, "");
  const help = execFileSync(process.execPath, [file, "--help"], {
    cwd: "/tmp",
    encoding: "utf8",
  });
  assert.match(help, /--execute/);
  assert.match(help, /exit 2/);
});
