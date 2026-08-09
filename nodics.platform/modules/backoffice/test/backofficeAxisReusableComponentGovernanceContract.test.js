/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/test/backofficeAxisReusableComponentGovernanceContract
 * @description Protects backend-driven Axis navigation, reusable schema workspace metadata, and documentation/help contracts.
 * @layer test
 * @owner backoffice
 */
const assert = require("assert");
const path = require("path");
const service = require("../src/service/contract/defaultBackofficeContractService");
const repositoryRoot = path.resolve(__dirname, "../../../..");

const cmsCapability = require(path.join(repositoryRoot, "nodics.wcms/modules/cms/config/properties"))
  .backofficeCapabilities.cms;
const mediaCapability = require(path.join(repositoryRoot, "nodics.wcms/modules/media/config/properties"))
  .backofficeCapabilities.media;

const capabilities = [
  cmsCapability,
  mediaCapability,
];

const schemaBackedNavigation = [
  {
    capability: cmsCapability,
    id: "sites",
    moduleName: "cms",
    schemaName: "cmsSite",
  },
  {
    capability: cmsCapability,
    id: "pages",
    moduleName: "cms",
    schemaName: "cmsPage",
  },
  {
    capability: cmsCapability,
    id: "slot-definitions",
    moduleName: "cms",
    schemaName: "cmsSlotDefinition",
  },
  {
    capability: cmsCapability,
    id: "renderer-mappings",
    moduleName: "cms",
    schemaName: "cmsTypeCode2Renderer",
  },
  {
    capability: mediaCapability,
    id: "media-items",
    moduleName: "media",
    schemaName: "media",
  },
  {
    capability: mediaCapability,
    id: "media-folders",
    moduleName: "media",
    schemaName: "mediaFolder",
  },
  {
    capability: mediaCapability,
    id: "media-formats",
    moduleName: "media",
    schemaName: "mediaFormat",
  },
];

function findNavigation(capability, id) {
  return (capability.navigation || []).find((item) => item.id === id);
}

function walkMetadata(value, visitor, path = []) {
  if (!value || typeof value !== "object") return;
  Object.entries(value).forEach(([key, child]) => {
    visitor(key, child, path);
    if (child && typeof child === "object") {
      walkMetadata(child, visitor, path.concat(key));
    }
  });
}

capabilities.forEach((capability) => {
  assert(
    service.validateBackofficeMetadata(capability),
    capability.capabilityId + " must expose valid BackOffice metadata",
  );
  assert(
    Array.isArray(capability.navigation) && capability.navigation.length > 0,
    capability.capabilityId + " must expose backend-owned navigation metadata",
  );
  walkMetadata(capability.navigation, (key, value, path) => {
    assert.notStrictEqual(
      typeof value,
      "function",
      path.concat(key).join(".") + " must remain data-only metadata",
    );
    assert(
      ![
        "component",
        "componentName",
        "renderer",
        "render",
        "renderFn",
      ].includes(key),
      path.concat(key).join(".") +
        " must not smuggle Axis frontend render decisions into BackOffice metadata",
    );
  });
});

schemaBackedNavigation.forEach(({ capability, id, moduleName, schemaName }) => {
  const entry = findNavigation(capability, id);
  assert(entry, id + " navigation entry must exist");
  assert.deepStrictEqual(
    entry.workbenchTarget,
    { moduleName, schemaName },
    id + " must point Axis to the owning backend schema workspace",
  );
  assert(entry.help, id + " must provide reusable page help metadata");
  assert(
    entry.help.documentationRoute.startsWith("/docs/"),
    id + " documentation must remain a safe framework documentation route",
  );
  assert(
    !entry.help.documentationRoute.startsWith("/docs/nodics-axis"),
    id +
      " documentation must explain the framework capability, not only Axis UI",
  );
});

mediaCapability.navigation.forEach((entry) => {
  assert(entry.help, entry.id + " media page must expose backend-owned help");
  assert.strictEqual(
    entry.help.documentationRoute,
    "/docs/reference/media-management",
    entry.id + " must link to the nMedia framework documentation pack",
  );
  assert(
    !entry.workbenchPresentation,
    entry.id +
      " must not duplicate generic schema-grid presentation metadata while nMedia owns specialized media lifecycle contracts",
  );
});
