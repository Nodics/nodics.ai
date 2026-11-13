/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module nodics.commerce/test/publicationConfigurationOwnership @description Verifies owner registration, independent qualification and publication-context overrides without runtime startup. @owner nodics.commerce @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const bindings = require("../../nodics.foundation/modules/nConfig/src/service/defaultConfigurationBindingService");
const publish = require("../../nodics.foundation/modules/nPublish/config/properties");

/** Uses canonical configuration bindings and effective publication context. */
function resolve(owner, publication, overlay = {}) {
  return bindings.resolve(bindings.merge(bindings.merge(publish, owner), overlay), {}, {
    serverCode: "arbitraryCustomerRuntime", environmentVariables: {},
    readRuntimeProperty: () => publication,
  });
}

for (const domain of ["product", "pricing", "tax", "inventory", "promotion"]) {
  const defaults = require(
    "../modules/baseCommerce/modules/" + domain + "/config/properties",
  );
  const provider =
    domain === "product"
      ? "DefaultProductPublicationVersionProviderService"
      : "Default" +
        domain[0].toUpperCase() +
        domain.slice(1) +
        "PublicationService";
  test(
    domain + " owns publication registrations without qualification or connections",
    () => {
      const staged = resolve(defaults, "STAGED");
      const online = resolve(defaults, "ONLINE");
      const operational = resolve(defaults, "OPERATIONAL");
      assert.equal(staged.publish.providers.versionProviders[domain], provider);
      assert.equal(
        staged.publish.providers.workflowProviders[domain],
        "DefaultPublicationApprovalWorkflowService",
      );
      assert.equal(
        online.publish.setup.observation.targetObservers[domain],
        provider,
      );
      assert.equal(online.publish.setup.observation.enabled, false);
      assert.equal(online.publish.providers.versionProviders[domain], null);
      assert.equal(operational.publish.providers.versionProviders[domain], null);
      assert.equal(operational[domain].publication.targetTransportProvider,
        online[domain].publication.targetTransportProvider);
      assert.equal(staged[domain].publication.target.connectionName, null);
      assert.equal(staged[domain].publication.target.publication, "OPERATIONAL");
      const policy =
        domain === "product" ? "catalogueVersioned" : "publicationVersioned";
      assert.equal(
        staged.schemaPolicies[domain][policy].isVersionedEnabled,
        true,
      );
      assert.equal(
        operational.schemaPolicies[domain][policy].isVersionedEnabled,
        domain === "product",
      );
      if (domain !== "product") {
        assert.equal(
          staged[domain].publication.sourceVersioningQualified,
          false,
        );
        assert.equal(staged[domain].publication.delivery.enabled, false);
        assert.deepEqual(
          staged[domain].publication.target.callers,
          domain === "pricing" ? [] : undefined,
        );
        assert.equal(online[domain].publication.runtimeRole, "ONLINE");
      }
      const customized = resolve(defaults, "STAGED", {
        [domain]: {
          publication: {
            targetTransportProvider: "PartnerTransport",
            target: { connectionName: "reviewedTarget" },
          },
        },
        schemaPolicies: { [domain]: { [policy]: { isVersionedEnabled: false } } },
      });
      assert.throws(() => resolve(defaults, "UNKNOWN"), /publication context/i);

      assert.equal(
        customized[domain].publication.targetTransportProvider,
        "PartnerTransport",
      );
      assert.equal(
        customized[domain].publication.target.connectionName,
        "reviewedTarget",
      );
      assert.equal(
        customized.schemaPolicies[domain][policy].isVersionedEnabled,
        false,
      );
      assert.equal(defaults[domain].publication.target.connectionName, null);
    },
  );
}
