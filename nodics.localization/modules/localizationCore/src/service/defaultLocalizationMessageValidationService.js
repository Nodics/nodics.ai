/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const { parse } = require('@formatjs/icu-messageformat-parser');
/** @module localizationCore/service/DefaultLocalizationMessageValidationService @description Validates bounded ICU messages and exact parameter contracts without formatting or executing content. @layer service @owner localizationCore @override Projects may strengthen validation while preserving parser compatibility and fail-closed behavior. */
module.exports = {
    /** Returns authority limits. */ configuration: function () { return ((CONFIG.get('localization') || {}).authority || {}); },
    /** Collects argument identifiers from an ICU abstract syntax tree. */ collectArguments: function (nodes, output) { (nodes || []).forEach(node => { if (node && node.value && [1, 2, 3, 4, 5, 6].includes(node.type)) output.add(node.value); if (node && node.options) Object.values(node.options).forEach(option => this.collectArguments(option.value, output)); if (node && node.children) this.collectArguments(node.children, output); }); return output; },
    /** Validates one message against declared parameters and returns canonical parameter names. */ validate: function (message, parameters) { let config = this.configuration(); if (typeof message !== 'string' || !message.length || message.length > Number(config.maximumMessageLength || 10000)) throw this.error('ERR_LOC_00001', 'Message is blank or exceeds its bound'); let declared = Array.isArray(parameters) ? [...new Set(parameters)] : []; if (declared.length > Number(config.maximumParametersPerMessage || 50) || declared.some(value => typeof value !== 'string' || !/^[A-Za-z][A-Za-z0-9_]*$/.test(value))) throw this.error('ERR_LOC_00001', 'Parameter declaration is invalid'); let parsed; try { parsed = parse(message, { requiresOtherClause: true }); } catch (cause) { throw this.error('ERR_LOC_00001', 'Message is not valid ICU MessageFormat'); } let used = [...this.collectArguments(parsed, new Set())].sort(); if (used.join('|') !== declared.slice().sort().join('|')) throw this.error('ERR_LOC_00001', 'ICU arguments do not match the declared parameter contract'); return Object.freeze(used); },
    /** Creates a stable validation error. */ error: function (code, message) { let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message); error.code = error.code || code; return error; }
};
