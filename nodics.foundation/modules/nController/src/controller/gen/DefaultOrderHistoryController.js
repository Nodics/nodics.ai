/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/controller/DefaultOrderHistoryController
 * @description Generated controller for schema `orderHistory` owned by module `order`. This file is recreated by clean/build from the effective schema and common controller template.
 * @layer controller
 * @owner order
 * @schema orderHistory
 * @model OrderHistoryModel
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
            FACADE.DefaultOrderHistoryFacade.get(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.get(request);
        }
    },
    safeSearch: function (request, callback) {
        request.browserQuery = request.httpRequest.body || {};
        request.schemaName = 'orderHistory';
        if (callback) {
            FACADE.DefaultOrderHistoryFacade.safeSearch(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.safeSearch(request);
        }
    },
    capabilities: function (request, callback) {
        request.schemaName = 'orderHistory';
        if (callback) {
            FACADE.DefaultOrderHistoryFacade.capabilities(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.capabilities(request);
        }
    },
    remove: function (request, callback) {
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultOrderHistoryFacade.remove(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.remove(request);
        }
    },
    deleteImpact: function (request, callback) {
        request.utilityBody = request.httpRequest.body || {};
        request.schemaName = 'orderHistory';
        if (callback) {
            FACADE.DefaultOrderHistoryFacade.deleteImpact(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.deleteImpact(request);
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
            FACADE.DefaultOrderHistoryFacade.removeById(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.removeById(request);
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
            FACADE.DefaultOrderHistoryFacade.removeByCode(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.removeByCode(request);
        }
    },
    save: function (request, callback) {
        request.model = request.httpRequest.body;
        if (callback) {
            FACADE.DefaultOrderHistoryFacade.save(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.save(request);
        }
    },
    saveAll: function (request, callback) {
        request.models = request.httpRequest.body;
        if (callback) {
            FACADE.DefaultOrderHistoryFacade.saveAll(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.saveAll(request);
        }
    },
    update: function (request, callback) {
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultOrderHistoryFacade.update(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.update(request);
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
            FACADE.DefaultOrderHistoryFacade.doRefresh(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.doRefresh(request);
        }
    },
    doCheckHealth: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultOrderHistoryFacade.doCheckHealth(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.doCheckHealth(request);
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
            FACADE.DefaultOrderHistoryFacade.doExists(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.doExists(request);
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
            FACADE.DefaultOrderHistoryFacade.doGet(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.doGet(request);
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
            FACADE.DefaultOrderHistoryFacade.doSearch(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.doSearch(request);
        }
    },
    doSave: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultOrderHistoryFacade.doSave(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.doSave(request);
        }
    },
    doBulk: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultOrderHistoryFacade.doBulk(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.doBulk(request);
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
            FACADE.DefaultOrderHistoryFacade.doRemove(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.doRemove(request);
        }
    },
    doRemoveByQuery: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultOrderHistoryFacade.doRemoveByQuery(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.doRemoveByQuery(request);
        }
    },
    doGetSchema: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultOrderHistoryFacade.doGetSchema(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.doGetSchema(request);
        }
    },
    doUpdateSchema: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultOrderHistoryFacade.doUpdateSchema(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.doUpdateSchema(request);
        }
    },
    doRemoveIndex: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultOrderHistoryFacade.doRemoveIndex(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.doRemoveIndex(request);
        }
    },
    doIndexing: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request.indexerCode = request.httpRequest.params.indexerCode || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultOrderHistoryFacade.doIndexing(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultOrderHistoryFacade.doIndexing(request);
        }
    }
};