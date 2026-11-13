/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module editorial/src/utils/statusDefinitions
 * @description Status and error definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    ERR_EDT_00001: { code: '400', message: 'Editorial article input is invalid' },
    ERR_EDT_00002: { code: '422', message: 'Editorial article is not ready for workflow submission' },
    ERR_EDT_00003: { code: '404', message: 'Editorial article was not found' },
    ERR_EDT_00004: { code: '409', message: 'Editorial slug is already in use for the selected site and locale' },
    ERR_EDT_00005: { code: '422', message: 'Editorial localization coverage is incomplete' },
    ERR_EDT_00006: { code: '422', message: 'Editorial scheduling window is invalid' },
    ERR_EDT_00007: { code: '409', message: 'Editorial content type is inactive' },
    ERR_EDT_00008: { code: '409', message: 'Inspect the saved Editorial revision before continuing' },
    ERR_EDT_00009: { code: '409', message: 'Editorial review setup is incomplete. Ask an administrator to validate and install the selected workflow release on the Process runtime in Initialization data.' },
    ERR_EDT_00010: { code: '502', message: 'The Editorial workflow operation could not be confirmed. Refresh the saved article and inspect its review before trying again.' },
    ERR_EDT_00011: { code: '403', message: 'You do not have permission to perform this Editorial workflow operation.' },
    ERR_EDT_00012: { code: '401', message: 'Sign in again to continue this Editorial workflow operation.' },
    ERR_EDT_00013: { code: '404', message: 'No review was found for this saved article revision.' }
};
