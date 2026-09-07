/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/** @module copilotCapability/src/service/defaultCopilotCapabilityService @description Filters and invokes Nodics-owned tools, and renders bounded exports without direct database access. @layer service @owner copilotCapability @override Domain adapters may contribute capability descriptors and handlers. */
module.exports = {
    /** Neutralizes values that spreadsheet applications could execute as formulas. */
    exportValue: function (value) {
        const text = String(value == null ? '' : value);
        return /^[=+\-@\t\r]/u.test(text) ? "'" + text : text;
    },
    /** Returns tools visible to an actor. @param {Object[]} tools Registered tools. @param {Object} context Actor context. @returns {Object[]} Allowed tools. */
    listAllowed: function (tools, context) {
        const permissions = context.permissions || [];
        return (tools || []).filter(tool => !tool.permission || permissions.includes('*') || permissions.includes(tool.permission)).map(tool => Object.assign({}, tool, { handler: undefined }));
    },
    /** Invokes a permissioned tool. @param {Object} tool Tool descriptor. @param {Object} input Tool input. @param {Object} context Actor context. @returns {Promise<*>} Handler result. */
    invoke: function (tool, input, context) {
        if (!tool || typeof tool.handler !== 'function') return Promise.reject(new Error('COPILOT_CAPABILITY_UNAVAILABLE'));
        if (tool.permission && !(context.permissions || []).includes('*') && !(context.permissions || []).includes(tool.permission)) return Promise.reject(new Error('COPILOT_CAPABILITY_FORBIDDEN'));
        if (tool.mutates === true) return Promise.reject(new Error('COPILOT_MUTATION_REQUIRES_GOVERNED_EXECUTION'));
        return Promise.resolve(tool.handler(input, context));
    },
    /** Renders rows as CSV or text; XLSX is delegated to nExport. @param {Object[]} rows Result rows. @param {string} format Format. @param {Object} options Limits. @returns {Object} Export payload. */
    renderExport: function (rows, format, options) {
        const limit = Number((options || {}).maximumRows || 10000);
        if (!Array.isArray(rows) || rows.length > limit) throw new Error('COPILOT_EXPORT_LIMIT_EXCEEDED');
        if (format === 'xlsx') return { format: 'xlsx', delegate: 'nExport/excelExport', rows: rows };
        const headers = rows.length ? Object.keys(rows[0]) : [];
        if (format === 'text') return { format: 'text', content: rows.map(row => headers.map(key => this.exportValue(row[key])).join('\t')).join('\n') };
        if (format !== 'csv') throw new Error('COPILOT_EXPORT_FORMAT_UNSUPPORTED');
        const quote = value => '"' + this.exportValue(value).replace(/"/g, '""') + '"';
        return { format: 'csv', content: [headers.map(quote).join(',')].concat(rows.map(row => headers.map(key => quote(row[key])).join(','))).join('\n') };
    },
    /** Produces a browser-safe export artifact while delegating XLSX rendering to nExport. */
    renderExportArtifact: async function (rows, format, options) {
        const rendered = this.renderExport(rows, format, options || {}), stamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
        if (format === 'xlsx') {
            if (!SERVICE.DefaultExcelExportRenderService || typeof SERVICE.DefaultExcelExportRenderService.render !== 'function') throw new Error('COPILOT_XLSX_EXPORT_NOT_COMPOSED');
            const buffer = await SERVICE.DefaultExcelExportRenderService.render(rows, { maximumRows: options && options.maximumRows, sheetName: options && options.sheetName || 'Nodics modules' });
            return { format: 'xlsx', fileName: 'nodics-modules-' + stamp + '.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', encoding: 'base64', content: buffer.toString('base64') };
        }
        return { format: format, fileName: 'nodics-modules-' + stamp + (format === 'csv' ? '.csv' : '.txt'),
            mimeType: format === 'csv' ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8', encoding: 'utf8', content: rendered.content };
    }
};
