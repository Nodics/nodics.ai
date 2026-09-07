'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const ExcelJS = require('exceljs');
const service = require('../src/service/defaultExcelExportRenderService');

test('xlsx renderer preserves authorized rows and neutralizes formulas', async () => {
    const buffer = await service.render([{ code: '=unsafe', name: 'Phone' }], { maximumRows: 2, sheetName: 'Modules' });
    const workbook = new ExcelJS.Workbook(); await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet('Modules');
    assert.equal(sheet.getCell('A1').value, 'code');
    assert.equal(sheet.getCell('A2').value, "'=unsafe");
    assert.equal(sheet.getCell('B2').value, 'Phone');
});

test('xlsx renderer rejects an oversized result before workbook creation', async () => {
    await assert.rejects(service.render([{}, {}], { maximumRows: 1 }), /EXPORT_ROW_LIMIT_EXCEEDED/);
});
