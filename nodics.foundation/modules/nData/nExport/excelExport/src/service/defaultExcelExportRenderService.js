/*
    Nodics - Enterprice Micro-Services Management Framework
    Copyright (c) 2026 Nodics All rights reserved.
 */
'use strict';

/** @module excelExport/service/DefaultExcelExportRenderService @description Renders already-authorized bounded rows as XLSX without owning source queries or download storage. @layer service @owner excelExport @override Projects may customize workbook presentation while preserving formula neutralization and bounded inputs. */
module.exports = {
    safeValue: function (value) {
        if (value === null || value === undefined) return '';
        const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
        return /^[=+\-@\t\r]/u.test(text) ? "'" + text : text;
    },
    render: async function (rows, options) {
        const values = Array.isArray(rows) ? rows : [];
        const maximumRows = Number(options && options.maximumRows || 10000);
        if (values.length > maximumRows) throw new Error('EXPORT_ROW_LIMIT_EXCEEDED');
        const ExcelJS = require('exceljs'), workbook = new ExcelJS.Workbook();
        workbook.creator = 'Nodics nExport'; workbook.created = new Date();
        const sheet = workbook.addWorksheet(String(options && options.sheetName || 'Export').slice(0, 31));
        const headers = values.length ? Object.keys(values[0]) : [];
        sheet.columns = headers.map(key => ({ header: key, key: key, width: Math.min(48, Math.max(12, key.length + 2)) }));
        values.forEach(row => sheet.addRow(Object.fromEntries(headers.map(key => [key, this.safeValue(row[key])]))));
        if (sheet.getRow(1)) { sheet.getRow(1).font = { bold: true }; sheet.views = [{ state: 'frozen', ySplit: 1 }]; }
        return Buffer.from(await workbook.xlsx.writeBuffer());
    }
};
