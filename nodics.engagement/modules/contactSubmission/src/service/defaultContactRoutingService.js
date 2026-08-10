/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module contactSubmission/src/service/defaultContactRoutingService @description Applies configuration-first queue, team, priority, and SLA routing with safe fallback. @layer service @owner contactSubmission @override Tenant layers may add reason routing without hardcoded project queues. */
module.exports = { route: function (contact, configuration, now) { let rule = (configuration.reasons || {})[contact.reasonCode] || {}; let start = new Date(now); return { queueCode: rule.queueCode || configuration.fallbackQueue, teamCode: rule.teamCode || configuration.fallbackTeam, priorityCode: rule.priorityCode || 'NORMAL', dueAt: new Date(start.getTime() + Number(rule.slaMinutes || configuration.defaultSlaMinutes) * 60000).toISOString(), fallback: !configuration.reasons[contact.reasonCode] }; } };
