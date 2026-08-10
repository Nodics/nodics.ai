/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/**
 * @module customerFeedback/src/service/defaultCustomerFeedbackMetricsService
 * @description Calculates transparent NPS, CSAT, CES, response, and lifecycle metrics from allow-listed feedback evidence.
 * @layer service
 * @owner customerFeedback
 * @override Customer modules may add benchmark dimensions while preserving source counts, scale declarations, and deterministic formulas.
 */
module.exports = {
    /** Returns finite scores for one declared metric from source feedback. */
    values: function (feedback, metric) {
        return (feedback || []).map(item => item && item.scores && Number(item.scores[metric])).filter(Number.isFinite);
    },

    /** Calculates one survey metric with numerator and denominator evidence. */
    calculate: function (feedback, metric, options) {
        options = options || {};
        let values = this.values(feedback, metric);
        if (!values.length) return { metric: metric, value: undefined, responseCount: 0, reason: 'NO_RESPONSES' };
        if (metric === 'NPS') {
            let promoters = values.filter(value => value >= 9 && value <= 10).length;
            let detractors = values.filter(value => value >= 0 && value <= 6).length;
            if (promoters + detractors > values.length) throw new Error('NPS values must use a 0 to 10 scale');
            return { metric: metric, value: Number((((promoters - detractors) / values.length) * 100).toFixed(2)), responseCount: values.length, promoters: promoters, detractors: detractors, passives: values.length - promoters - detractors, scale: '0-10' };
        }
        let minimum = Number(options.minimum || 1);
        let maximum = Number(options.maximum || 5);
        if (values.some(value => value < minimum || value > maximum)) throw new Error(metric + ' values are outside the declared scale');
        let average = values.reduce((sum, value) => sum + value, 0) / values.length;
        return { metric: metric, value: Number(average.toFixed(2)), responseCount: values.length, scale: minimum + '-' + maximum };
    },

    /** Groups a declared metric by UTC calendar period for explainable trends. */
    trend: function (feedback, metric, options) {
        options = options || {};
        let buckets = new Map();
        (feedback || []).forEach(item => {
            let timestamp = item.submittedAt && new Date(item.submittedAt);
            if (!timestamp || Number.isNaN(timestamp.getTime())) return;
            let key = options.period === 'DAY' ? timestamp.toISOString().slice(0, 10) : timestamp.toISOString().slice(0, 7);
            if (!buckets.has(key)) buckets.set(key, []);
            buckets.get(key).push(item);
        });
        return Array.from(buckets.entries()).sort(([left], [right]) => left.localeCompare(right)).map(([period, items]) => Object.assign({ period: period }, this.calculate(items, metric, options)));
    },

    /** Calculates bounded operational counts without exposing message content. */
    operations: function (feedback) {
        let records = feedback || [];
        let terminal = records.filter(item => ['RESOLVED', 'CLOSED'].includes(item.status));
        let overdue = records.filter(item => item.dueAt && new Date(item.dueAt).getTime() < Date.now() && !['RESOLVED', 'CLOSED', 'REJECTED'].includes(item.status));
        return { total: records.length, terminal: terminal.length, open: records.length - terminal.length, overdue: overdue.length };
    }
};
