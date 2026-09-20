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
    definitions: function () {
        return Object.freeze({
            EQUALS: { dataTypes: ['STRING','NUMBER','BOOLEAN','DATE'] },
            NOT_EQUALS: { dataTypes: ['STRING','NUMBER','BOOLEAN','DATE'] },
            IN: { dataTypes: ['STRING','NUMBER','BOOLEAN','DATE'] },
            NOT_IN: { dataTypes: ['STRING','NUMBER','BOOLEAN','DATE'] },
            GREATER_THAN: { dataTypes: ['NUMBER','DATE'] },
            GREATER_THAN_OR_EQUAL: { dataTypes: ['NUMBER','DATE'] },
            LESS_THAN: { dataTypes: ['NUMBER','DATE'] },
            LESS_THAN_OR_EQUAL: { dataTypes: ['NUMBER','DATE'] },
            BETWEEN: { dataTypes: ['NUMBER','DATE'] },
            IS_AVAILABLE: { dataTypes: ['STRING','NUMBER','BOOLEAN','DATE','COLLECTION','OBJECT'] },
            IS_NOT_AVAILABLE: { dataTypes: ['STRING','NUMBER','BOOLEAN','DATE','COLLECTION','OBJECT'] },
            IS_TRUE: { dataTypes: ['BOOLEAN'] },
            IS_FALSE: { dataTypes: ['BOOLEAN'] },
            CONTAINS: { dataTypes: ['COLLECTION'] },
            DOES_NOT_CONTAIN: { dataTypes: ['COLLECTION'] },
            CONTAINS_ANY: { dataTypes: ['COLLECTION'] },
            CONTAINS_ALL: { dataTypes: ['COLLECTION'] }
        });
    },

    operators: function () {
        return Object.freeze(Object.keys(this.definitions()));
    },

    supports: function (operator, dataType) {
        let definition = this.definitions()[operator];
        return Boolean(definition && definition.dataTypes.includes(String(dataType || '').toUpperCase()));
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
