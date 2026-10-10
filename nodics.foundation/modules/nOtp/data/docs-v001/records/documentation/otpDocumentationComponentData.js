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
    "code": "nodicsDocsComponentsecurityOtpSecurityFlow",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "security.otp-security-flow",
      "title": "OTP and Security Flow",
      "route": "/docs/framework/security-otp-security-flow",
      "section": "security-governance-and-compliance",
      "sectionTitle": "Security, Governance, and Compliance",
      "group": "security-governance-and-compliance",
      "groupTitle": "Security, Governance, and Compliance",
      "parentId": "security-governance-and-compliance",
      "hierarchyPath": [
        "Security, Governance, and Compliance",
        "OTP and Security Flow"
      ],
      "hierarchyDepth": 2,
      "documentType": "operations",
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
      "summary": "OTP generation, delivery intent, verification, expiry, retry, throttling, lockout, audit, and secure frontend message behavior.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.7",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "security.identity-access-governance",
        "communication.overview",
        "communication.provider-runbooks"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "../../../nodics.platform/modules/profile/package.json",
        "../../../nodics.communication/modules/smtpCommsProvider/package.json",
        "../../../nodics.communication/modules/smsCommsProvider/package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "configuration-table",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "otp",
        "verification",
        "security",
        "throttling",
        "audit"
      ],
      "topicKeywords": [
        "Security, Governance, and Compliance",
        "Authentication and Verification",
        "OTP and Security Flow"
      ],
      "headings": [
        {
          "text": "Source map",
          "anchor": "securityOtpSecurityFlow-1-source-map",
          "level": 2
        },
        {
          "text": "Flow",
          "anchor": "securityOtpSecurityFlow-2-flow",
          "level": 2
        },
        {
          "text": "Policy contract",
          "anchor": "securityOtpSecurityFlow-3-policy-contract",
          "level": 2
        },
        {
          "text": "Configuration behavior",
          "anchor": "securityOtpSecurityFlow-4-configuration-behavior",
          "level": 2
        },
        {
          "text": "Customization and extension guidance",
          "anchor": "securityOtpSecurityFlow-5-customization-and-extension-guidance",
          "level": 2
        },
        {
          "text": "Implementation handoff",
          "anchor": "securityOtpSecurityFlow-6-implementation-handoff",
          "level": 2
        },
        {
          "text": "Evidence checklist",
          "anchor": "securityOtpSecurityFlow-7-evidence-checklist",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "securityOtpSecurityFlow-8-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "securityOtpSecurityFlow-9-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "nOtp generates numeric short-lived challenges and delegates persistence/verification to nToken. It is not a complete identity, delivery, throttling or audit system. Profile/authentication and the consuming journey retain subject, tenant, session, purpose and permission authority. In this source, singleUseToken is an intended deactivation flag, not an atomic single-use guarantee. For beginners, trace a trusted journey's subject and purpose through generation, delivery and validation as separate responsibilities. Use redacted fixtures to inspect expiry and attempt outcomes, never recording a raw code in logs or review evidence. Before using verification for a high-risk action, require the consuming owner to qualify delivery, abuse controls and atomic single-use behavior; this module alone does not establish them."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source map",
          "anchor": "securityOtpSecurityFlow-1-source-map"
        },
        {
          "kind": "paragraph",
          "text": "A developer integrating OTP must preserve the trusted subject/purpose key through the nToken pipelines and keep raw values out of public evidence. Test expired, wrong-value, exhausted-limit and concurrent validation cases against the real persistence owner. Do not describe read-then-update or an unawaited deactivation as atomic single use; high-risk integration requires a separately qualified owner control."
        },
        {
          "kind": "table",
          "headers": [
            "Owner-relative source",
            "Actual responsibility"
          ],
          "rows": [
            [
              "src/service/DefaultOtpService.js",
              "generateOtp stamps type OTP; generate/validate delegate to DefaultTokenService."
            ],
            [
              "src/service/handler/defaultOtpHandlerService.js; config/properties.js",
              "crypto.randomInt range and validUpTo expiry seconds."
            ],
            [
              "../nToken/src/service/DefaultTokenService.js",
              "Token generation/validation pipeline dispatch."
            ],
            [
              "../nToken/src/service/pipelines/defaultGenerateTokenPipelineService.js",
              "Existing-token reuse and default limit from token.TOKEN."
            ],
            [
              "../nToken/src/service/pipelines/defaultValidateTokenPipelineService.js",
              "Active key/ops lookup, expiry/value check and unawaited update."
            ],
            [
              "src/router/routers.js; README.md",
              "Secured route boundary and required application security qualification."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Flow",
          "anchor": "securityOtpSecurityFlow-2-flow"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n  participant App as Trusted consuming journey\n  participant Otp as nOtp\n  participant Token as nToken pipeline / generated persistence\n  App->>Otp: Generate model with trusted key + ops\n  Otp->>Token: type OTP / generateToken\n  Token-->>App: Internal token result (not safe public projection)\n  Note over App: Delivery, cooldown and audit need separate integration\n  App->>Otp: Validate trusted key + ops + submitted value\n  Otp->>Token: validateToken\n  Token-->>App: Success or validation error\n  Note over Token: Deactivation/limit update follows result, not awaited"
        },
        {
          "kind": "paragraph",
          "text": "Bind key to the authorized subject/session/challenge and ops to a fixed allowed purpose in the consuming backend. Both are required, but the generic token pipeline does not prove subject/session ownership merely because a caller supplies them. Generate requires key/ops; validation also requires a nonempty value. Existing active, unexpired key/ops tokens can be returned by generation rather than issuing a new challenge. This reuse is not resend throttling or proof of delivery. Do not expose the returned persisted token model/raw value through a production response."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Policy contract",
          "anchor": "securityOtpSecurityFlow-3-policy-contract"
        },
        {
          "kind": "table",
          "headers": [
            "Behavior",
            "Source-backed result",
            "Limit"
          ],
          "rows": [
            [
              "Generation",
              "crypto.randomInt(Number(rangeStart),Number(rangeEnd)); upper bound exclusive.",
              "Default range1000..8999, not9000 inclusive; no channel ownership proof."
            ],
            [
              "Expiry",
              "generateExpiry adds token.OTP.validUpTo *1000; validation accepts expireAt >= now.",
              "Default300 seconds. Clock/deployment qualification remains required."
            ],
            [
              "Matching value",
              "Exactly one active key/ops result with String(input.value) matching stored value returns SUC_TKN_00001.",
              "Type OTP is stamped on generation; validation lookup shown here uses key/ops/active, not a separate OTP-type predicate."
            ],
            [
              "Expired/missing/wrong",
              "Expired ERR_TKN_00001; missing/ambiguous ERR_TKN_00002; wrong/invalid mandatory input ERR_TKN_00003.",
              "Map to a business-safe response without disclosing account existence."
            ],
            [
              "Attempts/single use",
              "Wrong value decrements limit, deactivating when it reaches zero; expiry or singleUseToken success requests deactivation.",
              "Updates occur after process.nextSuccess/error, are not awaited, and failures only log. Concurrent callers may both pass or lose decrements. No atomic consumption/lockout guarantee."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Configuration behavior",
          "anchor": "securityOtpSecurityFlow-4-configuration-behavior"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  token: {\n    OTP: {\n      rangeStart: 100000,\n      rangeEnd: 1000000,\n      validUpTo: 180,\n      attemptLimit: 5,\n      tokenHandler: 'DefaultOtpHandlerService'\n    },\n    TOKEN: { attemptLimit: 5 }\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "This illustrative later-layer policy produces a six-digit range with an exclusive upper bound and a 180-second expiry; it contains no live code or secret. Important configuration distinction: nOtp declares OTP.attemptLimit, but the current generation pipeline defaults model.limit from token.TOKEN.attemptLimit when limit is undefined. Changing only OTP.attemptLimit does not prove enforcement. Caller-supplied model.limit also needs a trusted owner policy rather than an arbitrary browser value. Neither section implements resendDelay, channelPriority, account lockout or audit retention."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension guidance",
          "anchor": "securityOtpSecurityFlow-5-customization-and-extension-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Layer the existing OTP handler/configuration and consuming backend journey, preserving cryptographic randomness, trusted identity/purpose binding and safe response projection. Delivery providers/templates, cooldown, rate limits, account lockout and challenge audit require explicit application/owning-capability orchestration; no such call path is present in DefaultOtpService. Do not imply that configuring these labels creates enforcement. Do not add a second identity store or hide raw token material in documents, metrics, logs or error responses."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Implementation handoff",
          "anchor": "securityOtpSecurityFlow-6-implementation-handoff"
        },
        {
          "kind": "paragraph",
          "text": "A journey handoff must identify the actual issuer/validator, recipient lookup, permission check, subject/session/purpose binding, delivery owner and failure policy, cooldown/abuse owner, safe audit owner and consumer projection. Where these integrations are absent, mark them REQUIRED_INTEGRATION_GAP. The unawaited read-then-update validation is an explicit OTP_ATOMICITY_GAP: high-risk verification needs separately implemented and evidenced atomic consume/attempt enforcement, replay handling and durable outcome reconciliation. Source review cannot approve that readiness."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Evidence checklist",
          "anchor": "securityOtpSecurityFlow-7-evidence-checklist"
        },
        {
          "kind": "paragraph",
          "text": "Record only sanitized challenge reference, purpose, trusted scope, expiry window, safe result code and owner correlation. Delivery status, throttling decisions and account lockout evidence must come from implemented owners, not invented nOtp events. Do not include raw code, token model, recipient address, authentication credentials or unredacted user details."
        },
        {
          "kind": "paragraph",
          "text": "A validation success is not proof that single-use deactivation persisted. For an update failure or uncertain result, block the sensitive consuming operation according to its owner recovery policy; inspect/reconcile through authorized owner APIs, not another blind validation or direct database write. Reissue only through that journey's governed delivery/cooldown policy. No generic atomic repair or challenge audit trail is provided here."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "securityOtpSecurityFlow-8-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating OTP as a replacement for identity and permission checks.",
            "Allowing unlimited resend or verification attempts.",
            "Exposing whether an account exists through error messages.",
            "Logging raw OTP codes.",
            "Forgetting communication provider failure handling."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "securityOtpSecurityFlow-9-verification"
        },
        {
          "kind": "paragraph",
          "text": "Required qualification separates numeric range/expiry, key/ops binding, wrong/expired/missing values, limit defaults/overrides and existing-token reuse from application delivery/throttling/audit. Test concurrent successful validations, concurrent wrong attempts, zero/exhausted limits and failed updates against the real persistence adapter before claiming single-use or guessing resistance. Separately prove no raw values escape APIs/logs/browser state."
        }
      ],
      "searchText": "OTP and Security Flow OTP generation, delivery intent, verification, expiry, retry, throttling, lockout, audit, and secure frontend message behavior. # OTP and Security Flow\n\nnOtp generates numeric short-lived challenges and delegates persistence/verification to nToken. It is not a complete identity, delivery, throttling or audit system. Profile/authentication and the consuming journey retain subject, tenant, session, purpose and permission authority. In this source, singleUseToken is an intended deactivation flag, not an atomic single-use guarantee. For beginners, trace a trusted journey's subject and purpose through generation, delivery and validation as separate responsibilities. Use redacted fixtures to inspect expiry and attempt outcomes, never recording a raw code in logs or review evidence. Before using verification for a high-risk action, require the consuming owner to qualify delivery, abuse controls and atomic single-use behavior; this module alone does not establish them.\n\n## Source map\n\nA developer integrating OTP must preserve the trusted subject/purpose key through the nToken pipelines and keep raw values out of public evidence. Test expired, wrong-value, exhausted-limit and concurrent validation cases against the real persistence owner. Do not describe read-then-update or an unawaited deactivation as atomic single use; high-risk integration requires a separately qualified owner control.\n\n| Owner-relative source | Actual responsibility |\n| --- | --- |\n| src/service/DefaultOtpService.js | generateOtp stamps type OTP; generate/validate delegate to DefaultTokenService. |\n| src/service/handler/defaultOtpHandlerService.js; config/properties.js | crypto.randomInt range and validUpTo expiry seconds. |\n| ../nToken/src/service/DefaultTokenService.js | Token generation/validation pipeline dispatch. |\n| ../nToken/src/service/pipelines/defaultGenerateTokenPipelineService.js | Existing-token reuse and default limit from token.TOKEN. |\n| ../nToken/src/service/pipelines/defaultValidateTokenPipelineService.js | Active key/ops lookup, expiry/value check and unawaited update. |\n| src/router/routers.js; README.md | Secured route boundary and required application security qualification. |\n\n## Flow\n\n```mermaid\nsequenceDiagram\n  participant App as Trusted consuming journey\n  participant Otp as nOtp\n  participant Token as nToken pipeline / generated persistence\n  App->>Otp: Generate model with trusted key + ops\n  Otp->>Token: type OTP / generateToken\n  Token-->>App: Internal token result (not safe public projection)\n  Note over App: Delivery, cooldown and audit need separate integration\n  App->>Otp: Validate trusted key + ops + submitted value\n  Otp->>Token: validateToken\n  Token-->>App: Success or validation error\n  Note over Token: Deactivation/limit update follows result, not awaited\n```\n\nBind key to the authorized subject/session/challenge and ops to a fixed allowed purpose in the consuming backend. Both are required, but the generic token pipeline does not prove subject/session ownership merely because a caller supplies them. Generate requires key/ops; validation also requires a nonempty value. Existing active, unexpired key/ops tokens can be returned by generation rather than issuing a new challenge. This reuse is not resend throttling or proof of delivery. Do not expose the returned persisted token model/raw value through a production response.\n\n## Policy contract\n\n| Behavior | Source-backed result | Limit |\n| --- | --- | --- |\n| Generation | crypto.randomInt(Number(rangeStart),Number(rangeEnd)); upper bound exclusive. | Default range1000..8999, not9000 inclusive; no channel ownership proof. |\n| Expiry | generateExpiry adds token.OTP.validUpTo *1000; validation accepts expireAt >= now. | Default300 seconds. Clock/deployment qualification remains required. |\n| Matching value | Exactly one active key/ops result with String(input.value) matching stored value returns SUC_TKN_00001. | Type OTP is stamped on generation; validation lookup shown here uses key/ops/active, not a separate OTP-type predicate. |\n| Expired/missing/wrong | Expired ERR_TKN_00001; missing/ambiguous ERR_TKN_00002; wrong/invalid mandatory input ERR_TKN_00003. | Map to a business-safe response without disclosing account existence. |\n| Attempts/single use | Wrong value decrements limit, deactivating when it reaches zero; expiry or singleUseToken success requests deactivation. | Updates occur after process.nextSuccess/error, are not awaited, and failures only log. Concurrent callers may both pass or lose decrements. No atomic consumption/lockout guarantee. |\n\n## Configuration behavior\n\n```js\nmodule.exports = {\n  token: {\n    OTP: {\n      rangeStart: 100000,\n      rangeEnd: 1000000,\n      validUpTo: 180,\n      attemptLimit: 5,\n      tokenHandler: 'DefaultOtpHandlerService'\n    },\n    TOKEN: { attemptLimit: 5 }\n  }\n};\n```\n\nThis illustrative later-layer policy produces a six-digit range with an exclusive upper bound and a 180-second expiry; it contains no live code or secret. Important configuration distinction: nOtp declares OTP.attemptLimit, but the current generation pipeline defaults model.limit from token.TOKEN.attemptLimit when limit is undefined. Changing only OTP.attemptLimit does not prove enforcement. Caller-supplied model.limit also needs a trusted owner policy rather than an arbitrary browser value. Neither section implements resendDelay, channelPriority, account lockout or audit retention.\n\n## Customization and extension guidance\n\nLayer the existing OTP handler/configuration and consuming backend journey, preserving cryptographic randomness, trusted identity/purpose binding and safe response projection. Delivery providers/templates, cooldown, rate limits, account lockout and challenge audit require explicit application/owning-capability orchestration; no such call path is present in DefaultOtpService. Do not imply that configuring these labels creates enforcement. Do not add a second identity store or hide raw token material in documents, metrics, logs or error responses.\n\n## Implementation handoff\n\nA journey handoff must identify the actual issuer/validator, recipient lookup, permission check, subject/session/purpose binding, delivery owner and failure policy, cooldown/abuse owner, safe audit owner and consumer projection. Where these integrations are absent, mark them REQUIRED_INTEGRATION_GAP. The unawaited read-then-update validation is an explicit OTP_ATOMICITY_GAP: high-risk verification needs separately implemented and evidenced atomic consume/attempt enforcement, replay handling and durable outcome reconciliation. Source review cannot approve that readiness.\n\n## Evidence checklist\n\nRecord only sanitized challenge reference, purpose, trusted scope, expiry window, safe result code and owner correlation. Delivery status, throttling decisions and account lockout evidence must come from implemented owners, not invented nOtp events. Do not include raw code, token model, recipient address, authentication credentials or unredacted user details.\n\nA validation success is not proof that single-use deactivation persisted. For an update failure or uncertain result, block the sensitive consuming operation according to its owner recovery policy; inspect/reconcile through authorized owner APIs, not another blind validation or direct database write. Reissue only through that journey's governed delivery/cooldown policy. No generic atomic repair or challenge audit trail is provided here.\n\n## Common mistakes\n\n- Treating OTP as a replacement for identity and permission checks.\n- Allowing unlimited resend or verification attempts.\n- Exposing whether an account exists through error messages.\n- Logging raw OTP codes.\n- Forgetting communication provider failure handling.\n\n## Verification\n\nRequired qualification separates numeric range/expiry, key/ops binding, wrong/expired/missing values, limit defaults/overrides and existing-token reuse from application delivery/throttling/audit. Test concurrent successful validations, concurrent wrong attempts, zero/exhausted limits and failed updates against the real persistence adapter before claiming single-use or guessing resistance. Separately prove no raw values escape APIs/logs/browser state.\n",
      "previous": {
        "title": "Database Provider Boundaries",
        "route": "/docs/framework/foundation-database-provider-boundaries"
      },
      "next": {
        "title": "Communication Provider Runbooks",
        "route": "/docs/framework/communication-provider-runbooks"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "otp",
        "owner": "otp",
        "sourcePath": "data/docs-v001/records/documentation/otpDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/otpDocumentationComponentData.js",
        "wordCount": 1007,
        "checksum": "d91e32e3273790c13c62850ce8c644efec57aef382db6137d254c2394fa2df05"
      },
      "slug": "security-otp-security-flow",
      "locale": "en",
      "navigationGroup": "Authentication and Verification",
      "navigationGroupCode": "authentication-and-verification",
      "navigationGroupOrder": 20,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "security.identity-access-governance",
          "owner": "profile"
        },
        {
          "documentId": "communication.overview",
          "owner": "commsCore"
        },
        {
          "documentId": "communication.provider-runbooks",
          "owner": "commsCore"
        }
      ]
    },
    "active": true
  }
};
