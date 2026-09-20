/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/service/applicationBuilder/defaultApplicationBuilderCatalogueService
 * @description Discovers a deterministic, read-only Application Builder capability catalogue from explicit repository roots, optional nodics.exp app catalogue, Nodics package metadata, customer-declared compositions and data-pack boundaries.
 * @layer tooling
 * @owner nTooling
 * @override Project tooling modules may enrich descriptor facts through the standard merged-service path, but must preserve explicit repository roots and source-backed provenance.
 */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

module.exports = {
  /**
   * Produces stable JSON text by recursively sorting object keys.
   * @param {*} value Serializable value.
   * @returns {string} Canonical JSON text.
   */
  stableStringify: function (value) {
    if (Array.isArray(value)) {
      return (
        "[" + value.map((item) => this.stableStringify(item)).join(",") + "]"
      );
    }
    if (value && typeof value === "object") {
      return (
        "{" +
        Object.keys(value)
          .sort()
          .map(
            (key) =>
              JSON.stringify(key) + ":" + this.stableStringify(value[key]),
          )
          .join(",") +
        "}"
      );
    }
    return JSON.stringify(value);
  },

  /**
   * Computes a prefixed SHA-256 digest for a serializable Builder artifact.
   * @param {*} value Serializable value.
   * @returns {string} `sha256:` digest.
   */
  digest: function (value) {
    return (
      "sha256:" +
      crypto
        .createHash("sha256")
        .update(this.stableStringify(value))
        .digest("hex")
    );
  },

  /**
   * Validates and resolves an explicitly supplied repository root.
   * @param {string} repositoryPath Candidate root.
   * @param {string} label Repository label.
   * @returns {string} Absolute existing directory.
   */
  resolveRepositoryRoot: function (repositoryPath, label) {
    if (!repositoryPath) {
      throw new Error(
        "Application Builder discovery requires explicit repository root: " +
          label,
      );
    }
    const resolved = path.resolve(repositoryPath);
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
      throw new Error(
        "Application Builder repository root is unavailable: " +
          label +
          " -> " +
          resolved,
      );
    }
    return fs.realpathSync(resolved);
  },

  /**
   * Reads a nodics.exp frontend application catalogue when supplied.
   * @param {string} expRoot Candidate nodics.exp root.
   * @returns {Object|null} Parsed experience catalogue or null.
   */
  loadExperienceCatalogue: function (expRoot) {
    if (!expRoot) {
      return null;
    }
    const resolved = this.resolveRepositoryRoot(expRoot, "experience");
    if (!resolved) {
      return null;
    }
    const cataloguePath = path.join(resolved, "apps.json");
    if (!fs.existsSync(cataloguePath) || !fs.statSync(cataloguePath).isFile()) {
      throw new Error(
        "nodics.exp apps catalogue is unavailable: " + cataloguePath,
      );
    }
    const catalogue = JSON.parse(fs.readFileSync(cataloguePath, "utf8"));
    if (![0, 1].includes(catalogue.contractVersion) || !catalogue.apps) {
      throw new Error("Invalid nodics.exp apps catalogue: " + cataloguePath);
    }
    return { root: resolved, catalogue: catalogue };
  },

  /**
   * Resolves one frontend app repository from nodics.exp, preferring nested apps and allowing transitional sibling fallback.
   * @param {Object} experienceInfo Loaded experience catalogue info.
   * @param {string} appCode Frontend app code.
   * @returns {Object} App root resolution.
   */
  resolveExperienceAppRoot: function (experienceInfo, appCode) {
    const app = experienceInfo?.catalogue?.apps?.[appCode];
    if (!app) {
      throw new Error("nodics.exp does not declare frontend app: " + appCode);
    }
    if (app.packageName && app.packageName !== app.name) {
      throw new Error("nodics.exp app package identity mismatch: " + appCode);
    }
    const candidates = [
      {
        location: "nested",
        root: path.resolve(experienceInfo.root, app.folder || ""),
      },
    ];
    if (app.siblingFallback) {
      candidates.push({
        location: "sibling",
        root: path.resolve(experienceInfo.root, app.siblingFallback),
      });
    }
    const found = candidates.find((candidate) =>
      fs.existsSync(path.join(candidate.root, "package.json")),
    );
    if (!found) {
      throw new Error(
        "Frontend app `" +
          appCode +
          "` is not available from nodics.exp. Run `npm run apps:fetch -- --app=" +
          appCode +
          "` in " +
          experienceInfo.root +
          ".",
      );
    }
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(found.root, "package.json"), "utf8"),
    );
    if (packageJson.name !== app.packageName) {
      throw new Error(
        "Frontend app `" +
          appCode +
          "` package name mismatch: expected " +
          app.packageName +
          ", received " +
          packageJson.name,
      );
    }
    return {
      code: appCode,
      name: app.name,
      type: app.type,
      root: found.root,
      location: found.location,
      packageName: packageJson.name,
      verifyScript: app.verifyScript,
    };
  },

  /**
   * Resolves Builder repository roots from direct coordinates or nodics.exp.
   * @param {Object} input Discovery input.
   * @returns {Object} Resolved roots and optional experience app provenance.
   */
  resolveRepositoryCoordinates: function (input) {
    const experienceInfo = this.loadExperienceCatalogue(
      input.experience || input.exp,
    );
    const experienceApps = experienceInfo
      ? Object.keys(experienceInfo.catalogue.apps)
          .sort()
          .map((code) => this.resolveExperienceAppRoot(experienceInfo, code))
      : [];
    const direct = input.frontend || input.agora;
    const storefronts = experienceApps.filter(
      (app) => app.type === "storefront",
    );
    if (!direct && storefronts.length !== 1 && !input.frontendCode) {
      throw new Error(
        "Select an explicit frontend root or frontendCode when the experience has multiple storefronts",
      );
    }
    const selected = input.frontendCode
      ? experienceApps.find((app) => app.code === input.frontendCode)
      : storefronts[0];
    return {
      roots: {
        framework: this.resolveRepositoryRoot(input.framework, "framework"),
        frontend: this.resolveRepositoryRoot(
          direct || selected?.root,
          "frontend",
        ),
        customer: this.resolveRepositoryRoot(
          input.customer || input.kickoff,
          "customer",
        ),
        experience: experienceInfo?.root || null,
      },
      experienceApps: experienceApps,
    };
  },

  /**
   * Recursively discovers package metadata while excluding dependency, generated, VCS, and temporary directories.
   * @param {string} directory Directory to inspect.
   * @param {string} repositoryRoot Owning repository root.
   * @param {Object[]} packages Mutable package collection.
   * @returns {Object[]} Discovered packages.
   */
  collectPackages: function (directory, repositoryRoot, packages = []) {
    const ignored = new Set([
      "node_modules",
      ".git",
      "generated",
      "dist",
      "coverage",
      "temp",
      "archive",
    ]);
    if (!fs.existsSync(directory)) {
      return packages;
    }
    const packagePath = path.join(directory, "package.json");
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
      if (packageJson.nodics) {
        packages.push({
          name: packageJson.name,
          version: packageJson.version,
          index: packageJson.index || "0",
          moduleRoot:
            path
              .relative(repositoryRoot, directory)
              .split(path.sep)
              .join("/") || ".",
          metadataDigest: this.digest(packageJson),
          nodics: packageJson.nodics,
        });
      }
    }
    fs.readdirSync(directory, { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isDirectory() &&
          !entry.name.startsWith(".") &&
          !ignored.has(entry.name),
      )
      .sort((left, right) => left.name.localeCompare(right.name))
      .forEach((entry) =>
        this.collectPackages(
          path.join(directory, entry.name),
          repositoryRoot,
          packages,
        ),
      );
    return packages;
  },

  /** Reads explicit Builder declarations from the existing customer package metadata. */
  readBuilderMetadata: function (customerRoot) {
    const file = path.join(customerRoot, "package.json");
    const metadata = JSON.parse(fs.readFileSync(file, "utf8")).nodics
      ?.applicationBuilder;
    if (
      !metadata ||
      !metadata.presets ||
      !Array.isArray(metadata.compositions) ||
      !Array.isArray(metadata.frontends)
    ) {
      throw new Error(
        "Customer package must declare nodics.applicationBuilder presets, compositions and frontends",
      );
    }
    const frontends = new Set();
    metadata.frontends.forEach((frontend) => {
      if (
        !/^[A-Za-z][A-Za-z0-9._-]{1,127}$/.test(frontend.code) ||
        frontends.has(frontend.code.toLowerCase())
      ) {
        throw new Error("Invalid or ambiguous frontend code: " + frontend.code);
      }
      frontends.add(frontend.code.toLowerCase());
    });
    const codes = new Set();
    metadata.compositions.forEach((composition) => {
      const key = composition.frontend + ":" + composition.code;
      if (
        !frontends.has(String(composition.frontend).toLowerCase()) ||
        !composition.code ||
        codes.has(key) ||
        !Array.isArray(composition.domains) ||
        !Array.isArray(composition.rendererKeys)
      ) {
        throw new Error(
          "Invalid or duplicate declared frontend composition: " + key,
        );
      }
      codes.add(key);
    });
    return metadata;
  },

  /** Discovers data packs by explicit package metadata, independent of package names. */
  discoverDataPacks: function (customerPackages) {
    return customerPackages
      .filter((item) => item.nodics.applicationBuilder?.dataPack === true)
      .map((item) => ({
        code: item.name,
        moduleRoot: item.moduleRoot,
        extends: [].concat(item.nodics.extends || []),
        metadataDigest: item.metadataDigest,
      }))
      .sort((left, right) => left.code.localeCompare(right.code));
  },

  /**
   * Returns repository verification commands without executing package scripts.
   * @param {string} repositoryRoot Explicit repository root.
   * @returns {Object<string,string>} Verification-related scripts.
   */
  discoverQualificationCommands: function (repositoryRoot) {
    const packagePath = path.join(repositoryRoot, "package.json");
    if (!fs.existsSync(packagePath)) {
      return {};
    }
    const scripts =
      JSON.parse(fs.readFileSync(packagePath, "utf8")).scripts || {};
    return Object.keys(scripts)
      .filter((name) =>
        /^(?:verify|test|acceptance:|qualification:)/.test(name),
      )
      .sort()
      .reduce((result, name) => {
        result[name] = scripts[name];
        return result;
      }, {});
  },

  /**
   * Creates a deterministic read-only capability catalogue from explicit repository coordinates.
   * @param {Object} input Discovery input.
   * @param {string} input.framework Framework repository root.
   * @param {string} input.frontend Explicit frontend source root.
   * @param {string} input.customer Customer source root with declared Builder metadata.
   * @param {string} input.experience Optional experience workspace using apps.json.
   * @returns {Object} Capability catalogue with provenance and digest.
   */
  discover: function (input) {
    const coordinates = this.resolveRepositoryCoordinates(input);
    const roots = coordinates.roots;
    const frameworkPackages = this.collectPackages(
      roots.framework,
      roots.framework,
      [],
    ).sort((left, right) => left.name.localeCompare(right.name));
    const customerPackages = roots.customer
      ? this.collectPackages(
          path.join(roots.customer, "modules"),
          roots.customer,
          [],
        ).sort((left, right) => left.name.localeCompare(right.name))
      : [];
    const frameworkDataPacks = this.discoverDataPacks(frameworkPackages);
    const customerDataPacks = this.discoverDataPacks(customerPackages);
    const packOwners = new Set();
    for (const pack of [...frameworkDataPacks, ...customerDataPacks]) {
      if (packOwners.has(pack.code)) throw new Error("Data pack has multiple source owners: " + pack.code);
      packOwners.add(pack.code);
    }
    const capabilities = frameworkPackages.map((packageObject) => ({
      code: packageObject.name,
      version: packageObject.version,
      kind: packageObject.nodics.kind || "capability",
      displayName: packageObject.nodics.displayName || packageObject.name,
      moduleRoot: packageObject.moduleRoot,
      runtimeModule: packageObject.nodics.runtimeModule === true,
      extends: [].concat(packageObject.nodics.extends || []).sort(),
      owns: [].concat(packageObject.nodics.owns || []).sort(),
      metadataDigest: packageObject.metadataDigest,
    }));
    const metadata = this.readBuilderMetadata(roots.customer);
    const catalogue = {
      contractVersion: 1,
      readOnly: true,
      repositories: Object.keys(roots)
        .filter((code) => roots[code])
        .sort()
        .map((code) => ({ code: code, root: roots[code] })),
      sourcePackages: ["framework", "frontend", "customer"].map((code) => {
        const info = JSON.parse(
          fs.readFileSync(path.join(roots[code], "package.json"), "utf8"),
        );
        return {
          code: code,
          name: info.name,
          version: info.version || null,
          metadataDigest: this.digest(info),
        };
      }),
      frontendApps: metadata.frontends,
      presets: metadata.presets,
      defaultPreset: metadata.defaultPreset || null,
      capabilities: capabilities,
      frontendCompositions: metadata.compositions.map((item) =>
        Object.assign({}, item, {
          path: "package.json#nodics.applicationBuilder.compositions",
          sourceDigest: this.digest(item),
          evidence: "DECLARED_CUSTOMER_COMPOSITION",
        }),
      ),
      customerDataPacks,
      frameworkDataPacks,
      qualificationCommands: {
        framework: this.discoverQualificationCommands(roots.framework),
        frontend: this.discoverQualificationCommands(roots.frontend),
        customer: this.discoverQualificationCommands(roots.customer),
      },
    };
    const portableCatalogue = Object.assign({}, catalogue, {
      repositories: catalogue.repositories.map((repository) => ({
        code: repository.code,
      })),
    });
    catalogue.catalogueDigest = this.digest(portableCatalogue);
    return catalogue;
  },
};
