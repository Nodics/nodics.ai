/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module copilotKnowledge/service/DefaultCopilotKnowledgeGroupService @description Restricts employee knowledge to configured active groups and explicit tenant-enterprise source ceilings without granting source access or owning publication. @layer service @owner copilotKnowledge @override Later layers may narrow assignments; user input never supplies definitions or ceilings. */
module.exports = {
    /** Validates a bounded unique code list; an empty list grants nothing. @param {unknown} value Configured list. @returns {string[]} Valid codes. */
    codes: function (value) {
        if (
            !Array.isArray(value) ||
            value.length > 1000 ||
            value.some(
                (code) =>
                    typeof code !== 'string' ||
                    !/^[A-Za-z0-9][A-Za-z0-9._-]{1,127}$/u.test(code),
            ) ||
            new Set(value).size !== value.length
        )
            throw new Error('COPILOT_KNOWLEDGE_GROUP_CONFIGURATION_INVALID');
        return value.slice();
    },
    /** Validates every configured group and assignment before considering the caller. @param {Object} configuration Group configuration. @param {Object} registry Canonical source registry. @returns {Object} Validated restrictive configuration. */
    validate: function (configuration, registry) {
        if (!configuration || typeof configuration.enabled !== 'boolean')
            throw new Error('COPILOT_KNOWLEDGE_GROUP_CONFIGURATION_INVALID');
        if (
            !Array.isArray(configuration.definitions) ||
            configuration.definitions.length > 100 ||
            !Array.isArray(configuration.assignments) ||
            configuration.assignments.length > 1000
        )
            throw new Error('COPILOT_KNOWLEDGE_GROUP_CONFIGURATION_INVALID');
        const sourceCodes = new Set(
            registry.sources.map((source) => source.code),
        );
        const definitions = configuration.definitions.map((group) => {
            if (
                !group ||
                typeof group.name !== 'string' ||
                !group.name.trim() ||
                group.name.length > 120 ||
                typeof group.active !== 'boolean'
            )
                throw new Error(
                    'COPILOT_KNOWLEDGE_GROUP_CONFIGURATION_INVALID',
                );
            const code = this.codes([group.code])[0];
            const owned =
                group.tenantCode !== undefined ||
                group.enterpriseCode !== undefined;
            if (
                owned &&
                ![group.tenantCode, group.enterpriseCode].every(
                    (value) =>
                        typeof value === 'string' &&
                        value.trim() &&
                        value.length <= 128,
                )
            )
                throw new Error(
                    'COPILOT_KNOWLEDGE_GROUP_CONFIGURATION_INVALID',
                );
            const sources = this.codes(group.sourceCodes);
            if (sources.some((source) => !sourceCodes.has(source)))
                throw new Error('COPILOT_KNOWLEDGE_GROUP_SOURCE_UNKNOWN');
            return {
                code,
                name: group.name,
                active: group.active,
                sourceCodes: sources,
                ...(owned
                    ? {
                          tenantCode: group.tenantCode,
                          enterpriseCode: group.enterpriseCode,
                      }
                    : {}),
            };
        });
        this.codes(definitions.map((group) => group.code));
        const known = new Set(definitions.map((group) => group.code));
        const keys = new Set();
        const assignments = configuration.assignments.map((assignment) => {
            if (
                !assignment ||
                [assignment.tenantCode, assignment.enterpriseCode].some(
                    (value) =>
                        typeof value !== 'string' ||
                        !value.trim() ||
                        value.length > 128,
                )
            )
                throw new Error(
                    'COPILOT_KNOWLEDGE_GROUP_CONFIGURATION_INVALID',
                );
            const key = JSON.stringify([
                assignment.tenantCode,
                assignment.enterpriseCode,
            ]);
            if (keys.has(key))
                throw new Error(
                    'COPILOT_KNOWLEDGE_GROUP_ASSIGNMENT_DUPLICATED',
                );
            keys.add(key);
            const groupCodes = this.codes(assignment.groupCodes);
            if (
                groupCodes.some((code) => {
                    const group = definitions.find(
                        (item) => item.code === code,
                    );
                    return (
                        group?.enterpriseCode &&
                        (group.enterpriseCode !== assignment.enterpriseCode ||
                            group.tenantCode !== assignment.tenantCode)
                    );
                })
            )
                throw new Error(
                    'COPILOT_KNOWLEDGE_GROUP_CONFIGURATION_INVALID',
                );
            const ceiling = this.codes(assignment.allowedSourceCodes);
            const activeGroupCodes =
                assignment.activeGroupCodes === undefined
                    ? groupCodes
                    : this.codes(assignment.activeGroupCodes);
            if (
                activeGroupCodes.some((code) => !groupCodes.includes(code)) ||
                groupCodes.some((code) => !known.has(code)) ||
                ceiling.some((code) => !sourceCodes.has(code))
            )
                throw new Error(
                    'COPILOT_KNOWLEDGE_GROUP_CONFIGURATION_INVALID',
                );
            return {
                tenantCode: assignment.tenantCode,
                enterpriseCode: assignment.enterpriseCode,
                groupCodes,
                activeGroupCodes,
                allowedSourceCodes: ceiling,
            };
        });
        return { definitions, assignments };
    },
    /** Intersects configured assignment, active group membership, optional narrowing selection and current source permissions. @param {Object} registry Canonical registry. @param {Object} configuration Group configuration. @param {Object} context Trusted security context. @param {Object} policy Canonical policy service. @param {Object} policyConfiguration Policy configuration. @param {string[]} selection Optional caller narrowing selection. @returns {Object} Immutable filtered registry and safe group metadata. */
    resolve: function (
        registry,
        configuration,
        context,
        policy,
        policyConfiguration,
        selection,
        serviceAutomation = false,
    ) {
        if (!configuration || configuration.enabled === false) {
            if (selection !== undefined)
                throw new Error(
                    'COPILOT_KNOWLEDGE_GROUP_SELECTION_UNAVAILABLE',
                );
            return { registry, groups: [], enabled: false };
        }
        const validated = this.validate(configuration, registry);
        if (
            !context ||
            (context.channel !== 'EMPLOYEE' &&
                !(
                    serviceAutomation === true &&
                    context.channel === 'SYSTEM' &&
                    context.principalType === 'SERVICE' &&
                    policy.hasPermission(
                        context,
                        'copilot.knowledge.source.manage',
                    )
                )) ||
            !context.tenant ||
            !context.enterprise ||
            !context.actor
        )
            throw new Error('COPILOT_KNOWLEDGE_GROUP_CONTEXT_REQUIRED');
        const assignment = validated.assignments.find(
            (item) =>
                item.tenantCode === context.tenant &&
                item.enterpriseCode === context.enterprise,
        );
        const ceiling = new Set(
            assignment ? assignment.allowedSourceCodes : [],
        );
        const assigned = new Set(assignment ? assignment.groupCodes : []);
        const allowedSources = new Set(
            registry.sources
                .filter(
                    (source) =>
                        ceiling.has(source.code) &&
                        policy.decideSourceAccess(
                            source,
                            context,
                            policyConfiguration || {},
                        ).allowed,
                )
                .map((source) => source.code),
        );
        const groups = validated.definitions
            .filter((group) => assigned.has(group.code))
            .map((group) => ({
                code: group.code,
                name: group.name,
                active:
                    group.active &&
                    assignment.activeGroupCodes.includes(group.code),
                sourceCodes: group.sourceCodes.filter((code) =>
                    allowedSources.has(code),
                ),
            }))
            .filter((group) => group.sourceCodes.length > 0);
        const selected =
            selection === undefined
                ? groups
                      .filter((group) => group.active)
                      .map((group) => group.code)
                : this.codes(selection);
        if (
            selected.some(
                (code) =>
                    !groups.some(
                        (group) => group.code === code && group.active,
                    ),
            )
        )
            throw new Error('COPILOT_KNOWLEDGE_GROUP_SELECTION_UNAVAILABLE');
        const selectedCodes = new Set(
            groups
                .filter((group) => selected.includes(group.code))
                .flatMap((group) => group.sourceCodes),
        );
        return policy.deepFreeze({
            enabled: true,
            groups,
            registry: {
                ...registry,
                sources: registry.sources.filter((source) =>
                    selectedCodes.has(source.code),
                ),
                revision:
                    registry.revision +
                    '|groups:' +
                    require('node:crypto')
                        .createHash('sha256')
                        .update(
                            JSON.stringify({
                                tenant: context.tenant,
                                enterprise: context.enterprise,
                                groups: selected,
                                sources: [...selectedCodes].sort(),
                            }),
                        )
                        .digest('hex'),
            },
        });
    },
};
