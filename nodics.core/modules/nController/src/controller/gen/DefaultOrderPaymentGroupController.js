/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/controller/DefaultOrderPaymentGroupController
 * @description Generated controller for schema `orderPaymentGroup` owned by module `order`. This file is recreated by clean/build from the effective schema and common controller template.
 * @layer controller
 * @owner order
 * @schema orderPaymentGroup
 * @model OrderPaymentGroupModel
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
            FACADE.DefaultOrderPaymentGroupFacade.get(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderPaymentGroupFacade.get(request);
        }
    },
    remove: function (request, callback) {
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultOrderPaymentGroupFacade.remove(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderPaymentGroupFacade.remove(request);
        }
    },
    removeById: function (request, callback) {
        request.ids = [];
        if (request.httpRequest.params.id) {
            request.ids.push(ObjectId(request.httpRequest.params.id));
        } else {
            request = _.merge(request, request.httpRequest.body || {});
        }
        if (callback) {
            FACADE.DefaultOrderPaymentGroupFacade.removeById(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderPaymentGroupFacade.removeById(request);
        }
    },
    removeByCode: function (request, callback) {
        request.codes = [];
        if (request.httpRequest.params.code) {
            request.codes.push(request.httpRequest.params.code);
        } else {
            request = _.merge(request, request.httpRequest.body || {});
        }
        if (callback) {
            FACADE.DefaultOrderPaymentGroupFacade.removeByCode(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderPaymentGroupFacade.removeByCode(request);
        }
    },
    save: function (request, callback) {
        request.model = request.httpRequest.body;
        if (callback) {
            FACADE.DefaultOrderPaymentGroupFacade.save(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderPaymentGroupFacade.save(request);
        }
    },
    saveAll: function (request, callback) {
        request.models = request.httpRequest.body;
        if (callback) {
            FACADE.DefaultOrderPaymentGroupFacade.saveAll(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderPaymentGroupFacade.saveAll(request);
        }
    },
    update: function (request, callback) {
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultOrderPaymentGroupFacade.update(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderPaymentGroupFacade.update(request);
        }
    },
    doRefresh: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (request.httpRequest.params.id) {
            request.query = request.query || {};
            request.query.id = request.httpRequest.params.id;
        }
        if (callback) {
            FACADE.DefaultOrderPaymentGroupFacade.doRefresh(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderPaymentGroupFacade.doRefresh(request);
        }
    },
    doCheckHealth: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultOrderPaymentGroupFacade.doCheckHealth(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderPaymentGroupFacade.doCheckHealth(request);
        }
    },
    doExists: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (request.httpRequest.params.id) {
            request.query = request.query || {};
            request.query.id = request.httpRequest.params.id;
        }
        if (callback) {
            FACADE.DefaultOrderPaymentGroupFacade.doExists(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderPaymentGroupFacade.doExists(request);
        }
    },
    doGet: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        if (request.httpRequest.params.id) {
            request.query = {
                id: request.httpRequest.params.id
            };
        } else {
            request = _.merge(request, request.httpRequest.body || {});
        }
        if (callback) {
            FACADE.DefaultOrderPaymentGroupFacade.doGet(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderPaymentGroupFacade.doGet(request);
        }
    },
    doSearch: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (request.httpRequest.params.id) {
            request.query = {
                match: {
                    _id: request.httpRequest.params.id
                }
            };
        }
        if (callback) {
            FACADE.DefaultOrderPaymentGroupFacade.doSearch(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderPaymentGroupFacade.doSearch(request);
        }
    },
    doSave: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultOrderPaymentGroupFacade.doSave(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderPaymentGroupFacade.doSave(request);
        }
    },
    doBulk: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultOrderPaymentGroupFacade.doBulk(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderPaymentGroupFacade.doBulk(request);
        }
    },
    doRemove: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (request.httpRequest.params.id) {
            request.query = {
                id: request.httpRequest.params.id
            };
        }
        if (callback) {
            FACADE.DefaultOrderPaymentGroupFacade.doRemove(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderPaymentGroupFacade.doRemove(request);
        }
    },
    doRemoveByQuery: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultOrderPaymentGroupFacade.doRemoveByQuery(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderPaymentGroupFacade.doRemoveByQuery(request);
        }
    },
    doGetSchema: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultOrderPaymentGroupFacade.doGetSchema(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderPaymentGroupFacade.doGetSchema(request);
        }
    },
    doUpdateSchema: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultOrderPaymentGroupFacade.doUpdateSchema(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderPaymentGroupFacade.doUpdateSchema(request);
        }
    },
    doRemoveIndex: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultOrderPaymentGroupFacade.doRemoveIndex(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderPaymentGroupFacade.doRemoveIndex(request);
        }
    },
    doIndexing: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request.indexerCode = request.httpRequest.params.indexerCode || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultOrderPaymentGroupFacade.doIndexing(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderPaymentGroupFacade.doIndexing(request);
        }
    }
};