/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module nCommon/utils/exactAmount @description Pure canonical decimal-string arithmetic shared across independently deployed capabilities. No configuration, persistence, currency policy or runtime service is required. @layer utility @owner nCommon */
const DECIMAL = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/u;
let exported;
module.exports = exported = {
    /** Parses a canonical decimal string into signed integer units and its scale. */
    parse: function (value) {
        if (typeof value !== "string" || !DECIMAL.test(value)) throw new Error("Amount must be a canonical decimal string");
        const negative = value.startsWith("-"), raw = negative ? value.slice(1) : value;
        const parts = raw.split("."), scale = (parts[1] || "").length;
        return { units: BigInt((negative ? "-" : "") + parts.join("")), scale };
    },
    /** Formats signed integer units without insignificant fractional zeroes. */
    format: function (units, scale) {
        const negative = units < 0n;
        let raw = (negative ? -units : units).toString().padStart(scale + 1, "0");
        if (scale) raw = raw.slice(0, -scale) + "." + raw.slice(-scale);
        raw = raw.replace(/\.0+$/u, "").replace(/(\.\d*?)0+$/u, "$1");
        return (negative ? "-" : "") + raw;
    },
    /** Aligns parsed decimal amounts to one exact integer scale. */
    align: function (left, right) {
        const scale = Math.max(left.scale, right.scale);
        return { left: left.units * (10n ** BigInt(scale - left.scale)), right: right.units * (10n ** BigInt(scale - right.scale)), scale };
    },
    /** Adds canonical decimal strings exactly. */
    add: function (left, right) {
        const values = (this.align || exported.align).call(this, this.parse(left), this.parse(right));
        return this.format(values.left + values.right, values.scale);
    },
    /** Multiplies canonical decimal strings exactly. */
    multiply: function (left, right) {
        const a = (this.parse || exported.parse).call(this, left), b = this.parse(right);
        return this.format(a.units * b.units, a.scale + b.scale);
    },
    /** Compares canonical decimal strings without floating point. */
    compare: function (left, right) {
        const values = (this.align || exported.align).call(this, this.parse(left), this.parse(right));
        return values.left === values.right ? 0 : values.left < values.right ? -1 : 1;
    },
    /** Validates and removes insignificant fractional zeroes. */
    normalize: function (value) {
        const parsed = (this.parse || exported.parse).call(this, value);
        return this.format(parsed.units, parsed.scale);
    }
};
