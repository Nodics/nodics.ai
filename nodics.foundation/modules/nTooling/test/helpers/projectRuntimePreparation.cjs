/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const probe = require('../../src/service/project/defaultProjectConfigurationProbeService');
const startup = require('../../src/service/project/defaultProjectRuntimeStartService');

/** Prepare only the selected configuration graph; never run hooks, providers or listeners.
 * Call in an isolated test process because nConfig owns process-wide registries.
 * Customer callers provide coordinates and expected exposure, then assert their choices.
 */
module.exports = function prepareRuntime(options) {
    const selected = probe.coordinates(options);
    startup.resolveServer(selected.projectRoot, selected.server, { ENV: selected.environment });
    const result = probe.resolve(selected);
    assert.equal(NODICS.getServerName(), selected.server);
    assert.equal(NODICS.getSelectedEnvironmentName(), selected.environment);
    assert.equal(NODICS.getEnvironmentName(), startup.resolveProjectCode(selected.projectRoot));
    for (const name of ['nSetup', 'nTooling']) {
        assert.equal(NODICS.getRawModule(name), undefined, name + ' must remain outside runtime discovery');
        assert.equal(NODICS.isModuleActive(name), false, name + ' must remain outside runtime activation');
    }
    const previous = Object.getOwnPropertyDescriptor(global, '_');
    try {
        global._ = require('lodash');
        const router = require('../../../nRouter/src/service/request/defaultRequestHandlerPipelineService');
        for (const category of options.expectedApiExposure || []) {
            assert.equal(router.isApiExposureEnabled(category), true, category + ' API exposure should be enabled for ' + selected.server);
        }
    } finally {
        if (previous) Object.defineProperty(global, '_', previous);
        else delete global._;
    }
    return { ...result, coreRoot: path.join(selected.frameworkRoot, 'nodics.foundation') };
};
