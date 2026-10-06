/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

/** @module copilotKnowledge/service/DefaultCopilotRuntimeKnowledgeSourceService
 * @description Binds explicitly registered repository partitions to nConfig's authoritative loaded-module order without discovering or loading another runtime.
 * @layer service @owner copilotKnowledge
 * @override Preserve opt-in source definitions, real-path containment, loader order and policy fingerprint invalidation; never expose absolute roots.
 */
module.exports = {
    /** Lists only registered repository partitions present in the current loader, without exposing filesystem roots. @param {Object} roots Deployment-owned roots. @returns {Array} Inert partition choices. */
    choices: function (roots) {
        const indexed = NODICS.getIndexedModules();
        if (!(indexed instanceof Map) || indexed.size > 2000)
            throw new Error('COPILOT_RUNTIME_MODULE_ORDER_UNAVAILABLE');
        const choices = [];
        for (const [repository, configuredRoot] of Object.entries(
            roots || {},
        )) {
            if (
                !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(repository) ||
                typeof configuredRoot !== 'string' ||
                !path.isAbsolute(configuredRoot)
            )
                continue;
            const root = fs.realpathSync(configuredRoot);
            for (const module of indexed.values()) {
                if (
                    !module ||
                    typeof module.name !== 'string' ||
                    !/^[A-Za-z][A-Za-z0-9._-]{0,63}$/.test(module.name) ||
                    typeof module.path !== 'string' ||
                    !path.isAbsolute(module.path)
                )
                    continue;
                const moduleRoot = fs.realpathSync(module.path);
                if (
                    moduleRoot === root ||
                    moduleRoot.startsWith(root + path.sep)
                )
                    choices.push({
                        code: repository + '/' + module.name,
                        repository,
                        moduleName: module.name,
                    });
            }
        }
        if (
            choices.length > 1000 ||
            new Set(choices.map((item) => item.code)).size !== choices.length
        )
            throw new Error('COPILOT_RUNTIME_MODULE_ORDER_INVALID');
        return choices;
    },
    /** Adds safe runtime provenance to an already classified source; inactive/unavailable modules fail closed. @param {Object} source Normalized source. @param {Object} roots Configured repository roots. @returns {Object} Immutable bound source. */
    bind: function (source, roots) {
        if (!source.runtimeModule || !source.enabled) return source;
        const indexed = NODICS.getIndexedModules();
        if (!(indexed instanceof Map) || indexed.size > 2000)
            throw new Error('COPILOT_RUNTIME_MODULE_ORDER_UNAVAILABLE');
        const modules = [...indexed.values()];
        if (
            modules.some(
                (item) =>
                    !item ||
                    typeof item.name !== 'string' ||
                    !item.name ||
                    !['string', 'number'].includes(typeof item.index) ||
                    !/^\d+(?:\.\d+)*$/.test(String(item.index)) ||
                    String(item.index).split('.').some(
                        (part) => !Number.isSafeInteger(Number(part)),
                    ),
            ) ||
            new Set(modules.map((item) => item.name)).size !== modules.length
        )
            throw new Error('COPILOT_RUNTIME_MODULE_ORDER_INVALID');
        const module = modules.find(
            (item) => item.name === source.runtimeModule,
        );
        const repositoryRoot = roots?.[source.repository];
        if (
            !module ||
            typeof module.path !== 'string' ||
            !path.isAbsolute(module.path) ||
            typeof repositoryRoot !== 'string' ||
            !path.isAbsolute(repositoryRoot)
        )
            throw new Error('COPILOT_RUNTIME_MODULE_UNAVAILABLE');
        const root = fs.realpathSync(repositoryRoot);
        const moduleRoot = fs.realpathSync(module.path);
        if (moduleRoot !== root && !moduleRoot.startsWith(root + path.sep))
            throw new Error('COPILOT_RUNTIME_MODULE_OUTSIDE_REPOSITORY');
        const orderDigest = crypto
            .createHash('sha256')
            .update(
                JSON.stringify(
                    modules.map((item) => [item.name, String(item.index)]),
                ),
            )
            .digest('hex');
        const bound = {
            ...source,
            runtimeBinding: {
                moduleName: module.name,
                loadIndex: String(module.index),
                relativeRoot:
                    path.relative(root, moduleRoot).split(path.sep).join('/') ||
                    '.',
                orderDigest,
            },
        };
        bound.sourcePolicyDigest =
            SERVICE.DefaultCopilotKnowledgeSourceRegistryService.policyDigest(
                bound,
            );
        return SERVICE.DefaultCopilotPolicyService.deepFreeze(bound);
    },
};
