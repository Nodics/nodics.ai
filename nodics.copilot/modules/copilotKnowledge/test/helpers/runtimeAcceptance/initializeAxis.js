/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotKnowledge/test/initializeAxis
 * @description Initializes the isolated Axis baseline through nImport, CMS publication, human Process approval and BackOffice activation. Never launches a frontend or fabricates readiness.
 * @layer test @owner copilotKnowledge
 */
const assert = require("node:assert/strict");

/** Completes governed initialization in an already running owned composition. @param {Object} runtime Owned fixture or its private browser manifest. @returns {Promise<Object>} Content-free readiness evidence. */
async function initialize(runtime) {
  const origins = new Set([
    runtime.baseUrl,
    ...runtime.axisRuntimes.map((item) => item.origin),
  ]);
  for (const origin of origins) {
    const url = new URL(origin);
    assert.equal(url.origin, origin);
    assert.equal(url.hostname, "127.0.0.1");
    assert.equal(url.protocol, "http:");
  }
  assert.equal(runtime.projectCode, "nodics.repository-build");
  const processOrigin = runtime.axisRuntimes.find(
    (item) => item.role === "PROCESS",
  ).origin;
  let token;
  /** Uses one selected normal API without command retry, redirect, or credential logging. */
  async function request(origin, path, body) {
    assert.ok(origins.has(origin));
    const response = await fetch(origin + "/nodics/" + path, {
      method: body === undefined ? "GET" : "POST",
      redirect: "error",
      signal: AbortSignal.timeout(120000),
      headers: {
        "Content-Type": "application/json",
        "x-enterprise-code": "default",
        "x-nodics-client-contract-version": "1",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const result = await response.json();
    if (!response.ok)
      throw new Error(path + " HTTP " + response.status + " " + result.code);
    return result.data || result.result || result;
  }
  token = (
    await request(runtime.baseUrl, "profile/v0/employee/authenticate", {
      loginId: "copilot_acceptance_operator",
      password: runtime.password,
    })
  ).authToken;
  assert.ok(token);
  const catalogue = await request(processOrigin, "import/v0/init");
  const releases = catalogue.data || catalogue.items || catalogue;
  const release = releases.find(
    (item) => item.releaseCode === "cms:cmsPublicationApproval",
  );
  assert.ok(
    release,
    "Process must expose the CMS-owned approval definition through nImport",
  );
  if (release.status !== "CURRENT")
    await request(processOrigin, "import/v0/init/install", {
      releaseCodes: [release.releaseCode],
      expectedReleases: { [release.releaseCode]: release.version },
    });
  let status = await request(
    runtime.baseUrl,
    "backoffice/v0/axis/initialization",
  );
  if (status.readiness !== "READY") {
    const initiated = await request(
      runtime.baseUrl,
      "backoffice/v0/axis/initialization/initiate",
      { reason: "Disposable Copilot full-application acceptance" },
    );
    assert.equal(initiated.publication?.state, "PENDING_APPROVAL");
    const instances = await request(
      processOrigin,
      "process/v0/instances?limit=100",
    );
    const instance = (instances.items || instances).find(
      (item) =>
        item.definitionCode === "cmsPublicationApproval" &&
        item.context?.publicationCode === initiated.publication.code &&
        item.status === "WAITING",
    );
    assert.ok(instance, "Original publication approval instance required");
    const tasks = await request(
      processOrigin,
      "process/v0/tasks?instanceCode=" +
        encodeURIComponent(instance.code) +
        "&limit=20",
    );
    const task = (tasks.items || tasks).find(
      (item) =>
        item.instanceCode === instance.code &&
        item.nodeCode === "publicationReview" &&
        ["OPEN", "CLAIMED"].includes(item.status),
    );
    assert.ok(task, "Original human approval task required");
    if (task.status === "OPEN")
      await request(
        processOrigin,
        "process/v0/tasks/" + encodeURIComponent(task.code) + "/claim",
        {},
      );
    const completed = await request(
      processOrigin,
      "process/v0/tasks/" + encodeURIComponent(task.code) + "/complete",
      {
        decision: {
          approved: true,
          reason: "Disposable Copilot full-application acceptance",
        },
      },
    );
    assert.equal(completed.instance?.status, "COMPLETED");
    status = await request(
      runtime.baseUrl,
      "backoffice/v0/axis/initialization",
    );
  }
  assert.equal(status.readiness, "READY");
  assert.equal(status.publication?.state, "ONLINE");
  const bootstrap = await request(
    runtime.baseUrl,
    "backoffice/v0/bootstrap/public",
  );
  const onlineOrigin = runtime.axisRuntimes.find(
    (item) => item.role === "WCMS_ONLINE",
  ).origin;
  assert.equal(new URL(bootstrap.endpoints.cms).origin, onlineOrigin);
  const delivered = await request(
    onlineOrigin,
    "cms/v0/delivery/pages/resolve/authenticated?site=axisCmsSite&path=%2Fdashboard&locale=en&channel=web&contractVersion=0",
  );
  assert.ok(
    delivered && typeof delivered === "object",
    "Published dashboard delivery required",
  );
  const registration =
    "backoffice/v0/runtime/modules/registrations/nodics.copilot";
  let state = await request(
    runtime.baseUrl,
    registration + "?project=" + runtime.projectCode,
  );
  for (const action of ["register", "activate"]) {
    state = await request(runtime.baseUrl, registration + "/" + action, {
      project: runtime.projectCode,
      expectedRevision: state.catalogueRevision,
      reason: "Disposable Copilot full-application acceptance",
    });
  }
  assert.equal(state.enabled, true);
  return {
    readiness: status.readiness,
    publicationState: status.publication.state,
    copilotActivated: true,
  };
}
module.exports = { initialize };
