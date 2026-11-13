/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');

/**
 * @module nodics.foundation/modules/nbpm/src/service/workflow/defaultWorkflowService
 * @description Implements nbpm default workflow service business behavior and extension logic.
 * @layer service
 * @owner nbpm
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    dbs: {},
    interceptors: {},

    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**

     * Runs pre-processing logic for pare url.

     *

     * @param {*} definition Method input.

     * @returns {*} Method result.

     */

    prepareInvocation: function (definition) {
        const authority = CONFIG.get('workflowTargetAuthority');
        if (CONFIG.get('workflowModuleName') !== 'workflow' || !authority || authority.publication !== 'OPERATIONAL' ||
            Object.keys(authority).some(key => !['publication', 'server', 'environment'].includes(key)) ||
            Object.values(authority).some(value => typeof value !== 'string' || !value.trim() || value !== value.trim()))
            throw new Error('Workflow module/publication authority is unavailable');
        const token = NODICS.getInternalAuthToken(definition.tenant);
        if (!token) throw new Error('Workflow internal authentication is unavailable');
        let connectionType = 'abstract';
        let nodeId = CONFIG.get('nodeId');
        if (definition.targetNodeId) {
            connectionType = 'node';
            nodeId = definition.targetNodeId;
        }
        return {
            connectionType: connectionType,
            nodeId: nodeId,
            moduleName: CONFIG.get('workflowModuleName'),
            targetAuthority: { ...authority },
            methodName: 'PUT',
            apiName: '/item/init',
            tenant: definition.tenant,
            requestBody: definition.requestBody,
            responseType: true,
            header: {
                Authorization: 'Bearer ' + token
            }
        };
    },

    /**

     * Processes to workflow behavior.

     *

     * @param {*} itemDetails Method input.

     * @param {*} tenant Method input.

     * @returns {*} Method result.

     */

    publishToWorkflow: function (itemDetails, tenant) {
        const invocation = this.prepareInvocation({ tenant: tenant, requestBody: itemDetails });
        if (SERVICE.DefaultModuleService.isLocalModuleActive('workflow') &&
            SERVICE.DefaultModuleService.isCurrentRuntimeAuthority(invocation.targetAuthority)) {
            return this.initializeWorkflows({
                tenant: tenant, items: itemDetails
            });
        }
        return SERVICE.DefaultModuleService.invokeModule(invocation);
    }
};
