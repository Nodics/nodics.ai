/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotKnowledge/test/ownedCleanup
 * @description Records only fixture-created cleanup actions and preserves failed resources for explicit retry. Never accepts an external resource selector.
 * @layer test @owner copilotKnowledge
 */
/** Creates a reverse-order cleanup journal with content-free failure reporting. @param {Function} finalize Removes the owned composition only after all resources close. @returns {Object} Registration, snapshot and close. */
function create(finalize) {
  const entries = [];
  let running,
    finalized = false;
  return {
    /** Registers one newly created resource, not an existing shared service. */
    add: function (id, release) {
      if (
        running ||
        finalized ||
        !/^[a-z]+:[a-z0-9-]+$/.test(id) ||
        entries.some((entry) => entry.id === id) ||
        typeof release !== "function"
      )
        throw new Error("Invalid owned cleanup registration");
      entries.push({ id, release, state: "OWNED" });
    },
    /** Exposes no release callback, error payload or credential content. */
    snapshot: function () {
      return {
        finalized,
        resources: entries.map(({ id, state }) => ({ id, state })),
      };
    },
    /** Attempts every owned release once, coalesces concurrent calls and retries only previously failed releases. */
    close: function () {
      if (running) return running;
      running = (async () => {
        const failed = [];
        for (const entry of [...entries].reverse()) {
          if (entry.state === "CLOSED") continue;
          try {
            await entry.release();
            entry.state = "CLOSED";
          } catch {
            entry.state = "CLOSE_FAILED";
            failed.push(entry.id);
          }
        }
        if (failed.length)
          throw new Error("Owned fixture cleanup failed: " + failed.join(", "));
        if (!finalized) {
          await finalize();
          finalized = true;
        }
      })().finally(() => {
        running = undefined;
      });
      return running;
    },
  };
}
module.exports = { create };
