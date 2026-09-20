/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module rulesCore/src/service/defaultRuleOperatorService @description Evaluates the generic type-safe operator catalogue used by Rules Engine conditions. @layer service @owner rulesCore */
module.exports = {
    operators: function () {
        return Object.freeze([
            'EQUALS','NOT_EQUALS','IN','NOT_IN',
            'GREATER_THAN','GREATER_THAN_OR_EQUAL','LESS_THAN','LESS_THAN_OR_EQUAL','BETWEEN',
            'IS_AVAILABLE','IS_NOT_AVAILABLE','IS_TRUE','IS_FALSE',
            'CONTAINS','DOES_NOT_CONTAIN','CONTAINS_ANY','CONTAINS_ALL'
        ]);
    },

    isAvailable: function (value) {
        return value !== undefined && value !== null && value !== '';
    },

    number: function (value) {
        let parsed = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(parsed)) throw new Error('Numeric rule operator requires a finite number');
        return parsed;
    },

    list: function (value) {
        return Array.isArray(value) ? value : [value];
    },

    evaluate: function (operator, actual, expected, expectedTo) {
        if (!this.operators().includes(operator)) throw new Error('Unsupported rule operator: ' + operator);
        if (operator === 'IS_AVAILABLE') return this.isAvailable(actual);
        if (operator === 'IS_NOT_AVAILABLE') return !this.isAvailable(actual);
        if (operator === 'IS_TRUE') return actual === true;
        if (operator === 'IS_FALSE') return actual === false;
        if (operator === 'EQUALS') return actual === expected;
        if (operator === 'NOT_EQUALS') return actual !== expected;
        if (operator === 'IN') return this.list(expected).includes(actual);
        if (operator === 'NOT_IN') return !this.list(expected).includes(actual);
        if (operator === 'GREATER_THAN') return this.number(actual) > this.number(expected);
        if (operator === 'GREATER_THAN_OR_EQUAL') return this.number(actual) >= this.number(expected);
        if (operator === 'LESS_THAN') return this.number(actual) < this.number(expected);
        if (operator === 'LESS_THAN_OR_EQUAL') return this.number(actual) <= this.number(expected);
        if (operator === 'BETWEEN') {
            let value = this.number(actual);
            return value >= this.number(expected) && value <= this.number(expectedTo);
        }
        let actualList = this.list(actual);
        let expectedList = this.list(expected);
        if (operator === 'CONTAINS') return actualList.includes(expected);
        if (operator === 'DOES_NOT_CONTAIN') return !actualList.includes(expected);
        if (operator === 'CONTAINS_ANY') return expectedList.some(item => actualList.includes(item));
        if (operator === 'CONTAINS_ALL') return expectedList.every(item => actualList.includes(item));
        return false;
    }
};
