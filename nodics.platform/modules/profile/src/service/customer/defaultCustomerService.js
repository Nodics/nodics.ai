/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/src/service/customer/defaultCustomerService
 * @description Implements profile default customer service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * Retrieves by login id information.
     *
     * @param {*} request Method input.
     * @returns {*} Method result.
     */
    findByLoginId: function (request) {
        return new Promise((resolve, reject) => {
            this.get({
                tenant: request.tenant,
                authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
                options: {
                    recursive: true,
                },
                query: {
                    loginId: request.loginId
                }
            }).then(customers => {
                if (customers.result.length !== 1) {
                    reject(new CLASSES.NodicsError('ERR_PRFL_00003', 'Invalid login id'));
                } else {
                    resolve(customers.result[0]);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },
    /**
     * Validates customer exist rules.
     *
     * @param {*} request Method input.
     * @returns {*} Method result.
     */
    isCustomerExist: function (request) {
        return new Promise((resolve, reject) => {
            this.get({
                tenant: request.tenant,
                authData: request.authData || SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
                options: {
                    recursive: false,
                },
                query: {
                    loginId: request.loginId
                }
            }).then(customers => {
                if (customers.result.length > 1) {
                    reject(new CLASSES.NodicsError('ERR_PRFL_00003', 'Invalid login id'));
                } else if (customers.result.length < 1) {
                    reject(new CLASSES.NodicsError('ERR_PRFL_00005', 'Customer not exist'));
                } else {
                    resolve({
                        code: 'SUC_PRFL_00002'
                    });
                }
            }).catch(error => {
                reject(error);
            });
        });
    },
    /**
     * Executes sign up behavior.
     *
     * @param {*} request Method input.
     * @returns {*} Method result.
     */
    /** Registers a bounded batch through the same customer registration pipeline; existing matching identities are preserved. */
    signUpAll: async function (request) {
        const models=request.models||[];
        if(!Array.isArray(models)||models.length>100) throw new CLASSES.NodicsError('ERR_PRFL_00003','A bounded customer batch is required');
        const result=[];
        for(const model of models){
            const response=await this.get({tenant:request.tenant,authData:request.authData,query:{loginId:model.loginId},options:{recursive:false}});
            const existing=response&&response.result&&response.result[0];
            if(existing){
                if(model.code&&existing.code!==model.code) throw new CLASSES.NodicsError('ERR_PRFL_00003','Customer login is already registered under a different identity');
                result.push({code:existing.code});
            }else{
                await this.signUp(Object.assign({},request,{model:Object.assign({},model)}));
                result.push({code:model.code});
            }
        }
        return {result:result};
    },

    /** Runs the customer registration pipeline with this composed service available to its existing extension steps. */
    signUp: function (request) {
        let _self = this;
        request.defaultCustomerService = _self;
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('customerRegistrationHandlerPipeline', request, {}).then(success => {
                resolve(success);
            }).catch(error => {
                reject(new CLASSES.NodicsError(error, null, 'ERR_PRFL_00006'));
            });
        });
    },
};
