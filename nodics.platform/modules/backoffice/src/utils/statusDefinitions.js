/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/src/utils/statusDefinitions
 * @description Status and error definition registry for this boundary.
 * @layer definition
 * @owner backoffice
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    SUC_BOF_00000: { code: '200', message: 'Module instance lease registered' },
    SUC_BOF_00001: { code: '200', message: 'Module instance lease removed' },
    SUC_BOF_00002: { code: '200', message: 'Active module registry returned' },
    SUC_BOF_00003: { code: '200', message: 'Registry diagnostics returned' },
    SUC_BOF_00004: { code: '200', message: 'Authorized BackOffice bootstrap returned' },
    SUC_BOF_00005: { code: '200', message: 'Active BackOffice contract snapshot returned' },
    SUC_BOF_00006: { code: '200', message: 'BackOffice contract history returned' },
    SUC_BOF_00007: { code: '200', message: 'BackOffice contract comparison returned' },
    SUC_BOF_00008: { code: '200', message: 'BackOffice contract candidate approved' },
    SUC_BOF_00009: { code: '200', message: 'BackOffice contract candidate rejected' },
    SUC_BOF_00010: { code: '200', message: 'BackOffice contract rollback activated' },
    SUC_BOF_00011: { code: '200', message: 'Administrative registry inventory returned' },
    SUC_BOF_00012: { code: '200', message: 'Administrative module detail returned' },
    SUC_BOF_00013: { code: '202', message: 'Module observation refresh completed' },
    SUC_BOF_00014: { code: '200', message: 'Public Axis bootstrap returned' },
    SUC_BOF_00015: { code: '200', message: 'Axis employee experience policy returned' },
    SUC_BOF_00016: { code: '200', message: 'Axis employee experience policy updated' },
    SUC_BOF_00017: { code: '200', message: 'Available functional modules returned' },
    SUC_BOF_00018: { code: '200', message: 'Registered functional modules returned' },
    SUC_BOF_00019: { code: '200', message: 'Functional-module registration returned' },
    SUC_BOF_00020: { code: '200', message: 'Functional-module registration updated' },
    SUC_BOF_00021: { code: '200', message: 'Application initialization status returned' },
    SUC_BOF_00022: { code: '200', message: 'Application initialization submitted' },
    SUC_BOF_00023: { code: '200', message: 'Axis navigation composition draft created' },
    SUC_BOF_00024: { code: '200', message: 'Axis navigation composition draft submitted' },
    SUC_BOF_00025: { code: '200', message: 'Axis navigation composition draft approved' },
    SUC_BOF_00026: { code: '200', message: 'Axis navigation composition draft published' },
    SUC_BOF_00027: { code: '200', message: 'Axis navigation composition rolled back' },
    ERR_BOF_00080: { code: '400', message: 'Application initialization profile is invalid' },
    ERR_BOF_00081: { code: '404', message: 'Application initialization profile is unavailable' },
    ERR_BOF_00082: { code: '403', message: 'Application initialization requires a human administrator' },
    ERR_BOF_00083: { code: '503', message: 'Application initialization target is unavailable' },
    ERR_BOF_00084: { code: '400', message: 'Application initialization content pack is unavailable' },
    ERR_BOF_00085: { code: '409', message: 'Application initialization target rejected the request' },
    ERR_BOF_00000: { code: '400', message: 'Invalid module registration' },
    ERR_BOF_00090: { code: '400', message: 'Local reset target boundary exceeded' },
    ERR_BOF_00091: { code: '503', message: 'Local reset provider is unavailable' },
    ERR_BOF_00092: { code: '403', message: 'Local reset is disabled' },
    ERR_BOF_00093: { code: '403', message: 'Local reset requires a human administrator' },
    ERR_BOF_00094: { code: '400', message: 'Local reset confirmation and reason are required' },
    ERR_BOF_00095: { code: '502', message: 'Local reset provider did not acknowledge completion' },
    ERR_BOF_00096: { code: '403', message: 'Local reset is not allowed in this environment' },
    ERR_BOF_00097: { code: '503', message: 'Local reset service authentication is unavailable' }
};
