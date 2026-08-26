/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module installer/config/properties
 * @description Reserves layered defaults for installed-runtime Application Builder governance.
 * @layer config
 * @owner installer
 * @override Customer projects may override allowlists and operation policy through normal Nodics configuration layering.
 */
module.exports = {
    installer: {
        applicationBuilder: {
            enabled: true,
            apiOperationsEnabled: false,
            standaloneBootstrapRepository: 'Nodics/nodics.installer',
            standaloneBootstrapCommand: 'npx github:Nodics/nodics.installer',
            latestVerifiedStandaloneVersion: '0.7.2',
            protectVendorRepositories: [
                'nodics.ai',
                'nodics.axis'
            ],
            evidenceDirectoryName: '.nodics-installer',
            workspaceManifestName: '.nodics-workspace.json'
        }
    }
};
