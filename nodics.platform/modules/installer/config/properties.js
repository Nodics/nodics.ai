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
            apiOperationsEnabled: true,
            mutatingOperationsEnabled: false,
            standaloneBootstrapRepository: 'Nodics/nodics.installer',
            standaloneBootstrapCommand: 'npx github:Nodics/nodics.installer',
            latestVerifiedStandaloneVersion: '0.7.2',
            protectVendorRepositories: [
                'nodics.ai',
                'nodics.axis'
            ],
            evidenceDirectoryName: '.nodics-installer',
            workspaceManifestName: '.nodics-workspace.json',
            workspaceIdentityName: '.nodics-installer-identity.json',
            workspaceLockName: '.nodics-installer-lock.json',
            workspace: {
                allowedRoots: [],
                allowRequestWorkspaceRoot: true,
                maxEvidenceBytes: 65536,
                allowedEvidenceFiles: [
                    '.nodics-workspace.json',
                    '.nodics-installer-identity.json',
                    '.nodics-installer-lock.json',
                    'summary.json',
                    'setup.log',
                    'preflight.log'
                ]
            }
        }
    }
};
