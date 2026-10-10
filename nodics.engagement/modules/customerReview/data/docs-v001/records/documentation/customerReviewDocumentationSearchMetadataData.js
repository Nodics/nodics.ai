/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Nodics framework documentation search metadata. */
module.exports = {
  "record0": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepageengagementcustomerreviews",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageengagementCustomerReviews",
    "title": "Customer reviews and ratings",
    "summary": "Beginner-to-operator journey for review submission, moderation, publication, rating aggregates, recovery, APIs, and safe customization.",
    "searchText": "Customer reviews and ratings Beginner-to-operator journey for review submission, moderation, publication, rating aggregates, recovery, APIs, and safe customization. customer-engagement-and-feedback reviews-and-ratings customer-reviews-and-ratings",
    "keywords": [
      "customer-engagement-and-feedback",
      "reviews-and-ratings",
      "customer-reviews-and-ratings"
    ],
    "facets": {
      "nodeLevel": "PAGE_LINK",
      "nodeType": "PAGE",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ]
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "indexState": "INDEX_READY",
    "active": true
  },
  "record1": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepageengagementreviewmoderationgovernance",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageengagementReviewModerationGovernance",
    "title": "Review Moderation and Governance",
    "summary": "Axis moderation queues, approval and rejection decisions, permissions, state transitions, and audit expectations.",
    "searchText": "Review Moderation and Governance Axis moderation queues, approval and rejection decisions, permissions, state transitions, and audit expectations. customer-engagement-and-feedback reviews-and-ratings customer-reviews-and-ratings",
    "keywords": [
      "customer-engagement-and-feedback",
      "reviews-and-ratings",
      "customer-reviews-and-ratings"
    ],
    "facets": {
      "nodeLevel": "PAGE_LINK",
      "nodeType": "PAGE",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ]
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "indexState": "INDEX_READY",
    "active": true
  },
  "record2": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepageengagementreviewaggregationrecovery",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageengagementReviewAggregationRecovery",
    "title": "Review Aggregation and Recovery",
    "summary": "Rating aggregate correctness, recalculation, event recovery, and product or discovery visibility after review changes.",
    "searchText": "Review Aggregation and Recovery Rating aggregate correctness, recalculation, event recovery, and product or discovery visibility after review changes. customer-engagement-and-feedback reviews-and-ratings customer-reviews-and-ratings",
    "keywords": [
      "customer-engagement-and-feedback",
      "reviews-and-ratings",
      "customer-reviews-and-ratings"
    ],
    "facets": {
      "nodeLevel": "PAGE_LINK",
      "nodeType": "PAGE",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ]
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "indexState": "INDEX_READY",
    "active": true
  },
  "record3": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadataengagementcustomerreviews",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataengagementCustomerReviews",
    "title": "Customer reviews and ratings",
    "summary": "Beginner-to-operator journey for review submission, moderation, publication, rating aggregates, recovery, APIs, and safe customization.",
    "searchText": "Customer reviews and ratings Beginner-to-operator journey for review submission, moderation, publication, rating aggregates, recovery, APIs, and safe customization. # Customer reviews and ratings\n\nCustomer Reviews and Ratings is the overview for capturing shopper feedback, moderating it, publishing approved reviews, and maintaining aggregate rating correctness. The detailed moderation and recovery topics live beside this page.\n\n## Review lifecycle\n\n```mermaid\nflowchart LR\n  Shopper[\"Shopper submits review\"] --> Staged[\"Review captured\"]\n  Staged --> Moderate[\"Moderation decision\"]\n  Moderate --> Publish[\"Approved review visible\"]\n  Publish --> Aggregate[\"Rating aggregate updated\"]\n```\n\n| Stage | Business question | Technical question |\n| --- | --- | --- |\n| Capture | Who can submit feedback? | Which API, identity, and product reference are required? |\n| Moderate | Who approves or rejects? | Which roles, queues, and state transitions apply? |\n| Publish | Where does the review appear? | Which site, catalog, channel, and visibility rules apply? |\n| Aggregate | Are ratings accurate? | Which recalculation and recovery path validates totals? |\n\n## Business perspective\n\nReviews influence product trust, merchandising, search, and customer service. Business users need to know which reviews are waiting, which were rejected, which are public, and whether aggregate ratings are trustworthy. Documentation must describe the operational journey without hiding it behind API language.\n\n## Developer perspective\n\nDevelopers need the data model, public submission behavior, moderation workflow, aggregate update logic, events, permissions, and extension points. Projects may add fraud checks, syndication, review requests, moderation policies, or downstream search indexing, but those changes must stay inside the governed engagement model.\n\n## Continue with\n\n- **Review Moderation and Governance** for Axis queues, approval, rejection, permissions, and business audit.\n- **Review Aggregation and Recovery** for aggregate correctness, recalculation, failure recovery, and search or product-page impact.\n\n## Operational evidence\n\nA review feature is only trustworthy when the visible customer experience and the administrative queue agree. Evidence should include submitted review record, product relation, moderation state, reviewer decision, final public visibility, aggregate rating result, and any downstream search or discovery update. Project documentation should also say whether reviews are enabled by site, catalog, channel, product type, or customer segment. This helps a business user understand why reviews appear in one experience and not another.\n\n## Reader and implementation contract\n\nA beginner should understand the simple journey: a shopper submits feedback, a reviewer makes a governed decision, and only approved content affects public experience. A business user should know how reviews affect trust, merchandising, service response, and product discovery. A developer should understand the submission contract, moderation state, aggregate update, events, permissions, and extension points. An operator should know which queues, logs, and recalculation tools prove the feature is healthy.\n\nEvery review topic must include shopper journey, Axis moderation journey, public visibility, security and privacy rules, aggregate correctness, recovery path, and browser verification. If a project customizes rating rules, review requests, syndication, or moderation policy, this page must link to the project-specific implementation and tests.\n\n## Documentation maintenance rule\n\nKeep this topic current whenever implementation, configuration, Axis workflow, publication behavior, or customer-facing rendering changes. The page should remain small enough to scan, but it must still carry enough business context, technical ownership, customization guidance, visual structure, operational evidence, and verification detail for a reader to act without guessing. When the detail becomes too large, create a sibling topic and link it from this page instead of turning the overview back into a long mixed article.\n\n## Common mistakes\n\n- Showing reviews publicly without a moderation state.\n- Updating aggregate ratings without a recovery path.\n- Documenting submission APIs but not the business approval journey.\n- Forgetting privacy, abuse, and role-based access rules.\n\n## Verification\n\nVerify reviews by submitting a review, moderating it, checking public visibility, recalculating aggregate ratings, and confirming audit evidence. Browser checks should cover shopper-visible pages and Axis moderation screens.\n",
    "keywords": [
      "customer-engagement-and-feedback",
      "reviews-and-ratings",
      "customer-reviews-and-ratings",
      "Customer Engagement and Feedback",
      "Reviews and Ratings",
      "Customer reviews and ratings"
    ],
    "facets": {
      "section": "customer-engagement-and-feedback",
      "group": "customer-engagement-and-feedback",
      "navigationDepth": 2,
      "documentType": "how-to",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "maturityState": "operational"
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "indexState": "INDEX_READY",
    "active": true
  },
  "record4": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadataengagementreviewmoderationgovernance",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataengagementReviewModerationGovernance",
    "title": "Review Moderation and Governance",
    "summary": "Axis moderation queues, approval and rejection decisions, permissions, state transitions, and audit expectations.",
    "searchText": "Review Moderation and Governance Axis moderation queues, approval and rejection decisions, permissions, state transitions, and audit expectations. # Review Moderation and Governance\n\nReview Moderation and Governance explains how submitted reviews become approved, rejected, hidden, or escalated. It is written for business moderators, administrators, developers, operators, QA owners, and AI tools that need a clear lifecycle contract.\n\n## Moderation flow\n\n```mermaid\nflowchart TD\n  Submitted[\"Submitted review\"] --> Queue[\"Moderation queue\"]\n  Queue --> Approve[\"Approve\"]\n  Queue --> Reject[\"Reject\"]\n  Queue --> Escalate[\"Escalate or hold\"]\n  Approve --> Public[\"Visible review\"]\n  Reject --> Hidden[\"Hidden with reason\"]\n```\n\n| Decision | Required evidence |\n| --- | --- |\n| Approve | Reviewer, timestamp, review id, product id, and visibility target. |\n| Reject | Reviewer, timestamp, reason, notification rule, and audit state. |\n| Hold | Owner, reason, due date, and next action. |\n| Escalate | Queue, role requirement, and business risk. |\n\n## Business perspective\n\nModerators need a clear queue, filters, review context, product context, customer context, and one obvious decision area. The UI should not make a user open unrelated pages to understand what can be approved. Documentation should explain how review decisions affect product pages, customer trust, search ranking, and compliance.\n\n## Developer perspective\n\nDevelopers should expose moderation through explicit state transitions and permissions. The requester or submitter identity is audit data, not the only approval rule. Approval should be controlled by role, permission, and workflow policy. Projects can add custom checks, but every added rule must be visible in Axis and covered by tests.\n\n## Operator perspective\n\nOperators need to see stuck reviews, failed moderation actions, event delivery failures, and aggregate update status. If moderation emits events to search, notification, analytics, or product services, the documentation must explain retry and recovery behavior.\n\n## Operational evidence\n\nModeration evidence should be visible without requiring the reviewer to interpret raw records. The queue should show item context, current state, allowed actions, decision history, and next outcome. The backend evidence should include role or permission evaluation, workflow transition, rejection reason, audit user, and timestamps. This is important because moderation is a governed business operation; the user journey must make the correct action obvious while still preserving enough detail for compliance and debugging.\n\n## Reader and implementation contract\n\nA beginner should understand that moderation is a business decision with audit, not an edit button on a record. A business reviewer should see what must be reviewed, why it matters, and what each decision changes. A developer should document permissions, workflow policy, state transitions, validation, events, and rejection reasons. An operator should know where blocked, stale, or failed moderation tasks appear and how they are retried.\n\nThis page must be updated when approval policy changes globally, because the rule is permission-based and should not be hardcoded around requester identity. Documentation should show the queue and decision flow visually so reviewers are not forced through disconnected pages to complete one task.\n\n## Customization and extension guidance\n\nProjects can customize review moderation with additional decision states, abuse checks, escalation queues, notification rules, or role policies. Document the workflow change, permission rule, state transition, Axis queue behavior, audit fields, and browser verification. Approval should remain governed by policy and permission, not by hardcoded assumptions about who created the request.\n\n## Common mistakes\n\n- Blocking approval only because the same user submitted the request, while ignoring actual permissions.\n- Hiding rejection reasons from the audit trail.\n- Making moderation depend on frontend-only state.\n- Updating public visibility before the workflow decision is complete.\n\n## Verification\n\nVerify moderation with success, rejection, permission-denied, escalation, and retry scenarios. Browser evidence should show the queue, selected review, decision controls, confirmation state, and final visibility.\n",
    "keywords": [
      "customer-engagement-and-feedback",
      "reviews-and-ratings",
      "customer-reviews-and-ratings",
      "Customer Engagement and Feedback",
      "Reviews and Ratings",
      "Customer reviews and ratings"
    ],
    "facets": {
      "section": "customer-engagement-and-feedback",
      "group": "customer-engagement-and-feedback",
      "navigationDepth": 2,
      "documentType": "how-to",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "maturityState": "operational"
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "indexState": "INDEX_READY",
    "active": true
  },
  "record5": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadataengagementreviewaggregationrecovery",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataengagementReviewAggregationRecovery",
    "title": "Review Aggregation and Recovery",
    "summary": "Rating aggregate correctness, recalculation, event recovery, and product or discovery visibility after review changes.",
    "searchText": "Review Aggregation and Recovery Rating aggregate correctness, recalculation, event recovery, and product or discovery visibility after review changes. # Review Aggregation and Recovery\n\nReview Aggregation and Recovery explains how Nodics keeps average ratings, review counts, and review-derived signals correct after moderation decisions, imports, failures, retries, or project customizations.\n\n## Aggregate flow\n\n```mermaid\nflowchart LR\n  Decision[\"Review decision\"] --> Event[\"Aggregate event\"]\n  Event --> Aggregate[\"Rating aggregate\"]\n  Aggregate --> Product[\"Product page\"]\n  Aggregate --> Search[\"Search or discovery\"]\n  Failure[\"Failure\"] --> Rebuild[\"Recalculate\"]\n  Rebuild --> Aggregate\n```\n\n| Aggregate | Why it matters | Recovery signal |\n| --- | --- | --- |\n| Review count | Merchandising and shopper trust. | Count differs from approved review query. |\n| Average rating | Product ranking and conversion. | Stored average differs from recalculated value. |\n| Distribution | Filtering and analytics. | Bucket totals do not match approved reviews. |\n| Derived search field | Discovery and sorting. | Search index differs from Online data. |\n\n## Business perspective\n\nA business user should not have to trust a number blindly. If a product shows 4.7 stars, the system should be able to explain which approved reviews created that value and how it can be recalculated. This matters for customer trust, marketplace quality, and commercial decisions.\n\n## Developer perspective\n\nDevelopers should keep aggregation idempotent and recoverable. Moderation, imports, deletes, retire actions, or syndication updates can all change the aggregate. The implementation should expose recalculation APIs or jobs, document events, and keep search synchronization separate from the source of truth.\n\n## Operator perspective\n\nOperators need a way to detect drift, rerun aggregate calculation, inspect failed events, and validate the product page after recovery. If an aggregate update is asynchronous, documentation must state where pending and failed work is visible.\n\n## Operational evidence\n\nAggregate recovery evidence should compare source reviews with stored totals. Include approved count, rejected count, rating distribution, computed average, stored average, recalculation run id, event status, and storefront verification. If search consumes the aggregate, include the indexed value and refresh behavior. This lets a business user trust the number on the page and lets a developer or operator quickly decide whether the problem is source data, event delivery, calculation logic, or index synchronization.\n\n## Reader and implementation contract\n\nA beginner should understand that aggregate ratings are derived evidence, not hand-authored content. A business user should know why aggregate accuracy affects product confidence, sorting, and commercial decisions. A developer should document the source query, update event, recalculation job, idempotency model, and search synchronization. An operator should know how to detect drift, rebuild safely, and validate the storefront after recovery.\n\nEvery aggregate topic must include successful update, rejected review behavior, deleted or retired review behavior, failed event recovery, recalculation acceptance, and browser verification. If downstream search or analytics consumes aggregate ratings, link those dependencies so the business impact is visible.\n\n## Documentation maintenance rule\n\nKeep this topic current whenever implementation, configuration, Axis workflow, publication behavior, or customer-facing rendering changes. The page should remain small enough to scan, but it must still carry enough business context, technical ownership, customization guidance, visual structure, operational evidence, and verification detail for a reader to act without guessing. When the detail becomes too large, create a sibling topic and link it from this page instead of turning the overview back into a long mixed article.\n\nThis extension guidance must stay linked to the owning project or capability page whenever a customer customizes the behavior.\n\n## Common mistakes\n\n- Treating aggregate values as manually editable content.\n- Updating search before the source review state is final.\n- Recalculating without an idempotency or audit contract.\n- Testing a single approved review but not rejection, deletion, or retry.\n\n## Verification\n\nVerify aggregation by creating approved and rejected reviews, recalculating the aggregate, comparing stored values to source queries, and checking browser output on product or discovery pages. Include failure and retry evidence for production readiness.\n",
    "keywords": [
      "customer-engagement-and-feedback",
      "reviews-and-ratings",
      "customer-reviews-and-ratings",
      "Customer Engagement and Feedback",
      "Reviews and Ratings",
      "Customer reviews and ratings"
    ],
    "facets": {
      "section": "customer-engagement-and-feedback",
      "group": "customer-engagement-and-feedback",
      "navigationDepth": 2,
      "documentType": "how-to",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "maturityState": "operational"
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "indexState": "INDEX_READY",
    "active": true
  }
};
