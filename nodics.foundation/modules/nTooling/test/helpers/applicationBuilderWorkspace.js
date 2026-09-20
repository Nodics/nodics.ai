/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/helpers/applicationBuilderWorkspace
 * @description Creates isolated source repositories for Builder contracts without installed customer checkouts or CI fallbacks.
 * @layer test
 * @owner nTooling
 * @override Test fixtures must retain explicit source provenance and cleanup.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
module.exports = function createBuilderWorkspace() {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "nodics-builder-sources-"),
  );
  const experience = path.join(root, "experience");
  const frontend = path.join(experience, "storefront");
  const customer = path.join(root, "customer");
  const metadata = require("../fixtures/applicationBuilder/reference-metadata.json");
  const write = (file, value) => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(value));
  };
  write(path.join(frontend, "package.json"), {
    name: "fixture.storefront",
    nodics: { kind: "frontend" },
  });
  write(path.join(experience, "apps.json"), {
    contractVersion: 1,
    workspace: "fixture.experience",
    apps: {
      storefront: {
        name: "fixture.storefront",
        packageName: "fixture.storefront",
        folder: "storefront",
        type: "storefront",
      },
    },
  });
  write(path.join(customer, "package.json"), {
    name: "fixture.customer",
    nodics: { applicationBuilder: metadata },
  });
  ["agora.apparel", "agora.electronics", "agora.telco"].forEach(
    (code) =>
      write(path.join(customer, "modules", code, "package.json"), {
        name: code,
        nodics: { applicationBuilder: { dataPack: true } },
      }),
  );
  process.once("exit", () => fs.rmSync(root, { recursive: true, force: true }));
  return { root, experience, frontend, customer };
};
