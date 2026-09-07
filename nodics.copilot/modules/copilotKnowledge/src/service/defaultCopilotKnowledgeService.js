/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/** @module copilotKnowledge/src/service/defaultCopilotKnowledgeService @description Builds bounded evidence and citations from Discovery-owned query results. @layer service @owner copilotKnowledge @override Projects may change evidence selection without creating a second search authority. */
module.exports = {
    /** Converts Discovery results into grounded context. @param {Object[]} results Discovery results. @param {Object} options Bounds. @returns {Object} Evidence context. */
    buildContext: function (results, options) {
        const maximum = Number((options || {}).maximumEvidenceItems || 20);
        const evidence = (results || []).slice(0, maximum).map((item, index) => ({
            id: item.id || 'evidence-' + (index + 1), title: item.title || item.name || 'Untitled',
            excerpt: String(item.excerpt || item.content || ''), sourceType: item.sourceType || 'unknown',
            source: item.source || item.url || null, score: Number(item.score || 0),
            provenance: item.provenance ? Object.assign({}, item.provenance) : undefined
        }));
        return { evidence: evidence, citations: evidence.map(item => {
            const citation = {
                citationId: item.id, id: item.id, title: item.title, locator: item.source,
                source: item.source, sourceType: item.sourceType, navigationType: 'NONE'
            };
            if (item.provenance && item.provenance.relativePath) citation.section = item.provenance.relativePath;
            if (item.provenance && item.provenance.version) citation.version = item.provenance.version;
            if (item.provenance) citation.provenance = item.provenance;
            return citation;
        }) };
    }
};
