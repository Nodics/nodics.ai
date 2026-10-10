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
    "code": "nodicsDocsSearchnodenodicsdocsnodepagesecurityotpsecurityflow",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagesecurityOtpSecurityFlow",
    "title": "OTP and Security Flow",
    "summary": "OTP generation, delivery intent, verification, expiry, retry, throttling, lockout, audit, and secure frontend message behavior.",
    "searchText": "OTP and Security Flow OTP generation, delivery intent, verification, expiry, retry, throttling, lockout, audit, and secure frontend message behavior. otp verification security throttling audit",
    "keywords": [
      "otp",
      "verification",
      "security",
      "throttling",
      "audit"
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
    "code": "nodicsDocsSearchpagenodicsdocsmetadatasecurityotpsecurityflow",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatasecurityOtpSecurityFlow",
    "title": "OTP and Security Flow",
    "summary": "OTP generation, delivery intent, verification, expiry, retry, throttling, lockout, audit, and secure frontend message behavior.",
    "searchText": "OTP and Security Flow OTP generation, delivery intent, verification, expiry, retry, throttling, lockout, audit, and secure frontend message behavior. # OTP and Security Flow\n\nnOtp generates numeric short-lived challenges and delegates persistence/verification to nToken. It is not a complete identity, delivery, throttling or audit system. Profile/authentication and the consuming journey retain subject, tenant, session, purpose and permission authority. In this source, singleUseToken is an intended deactivation flag, not an atomic single-use guarantee. For beginners, trace a trusted journey's subject and purpose through generation, delivery and validation as separate responsibilities. Use redacted fixtures to inspect expiry and attempt outcomes, never recording a raw code in logs or review evidence. Before using verification for a high-risk action, require the consuming owner to qualify delivery, abuse controls and atomic single-use behavior; this module alone does not establish them.\n\n## Source map\n\nA developer integrating OTP must preserve the trusted subject/purpose key through the nToken pipelines and keep raw values out of public evidence. Test expired, wrong-value, exhausted-limit and concurrent validation cases against the real persistence owner. Do not describe read-then-update or an unawaited deactivation as atomic single use; high-risk integration requires a separately qualified owner control.\n\n| Owner-relative source | Actual responsibility |\n| --- | --- |\n| src/service/DefaultOtpService.js | generateOtp stamps type OTP; generate/validate delegate to DefaultTokenService. |\n| src/service/handler/defaultOtpHandlerService.js; config/properties.js | crypto.randomInt range and validUpTo expiry seconds. |\n| ../nToken/src/service/DefaultTokenService.js | Token generation/validation pipeline dispatch. |\n| ../nToken/src/service/pipelines/defaultGenerateTokenPipelineService.js | Existing-token reuse and default limit from token.TOKEN. |\n| ../nToken/src/service/pipelines/defaultValidateTokenPipelineService.js | Active key/ops lookup, expiry/value check and unawaited update. |\n| src/router/routers.js; README.md | Secured route boundary and required application security qualification. |\n\n## Flow\n\n```mermaid\nsequenceDiagram\n  participant App as Trusted consuming journey\n  participant Otp as nOtp\n  participant Token as nToken pipeline / generated persistence\n  App->>Otp: Generate model with trusted key + ops\n  Otp->>Token: type OTP / generateToken\n  Token-->>App: Internal token result (not safe public projection)\n  Note over App: Delivery, cooldown and audit need separate integration\n  App->>Otp: Validate trusted key + ops + submitted value\n  Otp->>Token: validateToken\n  Token-->>App: Success or validation error\n  Note over Token: Deactivation/limit update follows result, not awaited\n```\n\nBind key to the authorized subject/session/challenge and ops to a fixed allowed purpose in the consuming backend. Both are required, but the generic token pipeline does not prove subject/session ownership merely because a caller supplies them. Generate requires key/ops; validation also requires a nonempty value. Existing active, unexpired key/ops tokens can be returned by generation rather than issuing a new challenge. This reuse is not resend throttling or proof of delivery. Do not expose the returned persisted token model/raw value through a production response.\n\n## Policy contract\n\n| Behavior | Source-backed result | Limit |\n| --- | --- | --- |\n| Generation | crypto.randomInt(Number(rangeStart),Number(rangeEnd)); upper bound exclusive. | Default range1000..8999, not9000 inclusive; no channel ownership proof. |\n| Expiry | generateExpiry adds token.OTP.validUpTo *1000; validation accepts expireAt >= now. | Default300 seconds. Clock/deployment qualification remains required. |\n| Matching value | Exactly one active key/ops result with String(input.value) matching stored value returns SUC_TKN_00001. | Type OTP is stamped on generation; validation lookup shown here uses key/ops/active, not a separate OTP-type predicate. |\n| Expired/missing/wrong | Expired ERR_TKN_00001; missing/ambiguous ERR_TKN_00002; wrong/invalid mandatory input ERR_TKN_00003. | Map to a business-safe response without disclosing account existence. |\n| Attempts/single use | Wrong value decrements limit, deactivating when it reaches zero; expiry or singleUseToken success requests deactivation. | Updates occur after process.nextSuccess/error, are not awaited, and failures only log. Concurrent callers may both pass or lose decrements. No atomic consumption/lockout guarantee. |\n\n## Configuration behavior\n\n```js\nmodule.exports = {\n  token: {\n    OTP: {\n      rangeStart: 100000,\n      rangeEnd: 1000000,\n      validUpTo: 180,\n      attemptLimit: 5,\n      tokenHandler: 'DefaultOtpHandlerService'\n    },\n    TOKEN: { attemptLimit: 5 }\n  }\n};\n```\n\nThis illustrative later-layer policy produces a six-digit range with an exclusive upper bound and a 180-second expiry; it contains no live code or secret. Important configuration distinction: nOtp declares OTP.attemptLimit, but the current generation pipeline defaults model.limit from token.TOKEN.attemptLimit when limit is undefined. Changing only OTP.attemptLimit does not prove enforcement. Caller-supplied model.limit also needs a trusted owner policy rather than an arbitrary browser value. Neither section implements resendDelay, channelPriority, account lockout or audit retention.\n\n## Customization and extension guidance\n\nLayer the existing OTP handler/configuration and consuming backend journey, preserving cryptographic randomness, trusted identity/purpose binding and safe response projection. Delivery providers/templates, cooldown, rate limits, account lockout and challenge audit require explicit application/owning-capability orchestration; no such call path is present in DefaultOtpService. Do not imply that configuring these labels creates enforcement. Do not add a second identity store or hide raw token material in documents, metrics, logs or error responses.\n\n## Implementation handoff\n\nA journey handoff must identify the actual issuer/validator, recipient lookup, permission check, subject/session/purpose binding, delivery owner and failure policy, cooldown/abuse owner, safe audit owner and consumer projection. Where these integrations are absent, mark them REQUIRED_INTEGRATION_GAP. The unawaited read-then-update validation is an explicit OTP_ATOMICITY_GAP: high-risk verification needs separately implemented and evidenced atomic consume/attempt enforcement, replay handling and durable outcome reconciliation. Source review cannot approve that readiness.\n\n## Evidence checklist\n\nRecord only sanitized challenge reference, purpose, trusted scope, expiry window, safe result code and owner correlation. Delivery status, throttling decisions and account lockout evidence must come from implemented owners, not invented nOtp events. Do not include raw code, token model, recipient address, authentication credentials or unredacted user details.\n\nA validation success is not proof that single-use deactivation persisted. For an update failure or uncertain result, block the sensitive consuming operation according to its owner recovery policy; inspect/reconcile through authorized owner APIs, not another blind validation or direct database write. Reissue only through that journey's governed delivery/cooldown policy. No generic atomic repair or challenge audit trail is provided here.\n\n## Common mistakes\n\n- Treating OTP as a replacement for identity and permission checks.\n- Allowing unlimited resend or verification attempts.\n- Exposing whether an account exists through error messages.\n- Logging raw OTP codes.\n- Forgetting communication provider failure handling.\n\n## Verification\n\nRequired qualification separates numeric range/expiry, key/ops binding, wrong/expired/missing values, limit defaults/overrides and existing-token reuse from application delivery/throttling/audit. Test concurrent successful validations, concurrent wrong attempts, zero/exhausted limits and failed updates against the real persistence adapter before claiming single-use or guessing resistance. Separately prove no raw values escape APIs/logs/browser state.\n",
    "keywords": [
      "otp",
      "verification",
      "security",
      "throttling",
      "audit",
      "Security, Governance, and Compliance",
      "Authentication and Verification",
      "OTP and Security Flow"
    ],
    "facets": {
      "section": "security-governance-and-compliance",
      "group": "security-governance-and-compliance",
      "navigationDepth": 2,
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
