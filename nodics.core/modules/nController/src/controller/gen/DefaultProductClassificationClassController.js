/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/controller/DefaultProductClassificationClassController
 * @description Generated controller for schema `productClassificationClass` owned by module `product`. This file is recreated by clean/build from the effective schema and common controller template.
 * @layer controller
 * @owner product
 * @schema productClassificationClass
 * @model ProductClassificationClassModel
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
            FACADE.DefaultProductClassificationClassFacade.get(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductClassificationClassFacade.get(request);
        }
    },
    remove: function (request, callback) {
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultProductClassificationClassFacade.remove(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductClassificationClassFacade.remove(request);
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
            FACADE.DefaultProductClassificationClassFacade.removeById(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductClassificationClassFacade.removeById(request);
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
            FACADE.DefaultProductClassificationClassFacade.removeByCode(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductClassificationClassFacade.removeByCode(request);
        }
    },
    save: function (request, callback) {
        request.model = request.httpRequest.body;
        if (callback) {
            FACADE.DefaultProductClassificationClassFacade.save(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductClassificationClassFacade.save(request);
        }
    },
    saveAll: function (request, callback) {
        request.models = request.httpRequest.body;
        if (callback) {
            FACADE.DefaultProductClassificationClassFacade.saveAll(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductClassificationClassFacade.saveAll(request);
        }
    },
    update: function (request, callback) {
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultProductClassificationClassFacade.update(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductClassificationClassFacade.update(request);
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
            FACADE.DefaultProductClassificationClassFacade.doRefresh(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductClassificationClassFacade.doRefresh(request);
        }
    },
    doCheckHealth: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultProductClassificationClassFacade.doCheckHealth(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductClassificationClassFacade.doCheckHealth(request);
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
            FACADE.DefaultProductClassificationClassFacade.doExists(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductClassificationClassFacade.doExists(request);
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
            FACADE.DefaultProductClassificationClassFacade.doGet(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductClassificationClassFacade.doGet(request);
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
            FACADE.DefaultProductClassificationClassFacade.doSearch(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductClassificationClassFacade.doSearch(request);
        }
    },
    doSave: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultProductClassificationClassFacade.doSave(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductClassificationClassFacade.doSave(request);
        }
    },
    doBulk: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultProductClassificationClassFacade.doBulk(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductClassificationClassFacade.doBulk(request);
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
            FACADE.DefaultProductClassificationClassFacade.doRemove(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductClassificationClassFacade.doRemove(request);
        }
    },
    doRemoveByQuery: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultProductClassificationClassFacade.doRemoveByQuery(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductClassificationClassFacade.doRemoveByQuery(request);
        }
    },
    doGetSchema: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultProductClassificationClassFacade.doGetSchema(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductClassificationClassFacade.doGetSchema(request);
        }
    },
    doUpdateSchema: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultProductClassificationClassFacade.doUpdateSchema(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductClassificationClassFacade.doUpdateSchema(request);
        }
    },
    doRemoveIndex: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultProductClassificationClassFacade.doRemoveIndex(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductClassificationClassFacade.doRemoveIndex(request);
        }
    },
    doIndexing: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request.indexerCode = request.httpRequest.params.indexerCode || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultProductClassificationClassFacade.doIndexing(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductClassificationClassFacade.doIndexing(request);
        }
    }
};