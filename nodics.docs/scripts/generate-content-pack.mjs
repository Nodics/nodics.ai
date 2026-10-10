/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const require = createRequire(import.meta.url);
const contract = require('../../nodics.foundation/modules/nTooling/src/service/defaultApplicationDocumentationContractService');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Compatibility command: CMS records are maintained directly, never regenerated from prose.
const catalogue = contract.validateDataRelease(root);
console.log(`Validated ${catalogue.documents.length} framework documentation pages from CMS data`);
