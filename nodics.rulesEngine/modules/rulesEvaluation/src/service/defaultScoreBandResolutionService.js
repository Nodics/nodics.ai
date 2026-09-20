/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module rulesEvaluation/src/service/defaultScoreBandResolutionService
 * @description Resolves exactly one enabled score band from a deterministic final score.
 * @layer service
 * @owner rulesEvaluation
 */
module.exports = {
    contains: function (band, score) {
        let minimum = Number(band.minScore);
        let maximum = band.maxScore === undefined || band.maxScore === null || band.maxScore === ''
            ? undefined
            : Number(band.maxScore);
        if (!Number.isFinite(minimum)) throw new Error('Score band minimum must be numeric');
        if (maximum !== undefined && !Number.isFinite(maximum)) throw new Error('Score band maximum must be numeric');
        return score >= minimum && (maximum === undefined || score <= maximum);
    },

    resolve: function (request) {
        request = request || {};
        let score = Number(request.score);
        if (!Number.isFinite(score)) throw new Error('A numeric score is required for band resolution');
        let matches = (request.bands || [])
            .filter(band => band && band.enabled !== false)
            .filter(band => this.contains(band, score));
        if (matches.length > 1) throw new Error('Score band configuration is ambiguous');
        if (matches.length === 0) {
            if (request.gapBehavior === 'NO_OUTCOME') return undefined;
            throw new Error('No score band covers the calculated score');
        }
        return Object.freeze(Object.assign({}, matches[0]));
    }
};
