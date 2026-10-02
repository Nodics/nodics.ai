/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module commsCore/test/communicationPrivateWorkerDelivery @description Deferred exact-private non-HTTP worker entry fixtures; not run and not external capture certification. @owner commsCore @layer test */
const test = require("node:test"),
  assert = require("node:assert/strict");
const runtime = require("../src/service/defaultCommunicationRuntimeService");
function fixture(t, qualified = true) {
  const previous = global.SERVICE,
    admitted = new WeakSet();
  t.after(() => {
    global.SERVICE = previous;
  });
  global.SERVICE = {
    DefaultLoggerService: {
      runSensitiveOperation: async (request, operation) => {
        if (!qualified) throw new Error("external capture unqualified");
        admitted.add(request);
        return operation();
      },
      assertSensitiveRequest: (request) => assert(admitted.has(request)),
    },
  };
  return { owner: { ...runtime }, admitted };
}
test("non-HTTP delivery fails before private storage reads when unqualified", async (t) => {
  const f = fixture(t, false);
  let reads = 0;
  f.owner.read = async () => {
    reads++;
  };
  await assert.rejects(
    f.owner.deliver({ tenant: "tenant" }, "COMM_original"),
    /COMMUNICATION_PRIVATE_DELIVERY_UNCONFIRMED/,
  );
  assert.equal(reads, 0);
});
test("worker is detached, admitted before reading and keeps enterprise routing without browser data", async (t) => {
  const f = fixture(t),
    input = {
      tenant: "tenant",
      authData: { tenant: "tenant", entCode: "enterprise" },
      body: { secret: "do not copy" },
    };
  f.owner.deliverPrivate = async (request) => {
    assert(f.admitted.has(request));
    assert.notEqual(request, input);
    assert.equal(request.body, undefined);
    assert.equal(request.entCode, "enterprise");
    return { status: "DELIVERED" };
  };
  assert.deepEqual(await f.owner.deliver(input, "COMM_original"), {
    status: "DELIVERED",
  });
});
test("direct unprotected private helper rejects before reads and worker errors are fixed", async (t) => {
  const f = fixture(t);
  let reads = 0;
  f.owner.read = async () => {
    reads++;
    throw Object.assign(new Error("address and rendered secret"), {
      errInfo: "private",
    });
  };
  await assert.rejects(
    f.owner.deliverPrivate({ tenant: "tenant" }, "COMM_original"),
  );
  assert.equal(reads, 0);
  await assert.rejects(
    f.owner.deliver({ tenant: "tenant" }, "COMM_original"),
    (error) =>
      error.message === "COMMUNICATION_PRIVATE_DELIVERY_UNCONFIRMED" &&
      !error.cause &&
      !error.errInfo,
  );
});
