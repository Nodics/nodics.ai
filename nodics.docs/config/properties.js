/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.docs/config/properties
 * @description Defines documentation-content package metadata without enabling runtime APIs or server behavior.
 * @layer config
 * @owner nodics.docs
 * @override Projects may contribute their own documentation packs through project-owned modules or repositories.
 */
module.exports = {
    docs: {
        contentPack: {
            enabled: true,
            owner: 'nodics.docs',
            runtimeModule: false,
            sourceRoot: 'content',
            generatedRoot: 'data/core',
            manifestPath: 'manifest/generated-content-pack.json'
        }
    }
};
