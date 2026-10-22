/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/**
 * @module profile/data/docs-v002/records/documentation/profileNotificationRecipientsDocumentationComponentData
 * @description Owns canonical profileNotificationRecipientsDocumentationComponentData successor records; installation and publication remain governed.
 * @layer data
 * @owner profile
 */
module.exports = {
  "record0": {
    "code": "nodicsDocsComponentprofileNotificationRecipients",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "profile.notification-recipients",
      "title": "Source-Proven Notification Recipients",
      "route": "/docs/framework/profile-notification-recipients",
      "section": "security-governance-and-compliance",
      "sectionTitle": "Security, Governance, and Compliance",
      "group": "security-governance-and-compliance",
      "groupTitle": "Security, Governance, and Compliance",
      "parentId": "security-governance-and-compliance",
      "hierarchyPath": [
        "Security, Governance, and Compliance",
        "Source-Proven Notification Recipients"
      ],
      "hierarchyDepth": 2,
      "documentType": "integration",
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
      "summary": "A business participant is not always the person using the application. A Customer receives an opted-in message in its own inbox. An Enterprise receives messages only through an explicitly selected roster of genuine Employees whose current authority and preferences still qualify. Profile resolves that distinction; it does not turn an Employee into a Customer, select the employee who clicked a button, or own gift, auction, coupon or reward accounting.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "STAGED",
      "version": "0.0.2",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "security.identity-access-governance"
      ],
      "sourceEvidence": [
        "src/service/identity/defaultProfileNotificationRecipientService.js",
        "src/service/identity/defaultProfileGiftNotificationRecipientService.js",
        "src/service/identity/defaultProfileTransferNotificationRecipientService.js",
        "src/service/identity/defaultProfileCouponNotificationRecipientService.js",
        "src/service/identity/defaultProfileAuctionNotificationRecipientService.js",
        "test/profileNotificationRecipients.test.js",
        "config/properties.js"
      ],
      "visualRequirements": [
        "diagram",
        "table"
      ],
      "searchKeywords": [
        "notification",
        "recipient",
        "permission",
        "gift",
        "auction",
        "coupon",
        "transfer",
        "employee"
      ],
      "topicKeywords": [
        "Source-proven recipients",
        "Durable outcome delivery"
      ],
      "headings": [
        {
          "text": "Purpose and owner boundaries",
          "anchor": "profile-notification-purpose",
          "level": 2
        },
        {
          "text": "Implemented source wrappers",
          "anchor": "profile-notification-wrappers",
          "level": 2
        },
        {
          "text": "Private API and source proof",
          "anchor": "profile-notification-proof",
          "level": 2
        },
        {
          "text": "Current identity, permission and consent",
          "anchor": "profile-notification-authority",
          "level": 2
        },
        {
          "text": "Framework defaults and governed records",
          "anchor": "profile-notification-configuration",
          "level": 2
        },
        {
          "text": "Employee access and safe recovery",
          "anchor": "profile-notification-recovery",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "profile-notification-mistakes",
          "level": 2
        },
        {
          "text": "Verification and adoption",
          "anchor": "profile-notification-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Before production use, the operator verifies retained runtime grants, installed schemas, current recipient consent and qualified private transports; source installation alone grants no authority and sends no message."
        },
        {
          "kind": "paragraph",
          "text": "For beginners, first identify whether the business outcome belongs to a Customer or an Enterprise, then review the owner and recipient opt-in separately. Developers integrate the private source wrapper rather than writing inbox rows or selecting a destination themselves."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Purpose and owner boundaries",
          "anchor": "profile-notification-purpose"
        },
        {
          "kind": "paragraph",
          "text": "A business participant is not always the person using the application. A Customer receives an opted-in message in its own inbox. An Enterprise receives messages only through an explicitly selected roster of genuine Employees whose current authority and preferences still qualify. Profile resolves that distinction; it does not turn an Employee into a Customer, select the employee who clicked a button, or own gift, auction, coupon or reward accounting."
        },
        {
          "kind": "paragraph",
          "text": "Wallet, Digital and Bidding first retain their authoritative business outcome. Profile independently calls the exact private source endpoint and then resolves current recipients. Communication alone retains immutable intents, rendering, inbox messages, suppression, retries and delivery evidence. An accepted message is neither a completed gift decision nor a reward transfer, coupon redemption, paid auction or confirmed external delivery."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Implemented source wrappers",
          "anchor": "profile-notification-wrappers"
        },
        {
          "kind": "table",
          "headers": [
            "Purpose",
            "Profile POST route",
            "Fresh source and Employee permission"
          ],
          "rows": [
            [
              "Reward transfer",
              "/internal/transfers/notification-recipients",
              "Wallet committed operation and SENDER/RECIPIENT side; loyalty.wallet.read"
            ],
            [
              "Coupon expiry",
              "/internal/coupons/notification-recipients",
              "Digital entitlement, unused coupon and fixed expiry occurrence; commerce.digital.own.read"
            ],
            [
              "Auction outcome",
              "/internal/auctions/notification-recipients",
              "Bidding retained round/event/Store proof and immutable digest; commerce.bid.participate"
            ],
            [
              "Whole gift",
              "/internal/bundles/gifts/notification-recipients",
              "Digital original manifest and complete phase receipts for event/side; commerce.digital.bundle.manage"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The pre-existing Commerce order resolver continues to handle its own PURCHASED/REFUNDED Customer contract. It is not a substitute for these typed-owner wrappers. The four wrappers reuse DefaultProfileNotificationRecipientService after source admission; there is no parallel inbox identity or scope-only recipient implementation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Private API and source proof",
          "anchor": "profile-notification-proof"
        },
        {
          "kind": "paragraph",
          "text": "All four APIs accept source coordinates and IN_APP only, never a caller-selected owner or contact. Transfer accepts {source:{operationCode,side},channel}; coupon accepts {source:{enterpriseCode,entitlementCode,occurrenceKey},channel}; auction accepts {source:{roundCode,eventCode,storeCode},channel}; gift accepts {source:{enterpriseCode,operationCode,event,side},channel}. Gift events are PENDING, CANCELLED, ACCEPTED, DECLINED and EXPIRED. Auction sources cover SELECTED, CANCELLED, UNSELECTED_RELEASED, WINNER_PENDING and UNSOLD."
        },
        {
          "kind": "paragraph",
          "text": "Require sensitive capture, genuine runtime tokens, Profile and domain module scope, route permission and exact signed tenant/Enterprise aliases. Transfer uses profile.transfer.notification.recipient.resolve; the other wrappers use profile.commerce.notification.recipient.resolve. The detached callback transport sends only tenant and source selectors with requireInternalAuth, bounded timeout, no redirects and secure transport. It never manufactures service credentials or forwards a human bearer. Digital gift callbacks separately require commerce.digital.notification.read and exactly one reviewed sourceCallers deployment/business grant."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n  participant D as Domain owner\n  participant P as Profile wrapper\n  participant I as Profile identity and grants\n  participant C as Communication\n  D->>P: Exact persisted source coordinates\n  P->>D: Independent private source callback\n  D-->>P: Typed owner and current source proof\n  P->>I: Fresh identity, permission, scope and consent\n  P->>D: Reread source\n  P->>I: Recheck recipients\n  P-->>D: Opaque source-bound inbox references\n  D->>C: Original frozen intent\n  C->>D: Current source and recipient eligibility\n  D->>P: Recheck original recipient\n  C-->>D: Delivery evidence or suppression"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Current identity, permission and consent",
          "anchor": "profile-notification-authority"
        },
        {
          "kind": "paragraph",
          "text": "The shared selector reads generated Profile records through its existing private registration boundary without broadening Customer generic CRUD. Customer owners require active typed identity and canonical anchor/lock validation. Enterprise owners require exact same-tenant placement in the authority partition. Selected Employees require active human identity, independent consent and current persisted group ancestry validated against the permission catalogue. Existing router permission checks and effective scopes are separate requirements: an allow scope cannot supply a missing permission, and matching deny takes precedence."
        },
        {
          "kind": "paragraph",
          "text": "Linked Employee projections need the current active REGISTERED assignment with COMPLETE membership, exact identity/projection and unchanged grant digest. Native Employees without an assignment still need current persisted groups and a matching Enterprise, tenant or global scope. A plain enterpriseCode field is not proof. A reserved profile-employee:<code> inbox reference must not collide with any Customer record, including an inactive one. Missing rosters and opt-outs have no actor, administrator, all-staff or contact fallback."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Framework defaults and governed records",
          "anchor": "profile-notification-configuration"
        },
        {
          "kind": "paragraph",
          "text": "Profile config/properties.js owns every selection definition and default. profileNotificationRecipients.maximumGroups defaults to 100. The transfer, auction and gift wrappers default enabled:false and qualified:false; coupon defaults enabled:false and retains Digital source qualification. Each purpose defaults to at most 20 recipients. Transfer and auction timeouts are 5000ms; coupon and gift are 10000ms. Secure transport is required and insecure loopback defaults false. Customer/runtime layers override intentional values only."
        },
        {
          "kind": "table",
          "headers": [
            "Purpose",
            "Preference on Customer, Employee and Enterprise",
            "Enterprise roster"
          ],
          "rows": [
            [
              "Transfer",
              "transferNotificationPreferences.IN_APP",
              "transferNotificationRecipients:[{employeeCode}]"
            ],
            [
              "Coupon",
              "couponReminderPreferences.IN_APP",
              "couponReminderRecipients:[{employeeCode}]"
            ],
            [
              "Auction",
              "auctionNotificationPreferences.IN_APP",
              "auctionNotificationRecipients:[{employeeCode}]"
            ],
            [
              "Gift",
              "giftNotificationPreferences.IN_APP",
              "giftNotificationRecipients:[{employeeCode}]"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Only explicit true opts in. These optional fields are governed Profile records, not runtime business defaults. Gift enable/receive settings remain Digital business policy and do not opt anyone into notifications. Installing schema fields or permission vocabulary grants nobody access. To customize selection, intentionally override the framework recipientSelection fields, permission and capability definitions, retain bounds, and provision the corresponding governed records through authorized owner paths."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Employee access and safe recovery",
          "anchor": "profile-notification-recovery"
        },
        {
          "kind": "paragraph",
          "text": "Existing /employee/inbox-identity and Communication /employee/communications preserve the original human bearer and signed Enterprise; they read the same canonical inbox without personal Customer participation. Profile returns no login, contact, credential, group, balance or private component contents. Each wrapper pins authority/policy across awaits, rereads source and recipients, and binds opaque address references to source and owner. Read agreement is not database snapshot isolation: Communication must recheck at dispatch."
        },
        {
          "kind": "paragraph",
          "text": "Opt-out or withdrawn authority suppresses a frozen recipient. Unavailable, ambiguous, locked or conflicting evidence is an error, not an empty successful list. Lost acknowledgements replay the original intent and source pointers, never another gift acceptance, transfer, hold or charge. Operators investigate private source availability and current assignments rather than inventing recipients or widening Customer CRUD. EMAIL, SMS and Telegram destinations need separately qualified purpose-bound consent and are not fallback channels here."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "profile-notification-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Do not grant access through a scope alone, interpret gift enablement as consent, fall back to the transaction actor, create a Customer for an Employee, or treat an unavailable source as an empty successful roster. Never change the frozen recipient after a retry or mark source/unit validation as installed, published or live delivery acceptance."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification and adoption",
          "anchor": "profile-notification-verification"
        },
        {
          "kind": "paragraph",
          "text": "Focused unit coverage composes actual Profile controller/facade/service, canonical membership, group/catalogue, router permission, scope and runtime-token owners. Bidding tests use actual persisted-event proof and its recipient client. Gift tests use actual Digital manifest/component receipt proof, postcommit handoff and Communication rendering, durable intent and inbox. Lost acknowledgement, all terminal events, source drift, denied permission, opt-out, stale pending gifts and frozen recipient suppression are covered with isolated storage and credential transport."
        },
        {
          "kind": "paragraph",
          "text": "Run test/profileNotificationRecipients.test.js and test/profileCouponNotificationRecipients.test.js together with Wallet transfer, Digital coupon/gift and Communication inbox suites. This is source/unit evidence only. Operators must separately verify installed schemas/indexes, reviewed runtime grants, private capture, secure connections, domain qualification and template selections before enabling. No database, provider, server, import, message or E2E activation is implied. This successor CMS pack is Staged; installation, review, approval and Online publication remain explicit."
        }
      ],
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.platform",
        "technicalModule": "profile",
        "owner": "profile",
        "sourcePath": "data/docs-v002/records/documentation/profileNotificationRecipientsDocumentationComponentData.js",
        "path": "data/docs-v002/records/documentation/profileNotificationRecipientsDocumentationComponentData.js",
        "checksum": "573d325b1a79b10c01c8b34553741b397b3f8625721ee4ba8c980c87b499233f",
        "wordCount": 1204
      },
      "slug": "profile-notification-recipients",
      "locale": "en",
      "navigationGroup": "Security, Governance, and Compliance",
      "navigationGroupCode": "security-governance-and-compliance",
      "navigationGroupOrder": 10,
      "navigationOrder": 90,
      "references": [
        {
          "documentId": "security.identity-access-governance",
          "owner": "profile"
        }
      ],
      "searchText": "Source-Proven Notification Recipients A business participant is not always the person using the application. A Customer receives an opted-in message in its own inbox. An Enterprise receives messages only through an explicitly selected roster of genuine Employees whose current authority and preferences still qualify. Profile resolves that distinction; it does not turn an Employee into a Customer, select the employee who clicked a button, or own gift, auction, coupon or reward accounting. Before production use, the operator verifies retained runtime grants, installed schemas, current recipient consent and qualified private transports; source installation alone grants no authority and sends no message.\n\nFor beginners, first identify whether the business outcome belongs to a Customer or an Enterprise, then review the owner and recipient opt-in separately. Developers integrate the private source wrapper rather than writing inbox rows or selecting a destination themselves.\n\n## Purpose and owner boundaries\n\nA business participant is not always the person using the application. A Customer receives an opted-in message in its own inbox. An Enterprise receives messages only through an explicitly selected roster of genuine Employees whose current authority and preferences still qualify. Profile resolves that distinction; it does not turn an Employee into a Customer, select the employee who clicked a button, or own gift, auction, coupon or reward accounting.\n\nWallet, Digital and Bidding first retain their authoritative business outcome. Profile independently calls the exact private source endpoint and then resolves current recipients. Communication alone retains immutable intents, rendering, inbox messages, suppression, retries and delivery evidence. An accepted message is neither a completed gift decision nor a reward transfer, coupon redemption, paid auction or confirmed external delivery.\n\n## Implemented source wrappers\n\n| Purpose | Profile POST route | Fresh source and Employee permission |\n| --- | --- | --- |\n| Reward transfer | /internal/transfers/notification-recipients | Wallet committed operation and SENDER/RECIPIENT side; loyalty.wallet.read |\n| Coupon expiry | /internal/coupons/notification-recipients | Digital entitlement, unused coupon and fixed expiry occurrence; commerce.digital.own.read |\n| Auction outcome | /internal/auctions/notification-recipients | Bidding retained round/event/Store proof and immutable digest; commerce.bid.participate |\n| Whole gift | /internal/bundles/gifts/notification-recipients | Digital original manifest and complete phase receipts for event/side; commerce.digital.bundle.manage |\n\nThe pre-existing Commerce order resolver continues to handle its own PURCHASED/REFUNDED Customer contract. It is not a substitute for these typed-owner wrappers. The four wrappers reuse DefaultProfileNotificationRecipientService after source admission; there is no parallel inbox identity or scope-only recipient implementation.\n\n## Private API and source proof\n\nAll four APIs accept source coordinates and IN_APP only, never a caller-selected owner or contact. Transfer accepts {source:{operationCode,side},channel}; coupon accepts {source:{enterpriseCode,entitlementCode,occurrenceKey},channel}; auction accepts {source:{roundCode,eventCode,storeCode},channel}; gift accepts {source:{enterpriseCode,operationCode,event,side},channel}. Gift events are PENDING, CANCELLED, ACCEPTED, DECLINED and EXPIRED. Auction sources cover SELECTED, CANCELLED, UNSELECTED_RELEASED, WINNER_PENDING and UNSOLD.\n\nRequire sensitive capture, genuine runtime tokens, Profile and domain module scope, route permission and exact signed tenant/Enterprise aliases. Transfer uses profile.transfer.notification.recipient.resolve; the other wrappers use profile.commerce.notification.recipient.resolve. The detached callback transport sends only tenant and source selectors with requireInternalAuth, bounded timeout, no redirects and secure transport. It never manufactures service credentials or forwards a human bearer. Digital gift callbacks separately require commerce.digital.notification.read and exactly one reviewed sourceCallers deployment/business grant.\n\n```mermaid\nsequenceDiagram\n  participant D as Domain owner\n  participant P as Profile wrapper\n  participant I as Profile identity and grants\n  participant C as Communication\n  D->>P: Exact persisted source coordinates\n  P->>D: Independent private source callback\n  D-->>P: Typed owner and current source proof\n  P->>I: Fresh identity, permission, scope and consent\n  P->>D: Reread source\n  P->>I: Recheck recipients\n  P-->>D: Opaque source-bound inbox references\n  D->>C: Original frozen intent\n  C->>D: Current source and recipient eligibility\n  D->>P: Recheck original recipient\n  C-->>D: Delivery evidence or suppression\n```\n\n## Current identity, permission and consent\n\nThe shared selector reads generated Profile records through its existing private registration boundary without broadening Customer generic CRUD. Customer owners require active typed identity and canonical anchor/lock validation. Enterprise owners require exact same-tenant placement in the authority partition. Selected Employees require active human identity, independent consent and current persisted group ancestry validated against the permission catalogue. Existing router permission checks and effective scopes are separate requirements: an allow scope cannot supply a missing permission, and matching deny takes precedence.\n\nLinked Employee projections need the current active REGISTERED assignment with COMPLETE membership, exact identity/projection and unchanged grant digest. Native Employees without an assignment still need current persisted groups and a matching Enterprise, tenant or global scope. A plain enterpriseCode field is not proof. A reserved profile-employee:<code> inbox reference must not collide with any Customer record, including an inactive one. Missing rosters and opt-outs have no actor, administrator, all-staff or contact fallback.\n\n## Framework defaults and governed records\n\nProfile config/properties.js owns every selection definition and default. profileNotificationRecipients.maximumGroups defaults to 100. The transfer, auction and gift wrappers default enabled:false and qualified:false; coupon defaults enabled:false and retains Digital source qualification. Each purpose defaults to at most 20 recipients. Transfer and auction timeouts are 5000ms; coupon and gift are 10000ms. Secure transport is required and insecure loopback defaults false. Customer/runtime layers override intentional values only.\n\n| Purpose | Preference on Customer, Employee and Enterprise | Enterprise roster |\n| --- | --- | --- |\n| Transfer | transferNotificationPreferences.IN_APP | transferNotificationRecipients:[{employeeCode}] |\n| Coupon | couponReminderPreferences.IN_APP | couponReminderRecipients:[{employeeCode}] |\n| Auction | auctionNotificationPreferences.IN_APP | auctionNotificationRecipients:[{employeeCode}] |\n| Gift | giftNotificationPreferences.IN_APP | giftNotificationRecipients:[{employeeCode}] |\n\nOnly explicit true opts in. These optional fields are governed Profile records, not runtime business defaults. Gift enable/receive settings remain Digital business policy and do not opt anyone into notifications. Installing schema fields or permission vocabulary grants nobody access. To customize selection, intentionally override the framework recipientSelection fields, permission and capability definitions, retain bounds, and provision the corresponding governed records through authorized owner paths.\n\n## Employee access and safe recovery\n\nExisting /employee/inbox-identity and Communication /employee/communications preserve the original human bearer and signed Enterprise; they read the same canonical inbox without personal Customer participation. Profile returns no login, contact, credential, group, balance or private component contents. Each wrapper pins authority/policy across awaits, rereads source and recipients, and binds opaque address references to source and owner. Read agreement is not database snapshot isolation: Communication must recheck at dispatch.\n\nOpt-out or withdrawn authority suppresses a frozen recipient. Unavailable, ambiguous, locked or conflicting evidence is an error, not an empty successful list. Lost acknowledgements replay the original intent and source pointers, never another gift acceptance, transfer, hold or charge. Operators investigate private source availability and current assignments rather than inventing recipients or widening Customer CRUD. EMAIL, SMS and Telegram destinations need separately qualified purpose-bound consent and are not fallback channels here.\n\n## Common mistakes\n\nDo not grant access through a scope alone, interpret gift enablement as consent, fall back to the transaction actor, create a Customer for an Employee, or treat an unavailable source as an empty successful roster. Never change the frozen recipient after a retry or mark source/unit validation as installed, published or live delivery acceptance.\n\n## Verification and adoption\n\nFocused unit coverage composes actual Profile controller/facade/service, canonical membership, group/catalogue, router permission, scope and runtime-token owners. Bidding tests use actual persisted-event proof and its recipient client. Gift tests use actual Digital manifest/component receipt proof, postcommit handoff and Communication rendering, durable intent and inbox. Lost acknowledgement, all terminal events, source drift, denied permission, opt-out, stale pending gifts and frozen recipient suppression are covered with isolated storage and credential transport.\n\nRun test/profileNotificationRecipients.test.js and test/profileCouponNotificationRecipients.test.js together with Wallet transfer, Digital coupon/gift and Communication inbox suites. This is source/unit evidence only. Operators must separately verify installed schemas/indexes, reviewed runtime grants, private capture, secure connections, domain qualification and template selections before enabling. No database, provider, server, import, message or E2E activation is implied. This successor CMS pack is Staged; installation, review, approval and Online publication remain explicit.\n"
    },
    "active": true
  }
};
