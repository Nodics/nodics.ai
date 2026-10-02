/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module digitalCore/test/digitalCommerceRegistrationContract
 * @description Exercises actual Digital Core capability production, runtime registration and strict BackOffice validation without providers.
 * @layer test
 * @owner digitalCore
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const root = path.resolve(__dirname, "../../../../../..");
const contract = require(
  path.join(
    root,
    "nodics.platform/modules/backoffice/src/service/contract/defaultBackofficeContractService",
  ),
);
const agentSource = require(
  path.join(
    root,
    "nodics.foundation/modules/nService/src/service/module/defaultModuleRegistrationAgentService",
  ),
);
const definition = require(
  path.join(
    root,
    "nodics.foundation/modules/nService/src/service/module/defaultBackofficeCapabilityDefinitionService",
  ),
);
const provider = require("../src/service/defaultDigitalCommerceBackofficeCapabilityService");
const notifications = require("../src/service/defaultDigitalCommerceNotificationService");
const defaults = require("../config/properties");
const clone = (value) => JSON.parse(JSON.stringify(value));

for (const qualified of [false, true]) {
  test(`real Digital Core registration validates with notification qualification ${qualified}`, (t) => {
    const previous = {
      CONFIG: global.CONFIG,
      SERVICE: global.SERVICE,
      NODICS: global.NODICS,
    };
    t.after(() => {
      for (const [name, value] of Object.entries(previous)) {
        if (value === undefined) delete global[name];
        else global[name] = value;
      }
    });
    const config = clone(defaults);
    Object.assign(config.digitalCore.notifications, {
      enabled: qualified,
      qualified,
      workspaceQualified: qualified,
    });
    config.digitalCore.merchantRedemption.enabled = true;
    config.apiExposure.categories.commerceNotificationManagement.enabled =
      qualified;
    global.CONFIG = { get: (name) => config[name] };
    const rawModule = {
      metaData: require("../package.json"),
      rawSchema: require("../src/schemas/schemas").digitalCore,
      path: path.resolve(__dirname, ".."),
      parent: "digitalCommerce",
      canonicalIdentity:
        "nodics.commerce/modules/digitalCommerce/modules/digitalCore",
    };
    global.NODICS = {
      getRawModule: () => rawModule,
      getServerName: () => "commerceStagedServer",
    };
    global.SERVICE = {
      DefaultBackofficeCapabilityDefinitionService: definition,
      DefaultDigitalCommerceNotificationService: notifications,
      DefaultRouterService: {
        prepareUrl: () => "http://localhost:4352/nodics/digitalCore/v0",
      },
    };
    const agent = {
      ...agentSource,
      getConfiguration: () => ({ healthPath: "/health", leaseTtlMs: 30000 }),
      getInstanceId: () => "fixture-commerce-staged",
      _backofficeCapabilityProviders: new Map([["digitalCore", provider]]),
    };
    const registration = agent.buildRegistration("digitalCore");
    const nav = registration.backoffice.navigation.find(
      (item) => item.id === "order-notifications",
    );
    assert.equal(contract.validateRegistration(registration), true);
    assert.equal(
      contract.validateRegistrationBatch(
        { instanceId: registration.instanceId, registrations: [registration] },
        512,
      ),
      true,
    );
    assert.equal(nav.featureState, qualified ? "ACTIVE" : "DISABLED");
    assert.equal(
      nav.backendWorkspace.title,
      config.digitalCore.notifications.workspace.title,
    );
    assert.equal(Object.hasOwn(nav.backendWorkspace, "operationRoute"), false);
    assert.equal(Object.hasOwn(nav, "workbenchTarget"), false);
    assert.deepEqual(
      nav.lifecycleActions.map((command) => command.id),
      ["inspect", "retry"],
    );
    assert.ok(
      nav.lifecycleActions.every(
        (command) =>
          !Object.hasOwn(command, "inputFields") &&
          !Object.hasOwn(command, "confirmationRequired"),
      ),
    );
    const commands = notifications.workspaceCommands();
    assert.equal(commands[1].confirmationRequired, true);
    assert.deepEqual(
      commands[1].inputFields.map((field) => field.type),
      ["SELECT", "NUMBER", "BOOLEAN"],
    );
    assert.equal(commands[1].inputFields[1].valueFromRecord, "orderRevision");
    assert.equal(commands[1].permission, "commerce.digital.notification.retry");
    for (const corrupt of [
      (item) => {
        item.backendWorkspace.operationRoute =
          "/orders/:code/notifications/workspace";
      },
      (item) => {
        delete item.backendWorkspace.title;
      },
      (item) => {
        item.lifecycleActions[1] = { ...commands[1], featureState: "DISABLED" };
      },
    ]) {
      const malformed = clone(registration);
      corrupt(
        malformed.backoffice.navigation.find(
          (item) => item.id === "order-notifications",
        ),
      );
      assert.equal(contract.validateRegistration(malformed), false);
    }
  });
}
