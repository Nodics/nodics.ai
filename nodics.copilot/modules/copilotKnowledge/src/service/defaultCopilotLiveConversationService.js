/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module copilotKnowledge/service/DefaultCopilotLiveConversationService
 * @description Adapts explicit conversational live reads to secured Knowledge owners, without model execution or mutation authority.
 * @layer service @owner copilotKnowledge
 * @override Preserve exact command validation, source and group scope, owner authorization, inert rendering and exclusion from subsequent model context.
 */
module.exports = {
    /** Advertises only currently permitted live sources; this projection never grants later execution. @param {Object} scope Resolved group scope. @param {Object} context Trusted employee. @param {Object} configuration Effective properties. @returns {Object} Bounded composer catalogue. */
    catalogue: function (scope, context, configuration) {
        const policy = SERVICE.DefaultCopilotPolicyService;
        const sources = scope.registry.sources
            .filter(
                (source) =>
                    context.channel === 'EMPLOYEE' &&
                    source.enabled &&
                    ['DATABASE', 'EXTERNAL_LOG'].includes(source.sourceType) &&
                    source.tenantScopes.includes(context.tenant) &&
                    source.enterpriseScopes.includes(context.enterprise) &&
                    source.environmentScopes.includes(context.environment) &&
                    policy.hasPermission(
                        context,
                        source.sourceType === 'DATABASE'
                            ? 'copilot.data.query'
                            : 'copilot.logs.read',
                    ) &&
                    (source.sourceType !== 'EXTERNAL_LOG' ||
                        configuration.knowledge?.externalLogs?.enabled ===
                            true) &&
                    policy.decideSourceAccess(
                        source,
                        context,
                        configuration.policy,
                    ).allowed,
            )
            .map((source) => ({
                code: source.code,
                sourceType: source.sourceType,
                sourcePolicyDigest: source.sourcePolicyDigest,
                groupCodes: scope.groups
                    .filter(
                        (group) =>
                            group.active &&
                            group.sourceCodes.includes(source.code),
                    )
                    .map((group) => group.code),
            }));
        return {
            sources,
            presentation: {
                ...configuration.core?.conversationContext?.liveReads,
            },
        };
    },
    /** Recognizes a bounded explicit read command; unrelated prose remains normal conversation. @param {string} message User text. @returns {Object|null} Valid command or no match. */
    parse: function (message) {
        if (typeof message !== 'string' || !message.trim().startsWith('{'))
            return null;
        let command;
        try {
            command = JSON.parse(message);
        } catch (_) {
            return null;
        }
        if (
            ![
                'copilot.data.query',
                'copilot.data.collections',
                'copilot.data.schema',
                'copilot.data.capabilities',
                'copilot.data.deleteImpact',
                'copilot.logs.query',
            ].includes(command?.intent)
        )
            return null;
        if (
            message.length > 4096 ||
            Object.keys(command).some(
                (key) => !['intent', 'sourceCode', 'input'].includes(key),
            ) ||
            typeof command.sourceCode !== 'string' ||
            !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(command.sourceCode) ||
            !command.input ||
            typeof command.input !== 'object' ||
            Array.isArray(command.input)
        )
            throw new CLASSES.NodicsError('ERR_CPK_00007');
        const keys =
            command.intent === 'copilot.data.collections'
                ? []
                : command.intent === 'copilot.data.query'
                  ? ['schemaName', 'search', 'page']
                  : [
                          'copilot.data.schema',
                          'copilot.data.capabilities',
                      ].includes(command.intent)
                    ? ['schemaName']
                    : command.intent === 'copilot.data.deleteImpact'
                      ? ['schemaName', 'identity']
                      : ['from', 'to', 'correlationId'];
        if (Object.keys(command.input).some((key) => !keys.includes(key)))
            throw new CLASSES.NodicsError('ERR_CPK_00007');
        return command;
    },
    /** Formats owner data as inert indented JSON, never Markdown instructions or executable HTML. @param {Object} value Bounded authorized output. @returns {string} Display text. */
    display: function (value) {
        return JSON.stringify(value, null, 2)
            .split('\n')
            .map((line) => '    ' + line)
            .join('\n');
    },
    /** Executes exactly one owner query under the original identity and conversation selection. @param {Object} command Parsed command. @param {Object} request Trusted context. @param {Object} configuration Effective configuration. @returns {Promise<Object>} Current live evidence and deterministic answer. */
    execute: async function (command, request, configuration) {
        // Revalidate even when another framework caller invokes this extension point.
        const validated = this.parse(JSON.stringify(command));
        if (!validated) throw new CLASSES.NodicsError('ERR_CPK_00007');
        const input = {
            ...request,
            sourceCode: validated.sourceCode,
            body: validated.input,
        };
        const collections = validated.intent === 'copilot.data.collections';
        const inspection = {
            'copilot.data.schema': 'schema',
            'copilot.data.capabilities': 'capabilities',
            'copilot.data.deleteImpact': 'deleteImpact',
        }[validated.intent];
        const database =
            collections ||
            !!inspection ||
            validated.intent === 'copilot.data.query';
        const owner = database
            ? SERVICE.DefaultCopilotDatabaseSourceService
            : SERVICE.DefaultCopilotIncidentEvidenceService;
        const observed = collections
            ? await owner.inventory(input, configuration)
            : inspection
              ? await owner.inspect(input, configuration, inspection)
              : await owner.query(input, configuration);
        const key =
            collections || inspection
                ? 'items'
                : database
                  ? 'records'
                  : 'events';
        const result = {
            ...observed,
            [key]: collections
                ? observed.items.filter((item) => item.selected === true)
                : observed[key].slice(),
            omittedForDisplay: 0,
        };
        while (
            Buffer.byteLength(JSON.stringify(this.display(result))) > 49152
        ) {
            if (!result[key].length)
                throw new CLASSES.NodicsError('ERR_CPK_00007');
            result[key].pop();
            result.omittedForDisplay++;
        }
        const heading = inspection
            ? inspection === 'deleteImpact'
                ? 'Native deletion-impact preview. No records were changed. This bounded observation does not authorize deletion or guarantee a later outcome; zero matching targets may mean the supplied identity or revision is stale.'
                : 'Live collection ' +
                  inspection +
                  '. Metadata only; no business records were read. Advertised operations are not an execution grant or a claim of Copilot implementation.'
            : collections
              ? 'Selected collections: ' +
                result.items.length +
                '. Metadata only; no business records were read. Selection does not grant record access.'
              : database
                ? 'Live collection result: ' +
                  result.records.length +
                  ' records shown from this page. ' +
                  (result.mayHaveMore
                      ? 'More records may be available.'
                      : 'This response does not establish a total collection count.')
                : 'Observed incident events: ' +
                  result.events.length +
                  '. Coverage: ' +
                  result.coverage +
                  '. ' +
                  (result.hasMore
                      ? 'Additional events exist outside this bounded response. '
                      : '') +
                  'These events do not prove a root cause.';
        return {
            content:
                heading +
                (result.omittedForDisplay
                    ? ' Display limit reached: ' +
                      result.omittedForDisplay +
                      ' returned rows omitted.'
                    : '') +
                '\n\n' +
                this.display(result),
            citation: {
                citationId: 'live-' + result.sourceCode,
                title: inspection
                    ? 'Live collection ' + inspection
                    : collections
                      ? 'Live collection catalogue'
                      : database
                        ? 'Live collection evidence'
                        : 'Live incident evidence',
                locator: result.sourceCode,
                navigationType: 'INTERNAL_ROUTE',
                navigationTarget: '/copilot/knowledge',
                sourceType: database ? 'DATABASE' : 'EXTERNAL_LOG',
                version: result.observedAt,
            },
        };
    },
};
