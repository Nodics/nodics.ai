/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');

/**
 * @module router/service/router/DefaultRouterOperationService
 * @description Bridges effective Nodics router definitions to Express operations.
 * It binds HTTP methods and delegates incoming requests to the request handler service.
 * @layer service
 * @owner nRouter
 * @override Project modules may override this service to customize HTTP method binding,
 * request handoff, body parser selection, or route deactivation behavior.
 *
 * @property {Object} CONFIG Runtime configuration registry for body parser handler selection.
 * @property {Object} NODICS Dynamic runtime registry used to read the latest active router definition.
 * @property {Object} SERVICE.DefaultRequestHandlerService Starts the Nodics request pipeline for a route.
 * @property {Object} SERVICE.DefaultRouterService Logger and router lifecycle dependency.
 * @property {Object} routerDef Effective route contract containing URL, method, body parser, module, and router name.
 */
module.exports = {

    /**
     * Validates server-authored metadata without deriving policy from HTTP input.
     * @param {Object} routerDef Effective owner route definition.
     * @returns {boolean} True only for the exact sensitive declaration.
     * @throws {TypeError} For malformed or weakening privacy declarations.
     */
    isPrivateRoute: function (routerDef) {
        const policy = routerDef && routerDef.requestPrivacy;
        if (policy === undefined) return false;
        if (!policy || !_.isPlainObject(policy) || Object.keys(policy).length !== 1 || policy.sensitive !== true) {
            throw new TypeError('Invalid owner request privacy metadata');
        }
        return true;
    },

    /**
     * Sends only owner-defined status diagnostics for private failures.
     * Raw names/messages/stacks, validation items and localization values are omitted.
     * @param {Object} req Bound HTTP request.
     * @param {Object} res HTTP response.
     * @param {Object} error Failure with an optional registered status code.
     * @returns {boolean} Whether the private response was handled.
     */
    sendPrivateError: function (req, res, error) {
        if (!SERVICE.DefaultLoggerService.isSensitiveRequest(req)) return false;
        if (res.headersSent) return true;
        let code = 'ERR_SYS_00000';
        let status = { code: '500', message: 'Request failed' };
        try {
            const candidate = error && error.code;
            if (typeof candidate === 'string' && /^ERR_[A-Z0-9_]{1,80}$/.test(candidate)) {
                const definition = SERVICE.DefaultStatusService.get(candidate);
                if (definition && Number.isInteger(Number(definition.code)) && Number(definition.code) >= 400 && Number(definition.code) <= 599) {
                    code = candidate;
                    status = definition;
                }
            }
        } catch (ignored) { /* Unknown codes never echo untrusted diagnostics. */ }
        res.status(Number(status.code)).json({ responseCode: status.code, code, message: status.message });
        return true;
    },

    /**
     * Binds trusted metadata before route parsers; original sensitivity is pinned.
     * Missing early middleware or unqualified upstream capture refuses admission.
     * @param {Object} routerDef Registered route definition, not request input.
     * @returns {Function} Express middleware with a safe, fixed refusal response.
     */
    privacyMiddleware: function (routerDef) {
        const owner = this;
        const originallyPrivate = owner.isPrivateRoute(routerDef);
        return (req, res, next) => {
            try {
                const current = NODICS.getRouter(routerDef.routerName, routerDef.moduleName);
                const sensitive = owner.isPrivateRoute(current) || originallyPrivate;
                const logger = SERVICE.DefaultLoggerService;
                const bound = logger.resolveRequestPrivacy(req, sensitive);
                if (sensitive && (!bound || !logger.admitPrivateRoute(req))) {
                    res.status(503).json({ code: 'ERR_RTR_00005', message: 'Request privacy is not qualified' });
                    return;
                }
                next();
            } catch (error) {
                res.status(503).json({ code: 'ERR_RTR_00005', message: 'Request privacy is not qualified' });
            }
        };
    },

    /**
     * Stops sensitive parser failures from reaching raw exception reporters.
     * @param {Error} error Body parser error; never serialized for private input.
     * @param {Object} req Privately bound HTTP request.
     * @param {Object} res HTTP response.
     * @param {Function} next Ordinary Express error continuation.
     * @returns {void}
     */
    privacyParserError: function (error, req, res, next) {
        if (SERVICE.DefaultLoggerService.isSensitiveRequest(req)) {
            res.status(400).json({ code: 'ERR_RTR_00006', message: 'Invalid request body' });
            return;
        }
        next(error);
    },

    serversConfigPool: '',

    /**
     * Initializes the router operation service during service loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the router operation service after service loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Refreshes route definition from runtime registry and starts request handling.
     *
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {Object} routerDef Route definition captured during Express binding.
     * @returns {void}
     * @sideEffects Delegates active routes to `DefaultRequestHandlerService`; writes standard JSON error for inactive or failed routes.
     */
    bindOperation: function (req, res, routerDef) {
        let requestedRouter = routerDef;
        try {
            routerDef = NODICS.getRouter(routerDef.routerName, routerDef.moduleName);
            const sensitive = this.isPrivateRoute(routerDef) || this.isPrivateRoute(requestedRouter) || SERVICE.DefaultLoggerService.isSensitiveRequest(req);
            if (sensitive && !SERVICE.DefaultLoggerService.hasPrivateCaptureProtection(req)) {
                res.status(503).json({ code: 'ERR_RTR_00005', message: 'Request privacy is not qualified' });
                return;
            }
            if (routerDef.active) {
                SERVICE.DefaultRequestHandlerService.startRequestHandler(req, res, routerDef);
            } else {
                this.sendRouterError(req, res, routerDef, {
                    code: 'ERR_SYS_00000',
                    message: 'This API is no more active currently',
                    metadata: {
                        routerName: routerDef.routerName,
                        moduleName: routerDef.moduleName
                    }
                });
            }
        } catch (error) {
            SERVICE.DefaultRouterService.LOG.error(SERVICE.DefaultLoggerService.isSensitiveRequest(req) ? '[SENSITIVE_REQUEST]' : error);
            this.sendRouterError(req, res, requestedRouter, error);
        }
    },

    /**
     * Sends router binding failures through the configured response handler.
     *
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {Object} routerDef Route definition used to resolve response handler.
     * @param {Error|Object|string} error Router binding failure.
     * @returns {void}
     * @sideEffects Writes HTTP status and JSON body through the configured response handler.
     */
    sendRouterError: function (req, res, routerDef, error) {
        if (this.sendPrivateError(req, res, error)) return;
        let responseHandlers = CONFIG.get('responseHandler') || {};
        let responseHandler = responseHandlers[(routerDef && routerDef.responseHandler) || 'jsonResponseHandler'];
        if (responseHandler && SERVICE[responseHandler] && SERVICE[responseHandler].handleError) {
            SERVICE[responseHandler].handleError(req, res, CLASSES.NodicsError.ensure(error));
        } else {
            res.status(SERVICE.DefaultStatusService.get('ERR_SYS_00000').code);
            res.json(new CLASSES.NodicsError(error).toJson());
        }
    },

    /**
     * Registers an HTTP GET route on the module router.
     *
     * @param {Object} moduleRouter Express router for the module.
     * @param {Object} routerDef Effective Nodics route definition.
     * @returns {void}
     */
    get: function (moduleRouter, routerDef) {
        let _self = this;
        moduleRouter.get(routerDef.url, _self.privacyMiddleware(routerDef), (req, res) => {
            _self.bindOperation(req, res, routerDef);
        });
    },

    /**
     * Registers an HTTP POST route with the configured body parser.
     *
     * @param {Object} moduleRouter Express router for the module.
     * @param {Object} routerDef Effective Nodics route definition.
     * @param {string} [routerDef.bodyParserHandler] Optional configured body parser handler key.
     * @returns {void}
     */
    post: function (moduleRouter, routerDef) {
        let _self = this;
        let bodyParserHandler = CONFIG.get('bodyParserHandler')[routerDef.bodyParserHandler] || CONFIG.get('bodyParserHandler').jsonBodyParserHandler;
        moduleRouter.post(routerDef.url, _self.privacyMiddleware(routerDef), SERVICE[bodyParserHandler].getBodyParser(routerDef), _self.privacyParserError, (req, res) => {
            _self.bindOperation(req, res, routerDef);
        });
    },

    /**
     * Registers an HTTP DELETE route with the configured body parser.
     *
     * @param {Object} moduleRouter Express router for the module.
     * @param {Object} routerDef Effective Nodics route definition.
     * @param {string} [routerDef.bodyParserHandler] Optional configured body parser handler key.
     * @returns {void}
     */
    delete: function (moduleRouter, routerDef) {
        let _self = this;
        let bodyParserHandler = CONFIG.get('bodyParserHandler')[routerDef.bodyParserHandler] || CONFIG.get('bodyParserHandler').jsonBodyParserHandler;
        moduleRouter.delete(routerDef.url, _self.privacyMiddleware(routerDef), SERVICE[bodyParserHandler].getBodyParser(routerDef), _self.privacyParserError, (req, res) => {
            _self.bindOperation(req, res, routerDef);
        });
    },

    /**
     * Registers an HTTP PUT route with the configured body parser.
     *
     * @param {Object} moduleRouter Express router for the module.
     * @param {Object} routerDef Effective Nodics route definition.
     * @param {string} [routerDef.bodyParserHandler] Optional configured body parser handler key.
     * @returns {void}
     */
    put: function (moduleRouter, routerDef) {
        let _self = this;
        let bodyParserHandler = CONFIG.get('bodyParserHandler')[routerDef.bodyParserHandler] || CONFIG.get('bodyParserHandler').jsonBodyParserHandler;
        moduleRouter.put(routerDef.url, _self.privacyMiddleware(routerDef), SERVICE[bodyParserHandler].getBodyParser(routerDef), _self.privacyParserError, (req, res) => {
            _self.bindOperation(req, res, routerDef);
        });
    },

    /**
     * Registers an HTTP PATCH route with the configured body parser.
     *
     * @param {Object} moduleRouter Express router for the module.
     * @param {Object} routerDef Effective Nodics route definition.
     * @param {string} [routerDef.bodyParserHandler] Optional configured body parser handler key.
     * @returns {void}
     */
    patch: function (moduleRouter, routerDef) {
        let _self = this;
        let bodyParserHandler = CONFIG.get('bodyParserHandler')[routerDef.bodyParserHandler] || CONFIG.get('bodyParserHandler').jsonBodyParserHandler;
        moduleRouter.patch(routerDef.url, _self.privacyMiddleware(routerDef), SERVICE[bodyParserHandler].getBodyParser(routerDef), _self.privacyParserError, (req, res) => {
            _self.bindOperation(req, res, routerDef);
        });
    }
};
