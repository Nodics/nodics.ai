/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
const contract = require('../defaultApplicationDocumentationContractService');
const root = path.resolve(process.env.NODICS_PROJECT_ROOT || process.cwd());
// Existing project command remains portable; data records are the sole content authority.
const catalogue = contract.validateDataRelease(root);
console.log(`Validated ${catalogue.documents.length} project documentation pages from CMS data`);
