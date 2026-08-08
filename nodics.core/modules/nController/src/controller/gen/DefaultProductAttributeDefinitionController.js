/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/**
 * @generated
 * @module generated/controller/DefaultProductAttributeDefinitionController
 * @description Generated controller for schema `productAttributeDefinition` owned by module `product`. This file is recreated by clean/build from the effective schema and common controller template.
 * @layer controller
 * @owner product
 * @schema productAttributeDefinition
 * @model ProductAttributeDefinitionModel
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
            FACADE.DefaultProductAttributeDefinitionFacade.get(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductAttributeDefinitionFacade.get(request);
        }
    },
    remove: function (request, callback) {
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultProductAttributeDefinitionFacade.remove(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductAttributeDefinitionFacade.remove(request);
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
            FACADE.DefaultProductAttributeDefinitionFacade.removeById(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductAttributeDefinitionFacade.removeById(request);
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
            FACADE.DefaultProductAttributeDefinitionFacade.removeByCode(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductAttributeDefinitionFacade.removeByCode(request);
        }
    },
    save: function (request, callback) {
        request.model = request.httpRequest.body;
        if (callback) {
            FACADE.DefaultProductAttributeDefinitionFacade.save(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductAttributeDefinitionFacade.save(request);
        }
    },
    saveAll: function (request, callback) {
        request.models = request.httpRequest.body;
        if (callback) {
            FACADE.DefaultProductAttributeDefinitionFacade.saveAll(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductAttributeDefinitionFacade.saveAll(request);
        }
    },
    update: function (request, callback) {
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultProductAttributeDefinitionFacade.update(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductAttributeDefinitionFacade.update(request);
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
            FACADE.DefaultProductAttributeDefinitionFacade.doRefresh(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductAttributeDefinitionFacade.doRefresh(request);
        }
    },
    doCheckHealth: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultProductAttributeDefinitionFacade.doCheckHealth(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductAttributeDefinitionFacade.doCheckHealth(request);
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
            FACADE.DefaultProductAttributeDefinitionFacade.doExists(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductAttributeDefinitionFacade.doExists(request);
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
            FACADE.DefaultProductAttributeDefinitionFacade.doGet(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductAttributeDefinitionFacade.doGet(request);
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
            FACADE.DefaultProductAttributeDefinitionFacade.doSearch(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductAttributeDefinitionFacade.doSearch(request);
        }
    },
    doSave: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultProductAttributeDefinitionFacade.doSave(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductAttributeDefinitionFacade.doSave(request);
        }
    },
    doBulk: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultProductAttributeDefinitionFacade.doBulk(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductAttributeDefinitionFacade.doBulk(request);
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
            FACADE.DefaultProductAttributeDefinitionFacade.doRemove(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductAttributeDefinitionFacade.doRemove(request);
        }
    },
    doRemoveByQuery: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultProductAttributeDefinitionFacade.doRemoveByQuery(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductAttributeDefinitionFacade.doRemoveByQuery(request);
        }
    },
    doGetSchema: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultProductAttributeDefinitionFacade.doGetSchema(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductAttributeDefinitionFacade.doGetSchema(request);
        }
    },
    doUpdateSchema: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultProductAttributeDefinitionFacade.doUpdateSchema(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductAttributeDefinitionFacade.doUpdateSchema(request);
        }
    },
    doRemoveIndex: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultProductAttributeDefinitionFacade.doRemoveIndex(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductAttributeDefinitionFacade.doRemoveIndex(request);
        }
    },
    doIndexing: function (request, callback) {
        request.indexName = request.httpRequest.params.indexName || undefined;
        request.indexerCode = request.httpRequest.params.indexerCode || undefined;
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.DefaultProductAttributeDefinitionFacade.doIndexing(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultProductAttributeDefinitionFacade.doIndexing(request);
        }
    }
};