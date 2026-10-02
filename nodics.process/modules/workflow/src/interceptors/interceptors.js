/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/**
 * @module workflow/src/interceptors/interceptors
 * @description Protects source-owned review retirement evidence at generated mutation boundaries.
 * @layer interceptors
 * @owner workflow
 * @override Later layers may tighten admission without allowing generic writes to manufacture retirement.
 */
module.exports = {
  protectTaskRetirementSave: {
    type: "schema",
    item: "processTask",
    trigger: "preSave",
    active: "true",
    index: -30,
    handler: "DefaultProcessRuntimeLifecycleService.protectTaskRetirement",
  },
  protectTaskRetirementUpdate: {
    type: "schema",
    item: "processTask",
    trigger: "preUpdate",
    active: "true",
    index: -30,
    handler: "DefaultProcessRuntimeLifecycleService.protectTaskRetirement",
  },
  protectTaskRetirementRemove: {
    type: "schema",
    item: "processTask",
    trigger: "preRemove",
    active: "true",
    index: -30,
    handler: "DefaultProcessRuntimeLifecycleService.protectTaskRetirement",
  },
  protectInstanceRetirementSave: {
    type: "schema",
    item: "processInstance",
    trigger: "preSave",
    active: "true",
    index: -30,
    handler: "DefaultProcessRuntimeLifecycleService.protectInstanceRetirement",
  },
  protectInstanceRetirementUpdate: {
    type: "schema",
    item: "processInstance",
    trigger: "preUpdate",
    active: "true",
    index: -30,
    handler: "DefaultProcessRuntimeLifecycleService.protectInstanceRetirement",
  },
  protectInstanceRetirementRemove: {
    type: "schema",
    item: "processInstance",
    trigger: "preRemove",
    active: "true",
    index: -30,
    handler: "DefaultProcessRuntimeLifecycleService.protectInstanceRetirement",
  },
};
