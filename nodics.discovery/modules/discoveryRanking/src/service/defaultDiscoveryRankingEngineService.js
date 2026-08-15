/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module discoveryRanking/service/defaultDiscoveryRankingEngineService @description Applies generic pin, boost, and bury actions to a result set. @layer service @owner discoveryRanking */
module.exports = {
    /** Returns entity code from a ranked item. @param {Object} item Result item. @param {string} codeProperty Code property. @returns {string|undefined} Code. */
    code: function (item, codeProperty) {
        return item && item[codeProperty || 'code'];
    },

    /** Applies actions to result items. @param {Array} items Result items. @param {Array} actions Ranking actions. @param {Object} options Ranking options. @returns {Array} Ranked items. */
    apply: function (items, actions, options) {
        let codeProperty = (options && options.codeProperty) || 'code';
        let defaults = ((CONFIG.get('discovery') || {}).ranking) || {};
        let boostScore = Number(defaults.boostScore || 1000);
        let buryScore = Number(defaults.buryScore || -1000);
        let original = new Map();
        (items || []).forEach((item, index) => original.set(this.code(item, codeProperty), index));
        let score = new Map();
        let pins = [];
        (actions || []).forEach(action => {
            let target = action.targetCode || action.productCode;
            if (!original.has(target)) return;
            if (action.actionType === 'PIN') pins.push({ code: target, position: Number(action.position || 1) });
            if (action.actionType === 'BOOST') score.set(target, (score.get(target) || 0) + Number(action.score || boostScore));
            if (action.actionType === 'BURY') score.set(target, (score.get(target) || 0) + Number(action.score || buryScore));
        });
        let ranked = (items || []).slice().sort((left, right) => {
            let leftCode = this.code(left, codeProperty), rightCode = this.code(right, codeProperty);
            let diff = (score.get(rightCode) || 0) - (score.get(leftCode) || 0);
            return diff || (original.get(leftCode) - original.get(rightCode));
        });
        pins.sort((left, right) => left.position - right.position).forEach(pin => {
            let index = ranked.findIndex(item => this.code(item, codeProperty) === pin.code);
            if (index < 0) return;
            let item = ranked.splice(index, 1)[0];
            ranked.splice(Math.max(0, pin.position - 1), 0, item);
        });
        return ranked;
    }
};
