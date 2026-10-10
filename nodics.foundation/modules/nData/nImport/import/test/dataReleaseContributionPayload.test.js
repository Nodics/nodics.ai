/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module import/test/dataReleaseContributionPayload @description Verifies owner-qualified detached JSON, byte integrity, containment and bounded failures with an independent partner. @layer test @owner import */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const base = require("../src/service/release/defaultDataReleaseService");

function fixture(t) {
  const previous = { CONFIG: global.CONFIG, NODICS: global.NODICS, SERVICE: global.SERVICE };
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "nodics-partner-payload-"));
  t.after(() => {
    fs.rmSync(root, { recursive: true, force: true });
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete global[key];
      else global[key] = value;
    }
  });
  const owner = { name: "partner.orders", path: path.join(root, "owner"), index: "90.1" };
  const source = path.join(owner.path, "data/init-v001");
  fs.mkdirSync(path.join(source, "records"), { recursive: true });
  const payload = path.join(source, "records/receipt.json");
  const other = path.join(source, "records/other.js");
  fs.writeFileSync(payload, JSON.stringify({ records: [{ code: "partner-first", quantity: 3 }] }));
  fs.writeFileSync(other, "throw new Error('JSON reader must not execute JavaScript');\n");
  const section = {
    kind: "DATA_RELEASE", dataType: "init", version: "1.0.0", sourceRoot: "init-v001",
    installer: "PARTNER_RECEIPT", owningDomain: "partner.orders", lifecycle: "OPERATIONAL_VERSIONED",
    destinationRole: "COMMERCE", environmentScope: ["LOCAL"], sensitivity: "INTERNAL",
    versioningPolicy: "IMMUTABLE", publicationPolicy: "NONE", initialPublicationPolicy: "NONE",
    removalPolicy: "RETAIN", files: {},
  };
  const manifest = { contractVersion: 2, module: owner.name, sections: { firstReceipt: section } };
  const save = () => {
    section.files = Object.fromEntries(fs.readdirSync(path.join(source, "records")).map((name) => {
      const relative = "init-v001/records/" + name;
      return [relative, crypto.createHash("sha256").update(fs.readFileSync(path.join(owner.path, "data", relative))).digest("hex")];
    }));
    writeManifest();
  };
  const writeManifest = () => fs.writeFileSync(path.join(owner.path, "data/manifest.json"), JSON.stringify(manifest));
  save();
  const policy = {
    allowedContractVersions: [2], lifecycleMetadataRequired: true, destinationEnforced: true,
    contributions: [{ moduleName: owner.name, sections: ["firstReceipt"] }],
    installers: { PARTNER_RECEIPT: "PartnerReceiptService" },
    maximumContributionBytes: 8192, maximumContributionPayloadBytes: 1024,
  };
  const context = { runtimeRole: { code: "COMMERCE" }, environment: { class: "LOCAL" } };
  global.CONFIG = { get: (name) => name === "data" ? { dataReleases: policy } : context[name] };
  global.NODICS = { getActiveModules: () => [], getRawModule: (name) => name === owner.name ? owner : undefined };
  global.SERVICE = {};
  const service = Object.create(base);
  const discover = () => service.discoverReleases("init")[0];
  const contribution = discover();
  assert.equal(contribution.invalidManifest, undefined);
  const read = (metadata = contribution, installer = "PARTNER_RECEIPT", name = "receipt.json") =>
    service.readContributionPayload(metadata, installer, name);
  const rejects = (promise) => assert.rejects(promise, (error) => {
    assert.equal(error.code, "ERR_IMP_00003");
    assert.equal(error.message, "Contribution payload is invalid, unavailable or changed");
    assert(!error.message.includes(root));
    return true;
  });
  return { root, owner, source, payload, other, policy, context, section, manifest, save, writeManifest,
    service, discover, contribution, read, rejects };
}

test("independent inactive partner returns detached JSON without running an installer or JavaScript", async (t) => {
  const f = fixture(t);
  const first = await f.read();
  first.records[0].quantity = 999;
  assert.deepEqual(await f.read(), { records: [{ code: "partner-first", quantity: 3 }] });
  assert.deepEqual(await f.read({ ...f.contribution, declaredFiles: ["../../untrusted.json"], path: "/untrusted" }),
    { records: [{ code: "partner-first", quantity: 3 }] });
  assert.deepEqual(await f.read(f.service.publicRelease(f.contribution)), await f.read());
});

test("forged exact metadata, installer, basename and destination/environment refuse", async (t) => {
  const f = fixture(t);
  for (const [key, value] of Object.entries({ releaseCode: "partner.orders:other", moduleName: "missing",
    sectionCode: "other", dataType: "core", version: "9.0.0", checksum: "f".repeat(64),
    installer: "OTHER_INSTALLER", destinationRole: "PROCESS", environmentScope: ["ALL"], sourceRoot: "../outside",
    lifecycle: "REFERENCE", selectionPolicy: "EXPLICIT", owningDomain: "other.owner" })) {
    await f.rejects(f.read({ ...f.contribution, [key]: value }));
  }
  for (const name of ["../receipt.json", "/tmp/receipt.json", "https://host/receipt.json", "records/receipt.json", "receipt.js", "records\\receipt.json"]) {
    await f.rejects(f.read(f.contribution, "PARTNER_RECEIPT", name));
  }
  await f.rejects(f.read(f.contribution, "OTHER_INSTALLER"));
  f.context.runtimeRole.code = "PROCESS";
  await f.rejects(f.read());
  f.context.runtimeRole.code = "COMMERCE";
  f.context.environment.class = "PRODUCTION";
  await f.rejects(f.read());
});

test("removed qualification, duplicate release identity and a non-DATA_RELEASE refuse", async (t) => {
  const f = fixture(t);
  f.policy.contributions = [];
  await f.rejects(f.read());
  f.policy.contributions = [{ moduleName: f.owner.name, sections: ["firstReceipt"] }];
  const discover = f.service.discoverReleases.bind(f.service);
  f.service.discoverReleases = (type) => [...discover(type), ...discover(type)];
  await f.rejects(f.read());
  f.service.discoverReleases = discover;
  f.section.kind = "CONTENT_PACK";
  f.writeManifest();
  await f.rejects(f.read());
});

test("changed payload or other declared bytes invalidate the exact release checksum", async (t) => {
  const f = fixture(t);
  const original = fs.readFileSync(f.payload);
  fs.writeFileSync(f.payload, '{"records":[]}');
  await f.rejects(f.read());
  fs.writeFileSync(f.payload, original);
  fs.writeFileSync(f.other, "changed bytes");
  await f.rejects(f.read());
});

test("byte and manifest drift between discovery and parsing refuse", async (t) => {
  const f = fixture(t);
  const discover = f.service.discoverReleases.bind(f.service);
  f.service.discoverReleases = (type) => {
    const releases = discover(type);
    fs.writeFileSync(f.other, "changed after discovery");
    return releases;
  };
  await f.rejects(f.read());
  f.service.discoverReleases = discover;
  f.save();
  const fresh = f.discover();
  f.service.discoverReleases = (type) => {
    const releases = discover(type);
    f.section.version = "2.0.0";
    f.writeManifest();
    return releases;
  };
  await f.rejects(f.read(fresh));
});

for (const boundary of ["file", "directory", "sourceRoot", "data", "manifest"]) {
  test("rejects selected " + boundary + " symlink without following it", async (t) => {
    const f = fixture(t);
    const target = boundary === "file" ? f.payload : boundary === "directory" ? path.dirname(f.payload) :
      boundary === "sourceRoot" ? f.source : boundary === "data" ? path.join(f.owner.path, "data") :
        path.join(f.owner.path, "data/manifest.json");
    const moved = path.join(f.root, "external");
    fs.renameSync(target, moved);
    fs.symlinkSync(moved, target);
    let discoveries = 0;
    f.service.discoverReleases = () => { discoveries++; return [f.contribution]; };
    await f.rejects(f.read());
    assert.equal(discoveries, ["file", "directory"].includes(boundary) ? 1 : 0);
  });
}

test("traversal and missing declared files refuse even when discovery ignores them", async (t) => {
  const f = fixture(t);
  for (const name of ["../outside.json", "init-v001/../outside.json", "init-v001/records/missing.json"]) {
    f.section.files[name] = "a".repeat(64);
    f.writeManifest();
    await f.rejects(f.read());
    delete f.section.files[name];
  }
});

test("missing, undeclared or ambiguous payload basename refuses", async (t) => {
  const f = fixture(t);
  await f.rejects(f.read(f.contribution, "PARTNER_RECEIPT", "missing.json"));
  delete f.section.files["init-v001/records/receipt.json"];
  f.writeManifest();
  await f.rejects(f.read(f.discover()));
  f.save();
  fs.mkdirSync(path.join(f.source, "nested"));
  fs.writeFileSync(path.join(f.source, "nested/receipt.json"), "{}");
  f.section.files["init-v001/nested/receipt.json"] = crypto.createHash("sha256").update("{}").digest("hex");
  f.writeManifest();
  await f.rejects(f.read(f.discover()));
});

test("malformed JSON has a bounded error with no parser fragments", async (t) => {
  const f = fixture(t);
  fs.writeFileSync(f.payload, '{"privateSecret":"do-not-disclose", broken}');
  f.save();
  await f.rejects(f.read(f.discover()));
});

test("payload and whole source sizes are bounded and later policy can tighten or extend them", async (t) => {
  const f = fixture(t);
  f.policy.maximumContributionPayloadBytes = 8;
  await f.rejects(f.read());
  f.policy.maximumContributionPayloadBytes = 2048;
  assert.equal((await f.read()).records[0].quantity, 3);
  f.policy.maximumContributionBytes = 32;
  await f.rejects(f.read());
  f.policy.maximumContributionBytes = -1;
  await f.rejects(f.read());
});

test("default byte limits admit a 200 KB partner payload and reject a file larger than 1 MiB", async (t) => {
  const f = fixture(t);
  delete f.policy.maximumContributionPayloadBytes;
  delete f.policy.maximumContributionBytes;
  const content = { records: [{ code: "partner-physical-variant", detail: "x".repeat(200 * 1024) }] };
  fs.writeFileSync(f.payload, JSON.stringify(content));
  f.save();
  assert.deepEqual(await f.read(f.discover()), content);
  fs.writeFileSync(f.payload, JSON.stringify({ detail: "x".repeat(1024 * 1024) }));
  f.save();
  await f.rejects(f.read(f.discover()));
});

test("selected JSON remains readable beside unrelated assets exceeding per-file and total byte limits", async (t) => {
  const f = fixture(t);
  delete f.policy.maximumContributionPayloadBytes;
  delete f.policy.maximumContributionBytes;
  fs.unlinkSync(f.other);
  f.save();
  fs.mkdirSync(path.join(f.source, "assets"));
  fs.writeFileSync(path.join(f.source, "assets/unrelated-large.bin"), Buffer.alloc(9 * 1024 * 1024));
  const original = f.service.contributionSourceSnapshot.bind(f.service);
  const captured = [];
  f.service.contributionSourceSnapshot = (owner, sourceRoot, files) => {
    captured.push(files.slice());
    return original(owner, sourceRoot, files);
  };
  const fresh = f.discover();
  assert.deepEqual(fresh.declaredFiles, ["init-v001/records/receipt.json"]);
  assert.deepEqual(await f.read(fresh), { records: [{ code: "partner-first", quantity: 3 }] });
  assert(captured.every((files) => !files.some((name) => name.includes("unrelated-large"))));
  assert.deepEqual(captured, [[], fresh.declaredFiles, fresh.declaredFiles]);
});
