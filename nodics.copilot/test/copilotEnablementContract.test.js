/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module copilot/test/copilotEnablementContract @description Proves one API opt-in and explicit rejection of retired ambiguous enablement switches. @layer test @owner copilotCore */
const assert = require('node:assert/strict');
const test = require('node:test');
const service = require('../modules/copilotCore/src/service/defaultCopilotOrchestrationService');
const core = require('../modules/copilotCore/config/properties').copilot.core;
const api = require('../modules/copilotApi/config/properties').copilot.api;
test('the API remains disabled until selected, independent internal capability choices do not enable it', () => {
    assert.throws(() => service.assertEnabled({ core, api }), /COPILOT_DISABLED/);
    assert.throws(
        () =>
            service.assertEnabled({
                core,
                api,
                providers: { enabled: true },
                knowledge: { enabled: true },
            }),
        /COPILOT_DISABLED/,
    );
    assert.equal(service.assertEnabled({ core, api: { ...api, enabled: true } }), true);
    assert.throws(() => service.assertEnabled({ core, api: { enabled: 'true' } }), /COPILOT_DISABLED/);
    for (const enabled of [false, true]) {
        assert.throws(
            () => service.assertEnabled({ enabled, core, api: { enabled: true } }),
            /RETIRED_ENABLEMENT/,
        );
        assert.throws(
            () =>
                service.assertEnabled({
                    core: { ...core, enabled },
                    api: { enabled: true },
                }),
            /RETIRED_ENABLEMENT/,
        );
    }
});
