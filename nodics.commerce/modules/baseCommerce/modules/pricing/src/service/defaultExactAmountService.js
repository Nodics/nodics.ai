/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module pricing/src/service/defaultExactAmountService @description Performs deterministic decimal-string arithmetic without floating point. @layer service @owner pricing */
const DECIMAL = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/u;
function parse(value) {
    if (typeof value !== 'string' || !DECIMAL.test(value)) throw new Error('Amount must be a canonical decimal string');
    const negative = value.startsWith('-'); const raw = negative ? value.slice(1) : value;
    const parts = raw.split('.'); const scale = (parts[1] || '').length;
    return { units: BigInt((negative ? '-' : '') + parts.join('')), scale };
}
function format(units, scale) {
    const negative = units < 0n; let raw = (negative ? -units : units).toString().padStart(scale + 1, '0');
    if (scale) raw = raw.slice(0, -scale) + '.' + raw.slice(-scale);
    raw = raw.replace(/\.0+$/u, '').replace(/(\.\d*?)0+$/u, '$1');
    return (negative ? '-' : '') + raw;
}
function align(left, right) {
    const scale = Math.max(left.scale, right.scale);
    return { left: left.units * (10n ** BigInt(scale - left.scale)), right: right.units * (10n ** BigInt(scale - right.scale)), scale };
}
module.exports = {
    /** Adds two canonical decimal strings exactly. */
    add: function (left, right) { const values = align(parse(left), parse(right)); return format(values.left + values.right, values.scale); },
    /** Multiplies two canonical decimal strings exactly. */
    multiply: function (left, right) { const a = parse(left); const b = parse(right); return format(a.units * b.units, a.scale + b.scale); },
    /** Compares two canonical decimal strings exactly. */
    compare: function (left, right) { const values = align(parse(left), parse(right)); return values.left === values.right ? 0 : values.left < values.right ? -1 : 1; },
    /** Validates and normalizes a decimal string. */
    normalize: function (value) { const parsed = parse(value); return format(parsed.units, parsed.scale); }
};
