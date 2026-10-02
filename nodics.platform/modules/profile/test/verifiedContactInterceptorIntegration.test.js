/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/test/verifiedContactInterceptorIntegration @description Deferred actual Profile hook dispatch and Contact/association guard integration with controlled provider fixtures; not installed concurrency, cache or provider privacy qualification. @owner profile @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const source = require("../src/service/interceptors/defaultProfileVerifiedContactInterceptorService");
const contactSource = require("../src/service/contact/defaultProfileVerifiedContactService");
const hooks = require("../src/interceptors/interceptors");
const savePipeline = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService");
const updatePipeline = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService");
const getPipeline = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService");
const mongo =
  require("../../../../nodics.foundation/modules/nDatabase/mongodb/src/schemas/model").default;
const concurrency = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelConcurrencyService");

function fixture() {
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  global.CONFIG = { get: () => ({ enabled: false, qualified: false }) };
  const queries = [],
    protectedContact = {
      code: "protected",
      profileVerifiedContact: { revision: 1 },
    };
  const owner = {
    ...contactSource,
    records: async (service, tenant, query, limit) => {
      queries.push({ service, tenant, query, limit });
      if (service === "DefaultContactService") {
        if (
          query.code?.$in?.includes("protected") ||
          JSON.stringify(query).includes('"protected"')
        )
          return [protectedContact];
        return [];
      }
      return [{ code: "original", contacts: ["protected"] }];
    },
  };
  global.SERVICE = {
    DefaultProfileVerifiedContactService: owner,
    DefaultCustomerEligibilityDecisionGovernanceService: {
      protectRead: () => true,
      redactDecision: () => true,
    },
    DefaultCanonicalHistoricalIdentityLinkService: {
      redactRetirement: () => true,
    },
    DefaultEnterpriseTeamAdministrationService: {
      redactEnterprise: () => true,
    },
    DefaultProfileVerifiedContactInterceptorService: { ...source },
    DefaultModelConcurrencyService: { ...concurrency },
    DefaultEnterpriseMembershipService: { recordId: (value) => String(value) },
    DefaultDatabaseConfigurationService: {
      getSchemaInterceptors: (schema) => {
        const result = {};
        for (const value of Object.values(hooks).filter(
          (value) =>
            value.item === schema &&
            value.handler?.startsWith(
              "DefaultProfileVerifiedContactInterceptorService.",
            ),
        ))
          (result[value.trigger] ||= []).push(value);
        return result;
      },
    },
    DefaultInterceptorService: {
      executeInterceptors: async (list, request, response) => {
        for (const hook of list.sort((a, b) => a.index - b.index)) {
          const [service, method] = hook.handler.split(".");
          await SERVICE[service][method](request, response);
        }
        return true;
      },
    },
  };
  const request = (schema, fields = {}) => ({
    tenant: "original",
    schemaModel: {
      schemaName: schema,
      rawSchema: {},
      saveItems: mongo.saveItems,
    },
    ...fields,
  });
  const run = (pipeline, method, command, response = {}) =>
    new Promise((resolve, reject) => {
      pipeline[method].call(
        {
          ...pipeline,
          LOG: { debug: () => {} },
          getSchemaLineage: () => [command.schemaModel.schemaName],
        },
        command,
        response,
        {
          nextSuccess: () => resolve(response),
          error: (_request, _response, error) => reject(error),
        },
      );
    });
  return { owner, queries, request, run };
}

test("exact appended Contact hooks exist only for real generated lifecycle triggers", () => {
  for (const schema of ["contact", "customer", "employee"]) {
    const selected = Object.values(hooks).filter(
      (value) =>
        value.item === schema &&
        value.handler?.startsWith(
          "DefaultProfileVerifiedContactInterceptorService.",
        ),
    );
    assert.deepEqual(selected.map((value) => value.trigger).sort(), [
      "postGet",
      "preGet",
      "preRemove",
      "preSave",
      "preUpdate",
    ]);
    assert(selected.every((value) => value.active === "true"));
    assert(
      selected.every(
        (value) => typeof source[value.handler.split(".")[1]] === "function",
      ),
    );
  }
});

test("actual generated preSave permits unmarked no-query insert and real Mongo insert branch", async () => {
  const f = fixture(),
    command = f.request("contact", {
      query: {},
      model: { code: "ordinary", value: "ordinary@example.test" },
    });
  await f.run(savePipeline, "applyPreInterceptors", command);
  assert.equal(command.query, undefined);
  let inserted = 0;
  SERVICE.DefaultModelValidatorService = {
    validateMandate: async () => true,
    validateDataType: async () => true,
  };
  const provider = {
    ...mongo,
    normalizeModelForWrite: (value) => value,
    transactionOptions: () => ({}),
    rawSchema: {},
    insertOne: async () => {
      inserted++;
      return { acknowledged: true, insertedId: "new-id" };
    },
  };
  await provider.saveItems(command);
  assert.equal(inserted, 1);
});

test("save operation cannot be upgraded to INSERT using body flags or managed/upsert paths", async () => {
  const f = fixture();
  for (const fields of [
    { query: { code: "protected" } },
    {
      options: { upsert: true },
      model: { code: "protected", operation: "INSERT" },
    },
  ]) {
    const command = f.request("contact", {
      model: { code: "protected", operation: "INSERT" },
      ...fields,
    });
    await assert.rejects(
      f.run(savePipeline, "applyPreInterceptors", command),
      /ERR_AUTH/,
    );
  }
  const managed = f.request("contact", { model: { code: "ordinary" } });
  managed.schemaModel.rawSchema = {
    definition: { revision: { type: "long" } },
    backoffice: { concurrency: { managed: true, field: "revision" } },
  };
  assert.equal(source.saveOperation(managed), "REPLACE");
});

test("actual Employee/Customer update keeps untouched legacy patches but rejects protected associations and marker manufacture", async () => {
  for (const schema of ["employee", "customer"]) {
    const f = fixture();
    await f.run(
      updatePipeline,
      "applyPreInterceptors",
      f.request(schema, {
        query: { code: "original" },
        model: { displayName: "ordinary" },
      }),
    );
    assert.equal(f.queries.length, 0);
    await assert.rejects(
      f.run(
        updatePipeline,
        "applyPreInterceptors",
        f.request(schema, {
          query: { code: "original" },
          model: { $set: { contacts: ["protected"] } },
        }),
      ),
      /ERR_AUTH/,
    );
    await assert.rejects(
      f.run(
        updatePipeline,
        "applyPreInterceptors",
        f.request(schema, {
          query: { code: "original" },
          model: { profileVerifiedContact: {}, ownsProjectionWrite: true },
        }),
      ),
      /ERR_AUTH/,
    );
    await assert.rejects(
      source[schema + "PreRemove"](
        f.request(schema, { query: { code: "original" } }),
      ),
      /ERR_AUTH/,
    );
    assert(
      f.queries.some(
        (value) =>
          value.service ===
          (schema === "employee"
            ? "DefaultEmployeeService"
            : "DefaultCustomerService"),
      ),
    );
  }
});

test("identity-only and retirement-only PATCH checks retained original Contacts with no historical bypass", async () => {
  const f = fixture();
  for (const schema of ["employee", "customer"]) {
    for (const model of [
      { authenticationIdentity: { recordId: "other" } },
      { identityLinkRetirement: { auditCode: "historical" } },
      { $unset: { "authenticationIdentity.recordId": true } },
      { $rename: { unrelated: "identityLinkRetirement.auditCode" } },
    ]) {
      await assert.rejects(
        source[schema + "PreUpdate"](
          f.request(schema, {
            query: { code: "original" },
            model,
            authData: { isSystem: true },
            ownsProjectionWrite: true,
          }),
        ),
        /ERR_AUTH/,
      );
    }
  }
});

test("INSERT checks incoming protected associations and never grants a provisioning/system bypass", async () => {
  const f = fixture();
  SERVICE.DefaultEnterpriseRegistrationService = {
    ownsProvisioningMutation: () => true,
  };
  SERVICE.DefaultEnterpriseMembershipService.ownsProjectionWrite = () => true;
  for (const schema of ["employee", "customer"]) {
    await assert.rejects(
      f.run(
        savePipeline,
        "applyPreInterceptors",
        f.request(schema, {
          authData: { isSystem: true },
          model: {
            code: "new",
            contacts: ["protected"],
            ownsProvisioningMutation: true,
          },
        }),
      ),
      /ERR_AUTH/,
    );
    await f.run(
      savePipeline,
      "applyPreInterceptors",
      f.request(schema, { model: { code: "new", contacts: [] } }),
    );
  }
});

test("actual generated get guards private count/search/export selectors and redacts recursive public evidence", async () => {
  const f = fixture();
  for (const schema of ["contact", "employee", "customer"]) {
    await assert.rejects(
      f.run(
        getPipeline,
        "applyPreInterceptors",
        f.request(schema, { query: { "profileVerifiedContact.revision": 1 } }),
      ),
      /ERR_AUTH/,
    );
    const command = f.request(schema, { query: {} });
    await f.run(getPipeline, "applyPreInterceptors", command);
    const response = {
      success: {
        result: [
          {
            code: "ordinary",
            contacts: [
              { code: "protected", profileVerifiedContact: { private: true } },
            ],
            "profileVerifiedContact.owner": "private",
          },
        ],
        count: 1,
      },
    };
    await f.run(getPipeline, "applyPostInterceptors", command, response);
    assert.equal(response.success.count, 1);
    assert.equal(
      JSON.stringify(response).includes("profileVerifiedContact"),
      false,
    );
  }
});

test("adapter entry rejects raw private filters but is not a claim of installed provider/cache wiring", () => {
  const f = fixture(),
    command = f.request("contact", {
      query: { profileVerifiedContact: { $exists: true } },
    });
  assert.throws(
    () => source.providerRead(command, command.schemaModel),
    /ERR_AUTH/,
  );
  assert.throws(
    () =>
      source.providerRead(command, { schemaName: "untrusted", rawSchema: {} }),
    /ERR_AUTH/,
  );
});

test("actual Contact owner CAS retains exact private admission through the generated update hook", async () => {
  const f = fixture();
  const selected = {
    identity: {
      tenantCode: "original",
      recordKind: "CUSTOMER",
      recordId: "original-id",
    },
    binding: "binding",
    contact: {
      _id: "contact-id",
      code: "ordinary",
      active: true,
      type: "EMAIL",
      value: "ordinary@example.test",
      priority: 1,
    },
  };
  let captured;
  f.owner.policy = () => ({});
  f.owner.state = () => null;
  f.owner.select = async () => selected;
  SERVICE.DefaultIdentityGovernanceService = {
    getSystemAuthData: () => ({ isSystem: true }),
  };
  SERVICE.DefaultContactService = {
    update: async (command) => {
      captured = command;
      command.schemaModel = f.request("contact").schemaModel;
      assert.equal(f.owner.ownsWrite(command), true);
      assert.equal(f.owner.ownsWrite({ ...command }), false);
      await assert.rejects(source.contactPreUpdate({ ...command }), /ERR_AUTH/);
      await f.run(updatePipeline, "applyPreInterceptors", command);
      Object.assign(selected.contact, command.model);
      return { code: "SUC_UPDATE", result: { matchedCount: 1 } };
    },
  };
  await f.owner.persist(selected, {
    notificationConsent: [],
    suppression: { all: false, purposes: [] },
  });
  assert.equal(f.owner.ownsWrite(captured), false);
});

test("actual Contact owner records keep private read evidence without granting copied request admission", async () => {
  const f = fixture();
  SERVICE.DefaultIdentityGovernanceService = {
    getSystemAuthData: () => ({ isSystem: true }),
  };
  SERVICE.DefaultContactService = {
    get: async (command) => {
      command.schemaModel = f.request("contact").schemaModel;
      await f.run(getPipeline, "applyPreInterceptors", command);
      assert.throws(() => source.contactPreGet({ ...command }), /ERR_AUTH/);
      const response = {
        success: {
          code: "SUC_GET",
          result: [
            { code: "protected", profileVerifiedContact: { revision: 1 } },
          ],
        },
      };
      await f.run(getPipeline, "applyPostInterceptors", command, response);
      assert.equal(
        response.success.result[0].profileVerifiedContact.revision,
        1,
      );
      return response.success;
    },
  };
  const result = await contactSource.records.call(
    f.owner,
    "DefaultContactService",
    "original",
    { profileVerifiedContact: { $exists: true } },
    2,
  );
  assert.equal(result[0].profileVerifiedContact.revision, 1);
});
