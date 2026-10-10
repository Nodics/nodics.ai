/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Canonical module-owned documentation CMS component records. */
module.exports = {
  "record0": {
    "code": "nodicsDocsComponentengagementCustomerReviews",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "engagement.customer-reviews",
      "title": "Customer reviews and ratings",
      "route": "/docs/framework/engagement-customer-reviews",
      "section": "customer-engagement-and-feedback",
      "sectionTitle": "Customer Engagement and Feedback",
      "group": "customer-engagement-and-feedback",
      "groupTitle": "Customer Engagement and Feedback",
      "parentId": "customer-engagement-and-feedback",
      "hierarchyPath": [
        "Customer Engagement and Feedback",
        "Customer reviews and ratings"
      ],
      "hierarchyDepth": 2,
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
      "businessAudience": [
        "business user",
        "administrator",
        "implementation partner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "Beginner-to-operator journey for review submission, moderation, publication, rating aggregates, recovery, APIs, and safe customization.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "engagement.unified-operations",
        "engagement.enterprise-operations",
        "engagement.review-moderation-governance",
        "engagement.review-aggregation-recovery"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "table"
      ],
      "searchKeywords": [
        "customer-engagement-and-feedback",
        "reviews-and-ratings",
        "customer-reviews-and-ratings"
      ],
      "topicKeywords": [
        "Customer Engagement and Feedback",
        "Reviews and Ratings",
        "Customer reviews and ratings"
      ],
      "headings": [
        {
          "text": "Review lifecycle",
          "anchor": "engagementCustomerReviews-1-review-lifecycle",
          "level": 2
        },
        {
          "text": "Business perspective",
          "anchor": "engagementCustomerReviews-2-business-perspective",
          "level": 2
        },
        {
          "text": "Developer perspective",
          "anchor": "engagementCustomerReviews-3-developer-perspective",
          "level": 2
        },
        {
          "text": "Continue with",
          "anchor": "engagementCustomerReviews-4-continue-with",
          "level": 2
        },
        {
          "text": "Operational evidence",
          "anchor": "engagementCustomerReviews-5-operational-evidence",
          "level": 2
        },
        {
          "text": "Reader and implementation contract",
          "anchor": "engagementCustomerReviews-6-reader-and-implementation-contract",
          "level": 2
        },
        {
          "text": "Documentation maintenance rule",
          "anchor": "engagementCustomerReviews-7-documentation-maintenance-rule",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "engagementCustomerReviews-8-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "engagementCustomerReviews-9-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Customer Reviews and Ratings is the overview for capturing shopper feedback, moderating it, publishing approved reviews, and maintaining aggregate rating correctness. The detailed moderation and recovery topics live beside this page."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Review lifecycle",
          "anchor": "engagementCustomerReviews-1-review-lifecycle"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Shopper[\"Shopper submits review\"] --> Staged[\"Review captured\"]\n  Staged --> Moderate[\"Moderation decision\"]\n  Moderate --> Publish[\"Approved review visible\"]\n  Publish --> Aggregate[\"Rating aggregate updated\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Stage",
            "Business question",
            "Technical question"
          ],
          "rows": [
            [
              "Capture",
              "Who can submit feedback?",
              "Which API, identity, and product reference are required?"
            ],
            [
              "Moderate",
              "Who approves or rejects?",
              "Which roles, queues, and state transitions apply?"
            ],
            [
              "Publish",
              "Where does the review appear?",
              "Which site, catalog, channel, and visibility rules apply?"
            ],
            [
              "Aggregate",
              "Are ratings accurate?",
              "Which recalculation and recovery path validates totals?"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business perspective",
          "anchor": "engagementCustomerReviews-2-business-perspective"
        },
        {
          "kind": "paragraph",
          "text": "Reviews influence product trust, merchandising, search, and customer service. Business users need to know which reviews are waiting, which were rejected, which are public, and whether aggregate ratings are trustworthy. Documentation must describe the operational journey without hiding it behind API language."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer perspective",
          "anchor": "engagementCustomerReviews-3-developer-perspective"
        },
        {
          "kind": "paragraph",
          "text": "Developers need the data model, public submission behavior, moderation workflow, aggregate update logic, events, permissions, and extension points. Projects may add fraud checks, syndication, review requests, moderation policies, or downstream search indexing, but those changes must stay inside the governed engagement model."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Continue with",
          "anchor": "engagementCustomerReviews-4-continue-with"
        },
        {
          "kind": "unordered-list",
          "items": [
            "**Review Moderation and Governance** for Axis queues, approval, rejection, permissions, and business audit.",
            "**Review Aggregation and Recovery** for aggregate correctness, recalculation, failure recovery, and search or product-page impact."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operational evidence",
          "anchor": "engagementCustomerReviews-5-operational-evidence"
        },
        {
          "kind": "paragraph",
          "text": "A review feature is only trustworthy when the visible customer experience and the administrative queue agree. Evidence should include submitted review record, product relation, moderation state, reviewer decision, final public visibility, aggregate rating result, and any downstream search or discovery update. Project documentation should also say whether reviews are enabled by site, catalog, channel, product type, or customer segment. This helps a business user understand why reviews appear in one experience and not another."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Reader and implementation contract",
          "anchor": "engagementCustomerReviews-6-reader-and-implementation-contract"
        },
        {
          "kind": "paragraph",
          "text": "A beginner should understand the simple journey: a shopper submits feedback, a reviewer makes a governed decision, and only approved content affects public experience. A business user should know how reviews affect trust, merchandising, service response, and product discovery. A developer should understand the submission contract, moderation state, aggregate update, events, permissions, and extension points. An operator should know which queues, logs, and recalculation tools prove the feature is healthy."
        },
        {
          "kind": "paragraph",
          "text": "Every review topic must include shopper journey, Axis moderation journey, public visibility, security and privacy rules, aggregate correctness, recovery path, and browser verification. If a project customizes rating rules, review requests, syndication, or moderation policy, this page must link to the project-specific implementation and tests."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Documentation maintenance rule",
          "anchor": "engagementCustomerReviews-7-documentation-maintenance-rule"
        },
        {
          "kind": "paragraph",
          "text": "Keep this topic current whenever implementation, configuration, Axis workflow, publication behavior, or customer-facing rendering changes. The page should remain small enough to scan, but it must still carry enough business context, technical ownership, customization guidance, visual structure, operational evidence, and verification detail for a reader to act without guessing. When the detail becomes too large, create a sibling topic and link it from this page instead of turning the overview back into a long mixed article."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "engagementCustomerReviews-8-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Showing reviews publicly without a moderation state.",
            "Updating aggregate ratings without a recovery path.",
            "Documenting submission APIs but not the business approval journey.",
            "Forgetting privacy, abuse, and role-based access rules."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "engagementCustomerReviews-9-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verify reviews by submitting a review, moderating it, checking public visibility, recalculating aggregate ratings, and confirming audit evidence. Browser checks should cover shopper-visible pages and Axis moderation screens."
        }
      ],
      "searchText": "Customer reviews and ratings Beginner-to-operator journey for review submission, moderation, publication, rating aggregates, recovery, APIs, and safe customization. # Customer reviews and ratings\n\nCustomer Reviews and Ratings is the overview for capturing shopper feedback, moderating it, publishing approved reviews, and maintaining aggregate rating correctness. The detailed moderation and recovery topics live beside this page.\n\n## Review lifecycle\n\n```mermaid\nflowchart LR\n  Shopper[\"Shopper submits review\"] --> Staged[\"Review captured\"]\n  Staged --> Moderate[\"Moderation decision\"]\n  Moderate --> Publish[\"Approved review visible\"]\n  Publish --> Aggregate[\"Rating aggregate updated\"]\n```\n\n| Stage | Business question | Technical question |\n| --- | --- | --- |\n| Capture | Who can submit feedback? | Which API, identity, and product reference are required? |\n| Moderate | Who approves or rejects? | Which roles, queues, and state transitions apply? |\n| Publish | Where does the review appear? | Which site, catalog, channel, and visibility rules apply? |\n| Aggregate | Are ratings accurate? | Which recalculation and recovery path validates totals? |\n\n## Business perspective\n\nReviews influence product trust, merchandising, search, and customer service. Business users need to know which reviews are waiting, which were rejected, which are public, and whether aggregate ratings are trustworthy. Documentation must describe the operational journey without hiding it behind API language.\n\n## Developer perspective\n\nDevelopers need the data model, public submission behavior, moderation workflow, aggregate update logic, events, permissions, and extension points. Projects may add fraud checks, syndication, review requests, moderation policies, or downstream search indexing, but those changes must stay inside the governed engagement model.\n\n## Continue with\n\n- **Review Moderation and Governance** for Axis queues, approval, rejection, permissions, and business audit.\n- **Review Aggregation and Recovery** for aggregate correctness, recalculation, failure recovery, and search or product-page impact.\n\n## Operational evidence\n\nA review feature is only trustworthy when the visible customer experience and the administrative queue agree. Evidence should include submitted review record, product relation, moderation state, reviewer decision, final public visibility, aggregate rating result, and any downstream search or discovery update. Project documentation should also say whether reviews are enabled by site, catalog, channel, product type, or customer segment. This helps a business user understand why reviews appear in one experience and not another.\n\n## Reader and implementation contract\n\nA beginner should understand the simple journey: a shopper submits feedback, a reviewer makes a governed decision, and only approved content affects public experience. A business user should know how reviews affect trust, merchandising, service response, and product discovery. A developer should understand the submission contract, moderation state, aggregate update, events, permissions, and extension points. An operator should know which queues, logs, and recalculation tools prove the feature is healthy.\n\nEvery review topic must include shopper journey, Axis moderation journey, public visibility, security and privacy rules, aggregate correctness, recovery path, and browser verification. If a project customizes rating rules, review requests, syndication, or moderation policy, this page must link to the project-specific implementation and tests.\n\n## Documentation maintenance rule\n\nKeep this topic current whenever implementation, configuration, Axis workflow, publication behavior, or customer-facing rendering changes. The page should remain small enough to scan, but it must still carry enough business context, technical ownership, customization guidance, visual structure, operational evidence, and verification detail for a reader to act without guessing. When the detail becomes too large, create a sibling topic and link it from this page instead of turning the overview back into a long mixed article.\n\n## Common mistakes\n\n- Showing reviews publicly without a moderation state.\n- Updating aggregate ratings without a recovery path.\n- Documenting submission APIs but not the business approval journey.\n- Forgetting privacy, abuse, and role-based access rules.\n\n## Verification\n\nVerify reviews by submitting a review, moderating it, checking public visibility, recalculating aggregate ratings, and confirming audit evidence. Browser checks should cover shopper-visible pages and Axis moderation screens.\n",
      "previous": {
        "title": "Cancellation, return, and refund lifecycle",
        "route": "/docs/framework/commerce-returns-refunds"
      },
      "next": {
        "title": "Review Moderation and Governance",
        "route": "/docs/framework/engagement-review-moderation-governance"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.engagement",
        "technicalModule": "customerReview",
        "owner": "customerReview",
        "sourcePath": "data/docs-v001/records/documentation/customerReviewDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/customerReviewDocumentationComponentData.js",
        "wordCount": 569,
        "checksum": "a9d786ad0572fbdb23b241e613296e604de7746ca5d8b1cd441052ef625c4b16"
      },
      "slug": "engagement-customer-reviews",
      "locale": "en",
      "navigationGroup": "Reviews and Ratings",
      "navigationGroupCode": "reviews-and-ratings",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "engagement.unified-operations",
          "owner": "engagementCore"
        },
        {
          "documentId": "engagement.enterprise-operations",
          "owner": "engagementCore"
        },
        {
          "documentId": "engagement.review-moderation-governance",
          "owner": "customerReview"
        },
        {
          "documentId": "engagement.review-aggregation-recovery",
          "owner": "customerReview"
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "nodicsDocsComponentengagementReviewModerationGovernance",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "engagement.review-moderation-governance",
      "title": "Review Moderation and Governance",
      "route": "/docs/framework/engagement-review-moderation-governance",
      "section": "customer-engagement-and-feedback",
      "sectionTitle": "Customer Engagement and Feedback",
      "group": "customer-engagement-and-feedback",
      "groupTitle": "Customer Engagement and Feedback",
      "parentId": "customer-engagement-and-feedback",
      "hierarchyPath": [
        "Customer Engagement and Feedback",
        "Review Moderation and Governance"
      ],
      "hierarchyDepth": 2,
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
      "businessAudience": [
        "business user",
        "administrator",
        "implementation partner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "Axis moderation queues, approval and rejection decisions, permissions, state transitions, and audit expectations.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "engagement.customer-reviews"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "table"
      ],
      "searchKeywords": [
        "customer-engagement-and-feedback",
        "reviews-and-ratings",
        "customer-reviews-and-ratings"
      ],
      "topicKeywords": [
        "Customer Engagement and Feedback",
        "Reviews and Ratings",
        "Customer reviews and ratings"
      ],
      "headings": [
        {
          "text": "Moderation flow",
          "anchor": "engagementReviewModerationGovernance-1-moderation-flow",
          "level": 2
        },
        {
          "text": "Business perspective",
          "anchor": "engagementReviewModerationGovernance-2-business-perspective",
          "level": 2
        },
        {
          "text": "Developer perspective",
          "anchor": "engagementReviewModerationGovernance-3-developer-perspective",
          "level": 2
        },
        {
          "text": "Operator perspective",
          "anchor": "engagementReviewModerationGovernance-4-operator-perspective",
          "level": 2
        },
        {
          "text": "Operational evidence",
          "anchor": "engagementReviewModerationGovernance-5-operational-evidence",
          "level": 2
        },
        {
          "text": "Reader and implementation contract",
          "anchor": "engagementReviewModerationGovernance-6-reader-and-implementation-contract",
          "level": 2
        },
        {
          "text": "Customization and extension guidance",
          "anchor": "engagementReviewModerationGovernance-7-customization-and-extension-guidance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "engagementReviewModerationGovernance-8-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "engagementReviewModerationGovernance-9-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Review Moderation and Governance explains how submitted reviews become approved, rejected, hidden, or escalated. It is written for business moderators, administrators, developers, operators, QA owners, and AI tools that need a clear lifecycle contract."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Moderation flow",
          "anchor": "engagementReviewModerationGovernance-1-moderation-flow"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Submitted[\"Submitted review\"] --> Queue[\"Moderation queue\"]\n  Queue --> Approve[\"Approve\"]\n  Queue --> Reject[\"Reject\"]\n  Queue --> Escalate[\"Escalate or hold\"]\n  Approve --> Public[\"Visible review\"]\n  Reject --> Hidden[\"Hidden with reason\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Decision",
            "Required evidence"
          ],
          "rows": [
            [
              "Approve",
              "Reviewer, timestamp, review id, product id, and visibility target."
            ],
            [
              "Reject",
              "Reviewer, timestamp, reason, notification rule, and audit state."
            ],
            [
              "Hold",
              "Owner, reason, due date, and next action."
            ],
            [
              "Escalate",
              "Queue, role requirement, and business risk."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business perspective",
          "anchor": "engagementReviewModerationGovernance-2-business-perspective"
        },
        {
          "kind": "paragraph",
          "text": "Moderators need a clear queue, filters, review context, product context, customer context, and one obvious decision area. The UI should not make a user open unrelated pages to understand what can be approved. Documentation should explain how review decisions affect product pages, customer trust, search ranking, and compliance."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer perspective",
          "anchor": "engagementReviewModerationGovernance-3-developer-perspective"
        },
        {
          "kind": "paragraph",
          "text": "Developers should expose moderation through explicit state transitions and permissions. The requester or submitter identity is audit data, not the only approval rule. Approval should be controlled by role, permission, and workflow policy. Projects can add custom checks, but every added rule must be visible in Axis and covered by tests."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operator perspective",
          "anchor": "engagementReviewModerationGovernance-4-operator-perspective"
        },
        {
          "kind": "paragraph",
          "text": "Operators need to see stuck reviews, failed moderation actions, event delivery failures, and aggregate update status. If moderation emits events to search, notification, analytics, or product services, the documentation must explain retry and recovery behavior."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operational evidence",
          "anchor": "engagementReviewModerationGovernance-5-operational-evidence"
        },
        {
          "kind": "paragraph",
          "text": "Moderation evidence should be visible without requiring the reviewer to interpret raw records. The queue should show item context, current state, allowed actions, decision history, and next outcome. The backend evidence should include role or permission evaluation, workflow transition, rejection reason, audit user, and timestamps. This is important because moderation is a governed business operation; the user journey must make the correct action obvious while still preserving enough detail for compliance and debugging."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Reader and implementation contract",
          "anchor": "engagementReviewModerationGovernance-6-reader-and-implementation-contract"
        },
        {
          "kind": "paragraph",
          "text": "A beginner should understand that moderation is a business decision with audit, not an edit button on a record. A business reviewer should see what must be reviewed, why it matters, and what each decision changes. A developer should document permissions, workflow policy, state transitions, validation, events, and rejection reasons. An operator should know where blocked, stale, or failed moderation tasks appear and how they are retried."
        },
        {
          "kind": "paragraph",
          "text": "This page must be updated when approval policy changes globally, because the rule is permission-based and should not be hardcoded around requester identity. Documentation should show the queue and decision flow visually so reviewers are not forced through disconnected pages to complete one task."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension guidance",
          "anchor": "engagementReviewModerationGovernance-7-customization-and-extension-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Projects can customize review moderation with additional decision states, abuse checks, escalation queues, notification rules, or role policies. Document the workflow change, permission rule, state transition, Axis queue behavior, audit fields, and browser verification. Approval should remain governed by policy and permission, not by hardcoded assumptions about who created the request."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "engagementReviewModerationGovernance-8-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Blocking approval only because the same user submitted the request, while ignoring actual permissions.",
            "Hiding rejection reasons from the audit trail.",
            "Making moderation depend on frontend-only state.",
            "Updating public visibility before the workflow decision is complete."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "engagementReviewModerationGovernance-9-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verify moderation with success, rejection, permission-denied, escalation, and retry scenarios. Browser evidence should show the queue, selected review, decision controls, confirmation state, and final visibility."
        }
      ],
      "searchText": "Review Moderation and Governance Axis moderation queues, approval and rejection decisions, permissions, state transitions, and audit expectations. # Review Moderation and Governance\n\nReview Moderation and Governance explains how submitted reviews become approved, rejected, hidden, or escalated. It is written for business moderators, administrators, developers, operators, QA owners, and AI tools that need a clear lifecycle contract.\n\n## Moderation flow\n\n```mermaid\nflowchart TD\n  Submitted[\"Submitted review\"] --> Queue[\"Moderation queue\"]\n  Queue --> Approve[\"Approve\"]\n  Queue --> Reject[\"Reject\"]\n  Queue --> Escalate[\"Escalate or hold\"]\n  Approve --> Public[\"Visible review\"]\n  Reject --> Hidden[\"Hidden with reason\"]\n```\n\n| Decision | Required evidence |\n| --- | --- |\n| Approve | Reviewer, timestamp, review id, product id, and visibility target. |\n| Reject | Reviewer, timestamp, reason, notification rule, and audit state. |\n| Hold | Owner, reason, due date, and next action. |\n| Escalate | Queue, role requirement, and business risk. |\n\n## Business perspective\n\nModerators need a clear queue, filters, review context, product context, customer context, and one obvious decision area. The UI should not make a user open unrelated pages to understand what can be approved. Documentation should explain how review decisions affect product pages, customer trust, search ranking, and compliance.\n\n## Developer perspective\n\nDevelopers should expose moderation through explicit state transitions and permissions. The requester or submitter identity is audit data, not the only approval rule. Approval should be controlled by role, permission, and workflow policy. Projects can add custom checks, but every added rule must be visible in Axis and covered by tests.\n\n## Operator perspective\n\nOperators need to see stuck reviews, failed moderation actions, event delivery failures, and aggregate update status. If moderation emits events to search, notification, analytics, or product services, the documentation must explain retry and recovery behavior.\n\n## Operational evidence\n\nModeration evidence should be visible without requiring the reviewer to interpret raw records. The queue should show item context, current state, allowed actions, decision history, and next outcome. The backend evidence should include role or permission evaluation, workflow transition, rejection reason, audit user, and timestamps. This is important because moderation is a governed business operation; the user journey must make the correct action obvious while still preserving enough detail for compliance and debugging.\n\n## Reader and implementation contract\n\nA beginner should understand that moderation is a business decision with audit, not an edit button on a record. A business reviewer should see what must be reviewed, why it matters, and what each decision changes. A developer should document permissions, workflow policy, state transitions, validation, events, and rejection reasons. An operator should know where blocked, stale, or failed moderation tasks appear and how they are retried.\n\nThis page must be updated when approval policy changes globally, because the rule is permission-based and should not be hardcoded around requester identity. Documentation should show the queue and decision flow visually so reviewers are not forced through disconnected pages to complete one task.\n\n## Customization and extension guidance\n\nProjects can customize review moderation with additional decision states, abuse checks, escalation queues, notification rules, or role policies. Document the workflow change, permission rule, state transition, Axis queue behavior, audit fields, and browser verification. Approval should remain governed by policy and permission, not by hardcoded assumptions about who created the request.\n\n## Common mistakes\n\n- Blocking approval only because the same user submitted the request, while ignoring actual permissions.\n- Hiding rejection reasons from the audit trail.\n- Making moderation depend on frontend-only state.\n- Updating public visibility before the workflow decision is complete.\n\n## Verification\n\nVerify moderation with success, rejection, permission-denied, escalation, and retry scenarios. Browser evidence should show the queue, selected review, decision controls, confirmation state, and final visibility.\n",
      "previous": {
        "title": "Customer reviews and ratings",
        "route": "/docs/framework/engagement-customer-reviews"
      },
      "next": {
        "title": "Review Aggregation and Recovery",
        "route": "/docs/framework/engagement-review-aggregation-recovery"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.engagement",
        "technicalModule": "customerReview",
        "owner": "customerReview",
        "sourcePath": "data/docs-v001/records/documentation/customerReviewDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/customerReviewDocumentationComponentData.js",
        "wordCount": 555,
        "checksum": "aa526454ec8c616f5b922e868f9cd9d086cae3fa711db16fcdb48a56bada5904"
      },
      "slug": "engagement-review-moderation-governance",
      "locale": "en",
      "navigationGroup": "Reviews and Ratings",
      "navigationGroupCode": "reviews-and-ratings",
      "navigationGroupOrder": 10,
      "navigationOrder": 20,
      "references": [
        {
          "documentId": "engagement.customer-reviews",
          "owner": "customerReview"
        }
      ]
    },
    "active": true
  },
  "record2": {
    "code": "nodicsDocsComponentengagementReviewAggregationRecovery",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "engagement.review-aggregation-recovery",
      "title": "Review Aggregation and Recovery",
      "route": "/docs/framework/engagement-review-aggregation-recovery",
      "section": "customer-engagement-and-feedback",
      "sectionTitle": "Customer Engagement and Feedback",
      "group": "customer-engagement-and-feedback",
      "groupTitle": "Customer Engagement and Feedback",
      "parentId": "customer-engagement-and-feedback",
      "hierarchyPath": [
        "Customer Engagement and Feedback",
        "Review Aggregation and Recovery"
      ],
      "hierarchyDepth": 2,
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
      "businessAudience": [
        "business user",
        "administrator",
        "implementation partner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "Rating aggregate correctness, recalculation, event recovery, and product or discovery visibility after review changes.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "engagement.customer-reviews"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "table"
      ],
      "searchKeywords": [
        "customer-engagement-and-feedback",
        "reviews-and-ratings",
        "customer-reviews-and-ratings"
      ],
      "topicKeywords": [
        "Customer Engagement and Feedback",
        "Reviews and Ratings",
        "Customer reviews and ratings"
      ],
      "headings": [
        {
          "text": "Aggregate flow",
          "anchor": "engagementReviewAggregationRecovery-1-aggregate-flow",
          "level": 2
        },
        {
          "text": "Business perspective",
          "anchor": "engagementReviewAggregationRecovery-2-business-perspective",
          "level": 2
        },
        {
          "text": "Developer perspective",
          "anchor": "engagementReviewAggregationRecovery-3-developer-perspective",
          "level": 2
        },
        {
          "text": "Operator perspective",
          "anchor": "engagementReviewAggregationRecovery-4-operator-perspective",
          "level": 2
        },
        {
          "text": "Operational evidence",
          "anchor": "engagementReviewAggregationRecovery-5-operational-evidence",
          "level": 2
        },
        {
          "text": "Reader and implementation contract",
          "anchor": "engagementReviewAggregationRecovery-6-reader-and-implementation-contract",
          "level": 2
        },
        {
          "text": "Documentation maintenance rule",
          "anchor": "engagementReviewAggregationRecovery-7-documentation-maintenance-rule",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "engagementReviewAggregationRecovery-8-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "engagementReviewAggregationRecovery-9-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Review Aggregation and Recovery explains how Nodics keeps average ratings, review counts, and review-derived signals correct after moderation decisions, imports, failures, retries, or project customizations."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Aggregate flow",
          "anchor": "engagementReviewAggregationRecovery-1-aggregate-flow"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Decision[\"Review decision\"] --> Event[\"Aggregate event\"]\n  Event --> Aggregate[\"Rating aggregate\"]\n  Aggregate --> Product[\"Product page\"]\n  Aggregate --> Search[\"Search or discovery\"]\n  Failure[\"Failure\"] --> Rebuild[\"Recalculate\"]\n  Rebuild --> Aggregate"
        },
        {
          "kind": "table",
          "headers": [
            "Aggregate",
            "Why it matters",
            "Recovery signal"
          ],
          "rows": [
            [
              "Review count",
              "Merchandising and shopper trust.",
              "Count differs from approved review query."
            ],
            [
              "Average rating",
              "Product ranking and conversion.",
              "Stored average differs from recalculated value."
            ],
            [
              "Distribution",
              "Filtering and analytics.",
              "Bucket totals do not match approved reviews."
            ],
            [
              "Derived search field",
              "Discovery and sorting.",
              "Search index differs from Online data."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business perspective",
          "anchor": "engagementReviewAggregationRecovery-2-business-perspective"
        },
        {
          "kind": "paragraph",
          "text": "A business user should not have to trust a number blindly. If a product shows 4.7 stars, the system should be able to explain which approved reviews created that value and how it can be recalculated. This matters for customer trust, marketplace quality, and commercial decisions."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer perspective",
          "anchor": "engagementReviewAggregationRecovery-3-developer-perspective"
        },
        {
          "kind": "paragraph",
          "text": "Developers should keep aggregation idempotent and recoverable. Moderation, imports, deletes, retire actions, or syndication updates can all change the aggregate. The implementation should expose recalculation APIs or jobs, document events, and keep search synchronization separate from the source of truth."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operator perspective",
          "anchor": "engagementReviewAggregationRecovery-4-operator-perspective"
        },
        {
          "kind": "paragraph",
          "text": "Operators need a way to detect drift, rerun aggregate calculation, inspect failed events, and validate the product page after recovery. If an aggregate update is asynchronous, documentation must state where pending and failed work is visible."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operational evidence",
          "anchor": "engagementReviewAggregationRecovery-5-operational-evidence"
        },
        {
          "kind": "paragraph",
          "text": "Aggregate recovery evidence should compare source reviews with stored totals. Include approved count, rejected count, rating distribution, computed average, stored average, recalculation run id, event status, and storefront verification. If search consumes the aggregate, include the indexed value and refresh behavior. This lets a business user trust the number on the page and lets a developer or operator quickly decide whether the problem is source data, event delivery, calculation logic, or index synchronization."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Reader and implementation contract",
          "anchor": "engagementReviewAggregationRecovery-6-reader-and-implementation-contract"
        },
        {
          "kind": "paragraph",
          "text": "A beginner should understand that aggregate ratings are derived evidence, not hand-authored content. A business user should know why aggregate accuracy affects product confidence, sorting, and commercial decisions. A developer should document the source query, update event, recalculation job, idempotency model, and search synchronization. An operator should know how to detect drift, rebuild safely, and validate the storefront after recovery."
        },
        {
          "kind": "paragraph",
          "text": "Every aggregate topic must include successful update, rejected review behavior, deleted or retired review behavior, failed event recovery, recalculation acceptance, and browser verification. If downstream search or analytics consumes aggregate ratings, link those dependencies so the business impact is visible."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Documentation maintenance rule",
          "anchor": "engagementReviewAggregationRecovery-7-documentation-maintenance-rule"
        },
        {
          "kind": "paragraph",
          "text": "Keep this topic current whenever implementation, configuration, Axis workflow, publication behavior, or customer-facing rendering changes. The page should remain small enough to scan, but it must still carry enough business context, technical ownership, customization guidance, visual structure, operational evidence, and verification detail for a reader to act without guessing. When the detail becomes too large, create a sibling topic and link it from this page instead of turning the overview back into a long mixed article."
        },
        {
          "kind": "paragraph",
          "text": "This extension guidance must stay linked to the owning project or capability page whenever a customer customizes the behavior."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "engagementReviewAggregationRecovery-8-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating aggregate values as manually editable content.",
            "Updating search before the source review state is final.",
            "Recalculating without an idempotency or audit contract.",
            "Testing a single approved review but not rejection, deletion, or retry."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "engagementReviewAggregationRecovery-9-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verify aggregation by creating approved and rejected reviews, recalculating the aggregate, comparing stored values to source queries, and checking browser output on product or discovery pages. Include failure and retry evidence for production readiness."
        }
      ],
      "searchText": "Review Aggregation and Recovery Rating aggregate correctness, recalculation, event recovery, and product or discovery visibility after review changes. # Review Aggregation and Recovery\n\nReview Aggregation and Recovery explains how Nodics keeps average ratings, review counts, and review-derived signals correct after moderation decisions, imports, failures, retries, or project customizations.\n\n## Aggregate flow\n\n```mermaid\nflowchart LR\n  Decision[\"Review decision\"] --> Event[\"Aggregate event\"]\n  Event --> Aggregate[\"Rating aggregate\"]\n  Aggregate --> Product[\"Product page\"]\n  Aggregate --> Search[\"Search or discovery\"]\n  Failure[\"Failure\"] --> Rebuild[\"Recalculate\"]\n  Rebuild --> Aggregate\n```\n\n| Aggregate | Why it matters | Recovery signal |\n| --- | --- | --- |\n| Review count | Merchandising and shopper trust. | Count differs from approved review query. |\n| Average rating | Product ranking and conversion. | Stored average differs from recalculated value. |\n| Distribution | Filtering and analytics. | Bucket totals do not match approved reviews. |\n| Derived search field | Discovery and sorting. | Search index differs from Online data. |\n\n## Business perspective\n\nA business user should not have to trust a number blindly. If a product shows 4.7 stars, the system should be able to explain which approved reviews created that value and how it can be recalculated. This matters for customer trust, marketplace quality, and commercial decisions.\n\n## Developer perspective\n\nDevelopers should keep aggregation idempotent and recoverable. Moderation, imports, deletes, retire actions, or syndication updates can all change the aggregate. The implementation should expose recalculation APIs or jobs, document events, and keep search synchronization separate from the source of truth.\n\n## Operator perspective\n\nOperators need a way to detect drift, rerun aggregate calculation, inspect failed events, and validate the product page after recovery. If an aggregate update is asynchronous, documentation must state where pending and failed work is visible.\n\n## Operational evidence\n\nAggregate recovery evidence should compare source reviews with stored totals. Include approved count, rejected count, rating distribution, computed average, stored average, recalculation run id, event status, and storefront verification. If search consumes the aggregate, include the indexed value and refresh behavior. This lets a business user trust the number on the page and lets a developer or operator quickly decide whether the problem is source data, event delivery, calculation logic, or index synchronization.\n\n## Reader and implementation contract\n\nA beginner should understand that aggregate ratings are derived evidence, not hand-authored content. A business user should know why aggregate accuracy affects product confidence, sorting, and commercial decisions. A developer should document the source query, update event, recalculation job, idempotency model, and search synchronization. An operator should know how to detect drift, rebuild safely, and validate the storefront after recovery.\n\nEvery aggregate topic must include successful update, rejected review behavior, deleted or retired review behavior, failed event recovery, recalculation acceptance, and browser verification. If downstream search or analytics consumes aggregate ratings, link those dependencies so the business impact is visible.\n\n## Documentation maintenance rule\n\nKeep this topic current whenever implementation, configuration, Axis workflow, publication behavior, or customer-facing rendering changes. The page should remain small enough to scan, but it must still carry enough business context, technical ownership, customization guidance, visual structure, operational evidence, and verification detail for a reader to act without guessing. When the detail becomes too large, create a sibling topic and link it from this page instead of turning the overview back into a long mixed article.\n\nThis extension guidance must stay linked to the owning project or capability page whenever a customer customizes the behavior.\n\n## Common mistakes\n\n- Treating aggregate values as manually editable content.\n- Updating search before the source review state is final.\n- Recalculating without an idempotency or audit contract.\n- Testing a single approved review but not rejection, deletion, or retry.\n\n## Verification\n\nVerify aggregation by creating approved and rejected reviews, recalculating the aggregate, comparing stored values to source queries, and checking browser output on product or discovery pages. Include failure and retry evidence for production readiness.\n",
      "previous": {
        "title": "Review Moderation and Governance",
        "route": "/docs/framework/engagement-review-moderation-governance"
      },
      "next": {
        "title": "Customer feedback, complaints, and closed-loop action",
        "route": "/docs/framework/engagement-customer-feedback"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.engagement",
        "technicalModule": "customerReview",
        "owner": "customerReview",
        "sourcePath": "data/docs-v001/records/documentation/customerReviewDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/customerReviewDocumentationComponentData.js",
        "wordCount": 588,
        "checksum": "ae7f0739ac16d741f8c39d5b12f7424d307470e0437e95e67d8bd49035e883b1"
      },
      "slug": "engagement-review-aggregation-recovery",
      "locale": "en",
      "navigationGroup": "Reviews and Ratings",
      "navigationGroupCode": "reviews-and-ratings",
      "navigationGroupOrder": 10,
      "navigationOrder": 30,
      "references": [
        {
          "documentId": "engagement.customer-reviews",
          "owner": "customerReview"
        }
      ]
    },
    "active": true
  }
};
