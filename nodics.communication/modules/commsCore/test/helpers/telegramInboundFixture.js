/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module commsCore/test/helpers/telegramInboundFixture @description Isolated private HTTP and generated persistence fixture using real insert-only/majority adapter owners and an in-memory driver. @owner commsCore @layer test @override Faults stay at the driver boundary; no live database or network. */
const assert = require("node:assert/strict");
const logger = require("../../../../../nodics.foundation/modules/nConfig/src/service/DefaultLoggerService");
const router = require("../../../../../nodics.foundation/modules/nRouter/src/service/router/defaultRouterOperationService");
const save = require("../../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService");
const get = require("../../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService");
const mongo = require("../../../../../nodics.foundation/modules/nDatabase/mongodb/src/schemas/model").default;
const schema = require("../../../commsSchema/src/schemas/schemas").commsSchema.commsTelegramUpdate;
const route = require("../../../commsApi/src/router/routers").commsApi.integration.receiveTelegramStart;

/** Installs synthetic runtime globals and restores them at test completion. @param {Object} t Node test context. @returns {Object} Driver faults, receipt map, configuration and admitted HTTP factory. */
module.exports = function fixture(t) {
  const keys = ["SERVICE", "CONFIG", "NODICS", "CLASSES", "UTILS", "CONTROLLER"];
  const prior = keys.map((key) => [key, Object.getOwnPropertyDescriptor(global, key)]);
  t.after(() => { for (const [key, descriptor] of prior) { if (descriptor) Object.defineProperty(global, key, descriptor); else delete global[key]; } });
  const policy = {
    ...require("../../config/properties").communication.telegramInbound,
    enabled: true,
    receivers: {
      first: { enabled: true, tenant: "tenant-a", applicationSubject: "123456", botUsername: "ExampleBot", miniAppUrl: "https://mini.example.test/app", webhookSecretReferences: ["telegram.test.current"] },
      second: { enabled: true, tenant: "tenant-b", applicationSubject: "987654", botUsername: "SecondBot", miniAppUrl: "https://other.example.test/app", webhookSecretReferences: ["telegram.other.current"] },
    },
  };
  const secret = "synthetic_telegram_secret_1234567890";
  const credentials = { "telegram.test.current": { value: secret }, "telegram.test.previous": { value: "synthetic_previous_secret_1234567890" }, "telegram.other.current": { value: "synthetic_other_secret_1234567890" } };
  const privacy = { qualified: true, captureMode: "disabled" };
  const exposure = { categories: { communicationTelegramInbound: { enabled: true } } };
  const rows = new Map(), calls = [], faults = {};
  global.CONFIG = { get: (key) => ({ communication: { telegramInbound: policy }, apiExposure: exposure, runtimeConfiguration: { credentials }, log: { requestPrivacy: privacy }, bodyParserHandler: { telegramInboundBodyParserHandler: "DefaultTelegramInboundBodyParserHandlerService" }, responseHandler: { jsonResponseHandler: "DefaultJsonResponseHandlerService" } })[key] };
  global.NODICS = { getActiveTenants: () => ["tenant-a", "tenant-b"], getRouter: () => route };
  global.UTILS = { generateUniqueCode: () => "synthetic-request", isBlank: require("lodash").isEmpty, isObject: require("lodash").isPlainObject, isArray: Array.isArray };
  global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
  global.SERVICE = {
    DefaultLoggerService: logger,
    DefaultCommunicationCoreService: require("../../src/service/defaultCommunicationCoreService"),
    DefaultCommunicationRuntimeService: require("../../src/service/defaultCommunicationRuntimeService"),
    DefaultTelegramCommunicationProviderService: require("../../src/service/defaultTelegramCommunicationProviderService"),
    DefaultTelegramInboundService: require("../../src/service/defaultTelegramInboundService"),
    DefaultTelegramInboundBodyParserHandlerService: require("../../../commsApi/src/service/defaultTelegramInboundBodyParserHandlerService"),
    DefaultJsonBodyParserHandlerService: require("../../../../../nodics.foundation/modules/nRouter/src/service/handlers/parser/defaultJsonBodyParserHandlerService"),
    DefaultRouterOperationService: router,
    DefaultJsonResponseHandlerService: require("../../../../../nodics.foundation/modules/nRouter/src/service/handlers/response/defaultJsonResponseHandlerService"),
    DefaultModelValidatorService: { validateMandate: async () => {}, validateDataType: async () => {} },
    DefaultStatusService: { get: (code) => require("../../../commsApi/src/utils/statusDefinitions")[code] || { code: "500", message: "Request failed" } },
  };
  global.CONTROLLER = { DefaultCommunicationApiController: require("../../../commsApi/src/controller/defaultCommunicationApiController") };
  const model = (tenant) => ({
    ...mongo, rawSchema: schema,
    dataBase: { getOptions: () => ({}), getCapabilities: () => ({ persistence: { contractVersion: 1, durableJournal: faults.unsupported !== true, primaryMajorityReadback: true } }) },
    insertOne: async (record, options) => {
      calls.push({ kind: "insert", tenant, record: structuredClone(record), options });
      if (faults.beforeInsert) await faults.beforeInsert(record);
      const key = tenant + ":" + record.code;
      if (rows.has(key)) throw Object.assign(new Error("private driver duplicate"), { code: 11000 });
      if (faults.noWrite) return { acknowledged: false };
      rows.set(key, structuredClone(record));
      if (faults.afterInsert) faults.afterInsert(rows.get(key));
      if (faults.lostAck) throw new Error("private driver lost acknowledgment");
      return { acknowledged: true, insertedId: record.code };
    },
    find: (query, options) => {
      calls.push({ kind: "read", tenant, query, options });
      if (faults.readError) throw new Error("private driver read failure");
      return [...rows.values()].filter((row) => row.tenant === tenant && row.code === query.code && row.tenant === query.tenant).map((row) => structuredClone(row));
    },
    countDocuments: async (query) => [...rows.values()].filter((row) => row.tenant === tenant && row.code === query.code && row.tenant === query.tenant).length,
    cursorToArray: async (values) => values,
  });
  SERVICE.DefaultCommsTelegramUpdateService = {
    save: async (input) => {
      logger.assertSensitiveRequest(input);
      assert.equal(input.authData.groups.includes("serviceAccountUserGroup"), true);
      const result = await save.persistModel({ ...input, schemaModel: model(input.tenant) });
      return { code: "SUC_FIXTURE_SAVE", result };
    },
    get: async (input) => {
      logger.assertSensitiveRequest(input);
      const request = { ...input, schemaModel: model(input.tenant) };
      const reader = { ...get, LOG: { debug() {} } };
      await new Promise((resolve, reject) => reader.buildOptions(request, {}, { nextSuccess: resolve, error: (req, res, error) => reject(error) }));
      return { code: "SUC_FIXTURE_GET", ...(await reader.readItems(request)) };
    },
  };
  const response = () => ({ status(value) { this.httpStatus = value; return this; }, json(value) { this.data = value; return this; }, setHeader(name, value) { (this.headers ||= {})[name] = value; }, type(value) { this.contentType = value; return this; } });
  const admit = (http) => {
    logger.runRequestPrivacy(http, () => router.privacyMiddleware(route)(http, response(), () => {}));
    return http;
  };
  const http = (body, receiverCode = "first", token = secret) => admit({ method: "POST", params: { receiverCode }, originalUrl: "/nodics/commsApi/v0/integrations/telegram/" + receiverCode + "/start", headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": token }, body, get(name) { return this.headers[name.toLowerCase()]; } });
  const update = (id = 1) => ({ update_id: id, message: { message_id: 42, date: 1800000000, from: { id: 123, is_bot: false }, chat: { id: 123, type: "private" }, text: "/start", entities: [{ type: "bot_command", offset: 0, length: 6 }] } });
  return { policy, credentials, privacy, exposure, rows, calls, faults, http, admit, update, response, route, secret, logger, owner: SERVICE.DefaultTelegramInboundService };
};
