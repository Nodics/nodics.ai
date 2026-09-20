/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module rulesCore/src/service/defaultRuleOutcomeRegistryService @description Registers generic/consumer rule outcome definitions and validators without moving consumer execution into Rules Engine. @layer service @owner rulesCore */
module.exports = {
    definitions: {
        ADD_SCORE: {
            ownerModule: 'rulesCore',
            validate: function (outcome) {
                let score = Number(outcome && outcome.parameters && outcome.parameters.score);
                return Number.isFinite(score)
                    ? { valid: true, issues: [] }
                    : { valid: false, issues: [{ code: 'ADD_SCORE_NUMERIC_REQUIRED' }] };
            }
        }
    },

    registerOutcomeType: function (code, definition) {
        if (!code || !definition || typeof definition.validate !== 'function') {
            throw new Error('Rule outcome definition must provide a validator');
        }
        if (this.definitions[code] && this.definitions[code] !== definition) {
            throw new Error('Rule outcome type is already registered: ' + code);
        }
        this.definitions[code] = definition;
        return true;
    },

    get: function (code) {
        return this.definitions[code];
    },

    validate: function (outcome) {
        if (!outcome || !outcome.outcomeType) {
            return { valid: false, issues: [{ code: 'OUTCOME_TYPE_REQUIRED' }] };
        }
        let definition = this.get(outcome.outcomeType);
        if (!definition) {
            return { valid: false, issues: [{ code: 'OUTCOME_TYPE_UNREGISTERED', outcomeType: outcome.outcomeType }] };
        }
        return definition.validate(outcome);
    }
};
