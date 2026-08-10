/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module nodics.engagement/test/engagementPaginationFilterContract @description Prevents API pagination controls from becoming persistence filters that hide valid operator records. @layer test @owner nodics.engagement */

const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '../modules');
const feedback = require(path.join(root, 'customerFeedback/src/service/defaultCustomerFeedbackApiService'));
const review = require(path.join(root, 'customerReview/src/service/defaultCustomerReviewApiService'));
const operations = require(path.join(root, 'engagementCore/src/service/defaultEngagementOperationsApiService'));

const input = { status: 'RECEIVED', limit: 25, offset: 10, page: 2, pageSize: 25, sort: '-submittedAt' };
const expected = { status: 'RECEIVED' };
assert.deepEqual(feedback.filters(input), expected);
assert.deepEqual(review.filters(input), expected);
assert.deepEqual(operations.filters(input), expected);
assert.deepEqual(input, { status: 'RECEIVED', limit: 25, offset: 10, page: 2, pageSize: 25, sort: '-submittedAt' });
console.log('Engagement pagination and persistence-filter separation contract validated');
