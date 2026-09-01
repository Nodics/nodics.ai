/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { flattenRoutes } = require('./routerContractTestUtils');

/**
 * @module nRouter/test/commerceRouteResourceShapeContract
 * @description Verifies commerce module route keys remain resource-oriented
 * relative to the nRouter generated base URL and do not encode caller audience
 * or UI shell prefixes.
 * @layer test
 * @owner nRouter
 * @override New commerce modules may add route keys for their own resources or
 * capabilities, but customer, employee, operator, and backoffice access must be
 * represented by security metadata and runtime ownership policy rather than URL
 * prefixes.
 */

const rootPath = path.resolve(process.env.NODICS_HOME || process.cwd());
const commerceRoot = path.join(rootPath, 'nodics.commerce');
const forbiddenAudiencePrefixPattern = /^\/(customer|employee|operator|backoffice)(\/|$)/;
const ignoredDirectories = new Set(['.git', 'docs', 'generated', 'node_modules']);

function collectRouterFiles(currentPath, files = []) {
    if (!fs.existsSync(currentPath)) {
        return files;
    }
    fs.readdirSync(currentPath, { withFileTypes: true }).forEach((entry) => {
        const entryPath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
            if (!ignoredDirectories.has(entry.name)) {
                collectRouterFiles(entryPath, files);
            }
            return;
        }

        if ((entry.name === 'routers.js' || entry.name === 'router.js')
            && entryPath.split(path.sep).includes('src')
            && entryPath.split(path.sep).includes('router')) {
            files.push(entryPath);
        }
    });
    return files;
}

const violations = [];
collectRouterFiles(commerceRoot).forEach((filePath) => {
    delete require.cache[require.resolve(filePath)];
    flattenRoutes(require(filePath)).forEach((route) => {
        const key = String(route.key || '');
        if (forbiddenAudiencePrefixPattern.test(key)) {
            violations.push(`${path.relative(rootPath, filePath)}: ${String(route.method).toUpperCase()} ${key}`);
        }
    });
});

assert.deepStrictEqual(violations, [], `Commerce route keys must be resource-oriented below /<contextRoot>/<modulePrefix>/<apiVersion>; move audience/client-shell prefixes into auth metadata and ownership policy:\n${violations.join('\n')}`);
console.log('Commerce route resource-shape contract validated');
