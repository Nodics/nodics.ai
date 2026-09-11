/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/controller/DefaultContactHandoffController
 * @description Generated controller for schema `contactHandoff` owned by module `contactSubmission`. This file is recreated by clean/build from the effective schema and common controller template.
 * @layer controller
 * @owner contactSubmission
 * @schema contactHandoff
 * @model ContactHandoffModel
 * @sourceTemplate /src/controller/common.js
 * @override Do not edit generated files directly. Customize behavior by adding a later module in the hierarchy that overrides this generated artifact or its source template contract.
 */
const _ = require('lodash');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    get: function (request, callback) {
        request.options = request.options || {};
        request.searchOptions = request.searchOptions || {};
        if (!request.options.recursive && request.httpRequest.get('recursive') && request.httpRequest.get('recursive') === 'true') {
            request.options.recursive = true;
        } else {
            request.options.recursive = false;
        }
        if (request.httpRequest.params.id) {
            request.query = {
                _id: ObjectId(request.httpRequest.params.id)
            };
        } else if (request.httpRequest.params.code) {
            request.query = {
                code: request.httpRequest.params.code
            };
        } else if (!UTILS.isBlank(request.httpRequest.body)) {
            request = _.merge(request, request.httpRequest.body || {});
        }
        if (callback) {
            FACADE.DefaultContactHandoffFacade.get(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultContactHandoffFacade.get(request);
        }
    },
    safeSearch: function (request, callback) {
        request.browserQuery = request.httpRequest.body || {};
        request.schemaName = 'contactHandoff';
        if (callback) {
            FACADE.DefaultContactHandoffFacade.safeSearch(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultContactHandoffFacade.safeSearch(request);
        }
    },
    capabilities: function (request, callback) {
        request.schemaName = 'contactHandoff';
        if (callback) {
            FACADE.DefaultContactHandoffFacade.capabilities(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultContactHandoffFacade.capabilities(request);
        }
    },
    remove: function (request, callback) {
        return this.executeGenericMutation(request, callback, () => this.removeAuthorized(request));
    },
    removeAuthorized: function (request, callback) {
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultContactHandoffFacade.remove(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultContactHandoffFacade.remove(request);
        }
    },
    deleteImpact: function (request, callback) {
        request.utilityBody = request.httpRequest.body || {};
        request.schemaName = 'contactHandoff';
        if (callback) {
            FACADE.DefaultContactHandoffFacade.deleteImpact(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultContactHandoffFacade.deleteImpact(request);
        }
    },
    removeById: function (request, callback) {
        return this.executeGenericMutation(request, callback, () => this.removeByIdAuthorized(request));
    },
    removeByIdAuthorized: function (request, callback) {
        request.ids = [];
        if (request.httpRequest.params.id) {
            request.ids.push(ObjectId(request.httpRequest.params.id));
        } else {
            request = _.merge(request, request.httpRequest.body || {});
        }
        if (callback) {
            FACADE.DefaultContactHandoffFacade.removeById(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultContactHandoffFacade.removeById(request);
        }
    },
    removeByCode: function (request, callback) {
        return this.executeGenericMutation(request, callback, () => this.removeByCodeAuthorized(request));
    },
    removeByCodeAuthorized: function (request, callback) {
        request.codes = [];
        if (request.httpRequest.params.code) {
            request.codes.push(request.httpRequest.params.code);
        } else {
            request = _.merge(request, request.httpRequest.body || {});
        }
        if (callback) {
            FACADE.DefaultContactHandoffFacade.removeByCode(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultContactHandoffFacade.removeByCode(request);
        }
    },
    save: function (request, callback) {
        return this.executeGenericMutation(request, callback, () => this.saveAuthorized(request), 'create');
    },
    saveAuthorized: function (request, callback) {
        request.model = request.httpRequest.body;
        if (callback) {
            FACADE.DefaultContactHandoffFacade.save(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultContactHandoffFacade.save(request);
        }
    },
    saveAll: function (request, callback) {
        return this.executeGenericMutation(request, callback, () => this.saveAllAuthorized(request), 'create');
    },
    saveAllAuthorized: function (request, callback) {
        request.models = request.httpRequest.body;
        if (callback) {
            FACADE.DefaultContactHandoffFacade.saveAll(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultContactHandoffFacade.saveAll(request);
        }
    },
    update: function (request, callback) {
        return this.executeGenericMutation(request, callback, () => this.updateAuthorized(request));
    },
    updateAuthorized: function (request, callback) {
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultContactHandoffFacade.update(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultContactHandoffFacade.update(request);
        }
    },
    executeGenericMutation: function (request, callback, execute, operation) {
        let result = Promise.resolve().then(() => {
            SERVICE.DefaultSchemaAuthoringPolicyService.assertMutationAllowed(request.moduleName, 'contactHandoff', operation);
            return execute();
        });
        if (callback) {
            result.then(success => callback(null, success)).catch(error => callback(error));
            return;
        }
        return result;
    }
};