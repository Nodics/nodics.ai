/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module elastic/test/isolatedRetirementProvider
 * @description Owns disposable loopback Elasticsearch setup and native retirement acceptance operations. Never connects to a shared index or changes an installed configuration.
 * @layer test @owner elastic
 */
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const net = require("node:net");
const crypto = require("node:crypto");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const { setTimeout: delay } = require("node:timers/promises");
const { Client } = require("@elastic/elasticsearch");
const bcrypt = require("bcryptjs");
const modelDefinition = require("../../src/schemas/elasticSearchModel").default;

/** Allocates a loopback test port. @returns {Promise<number>} Released ephemeral port. */
async function port() {
  const server = net.createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const value = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return value;
}

/** Starts one owned secure node from an explicitly selected installed distribution. @returns {Promise<Object>} Provider fixture with mandatory close. */
async function start() {
  const home = process.env.NODICS_ERASURE_ES_HOME;
  if (!home || !path.isAbsolute(home))
    throw new Error("An absolute installed Elasticsearch home is required");
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "nodics-erasure-es-"));
  const config = path.join(root, "config");
  await fs.mkdir(config);
  await fs.mkdir(path.join(config, "jvm.options.d"));
  for (const file of ["jvm.options", "log4j2.properties"])
    await fs.copyFile(path.join(home, "config", file), path.join(config, file));
  const username = "erasure_acceptance";
  const password = crypto.randomBytes(24).toString("hex");
  await fs.writeFile(
    path.join(config, "users"),
    `${username}:${bcrypt.hashSync(password, 10)}\n`,
    { mode: 0o600 },
  );
  await fs.writeFile(
    path.join(config, "users_roles"),
    `superuser:${username}\n`,
    { mode: 0o600 },
  );
  for (const file of ["roles.yml", "role_mapping.yml"])
    await fs.writeFile(path.join(config, file), "", { mode: 0o600 });
  const httpPort = await port();
  const transportPort = await port();
  const settings = {
    "cluster.name": path.basename(root),
    "node.name": "erasure-test",
    "path.data": path.join(root, "data"),
    "path.logs": path.join(root, "logs"),
    "network.host": "127.0.0.1",
    "http.port": httpPort,
    "transport.port": transportPort,
    "discovery.type": "single-node",
    "xpack.security.enabled": true,
    "xpack.security.authc.api_key.enabled": true,
    "xpack.security.http.ssl.enabled": false,
    "xpack.security.transport.ssl.enabled": false,
    "xpack.ml.enabled": false,
    "ingest.geoip.downloader.enabled": false,
    "action.auto_create_index": false,
  };
  await fs.writeFile(
    path.join(config, "elasticsearch.yml"),
    JSON.stringify(settings),
    { mode: 0o600 },
  );
  const child = spawn(path.join(home, "bin/elasticsearch"), [], {
    env: {
      ...process.env,
      ES_PATH_CONF: config,
      ES_JAVA_OPTS: "-Xms256m -Xmx256m",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  for (const stream of [child.stdout, child.stderr])
    stream.on("data", (bytes) => {
      output = (output + bytes).slice(-16000);
    });
  const exited = once(child, "exit");
  const client = new Client({
    node: `http://127.0.0.1:${httpPort}`,
    auth: { username, password },
    maxRetries: 0,
    requestTimeout: 5000,
  });
  let closed = false;
  /** Stops only the spawned process, then removes only its generated directory. */
  async function close() {
    if (closed) return;
    closed = true;
    await client.close();
    if (child.exitCode === null && child.signalCode === null)
      child.kill("SIGTERM");
    await exited;
    await fs.rm(root, { recursive: true, force: true });
  }
  try {
    let ready = false;
    for (let attempt = 0; attempt < 120; attempt++) {
      if (child.exitCode !== null)
        throw new Error("Isolated Elasticsearch exited: " + output);
      try {
        await client.cluster.health({
          wait_for_status: "yellow",
          timeout: "1s",
        });
        ready = true;
        break;
      } catch {}
      await delay(500);
    }
    if (!ready) throw new Error("Isolated Elasticsearch not ready: " + output);
    const info = await client.info();
    return {
      version: info.version.number,
      resources: Object.freeze({
        root,
        pid: child.pid,
        httpPort,
        transportPort,
        clusterName: settings["cluster.name"],
      }),
      close,
      /** Transfers ephemeral fixture-only credentials over private test IPC, never UI or logs. */
      inspectionInput: function (model) {
        return {
          node: `http://127.0.0.1:${httpPort}`,
          auth: { username, password },
          clusterName: settings["cluster.name"],
          indexDef: model.indexDef,
        };
      },
      /** Creates one owned target and replacement; no existing index selector is accepted. */
      createTarget: async function (scope) {
        const prefix = "erasure-" + crypto.randomUUID();
        const legacy = prefix + "-legacy";
        const replacement = prefix + "-replacement";
        for (const index of [legacy, replacement])
          await client.indices.create({
            index,
            settings: { number_of_shards: 1, number_of_replicas: 0 },
          });
        const key = await client.security.createApiKey({
          name: prefix,
          role_descriptors: {
            writer: {
              cluster: [],
              indices: [{ names: [legacy], privileges: ["write"] }],
            },
          },
        });
        const writer = new Client({
          node: `http://127.0.0.1:${httpPort}`,
          auth: {
            apiKey: Buffer.from(`${key.id}:${key.api_key}`).toString("base64"),
          },
          maxRetries: 0,
        });
        await writer.index({
          index: legacy,
          id: "sample",
          document: { content: "Disposable acceptance evidence" },
          refresh: true,
        });
        await client.index({
          index: replacement,
          id: "sample",
          document: { content: "Disposable acceptance evidence" },
          refresh: true,
        });
        const model = {
          indexDef: {
            indexName: legacy,
            retirement: {
              dedicated: true,
              immutablePhysicalName: true,
              ...scope,
              erasure: {
                writerInventoryComplete: true,
                writerCredentialMode: "API_KEY_ONLY",
                writerApiKeyIds: [key.id],
              },
            },
          },
          searchEngine: { getConnection: () => client },
        };
        modelDefinition.defineDefaultIndexRetirement(model);
        const created = await client.indices.get({
          index: legacy,
          flat_settings: true,
        });
        return {
          model,
          identity: Object.freeze({
            physicalName: legacy,
            uuid: created[legacy].settings["index.uuid"],
            sentinel: replacement,
          }),
          /** Simulates prohibited name reuse only on the fixture-created index, to test refusal of its new UUID. */
          recreate: async function () {
            await client.indices.delete({ index: legacy });
            await client.indices.create({
              index: legacy,
              settings: { number_of_shards: 1, number_of_replicas: 0 },
            });
            await client.indices.addBlock({ index: legacy, block: "write" });
          },
          /** Reads only this fixture's exact native identity; no runtime service globals are required. */
          inspectIdentity: async function () {
            const current = await client.indices.get({
              index: legacy,
              flat_settings: true,
            });
            return {
              uuid: current[legacy].settings["index.uuid"],
              blocked:
                current[legacy].settings["index.blocks.write"] === "true",
            };
          },
          /** Revokes only the fixture-created writer and verifies actual rejected writes. */
          revoke: async function () {
            const result = await client.security.invalidateApiKey({
              ids: [key.id],
            });
            if (!result.invalidated_api_keys.includes(key.id))
              throw new Error("Fixture writer revocation unacknowledged");
            try {
              await writer.index({
                index: legacy,
                id: "late",
                document: { forbidden: true },
              });
              throw new Error("Revoked writer accepted");
            } catch (error) {
              if (error.meta?.statusCode !== 401) throw error;
            } finally {
              await writer.close();
            }
          },
          /** Uses real physical count and UUID as the test owner's replacement evidence. */
          replacementEvidence: async function () {
            const count = await client.count({ index: replacement });
            if (count.count !== 1) throw new Error("Replacement incomplete");
            const data = await client.indices.get({
              index: replacement,
              flat_settings: true,
            });
            return [
              {
                uuid: data[replacement].settings["index.uuid"],
                count: count.count,
              },
            ];
          },
          /** Injects loss after the actual native delete, before the provider sees acknowledgement. */
          loseDeleteAcknowledgement: function () {
            const original = client.indices.delete.bind(client.indices);
            client.indices.delete = async (...args) => {
              const result = await original(...args);
              if (args[0].index === legacy)
                throw new Error("Injected native acknowledgement loss");
              return result;
            };
          },
        };
      },
    };
  } catch (error) {
    await close();
    throw error;
  }
}
/** Reopens an explicitly identified disposable node in an independent inspection process. @param {Object} input Parent fixture's private IPC binding. @returns {Promise<Object>} Registered model and close. */
async function openInspection(input) {
  const url = new URL(input.node);
  if (
    url.protocol !== "http:" ||
    url.hostname !== "127.0.0.1" ||
    !input.clusterName.startsWith("nodics-erasure-es-")
  )
    throw new Error("Disposable loopback provider required");
  const client = new Client({
    node: input.node,
    auth: input.auth,
    maxRetries: 0,
  });
  try {
    const info = await client.info();
    if (info.cluster_name !== input.clusterName)
      throw new Error("Wrong disposable cluster");
    const model = {
      indexDef: input.indexDef,
      searchEngine: { getConnection: () => client },
    };
    modelDefinition.defineDefaultIndexRetirement(model);
    return { model, close: () => client.close() };
  } catch (error) {
    await client.close();
    throw error;
  }
}
module.exports = { start, openInspection };
