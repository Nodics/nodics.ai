/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/*
 * Copyright (c) 2026 Nodics. All rights reserved.
 * Governed by the root LICENSE or a separate written agreement with Nodics.
 */
/**
 * @module backoffice/test/backendWorkspaceSourceInspectionContract
 * @description Protects bounded row navigation, fresh owner inspection and static Media workspace metadata.
 * @layer test
 * @owner backoffice
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { test, after } = require("node:test");
const service = require("../src/service/contract/defaultBackofficeContractService");
const contracts = require("../src/schemas/apiContracts");
const mediaProperties = require("../../../../nodics.wcms/modules/media/config/properties");
const mediaOwner = require("../../../../nodics.wcms/modules/media/src/service/defaultMediaBackofficeCapabilityService");
const clone = (value) => JSON.parse(JSON.stringify(value));
const library = clone(mediaProperties.media.library);
const listing = library.workspace.tabs[0].sections[0];
const form = library.publicationWorkspace.tabs[0].sections[0];
listing.rowNavigation = {
  label: "Inspect publication",
  route: "/media/publication",
  parameters: { mediaCode: "code" },
};
form.readSource = {
  endpoint: { method: "GET", path: "/nodics/media/v0/library/{mediaCode}" },
  parameter: "mediaCode",
  fields: { mediaCode: "code", versionId: "versionId" },
  commandId: "requestPublication",
  unavailableMessage: "Current source is not eligible for publication.",
};
const previousConfig = global.CONFIG;
test("owner diagnostic message path is presentation-only bounded plain projection", () => {
  const section = clone(form);
  section.readSource.unavailableMessagePath = "publicationReadiness.message";
  assert(service.validateWorkspaceReadSource(section));
  for (const invalid of [
    "",
    "x".repeat(257),
    "messages[0]",
    "https://other.test",
    "x.constructor.message",
    "prototype",
    "__proto__.message",
    "x..message",
    {},
    7,
  ]) {
    section.readSource.unavailableMessagePath = invalid;
    assert.equal(
      service.validateWorkspaceReadSource(section),
      false,
      String(invalid),
    );
  }
});
after(() => {
  if (previousConfig === undefined) delete global.CONFIG;
  else global.CONFIG = previousConfig;
});

test("real Media workspace shapes accept the exact proposed inspection contract", () => {
  assert(service.validateBackendWorkspace(library.workspace));
  assert(service.validateBackendWorkspace(library.publicationWorkspace));
  assert.equal(form.endpoint.method, "POST");
  assert.deepEqual(library.publicationWorkspace.ownerSelector, {
    runtimeRoleCode: "WCMS_STAGED",
    publicationRole: "STAGED",
  });
});

const invalidReads = [
  [
    "unknown property",
    (read) => {
      read.execute = true;
    },
  ],
  [
    "query string",
    (read) => {
      read.endpoint.path += "?tenant=other";
    },
  ],
  [
    "URL origin",
    (read) => {
      read.endpoint.path =
        "https://other.test/nodics/media/v0/library/{mediaCode}";
    },
  ],
  [
    "scheme-relative path",
    (read) => {
      read.endpoint.path = "//other/nodics/media/v0/library/{mediaCode}";
    },
  ],
  [
    "encoded path separator",
    (read) => {
      read.endpoint.path = "/nodics/media/v0/library%2f/{mediaCode}";
    },
  ],
  [
    "path traversal",
    (read) => {
      read.endpoint.path = "/nodics/media/v0/../library/{mediaCode}";
    },
  ],
  [
    "other owner",
    (read) => {
      read.endpoint.path = "/nodics/profile/v0/library/{mediaCode}";
    },
  ],
  [
    "second parameter",
    (read) => {
      read.endpoint.path += "/{revision}";
    },
  ],
  [
    "duplicate parameter",
    (read) => {
      read.endpoint.path += "/{mediaCode}";
    },
  ],
  [
    "missing parameter",
    (read) => {
      read.endpoint.path = "/nodics/media/v0/library/current";
    },
  ],
  [
    "mismatched parameter",
    (read) => {
      read.parameter = "code";
    },
  ],
  [
    "POST inspection",
    (read) => {
      read.endpoint.method = "POST";
    },
  ],
  [
    "inspection body",
    (read) => {
      read.endpoint.bodyShape = "FIELDS";
    },
  ],
  [
    "extra query map",
    (read) => {
      read.endpoint.query = { tenant: "other" };
    },
  ],
  [
    "dotted projection",
    (read) => {
      read.fields.versionId = "private.versionId";
    },
  ],
  [
    "undeclared form field",
    (read) => {
      read.fields.secret = "secret";
    },
  ],
  [
    "unbounded mapping",
    (read) => {
      read.fields = Object.fromEntries(
        Array.from({ length: 9 }, (_, index) => ["field" + index, "code"]),
      );
    },
  ],
  [
    "empty mapping",
    (read) => {
      read.fields = {};
    },
  ],
  [
    "array mapping",
    (read) => {
      read.fields = ["code"];
    },
  ],
  [
    "executable result projection",
    (read) => {
      read.endpoint.resultPath = "data.items[0]";
    },
  ],
  [
    "invalid command",
    (read) => {
      read.commandId = "requestPublication()";
    },
  ],
];
for (const [label, mutate] of invalidReads)
  test("read source rejects " + label, () => {
    const section = clone(form);
    mutate(section.readSource);
    assert(!service.validateBackendWorkspaceSection(section));
  });
for (const [label, mutate] of [
  [
    "listing source inspection",
    (section) => {
      section.type = "listing";
    },
  ],
  [
    "public source inspection",
    (section) => {
      section.public = true;
    },
  ],
  [
    "mutable source field",
    (section) => {
      section.fields[1].required = false;
    },
  ],
  [
    "password source field",
    (section) => {
      section.fields[1].type = "PASSWORD";
    },
  ],
  [
    "templated mutation path",
    (section) => {
      section.endpoint.path += "/{mediaCode}";
    },
  ],
  [
    "GET mutation",
    (section) => {
      section.endpoint.method = "GET";
    },
  ],
])
  test("source form rejects " + label, () => {
    const section = clone(form);
    mutate(section);
    assert(!service.validateBackendWorkspaceSection(section));
  });
for (const [label, mutate] of [
  [
    "external route",
    (action) => {
      action.route = "https://other.test/media/publication";
    },
  ],
  [
    "route query",
    (action) => {
      action.route += "?mediaCode=other";
    },
  ],
  [
    "route traversal",
    (action) => {
      action.route = "/media/../publication";
    },
  ],
  [
    "hidden record field",
    (action) => {
      action.parameters.mediaCode = "privateIdentity";
    },
  ],
  [
    "unknown property",
    (action) => {
      action.permission = "allow";
    },
  ],
  [
    "empty parameters",
    (action) => {
      action.parameters = {};
    },
  ],
])
  test("row navigation rejects " + label, () => {
    const section = clone(listing);
    mutate(section.rowNavigation);
    assert(!service.validateBackendWorkspaceSection(section));
  });

test("navigation requires a contributed destination and metadata remains identical across roles", () => {
  const hashes = new Set();
  for (const role of [
    "PLATFORM",
    "WCMS_STAGED",
    "WCMS_ONLINE",
    "PROCESS",
    "COMMERCE",
    "COMMERCE_STAGED",
    "ENGAGEMENT",
    "LOYALTY",
    "LOCATION",
    "WASTE",
  ]) {
    global.CONFIG = {
      get: (name) =>
        name === "media"
          ? { ...mediaProperties.media, library }
          : name === "runtimeRole"
            ? { code: role }
            : undefined,
    };
    const capability = mediaOwner.getCapability();
    assert(service.validateNavigation(capability.navigation), role);
    hashes.add(
      crypto
        .createHash("sha256")
        .update(JSON.stringify(capability))
        .digest("hex"),
    );
    const navigation = capability.navigation.filter(
      (item) => item.route !== "/media/publication",
    );
    assert(
      !service.validateNavigation(navigation),
      "undeclared route must not be accepted",
    );
    const extraQuery = clone(capability.navigation);
    extraQuery.find(
      (item) => item.id === "media-library",
    ).backendWorkspace.tabs[0].sections[0].rowNavigation.parameters.versionId =
      "versionId";
    assert(
      !service.validateNavigation(extraQuery),
      "query must carry only the declared fresh source lookup parameter",
    );
  }
  assert.equal(hashes.size, 1);
});

test("published JSON schema contains strict nested properties and renderer-type constraints", () => {
  const section =
    contracts.backendWorkspace.oneOf[0].properties.tabs.items.properties
      .sections.items;
  assert.equal(section.properties.rowNavigation.additionalProperties, false);
  assert.deepEqual(section.properties.rowNavigation.required, [
    "label",
    "route",
    "parameters",
  ]);
  assert.equal(section.properties.readSource.additionalProperties, false);
  assert.equal(
    section.properties.readSource.properties.endpoint.additionalProperties,
    false,
  );
  assert.equal(
    section.properties.readSource.properties.endpoint.properties.method.const,
    "GET",
  );
  assert.equal(
    section.properties.readSource.properties.fields.maxProperties,
    8,
  );
  assert.equal(section.allOf.length, 2);
});
