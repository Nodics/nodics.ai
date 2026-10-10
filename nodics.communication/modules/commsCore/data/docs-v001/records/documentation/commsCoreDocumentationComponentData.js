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
    "code": "nodicsDocsComponentcommunicationProviderRunbooks",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "communication.provider-runbooks",
      "title": "Communication Provider Runbooks",
      "route": "/docs/framework/communication-provider-runbooks",
      "section": "communication-and-notifications",
      "sectionTitle": "Communication and Notifications",
      "group": "communication-and-notifications",
      "groupTitle": "Communication and Notifications",
      "parentId": "communication-and-notifications",
      "hierarchyPath": [
        "Communication and Notifications",
        "Communication Provider Runbooks"
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
      "summary": "Source-backed SMTP controlled-test and SMS injected-sandbox configuration, credentials, frozen-content delivery, safeguards, uncertainty recovery and live qualification boundaries.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.14",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "communication.overview",
        "security.otp-security-flow",
        "engagement.contact-submission-operations",
        "communication.email-sms-templates"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "../smtpCommsProvider/package.json",
        "../smsCommsProvider/package.json",
        "../../../nodics.engagement/modules/contactSubmission/package.json",
        "../smtpCommsProvider/src/service/defaultSmtpCommunicationProviderService.js",
        "../smsCommsProvider/src/service/defaultSmsCommunicationProviderService.js",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "communication",
        "smtp",
        "sms",
        "delivery",
        "retry"
      ],
      "topicKeywords": [
        "Communication and Notifications",
        "Provider Delivery",
        "Communication Provider Runbooks"
      ],
      "headings": [
        {
          "text": "Implemented modes and limits",
          "anchor": "communicationProviderRunbooks-1-implemented-modes-and-limits",
          "level": 2
        },
        {
          "text": "Source map",
          "anchor": "communicationProviderRunbooks-2-source-map",
          "level": 2
        },
        {
          "text": "Delivery sequence",
          "anchor": "communicationProviderRunbooks-3-delivery-sequence",
          "level": 2
        },
        {
          "text": "Before configuring any provider",
          "anchor": "communicationProviderRunbooks-4-before-configuring-any-provider",
          "level": 2
        },
        {
          "text": "Email: controlled SMTP configuration",
          "anchor": "communicationProviderRunbooks-5-email-controlled-smtp-configuration",
          "level": 2
        },
        {
          "text": "SMTP settings",
          "anchor": "communicationProviderRunbooks-6-smtp-settings",
          "level": 3
        },
        {
          "text": "Sender and credentials",
          "anchor": "communicationProviderRunbooks-7-sender-and-credentials",
          "level": 3
        },
        {
          "text": "MIME and content",
          "anchor": "communicationProviderRunbooks-8-mime-and-content",
          "level": 3
        },
        {
          "text": "Email: injected sandbox mode",
          "anchor": "communicationProviderRunbooks-9-email-injected-sandbox-mode",
          "level": 2
        },
        {
          "text": "SMS: injected sandbox configuration",
          "anchor": "communicationProviderRunbooks-10-sms-injected-sandbox-configuration",
          "level": 2
        },
        {
          "text": "SMS safety and limits",
          "anchor": "communicationProviderRunbooks-11-sms-safety-and-limits",
          "level": 3
        },
        {
          "text": "Customize and extend safely",
          "anchor": "communicationProviderRunbooks-12-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Outcomes and recovery",
          "anchor": "communicationProviderRunbooks-13-outcomes-and-recovery",
          "level": 2
        },
        {
          "text": "Operations and troubleshooting",
          "anchor": "communicationProviderRunbooks-14-operations-and-troubleshooting",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "communicationProviderRunbooks-15-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification and joint acceptance",
          "anchor": "communicationProviderRunbooks-16-verification-and-joint-acceptance",
          "level": 2
        },
        {
          "text": "Related topics",
          "anchor": "communicationProviderRunbooks-17-related-topics",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Beginners should first distinguish a template preview, sandbox acknowledgement, SMTP server acceptance and an observed customer receipt; they prove different things."
        },
        {
          "kind": "paragraph",
          "text": "Providers deliver frozen messages; they do not decide whether an order is ready, an employee is verified or a testimonial has consent. Think of them as delivery services that receive a prepared envelope. The business domain chooses the recipient and purpose; Communication renders, persists, claims and supervises delivery. Email and SMS share this ownership model but have different transport and qualification requirements."
        },
        {
          "kind": "paragraph",
          "text": "Functional owner: nodics.communication. Technical owners: smtpCommsProvider and smsCommsProvider. This guide is for administrators, operators, partner developers, QA, framework maintainers and AI tools. Business authors should start with [Email and SMS Templates](/docs/framework/communication-email-sms-templates) for wording and branding changes."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Implemented modes and limits",
          "anchor": "communicationProviderRunbooks-1-implemented-modes-and-limits"
        },
        {
          "kind": "table",
          "headers": [
            "Mode",
            "Current implementation",
            "Default",
            "What success proves"
          ],
          "rows": [
            [
              "Email SANDBOX",
              "Injected credential resolver and send port",
              "Disabled",
              "Selected test port reported acceptance"
            ],
            [
              "Email SMTP",
              "Real SMTP/MIME through Nodemailer with guarded test policy",
              "Disabled; must explicitly select SMTP",
              "Server accepted the one permitted recipient"
            ],
            [
              "SMS_SANDBOX",
              "Durable adapter to an injected sandbox service",
              "Disabled; sandbox-only",
              "Selected test port reported acceptance"
            ],
            [
              "Production SMS carrier",
              "Not supplied by this adapter",
              "Not qualified",
              "Requires a separately reviewed integration and acceptance"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "None of these alone proves that a person read a message. SMTP DELIVERED is transport acceptance, not independently observed mailbox receipt. SMS sandbox DELIVERED is not a carrier delivery report or handset observation. Do not set a liveQualified flag to bypass these restrictions: current adapters reject unsupported live settings. Runtime credentials, recipient authorization and actual acceptance remain explicit operational gates."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source map",
          "anchor": "communicationProviderRunbooks-2-source-map"
        },
        {
          "kind": "table",
          "headers": [
            "Concern",
            "Framework source"
          ],
          "rows": [
            [
              "Durable orchestration",
              "nodics.communication/modules/commsCore/src/service/defaultCommunicationRuntimeService.js"
            ],
            [
              "Resource rendering",
              "nodics.communication/modules/commsCore/src/service/defaultCommunicationTemplateService.js"
            ],
            [
              "SMTP configuration and adapter",
              "nodics.communication/modules/smtpCommsProvider/config/properties.js and src/service/defaultSmtpCommunicationProviderService.js"
            ],
            [
              "SMS configuration and adapter",
              "nodics.communication/modules/smsCommsProvider/config/properties.js and src/service/defaultSmsCommunicationProviderService.js"
            ],
            [
              "Verification challenge authority",
              "nodics.communication/modules/commsVerification"
            ],
            [
              "Intent and attempt schemas",
              "nodics.communication/modules/commsSchema"
            ],
            [
              "Template authoring and overrides",
              "[Email and SMS Templates](/docs/framework/communication-email-sms-templates)"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Delivery sequence",
          "anchor": "communicationProviderRunbooks-3-delivery-sequence"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n  participant Domain as Domain owner\n  participant Core as Communication runtime\n  participant Store as Managed intent storage\n  participant Provider as Selected provider\n  participant Transport as SMTP or injected sandbox\n  Domain->>Core: Trusted request and stable event key\n  Core->>Store: Read replay or persist frozen render\n  Core->>Core: Check policy, suppression and expiry\n  Core->>Store: Acquire exact managed claim\n  Store-->>Core: Confirm this writer owns the claim\n  Core->>Provider: request, claimed intent, selected policy\n  Provider->>Provider: Validate tenant, lease, expiry and content\n  Provider->>Transport: One bounded delivery invocation\n  Transport-->>Provider: Acceptance, rejection or ambiguous failure\n  Provider-->>Core: Redacted status and references\n  Core->>Store: Persist attempt/outcome\n  Core-->>Domain: Safe intent/status projection"
        },
        {
          "kind": "paragraph",
          "text": "Providers receive the durable form `deliver({ request, intent, policy })`. They consume intent.renderedContent, not a template code requiring provider-side rendering. The legacy injected three-argument sandbox interface remains for compatibility. Domain code must call the Communication owner rather than either provider interface directly."
        },
        {
          "kind": "paragraph",
          "text": "The runtime checks its own managed write marker and revision before delivery. A zero-match update, read failure or another writer's claim is not authorization to send. An expired external-delivery claim can be uncertain because a previous worker may already have invoked the transport."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Before configuring any provider",
          "anchor": "communicationProviderRunbooks-4-before-configuring-any-provider"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Identify the sending runtime and confirm its effective Communication/provider modules. A setting in a separate API runtime does not configure the sender.",
            "Verify the template owner is discovered, resource selected, source trusted, recipient authoritative and business feature enabled by its existing owner.",
            "Prepare an approved test recipient, controlled sender identity, private credential reference and redacted evidence plan. Do not use arbitrary customer addresses.",
            "Verify schema installation and current intent/attempt contracts through the normal owner path. Source generation is not database installation.",
            "Keep the adapter disabled until the approved test window. Configuration examples below show shapes and fake values; they are not deployment instructions to execute automatically or proof of production readiness."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Email: controlled SMTP configuration",
          "anchor": "communicationProviderRunbooks-5-email-controlled-smtp-configuration"
        },
        {
          "kind": "paragraph",
          "text": "The provider type SMTP is registered by the existing provider module. Do not copy its service name into a new provider registry. The following deployment fragment selects it, but intentionally leaves delivery disabled:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  communication: {\n    providers: {\n      EMAIL: {\n        type: \"SMTP\",\n        enabled: false,\n        mode: \"SMTP\",\n        sandboxOnly: false,\n        testOnly: true,\n        liveQualified: false,\n        senderReference: \"notifications\",\n        credentialReference: \"notification-mail\",\n        allowedRecipients: [\"approved-recipient@example.test\"],\n        smtp: {\n          host: \"smtp.example.test\",\n          port: 587,\n          secure: false,\n          requireTLS: true\n        }\n      }\n    },\n    senders: {\n      notifications: {\n        address: \"notifications@example.test\",\n        name: \"Example Company\"\n      }\n    }\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Replace fake values only in the correct customer/private deployment layer. The authorized operator enables the selected provider during the controlled test. Defaults such as timeout and maximum content size remain inherited unless an intentional difference is required. Never commit a credential value to properties."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "SMTP settings",
          "anchor": "communicationProviderRunbooks-6-smtp-settings"
        },
        {
          "kind": "table",
          "headers": [
            "Setting",
            "Default or rule"
          ],
          "rows": [
            [
              "enabled",
              "false; true required to send"
            ],
            [
              "mode",
              "SANDBOX by default; select SMTP for the real protocol"
            ],
            [
              "sandboxOnly",
              "Must be false for SMTP, true for sandbox"
            ],
            [
              "testOnly",
              "Must remain true for this controlled SMTP implementation"
            ],
            [
              "liveQualified",
              "Must not be true; no unrestricted production mode is supplied"
            ],
            [
              "senderReference",
              "Key in communication.senders"
            ],
            [
              "credentialReference",
              "Key resolved by the existing secure configuration owners"
            ],
            [
              "allowedRecipients",
              "Explicit non-empty list, at most 100 approved mailbox values"
            ],
            [
              "maximumContentBytes",
              "Default 65536; bound subject, text and optional HTML"
            ],
            [
              "timeoutMilliseconds",
              "Default 5000; valid integer 1 through 60000"
            ],
            [
              "smtp.host / port",
              "Explicit host, port 1 through 65535"
            ],
            [
              "smtp.secure",
              "Implicit TLS when true; port 465 requires true"
            ],
            [
              "smtp.requireTLS",
              "Required STARTTLS when secure is false, except approved loopback fixture"
            ],
            [
              "smtp.allowInsecureLoopback",
              "false by default; true allowed only for loopback tests"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "TLS certificate verification stays enabled. Remote plaintext, ignoreTLS, rejectUnauthorized:false and arbitrary SMTP options are not supported overrides. For a local fixture only, the explicit allowInsecureLoopback option can permit plaintext on localhost, 127.0.0.1 or ::1. Never carry that exception into a remote deployment. Nodemailer gets bounded timeouts, no pooling, no transport debug/logging, no file/URL access and no arbitrary attachment/raw-message options."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Sender and credentials",
          "anchor": "communicationProviderRunbooks-7-sender-and-credentials"
        },
        {
          "kind": "paragraph",
          "text": "communication.senders[senderReference] is either a plain mailbox string or an object with address and optional name. The approved sender must match the credential account user in the current controlled-test adapter; alias or delegated send-as support requires separate qualification. Recipient input is one plain mailbox, not a display-name expression, recipient list or arbitrary SMTP envelope."
        },
        {
          "kind": "paragraph",
          "text": "Credentials resolve on every send. runtimeConfiguration.credentials takes precedence when it owns the reference; otherwise secureConfiguration.credentials is used. Supported secret object shapes are a login user/pass or OAuth2 type/user/accessToken. These are descriptions of a protected store, not instructions to add plaintext secrets to a source file. The existing secret owner supplies/rotates them. The transport does not refresh OAuth tokens or retain credentials in a pool."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "MIME and content",
          "anchor": "communicationProviderRunbooks-8-mime-and-content"
        },
        {
          "kind": "paragraph",
          "text": "The provider sends plain text and optional HTML as MIME alternatives. Both come from frozen private intent content. Plain text remains required. Subjects reject header injection, all representations are strings, and combined content is bounded. Private templateIdentity does not become a message header or transport payload. Providers never fetch a template, render a placeholder or resolve HTML asset URLs."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Email: injected sandbox mode",
          "anchor": "communicationProviderRunbooks-9-email-injected-sandbox-mode"
        },
        {
          "kind": "paragraph",
          "text": "Select the SMTP provider type with mode SANDBOX and a trusted sandboxTransportService exposing resolveCredential and send. The provider also needs its endpoint, senderReference and credentialReference, enabled:true and sandboxOnly:true; all are deployment selections, not browser input. Defaults remain disabled. Do not confuse a sandbox endpoint with smtp.host."
        },
        {
          "kind": "paragraph",
          "text": "The durable path validates tenant, EMAIL channel, DELIVERING state, future lease and expiry before ports. It projects bounded subject/body/optional HTML and excludes private provenance. The injected port owns its sandbox protocol. It is not proof that the real SMTP path or a mailbox has been exercised."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "SMS: injected sandbox configuration",
          "anchor": "communicationProviderRunbooks-10-sms-injected-sandbox-configuration"
        },
        {
          "kind": "paragraph",
          "text": "The existing module registers SMS_SANDBOX. This illustrative selection remains disabled and names a customer-owned sandbox port that must actually be implemented through the normal service hierarchy:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  communication: {\n    providers: {\n      SMS: {\n        type: \"SMS_SANDBOX\",\n        enabled: false,\n        endpoint: \"https://sms-sandbox.example.test/messages\",\n        credentialReference: \"notification-sms\",\n        senderReference: \"notifications\",\n        sandboxTransportService: \"AcmeSmsSandboxTransportService\"\n      }\n    }\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "The fictional service name is not built into Nodics. Compose a trusted exported service with resolveCredential(reference) and send(envelope) before enabling the selection in an approved sandbox. Methods are bound to the effective service receiver so later-layer behavior remains available."
        },
        {
          "kind": "paragraph",
          "text": "The send envelope contains endpoint, resolved credential, senderReference, recipientAddressReference, rendered.body, idempotencyKey and timeoutMilliseconds. The port must apply its own sandbox transport and recipient-resolution policy, honor the timeout and avoid secret/content logging. Unlike SMTP, the SMS adapter does not supply a mailbox-style allowedRecipients implementation or a live carrier client. Provider qualification must establish those channel-specific controls."
        },
        {
          "kind": "paragraph",
          "text": "The sandbox response needs a nonempty string reference, at most 256 characters; an optional string code is bounded at 128. accepted:false maps to FAILED. A valid acknowledgement otherwise maps to sandbox DELIVERED under the compatibility contract. Port authors should return an explicit accepted:true on positive acceptance. Malformed replies or transport exceptions after invocation are uncertain, not a safe reason to send again."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "SMS safety and limits",
          "anchor": "communicationProviderRunbooks-11-sms-safety-and-limits"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Validate matching request/authenticated/intent tenant, SMS channel, DELIVERING state, future lease, expiry and bounded identities before transport.",
            "Use a nonempty literal body only. HTML is rejected and template provenance is stripped. Do not pass an entire intent to a gateway.",
            "maximumContentBytes defaults to 1600 and is validated in the range 1 through"
          ]
        },
        {
          "kind": "ordered-list",
          "items": [
            "The bound measures UTF-8 bytes, not carrier segments or character credits."
          ]
        },
        {
          "kind": "unordered-list",
          "items": [
            "sandboxOnly remains true and liveQualified remains false. A real SMS provider, authenticated callbacks, opt-out handling, rate/cost controls and delivery-report semantics require explicit integration and acceptance.",
            "A credential/send port is trusted framework/customer implementation, not a public extensibility input. It must not be chosen by a submitted browser body."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "communicationProviderRunbooks-12-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Branding and wording changes belong in [layered resources](/docs/framework/communication-email-sms-templates#customize-and-extend-safely), not transport services. Select providers and actual deployment differences through the existing configuration hierarchy. Do not add credentials, gateways or rendering code to Kickoff merely because it is the demonstration project."
        },
        {
          "kind": "paragraph",
          "text": "For a transport-specific requirement, use the existing provider's mergeable exported service members and documented extension boundary. A later concrete customer module can supply the sandbox service referenced above; reusable provider mechanics belong with their framework owner. Do not replace Communication's claim, idempotency, suppression or uncertainty ledger with a customer-owned queue."
        },
        {
          "kind": "paragraph",
          "text": "A credential-resolver override must preserve reference-only configuration, least privilege, rotation and redacted errors. A transport override must preserve tenant, lease, expiry, content bounds and one-invocation semantics. A change to production behavior requires its own reviewed contract and evidence; setting flags is not qualification. Do not invent custom callback handlers that update employee, order or testimonial status directly."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Outcomes and recovery",
          "anchor": "communicationProviderRunbooks-13-outcomes-and-recovery"
        },
        {
          "kind": "table",
          "headers": [
            "State",
            "Meaning",
            "Operator action"
          ],
          "rows": [
            [
              "UNCONFIGURED",
              "Disabled/missing/invalid provider configuration or credential",
              "Fix configuration through its owner; inspect supported recovery without inventing a new event"
            ],
            [
              "SUPPRESSED",
              "Recipient/purpose/channel policy or delivery expiry prevents send",
              "Confirm policy; never switch providers to evade it"
            ],
            [
              "DELIVERED",
              "Selected adapter's positive acceptance evidence",
              "Observe real mailbox/handset separately when required"
            ],
            [
              "FAILED",
              "Definite rejection or invalid request",
              "Diagnose redacted reason; use only authorized supported recovery"
            ],
            [
              "RETRY_PENDING",
              "Known retryable rejection with bounded due time",
              "Wait for due time and use the existing authorized retry operation"
            ],
            [
              "UNCERTAIN",
              "Send may have happened; reply/claim outcome is ambiguous",
              "Reconcile evidence before any resend"
            ],
            [
              "DEAD_LETTER",
              "Attempt ceiling exhausted",
              "Investigate and reconcile; do not reset counters to bypass policy"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The durable binding does not install an automatic retry scheduler. Authorized retry checks current status, due time and attempt ceiling. Uncertain recovery requires current managed revision, reason and an explicit decision: MARK_DELIVERED, AUTHORIZE_RESEND or CANCEL. Authorization to resend is not itself a send. Manual MARK_DELIVERED is operator evidence, not an authenticated provider receipt."
        },
        {
          "kind": "paragraph",
          "text": "If the source-domain operation succeeded but notification failed, retain the domain success and report notification progress separately. Never replay registration, approval, password reset or consent capture to force a new message."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operations and troubleshooting",
          "anchor": "communicationProviderRunbooks-14-operations-and-troubleshooting"
        },
        {
          "kind": "paragraph",
          "text": "Use intent code, source reference, channel, template code/version, attempt count, redacted provider reference, status and correlation ID to connect business events with delivery. Do not log bodies, addresses, raw replies, OTPs or credentials. Health/configuration availability does not imply external delivery readiness."
        },
        {
          "kind": "table",
          "headers": [
            "Observation",
            "Check",
            "Safe response"
          ],
          "rows": [
            [
              "No intent created",
              "Trusted source, command, resource and parameter validation",
              "Correct caller/configuration before trying a new authorized request"
            ],
            [
              "Provider UNCONFIGURED",
              "Effective sending-runtime settings, mode, refs and ports",
              "Do not alter domain decisions or disable security checks"
            ],
            [
              "SMTP authentication rejected",
              "Secret owner, account, expiry/rotation",
              "Fix privately; do not paste secrets/provider text into tickets"
            ],
            [
              "SMTP sender rejected",
              "Sender account binding and provider policy",
              "Qualify alias support rather than bypassing binding"
            ],
            [
              "TLS connection fails",
              "Host, port, required TLS and certificate trust",
              "Fix endpoint/certificates; never disable validation remotely"
            ],
            [
              "SMS text rejected",
              "Nonempty plain body and final UTF-8 size",
              "Shorten the template and revalidate without HTML"
            ],
            [
              "Timeout after possible acceptance",
              "Intent/attempt and provider evidence",
              "Keep UNCERTAIN until authorized reconciliation"
            ],
            [
              "Template edits do not affect pending intent",
              "Frozen stored render",
              "Expected; no automatic content rewrite"
            ],
            [
              "Provider reports success but inbox is empty",
              "Spam/quarantine, mailbox routing or carrier semantics",
              "Gather separate observed-receipt evidence, avoid duplicate sends"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Incident handoff should identify mode, runtime, affected intent references, redacted failure classification, whether transport invocation occurred, retry/ uncertainty state, policy constraints and the authorized next action. Include residency, consent, rate/cost and rollback owners for any production qualification."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "communicationProviderRunbooks-15-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Enabling a provider before verifying the effective sending-runtime policy.",
            "Treating SMS sandbox acceptance as a carrier delivery report.",
            "Committing credentials, disabling remote TLS validation or widening recipients.",
            "Passing templates to providers instead of frozen representations.",
            "Resetting attempts or changing event keys to bypass uncertain-send reconciliation.",
            "Updating domain approval or identity state in a provider callback."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification and joint acceptance",
          "anchor": "communicationProviderRunbooks-16-verification-and-joint-acceptance"
        },
        {
          "kind": "paragraph",
          "text": "Test defaults and customization with fake values first. Exercise disabled mode, missing ports/credentials, tenant mismatch, expired lease/intent, subject injection, oversized content, invalid recipient/sender, TLS downgrade refusal, accepted, rejected and ambiguous outcomes, rotation and frozen replay. Inspect MIME text/HTML and private-data exclusion. The focused suites live under the two provider test directories and commsCore/test."
        },
        {
          "kind": "paragraph",
          "text": "Only then, in a named approved runtime, install current schemas/adoption records, inspect effective policy, enable one controlled provider and recipient, and observe actual delivery. Test a real email client separately from Chrome previews. A carrier test is separate from an injected SMS port test. Confirm domain state does not change on notification retry and disable the controlled selection after the agreed window. Record authored, generated, local-tested, runtime-tested and live-observed states separately."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Related topics",
          "anchor": "communicationProviderRunbooks-17-related-topics"
        },
        {
          "kind": "unordered-list",
          "items": [
            "[Communication overview](/docs/framework/communication-overview)",
            "[Template inventory, configuration and authoring](/docs/framework/communication-email-sms-templates)",
            "[SMTP implementation contract](../../../../nodics.communication/modules/smtpCommsProvider/llm/contracts/README.md)",
            "[SMS implementation contract](../../../../nodics.communication/modules/smsCommsProvider/llm/contracts/README.md)"
          ]
        }
      ],
      "searchText": "Communication Provider Runbooks Source-backed SMTP controlled-test and SMS injected-sandbox configuration, credentials, frozen-content delivery, safeguards, uncertainty recovery and live qualification boundaries. # Communication Provider Runbooks\n\nBeginners should first distinguish a template preview, sandbox acknowledgement, SMTP server acceptance and an observed customer receipt; they prove different things.\n\nProviders deliver frozen messages; they do not decide whether an order is ready, an employee is verified or a testimonial has consent. Think of them as delivery services that receive a prepared envelope. The business domain chooses the recipient and purpose; Communication renders, persists, claims and supervises delivery. Email and SMS share this ownership model but have different transport and qualification requirements.\n\nFunctional owner: nodics.communication. Technical owners: smtpCommsProvider and smsCommsProvider. This guide is for administrators, operators, partner developers, QA, framework maintainers and AI tools. Business authors should start with [Email and SMS Templates](/docs/framework/communication-email-sms-templates) for wording and branding changes.\n\n## Implemented modes and limits\n\n| Mode | Current implementation | Default | What success proves |\n| --- | --- | --- | --- |\n| Email SANDBOX | Injected credential resolver and send port | Disabled | Selected test port reported acceptance |\n| Email SMTP | Real SMTP/MIME through Nodemailer with guarded test policy | Disabled; must explicitly select SMTP | Server accepted the one permitted recipient |\n| SMS_SANDBOX | Durable adapter to an injected sandbox service | Disabled; sandbox-only | Selected test port reported acceptance |\n| Production SMS carrier | Not supplied by this adapter | Not qualified | Requires a separately reviewed integration and acceptance |\n\nNone of these alone proves that a person read a message. SMTP DELIVERED is transport acceptance, not independently observed mailbox receipt. SMS sandbox DELIVERED is not a carrier delivery report or handset observation. Do not set a liveQualified flag to bypass these restrictions: current adapters reject unsupported live settings. Runtime credentials, recipient authorization and actual acceptance remain explicit operational gates.\n\n## Source map\n\n| Concern | Framework source |\n| --- | --- |\n| Durable orchestration | nodics.communication/modules/commsCore/src/service/defaultCommunicationRuntimeService.js |\n| Resource rendering | nodics.communication/modules/commsCore/src/service/defaultCommunicationTemplateService.js |\n| SMTP configuration and adapter | nodics.communication/modules/smtpCommsProvider/config/properties.js and src/service/defaultSmtpCommunicationProviderService.js |\n| SMS configuration and adapter | nodics.communication/modules/smsCommsProvider/config/properties.js and src/service/defaultSmsCommunicationProviderService.js |\n| Verification challenge authority | nodics.communication/modules/commsVerification |\n| Intent and attempt schemas | nodics.communication/modules/commsSchema |\n| Template authoring and overrides | [Email and SMS Templates](/docs/framework/communication-email-sms-templates) |\n\n## Delivery sequence\n\n```mermaid\nsequenceDiagram\n  participant Domain as Domain owner\n  participant Core as Communication runtime\n  participant Store as Managed intent storage\n  participant Provider as Selected provider\n  participant Transport as SMTP or injected sandbox\n  Domain->>Core: Trusted request and stable event key\n  Core->>Store: Read replay or persist frozen render\n  Core->>Core: Check policy, suppression and expiry\n  Core->>Store: Acquire exact managed claim\n  Store-->>Core: Confirm this writer owns the claim\n  Core->>Provider: request, claimed intent, selected policy\n  Provider->>Provider: Validate tenant, lease, expiry and content\n  Provider->>Transport: One bounded delivery invocation\n  Transport-->>Provider: Acceptance, rejection or ambiguous failure\n  Provider-->>Core: Redacted status and references\n  Core->>Store: Persist attempt/outcome\n  Core-->>Domain: Safe intent/status projection\n```\n\nProviders receive the durable form `deliver({ request, intent, policy })`. They consume intent.renderedContent, not a template code requiring provider-side rendering. The legacy injected three-argument sandbox interface remains for compatibility. Domain code must call the Communication owner rather than either provider interface directly.\n\nThe runtime checks its own managed write marker and revision before delivery. A zero-match update, read failure or another writer's claim is not authorization to send. An expired external-delivery claim can be uncertain because a previous worker may already have invoked the transport.\n\n## Before configuring any provider\n\n1. Identify the sending runtime and confirm its effective Communication/provider modules. A setting in a separate API runtime does not configure the sender.\n2. Verify the template owner is discovered, resource selected, source trusted, recipient authoritative and business feature enabled by its existing owner.\n3. Prepare an approved test recipient, controlled sender identity, private credential reference and redacted evidence plan. Do not use arbitrary customer addresses.\n4. Verify schema installation and current intent/attempt contracts through the normal owner path. Source generation is not database installation.\n5. Keep the adapter disabled until the approved test window. Configuration examples below show shapes and fake values; they are not deployment instructions to execute automatically or proof of production readiness.\n\n## Email: controlled SMTP configuration\n\nThe provider type SMTP is registered by the existing provider module. Do not copy its service name into a new provider registry. The following deployment fragment selects it, but intentionally leaves delivery disabled:\n\n```js\nmodule.exports = {\n  communication: {\n    providers: {\n      EMAIL: {\n        type: \"SMTP\",\n        enabled: false,\n        mode: \"SMTP\",\n        sandboxOnly: false,\n        testOnly: true,\n        liveQualified: false,\n        senderReference: \"notifications\",\n        credentialReference: \"notification-mail\",\n        allowedRecipients: [\"approved-recipient@example.test\"],\n        smtp: {\n          host: \"smtp.example.test\",\n          port: 587,\n          secure: false,\n          requireTLS: true\n        }\n      }\n    },\n    senders: {\n      notifications: {\n        address: \"notifications@example.test\",\n        name: \"Example Company\"\n      }\n    }\n  }\n};\n```\n\nReplace fake values only in the correct customer/private deployment layer. The authorized operator enables the selected provider during the controlled test. Defaults such as timeout and maximum content size remain inherited unless an intentional difference is required. Never commit a credential value to properties.\n\n### SMTP settings\n\n| Setting | Default or rule |\n| --- | --- |\n| enabled | false; true required to send |\n| mode | SANDBOX by default; select SMTP for the real protocol |\n| sandboxOnly | Must be false for SMTP, true for sandbox |\n| testOnly | Must remain true for this controlled SMTP implementation |\n| liveQualified | Must not be true; no unrestricted production mode is supplied |\n| senderReference | Key in communication.senders |\n| credentialReference | Key resolved by the existing secure configuration owners |\n| allowedRecipients | Explicit non-empty list, at most 100 approved mailbox values |\n| maximumContentBytes | Default 65536; bound subject, text and optional HTML |\n| timeoutMilliseconds | Default 5000; valid integer 1 through 60000 |\n| smtp.host / port | Explicit host, port 1 through 65535 |\n| smtp.secure | Implicit TLS when true; port 465 requires true |\n| smtp.requireTLS | Required STARTTLS when secure is false, except approved loopback fixture |\n| smtp.allowInsecureLoopback | false by default; true allowed only for loopback tests |\n\nTLS certificate verification stays enabled. Remote plaintext, ignoreTLS, rejectUnauthorized:false and arbitrary SMTP options are not supported overrides. For a local fixture only, the explicit allowInsecureLoopback option can permit plaintext on localhost, 127.0.0.1 or ::1. Never carry that exception into a remote deployment. Nodemailer gets bounded timeouts, no pooling, no transport debug/logging, no file/URL access and no arbitrary attachment/raw-message options.\n\n### Sender and credentials\n\ncommunication.senders[senderReference] is either a plain mailbox string or an object with address and optional name. The approved sender must match the credential account user in the current controlled-test adapter; alias or delegated send-as support requires separate qualification. Recipient input is one plain mailbox, not a display-name expression, recipient list or arbitrary SMTP envelope.\n\nCredentials resolve on every send. runtimeConfiguration.credentials takes precedence when it owns the reference; otherwise secureConfiguration.credentials is used. Supported secret object shapes are a login user/pass or OAuth2 type/user/accessToken. These are descriptions of a protected store, not instructions to add plaintext secrets to a source file. The existing secret owner supplies/rotates them. The transport does not refresh OAuth tokens or retain credentials in a pool.\n\n### MIME and content\n\nThe provider sends plain text and optional HTML as MIME alternatives. Both come from frozen private intent content. Plain text remains required. Subjects reject header injection, all representations are strings, and combined content is bounded. Private templateIdentity does not become a message header or transport payload. Providers never fetch a template, render a placeholder or resolve HTML asset URLs.\n\n## Email: injected sandbox mode\n\nSelect the SMTP provider type with mode SANDBOX and a trusted sandboxTransportService exposing resolveCredential and send. The provider also needs its endpoint, senderReference and credentialReference, enabled:true and sandboxOnly:true; all are deployment selections, not browser input. Defaults remain disabled. Do not confuse a sandbox endpoint with smtp.host.\n\nThe durable path validates tenant, EMAIL channel, DELIVERING state, future lease and expiry before ports. It projects bounded subject/body/optional HTML and excludes private provenance. The injected port owns its sandbox protocol. It is not proof that the real SMTP path or a mailbox has been exercised.\n\n## SMS: injected sandbox configuration\n\nThe existing module registers SMS_SANDBOX. This illustrative selection remains disabled and names a customer-owned sandbox port that must actually be implemented through the normal service hierarchy:\n\n```js\nmodule.exports = {\n  communication: {\n    providers: {\n      SMS: {\n        type: \"SMS_SANDBOX\",\n        enabled: false,\n        endpoint: \"https://sms-sandbox.example.test/messages\",\n        credentialReference: \"notification-sms\",\n        senderReference: \"notifications\",\n        sandboxTransportService: \"AcmeSmsSandboxTransportService\"\n      }\n    }\n  }\n};\n```\n\nThe fictional service name is not built into Nodics. Compose a trusted exported service with resolveCredential(reference) and send(envelope) before enabling the selection in an approved sandbox. Methods are bound to the effective service receiver so later-layer behavior remains available.\n\nThe send envelope contains endpoint, resolved credential, senderReference, recipientAddressReference, rendered.body, idempotencyKey and timeoutMilliseconds. The port must apply its own sandbox transport and recipient-resolution policy, honor the timeout and avoid secret/content logging. Unlike SMTP, the SMS adapter does not supply a mailbox-style allowedRecipients implementation or a live carrier client. Provider qualification must establish those channel-specific controls.\n\nThe sandbox response needs a nonempty string reference, at most 256 characters; an optional string code is bounded at 128. accepted:false maps to FAILED. A valid acknowledgement otherwise maps to sandbox DELIVERED under the compatibility contract. Port authors should return an explicit accepted:true on positive acceptance. Malformed replies or transport exceptions after invocation are uncertain, not a safe reason to send again.\n\n### SMS safety and limits\n\n- Validate matching request/authenticated/intent tenant, SMS channel, DELIVERING state, future lease, expiry and bounded identities before transport.\n- Use a nonempty literal body only. HTML is rejected and template provenance is stripped. Do not pass an entire intent to a gateway.\n- maximumContentBytes defaults to 1600 and is validated in the range 1 through\n\n1. The bound measures UTF-8 bytes, not carrier segments or character credits.\n\n- sandboxOnly remains true and liveQualified remains false. A real SMS provider, authenticated callbacks, opt-out handling, rate/cost controls and delivery-report semantics require explicit integration and acceptance.\n- A credential/send port is trusted framework/customer implementation, not a public extensibility input. It must not be chosen by a submitted browser body.\n\n## Customize and extend safely\n\nBranding and wording changes belong in [layered resources](/docs/framework/communication-email-sms-templates#customize-and-extend-safely), not transport services. Select providers and actual deployment differences through the existing configuration hierarchy. Do not add credentials, gateways or rendering code to Kickoff merely because it is the demonstration project.\n\nFor a transport-specific requirement, use the existing provider's mergeable exported service members and documented extension boundary. A later concrete customer module can supply the sandbox service referenced above; reusable provider mechanics belong with their framework owner. Do not replace Communication's claim, idempotency, suppression or uncertainty ledger with a customer-owned queue.\n\nA credential-resolver override must preserve reference-only configuration, least privilege, rotation and redacted errors. A transport override must preserve tenant, lease, expiry, content bounds and one-invocation semantics. A change to production behavior requires its own reviewed contract and evidence; setting flags is not qualification. Do not invent custom callback handlers that update employee, order or testimonial status directly.\n\n## Outcomes and recovery\n\n| State | Meaning | Operator action |\n| --- | --- | --- |\n| UNCONFIGURED | Disabled/missing/invalid provider configuration or credential | Fix configuration through its owner; inspect supported recovery without inventing a new event |\n| SUPPRESSED | Recipient/purpose/channel policy or delivery expiry prevents send | Confirm policy; never switch providers to evade it |\n| DELIVERED | Selected adapter's positive acceptance evidence | Observe real mailbox/handset separately when required |\n| FAILED | Definite rejection or invalid request | Diagnose redacted reason; use only authorized supported recovery |\n| RETRY_PENDING | Known retryable rejection with bounded due time | Wait for due time and use the existing authorized retry operation |\n| UNCERTAIN | Send may have happened; reply/claim outcome is ambiguous | Reconcile evidence before any resend |\n| DEAD_LETTER | Attempt ceiling exhausted | Investigate and reconcile; do not reset counters to bypass policy |\n\nThe durable binding does not install an automatic retry scheduler. Authorized retry checks current status, due time and attempt ceiling. Uncertain recovery requires current managed revision, reason and an explicit decision: MARK_DELIVERED, AUTHORIZE_RESEND or CANCEL. Authorization to resend is not itself a send. Manual MARK_DELIVERED is operator evidence, not an authenticated provider receipt.\n\nIf the source-domain operation succeeded but notification failed, retain the domain success and report notification progress separately. Never replay registration, approval, password reset or consent capture to force a new message.\n\n## Operations and troubleshooting\n\nUse intent code, source reference, channel, template code/version, attempt count, redacted provider reference, status and correlation ID to connect business events with delivery. Do not log bodies, addresses, raw replies, OTPs or credentials. Health/configuration availability does not imply external delivery readiness.\n\n| Observation | Check | Safe response |\n| --- | --- | --- |\n| No intent created | Trusted source, command, resource and parameter validation | Correct caller/configuration before trying a new authorized request |\n| Provider UNCONFIGURED | Effective sending-runtime settings, mode, refs and ports | Do not alter domain decisions or disable security checks |\n| SMTP authentication rejected | Secret owner, account, expiry/rotation | Fix privately; do not paste secrets/provider text into tickets |\n| SMTP sender rejected | Sender account binding and provider policy | Qualify alias support rather than bypassing binding |\n| TLS connection fails | Host, port, required TLS and certificate trust | Fix endpoint/certificates; never disable validation remotely |\n| SMS text rejected | Nonempty plain body and final UTF-8 size | Shorten the template and revalidate without HTML |\n| Timeout after possible acceptance | Intent/attempt and provider evidence | Keep UNCERTAIN until authorized reconciliation |\n| Template edits do not affect pending intent | Frozen stored render | Expected; no automatic content rewrite |\n| Provider reports success but inbox is empty | Spam/quarantine, mailbox routing or carrier semantics | Gather separate observed-receipt evidence, avoid duplicate sends |\n\nIncident handoff should identify mode, runtime, affected intent references, redacted failure classification, whether transport invocation occurred, retry/ uncertainty state, policy constraints and the authorized next action. Include residency, consent, rate/cost and rollback owners for any production qualification.\n\n## Common mistakes\n\n- Enabling a provider before verifying the effective sending-runtime policy.\n- Treating SMS sandbox acceptance as a carrier delivery report.\n- Committing credentials, disabling remote TLS validation or widening recipients.\n- Passing templates to providers instead of frozen representations.\n- Resetting attempts or changing event keys to bypass uncertain-send reconciliation.\n- Updating domain approval or identity state in a provider callback.\n\n## Verification and joint acceptance\n\nTest defaults and customization with fake values first. Exercise disabled mode, missing ports/credentials, tenant mismatch, expired lease/intent, subject injection, oversized content, invalid recipient/sender, TLS downgrade refusal, accepted, rejected and ambiguous outcomes, rotation and frozen replay. Inspect MIME text/HTML and private-data exclusion. The focused suites live under the two provider test directories and commsCore/test.\n\nOnly then, in a named approved runtime, install current schemas/adoption records, inspect effective policy, enable one controlled provider and recipient, and observe actual delivery. Test a real email client separately from Chrome previews. A carrier test is separate from an injected SMS port test. Confirm domain state does not change on notification retry and disable the controlled selection after the agreed window. Record authored, generated, local-tested, runtime-tested and live-observed states separately.\n\n## Related topics\n\n- [Communication overview](/docs/framework/communication-overview)\n- [Template inventory, configuration and authoring](/docs/framework/communication-email-sms-templates)\n- [SMTP implementation contract](../../../../nodics.communication/modules/smtpCommsProvider/llm/contracts/README.md)\n- [SMS implementation contract](../../../../nodics.communication/modules/smsCommsProvider/llm/contracts/README.md)\n",
      "previous": {
        "title": "OTP and Security Flow",
        "route": "/docs/framework/security-otp-security-flow"
      },
      "next": {
        "title": "Contact Submission Operations",
        "route": "/docs/framework/engagement-contact-submission-operations"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.communication",
        "technicalModule": "commsCore",
        "owner": "commsCore",
        "sourcePath": "data/docs-v001/records/documentation/commsCoreDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/commsCoreDocumentationComponentData.js",
        "wordCount": 2412,
        "checksum": "1614ea3ae40cc56606bdf7a3ea39d4570712734f93051c88fc68f778d5801761"
      },
      "slug": "communication-provider-runbooks",
      "locale": "en",
      "navigationGroup": "Provider Delivery",
      "navigationGroupCode": "provider-delivery",
      "navigationGroupOrder": 20,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "communication.overview",
          "owner": "commsCore"
        },
        {
          "documentId": "security.otp-security-flow",
          "owner": "otp"
        },
        {
          "documentId": "engagement.contact-submission-operations",
          "owner": "contactSubmission"
        },
        {
          "documentId": "communication.email-sms-templates",
          "owner": "commsCore"
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "nodicsDocsComponentcommunicationOverview",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "communication.overview",
      "title": "Communication, delivery, and verification",
      "route": "/docs/framework/communication-overview",
      "section": "communication-and-notifications",
      "sectionTitle": "Communication and Notifications",
      "group": "communication-and-notifications",
      "groupTitle": "Communication and Notifications",
      "parentId": "communication-and-notifications",
      "hierarchyPath": [
        "Communication and Notifications",
        "Communication, delivery, and verification"
      ],
      "hierarchyDepth": 2,
      "documentType": "overview",
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
      "summary": "Beginner-to-operator journey for templates, intent, consent, suppression, verification, provider delivery, callbacks, retry, inbox, recovery, and domain integration.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.14",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "engagement.customer-feedback",
        "process.action-adapters",
        "communication.email-sms-templates"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "table"
      ],
      "searchKeywords": [
        "communication-and-notifications",
        "communication-delivery-and-verification",
        "communication-delivery-and-verification"
      ],
      "topicKeywords": [
        "Communication and Notifications",
        "Communication Delivery and Verification",
        "Communication, delivery, and verification"
      ],
      "headings": [
        {
          "text": "Module structure",
          "anchor": "communicationOverview-1-module-structure",
          "level": 2
        },
        {
          "text": "End-to-end delivery journey",
          "anchor": "communicationOverview-2-end-to-end-delivery-journey",
          "level": 2
        },
        {
          "text": "Template and rendering journey",
          "anchor": "communicationOverview-3-template-and-rendering-journey",
          "level": 2
        },
        {
          "text": "Consent, purpose, and suppression",
          "anchor": "communicationOverview-4-consent-purpose-and-suppression",
          "level": 2
        },
        {
          "text": "Idempotency and delivery evidence",
          "anchor": "communicationOverview-5-idempotency-and-delivery-evidence",
          "level": 2
        },
        {
          "text": "Verification journey",
          "anchor": "communicationOverview-6-verification-journey",
          "level": 2
        },
        {
          "text": "Axis and customer journey",
          "anchor": "communicationOverview-7-axis-and-customer-journey",
          "level": 2
        },
        {
          "text": "Engagement integration",
          "anchor": "communicationOverview-8-engagement-integration",
          "level": 2
        },
        {
          "text": "Provider activation and operations",
          "anchor": "communicationOverview-9-provider-activation-and-operations",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "communicationOverview-10-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "communicationOverview-11-verification",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "communicationOverview-12-customize-and-extend-safely",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Nodics Communication turns a business-owned request to inform or verify someone into a governed message and delivery outcome. This beginner-friendly guide explains templates, recipients, consent and suppression, provider delivery, retry, callbacks, inbox records, and the boundary between Communication and consuming modules such as Engagement, Order, Process, Profile/KYC, and Security."
        },
        {
          "kind": "paragraph",
          "text": "Communication owns how a message is prepared and delivered. The consuming domain owns why it was requested and what business state changes afterward. For example, Contact Submission owns an enquiry and may request an acknowledgement. Communication renders and sends that acknowledgement, but a provider failure never deletes or rolls back the enquiry."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Module structure",
          "anchor": "communicationOverview-1-module-structure"
        },
        {
          "kind": "table",
          "headers": [
            "Module",
            "Responsibility"
          ],
          "rows": [
            [
              "`commsSchema`",
              "Source declarations for templates, intents, delivery attempts, suppression, inbox, and verification evidence."
            ],
            [
              "`commsCore`",
              "Rendering, idempotency, policy, delivery orchestration, retry, fallback, and content-free events."
            ],
            [
              "`commsVerification`",
              "Expiring, hashed, attempt-limited communication challenges without owning identity."
            ],
            [
              "`localCommsProvider`",
              "Deterministic development delivery with no external network transmission."
            ],
            [
              "`commsApi`",
              "Secured customer inbox, operator recovery, and service-authenticated callback routes."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "End-to-end delivery journey",
          "anchor": "communicationOverview-2-end-to-end-delivery-journey"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Domain[\"Business module creates intent\"] --> Policy[\"Recipient, purpose, consent and suppression\"]\n  Policy -->|Suppressed| Evidence[\"Suppression evidence\"]\n  Policy -->|Allowed| Template[\"Validated template version\"]\n  Template --> Render[\"Typed rendering and frozen private intent\"]\n  Render --> Provider[\"Explicitly selected guarded provider\"]\n  Provider -->|Delivered| Outcome[\"Content-free delivery evidence\"]\n  Provider -->|Known retryable failure| Retry[\"Authorized bounded retry\"]\n  Provider -->|Ambiguous| Uncertain[\"Uncertain: reconcile before resend\"]\n  Retry --> Provider\n  Retry -->|Exhausted| Dead[\"Dead letter and reconciliation\"]\n  Outcome --> Domain"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Template and rendering journey",
          "anchor": "communicationOverview-3-template-and-rendering-journey"
        },
        {
          "kind": "paragraph",
          "text": "Domain modules supply neutral presentation under `src/templates/email/<name>` or `src/templates/sms/<name>`. An inert manifest declares code, owner, purpose, channel, source allowlist and typed parameters. Email has locale subject, HTML and plain-text files; SMS has a locale message.txt. Customer/runtime layers override individual files. Configuration and published adoption records select resources; new EMAIL/SMS presentation does not belong in configuration or database body blobs."
        },
        {
          "kind": "paragraph",
          "text": "The shared renderer accepts declared typed values, escapes HTML and enforces bounds. New intents privately store frozen rendered content and effective template identity for deterministic retry, as well as a variables hash/version. Public results, events and logs omit content. Providers consume frozen representations and do not load templates. Provider credentials never belong in presentation. The private message content needs storage access and retention controls."
        },
        {
          "kind": "paragraph",
          "text": "Developers add a template by declaring the smallest variable set, providing safe locale/channel versions, testing missing and unknown variables, validating output size and escaping, and supplying a migration path before retiring an active version."
        },
        {
          "kind": "paragraph",
          "text": "Use [Email and SMS Templates](/docs/framework/communication-email-sms-templates) for the complete inventory, selection precedence, customer/server overrides, localization and worked examples."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Consent, purpose, and suppression",
          "anchor": "communicationOverview-4-consent-purpose-and-suppression"
        },
        {
          "kind": "paragraph",
          "text": "Every intent states a purpose such as transactional, service, consent, verification, or marketing. Marketing consent must never be inferred from permission to send a transaction or security challenge. A suppression is recipient-, purpose-, and channel-scoped with reason, source, and validity period."
        },
        {
          "kind": "paragraph",
          "text": "Trusted-source and template policy run before new rendering; durable suppression and expiry checks prevent sending. A suppressed request produces evidence. It must not switch providers to evade customer preference. The diagram above summarizes policy responsibility rather than promising that every suppression read precedes rendering. Emergency exceptions require an explicit owner-defined policy."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Idempotency and delivery evidence",
          "anchor": "communicationOverview-5-idempotency-and-delivery-evidence"
        },
        {
          "kind": "paragraph",
          "text": "The consuming domain supplies an idempotency key and correlation ID. Repeating the same logical request returns the existing intent instead of sending a duplicate. Delivery attempts record provider, channel, attempt, bounded status, safe provider reference, response code, retry time, and timestamps. Events contain codes and statuses, not message bodies, addresses, or provider payloads."
        },
        {
          "kind": "paragraph",
          "text": "Retry uses exponential delay and a maximum attempt count. Ambiguous timeouts require provider reconciliation before replay. Fallback between providers or channels must be allowed by purpose, consent, residency, and customer preference; it is not an automatic escape hatch."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification journey",
          "anchor": "communicationOverview-6-verification-journey"
        },
        {
          "kind": "paragraph",
          "text": "Verification creates a random transient secret and stores only salted hash evidence plus a destination hash. The challenge has purpose, subject reference, channel, expiry, attempt limit, status, and correlation. Successful comparison marks it verified once. Expiry or lockout prevents further use."
        },
        {
          "kind": "paragraph",
          "text": "Communication proves possession of a channel; it does not decide that a user is authenticated, KYC-approved, authorized, or safe. Profile, KYC, Security, or the requesting domain consumes the verified outcome and applies its own current policy."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Axis and customer journey",
          "anchor": "communicationOverview-7-axis-and-customer-journey"
        },
        {
          "kind": "paragraph",
          "text": "Customers use the secured Communication inbox route to list only their own in-app messages. They can never select another recipient identifier in the URL or query. Axis operators inspect delivery evidence and retry only failed, retry-pending, or dead-letter attempts with explicit permission. Raw content and addresses stay masked."
        },
        {
          "kind": "paragraph",
          "text": "Provider callbacks use service authentication and bounded provider evidence. Production adapters additionally verify signature, timestamp/replay window, provider/account identity, and idempotency before reconciling an attempt. A callback does not trust domain identifiers supplied by an external payload."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Engagement integration",
          "anchor": "communicationOverview-8-engagement-integration"
        },
        {
          "kind": "paragraph",
          "text": "`engagementComms` is a later-loaded bridge. It maps CONTACT, FEEDBACK, REVIEW, and TESTIMONIAL scenarios to Communication templates, declared variables, purpose, recipient/address reference, and a stable idempotency key. The dependency is one-way: Communication never imports Engagement or changes its status."
        },
        {
          "kind": "paragraph",
          "text": "When Communication is unavailable, the bridge returns deferred evidence with `domainStateChanged: false`. Contact intake and other safe domain operations remain durable. A scheduled worker can retry or reconcile later."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Provider activation and operations",
          "anchor": "communicationOverview-9-provider-activation-and-operations"
        },
        {
          "kind": "paragraph",
          "text": "The local provider returns deterministic development evidence. SMTP supports a disabled-by-default guarded test mode with approved recipients and TLS. SMS is an injected sandbox adapter, not a supplied live carrier client. Neither is qualified for unrestricted production simply by configuring credentials. See [provider runbooks](/docs/framework/communication-provider-runbooks) for exact settings, outcome semantics and the remaining delivery/operational qualification gates."
        },
        {
          "kind": "paragraph",
          "text": "Operators monitor accepted/suppressed intent volume, render failures, provider latency/error, delivered rate, retry age, dead letters, callback rejection/replay, inbox expiry, verification success/lockout, and consent/suppression decisions. Logs use intent, attempt, template, and correlation codes without content."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "communicationOverview-10-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Putting domain presentation in generic configuration, or domain-owned provider retry.",
            "Letting Communication change order, case, identity, or security status.",
            "Storing rendered bodies or recipient addresses in events and logs.",
            "Treating transactional permission as marketing consent.",
            "Sending again after retry without checking the idempotency key or ambiguous provider outcome.",
            "Logging verification secrets, storing plaintext as authoritative challenge evidence, or allowing unlimited guesses. Private delivery content is a separate protected boundary.",
            "Enabling an external provider because local delivery passed.",
            "Trusting callback fields without service authentication, signature, replay, tenant, and provider-reference validation."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "communicationOverview-11-verification"
        },
        {
          "kind": "paragraph",
          "text": "Prove template version/checksum, declared-variable rendering, executable and unknown-variable rejection, output limits, purpose/channel denial, suppression, consent separation, idempotent replay, content-free events, local delivery, provider failure, exponential retry, dead letter, safe fallback, callback authentication and replay policy, tenant isolation, customer inbox ownership, challenge hashing/expiry/lockout/single use, one-way domain integration, and domain durability during outage. Run Communication package tests, generated schema contracts, Communication route/security contracts, Engagement bridge tests, documentation generation/validation, and the effective Engagement server build to confirm Communication loads first."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "communicationOverview-12-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Projects may add providers, templates, channel policies, callback adapters, verification purposes, and inbox views through Communication-owned extension points. The extension must preserve consent, suppression, content masking, idempotency, replay protection, tenant isolation, and the rule that Communication delivers messages but does not decide domain state."
        },
        {
          "kind": "paragraph",
          "text": "For example, replace only `<customer-module>/src/templates/email/employee-email-verification/en/subject.txt` to brand a subject while inheriting the owner's manifest and bodies. The module must be discovered in the effective sending hierarchy. Wrong source, incompatible manifest and invalid parameters reject; queued intents keep their old content. Verify the effective override and rejection/replay behavior using the [worked guide](/docs/framework/communication-email-sms-templates#customize-and-extend-safely)."
        }
      ],
      "searchText": "Communication, delivery, and verification Beginner-to-operator journey for templates, intent, consent, suppression, verification, provider delivery, callbacks, retry, inbox, recovery, and domain integration. # Communication, delivery, and verification\n\nNodics Communication turns a business-owned request to inform or verify someone into a governed message and delivery outcome. This beginner-friendly guide explains templates, recipients, consent and suppression, provider delivery, retry, callbacks, inbox records, and the boundary between Communication and consuming modules such as Engagement, Order, Process, Profile/KYC, and Security.\n\nCommunication owns how a message is prepared and delivered. The consuming domain owns why it was requested and what business state changes afterward. For example, Contact Submission owns an enquiry and may request an acknowledgement. Communication renders and sends that acknowledgement, but a provider failure never deletes or rolls back the enquiry.\n\n## Module structure\n\n| Module | Responsibility |\n| --- | --- |\n| `commsSchema` | Source declarations for templates, intents, delivery attempts, suppression, inbox, and verification evidence. |\n| `commsCore` | Rendering, idempotency, policy, delivery orchestration, retry, fallback, and content-free events. |\n| `commsVerification` | Expiring, hashed, attempt-limited communication challenges without owning identity. |\n| `localCommsProvider` | Deterministic development delivery with no external network transmission. |\n| `commsApi` | Secured customer inbox, operator recovery, and service-authenticated callback routes. |\n\n## End-to-end delivery journey\n\n```mermaid\nflowchart LR\n  Domain[\"Business module creates intent\"] --> Policy[\"Recipient, purpose, consent and suppression\"]\n  Policy -->|Suppressed| Evidence[\"Suppression evidence\"]\n  Policy -->|Allowed| Template[\"Validated template version\"]\n  Template --> Render[\"Typed rendering and frozen private intent\"]\n  Render --> Provider[\"Explicitly selected guarded provider\"]\n  Provider -->|Delivered| Outcome[\"Content-free delivery evidence\"]\n  Provider -->|Known retryable failure| Retry[\"Authorized bounded retry\"]\n  Provider -->|Ambiguous| Uncertain[\"Uncertain: reconcile before resend\"]\n  Retry --> Provider\n  Retry -->|Exhausted| Dead[\"Dead letter and reconciliation\"]\n  Outcome --> Domain\n```\n\n## Template and rendering journey\n\nDomain modules supply neutral presentation under `src/templates/email/<name>` or `src/templates/sms/<name>`. An inert manifest declares code, owner, purpose, channel, source allowlist and typed parameters. Email has locale subject, HTML and plain-text files; SMS has a locale message.txt. Customer/runtime layers override individual files. Configuration and published adoption records select resources; new EMAIL/SMS presentation does not belong in configuration or database body blobs.\n\nThe shared renderer accepts declared typed values, escapes HTML and enforces bounds. New intents privately store frozen rendered content and effective template identity for deterministic retry, as well as a variables hash/version. Public results, events and logs omit content. Providers consume frozen representations and do not load templates. Provider credentials never belong in presentation. The private message content needs storage access and retention controls.\n\nDevelopers add a template by declaring the smallest variable set, providing safe locale/channel versions, testing missing and unknown variables, validating output size and escaping, and supplying a migration path before retiring an active version.\n\nUse [Email and SMS Templates](/docs/framework/communication-email-sms-templates) for the complete inventory, selection precedence, customer/server overrides, localization and worked examples.\n\n## Consent, purpose, and suppression\n\nEvery intent states a purpose such as transactional, service, consent, verification, or marketing. Marketing consent must never be inferred from permission to send a transaction or security challenge. A suppression is recipient-, purpose-, and channel-scoped with reason, source, and validity period.\n\nTrusted-source and template policy run before new rendering; durable suppression and expiry checks prevent sending. A suppressed request produces evidence. It must not switch providers to evade customer preference. The diagram above summarizes policy responsibility rather than promising that every suppression read precedes rendering. Emergency exceptions require an explicit owner-defined policy.\n\n## Idempotency and delivery evidence\n\nThe consuming domain supplies an idempotency key and correlation ID. Repeating the same logical request returns the existing intent instead of sending a duplicate. Delivery attempts record provider, channel, attempt, bounded status, safe provider reference, response code, retry time, and timestamps. Events contain codes and statuses, not message bodies, addresses, or provider payloads.\n\nRetry uses exponential delay and a maximum attempt count. Ambiguous timeouts require provider reconciliation before replay. Fallback between providers or channels must be allowed by purpose, consent, residency, and customer preference; it is not an automatic escape hatch.\n\n## Verification journey\n\nVerification creates a random transient secret and stores only salted hash evidence plus a destination hash. The challenge has purpose, subject reference, channel, expiry, attempt limit, status, and correlation. Successful comparison marks it verified once. Expiry or lockout prevents further use.\n\nCommunication proves possession of a channel; it does not decide that a user is authenticated, KYC-approved, authorized, or safe. Profile, KYC, Security, or the requesting domain consumes the verified outcome and applies its own current policy.\n\n## Axis and customer journey\n\nCustomers use the secured Communication inbox route to list only their own in-app messages. They can never select another recipient identifier in the URL or query. Axis operators inspect delivery evidence and retry only failed, retry-pending, or dead-letter attempts with explicit permission. Raw content and addresses stay masked.\n\nProvider callbacks use service authentication and bounded provider evidence. Production adapters additionally verify signature, timestamp/replay window, provider/account identity, and idempotency before reconciling an attempt. A callback does not trust domain identifiers supplied by an external payload.\n\n## Engagement integration\n\n`engagementComms` is a later-loaded bridge. It maps CONTACT, FEEDBACK, REVIEW, and TESTIMONIAL scenarios to Communication templates, declared variables, purpose, recipient/address reference, and a stable idempotency key. The dependency is one-way: Communication never imports Engagement or changes its status.\n\nWhen Communication is unavailable, the bridge returns deferred evidence with `domainStateChanged: false`. Contact intake and other safe domain operations remain durable. A scheduled worker can retry or reconcile later.\n\n## Provider activation and operations\n\nThe local provider returns deterministic development evidence. SMTP supports a disabled-by-default guarded test mode with approved recipients and TLS. SMS is an injected sandbox adapter, not a supplied live carrier client. Neither is qualified for unrestricted production simply by configuring credentials. See [provider runbooks](/docs/framework/communication-provider-runbooks) for exact settings, outcome semantics and the remaining delivery/operational qualification gates.\n\nOperators monitor accepted/suppressed intent volume, render failures, provider latency/error, delivered rate, retry age, dead letters, callback rejection/replay, inbox expiry, verification success/lockout, and consent/suppression decisions. Logs use intent, attempt, template, and correlation codes without content.\n\n## Common mistakes\n\n- Putting domain presentation in generic configuration, or domain-owned provider retry.\n- Letting Communication change order, case, identity, or security status.\n- Storing rendered bodies or recipient addresses in events and logs.\n- Treating transactional permission as marketing consent.\n- Sending again after retry without checking the idempotency key or ambiguous provider outcome.\n- Logging verification secrets, storing plaintext as authoritative challenge evidence, or allowing unlimited guesses. Private delivery content is a separate protected boundary.\n- Enabling an external provider because local delivery passed.\n- Trusting callback fields without service authentication, signature, replay, tenant, and provider-reference validation.\n\n## Verification\n\nProve template version/checksum, declared-variable rendering, executable and unknown-variable rejection, output limits, purpose/channel denial, suppression, consent separation, idempotent replay, content-free events, local delivery, provider failure, exponential retry, dead letter, safe fallback, callback authentication and replay policy, tenant isolation, customer inbox ownership, challenge hashing/expiry/lockout/single use, one-way domain integration, and domain durability during outage. Run Communication package tests, generated schema contracts, Communication route/security contracts, Engagement bridge tests, documentation generation/validation, and the effective Engagement server build to confirm Communication loads first.\n\n## Customize and extend safely\n\nProjects may add providers, templates, channel policies, callback adapters, verification purposes, and inbox views through Communication-owned extension points. The extension must preserve consent, suppression, content masking, idempotency, replay protection, tenant isolation, and the rule that Communication delivers messages but does not decide domain state.\n\nFor example, replace only `<customer-module>/src/templates/email/employee-email-verification/en/subject.txt` to brand a subject while inheriting the owner's manifest and bodies. The module must be discovered in the effective sending hierarchy. Wrong source, incompatible manifest and invalid parameters reject; queued intents keep their old content. Verify the effective override and rejection/replay behavior using the [worked guide](/docs/framework/communication-email-sms-templates#customize-and-extend-safely).\n",
      "previous": {
        "title": "Enterprise scale, resilience, and ecosystem operations",
        "route": "/docs/framework/engagement-enterprise-operations"
      },
      "next": {
        "title": "Events, Messaging, and Cluster Coordination",
        "route": "/docs/framework/events-messaging-cluster-coordination"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.communication",
        "technicalModule": "commsCore",
        "owner": "commsCore",
        "sourcePath": "data/docs-v001/records/documentation/commsCoreDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/commsCoreDocumentationComponentData.js",
        "wordCount": 1246,
        "checksum": "8192f015a78ac6f1642645cb9ae407c1f68dd30f0144f89fffd4875850ef2abf"
      },
      "slug": "communication-overview",
      "locale": "en",
      "navigationGroup": "Communication Delivery and Verification",
      "navigationGroupCode": "communication-delivery-and-verification",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "engagement.customer-feedback",
          "owner": "customerFeedback"
        },
        {
          "documentId": "process.action-adapters",
          "owner": "workflow"
        },
        {
          "documentId": "communication.email-sms-templates",
          "owner": "commsCore"
        }
      ]
    },
    "active": true
  },
  "record2": {
    "code": "nodicsDocsComponentcommunicationEmailSmsTemplates",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "communication.email-sms-templates",
      "title": "Email and SMS Templates",
      "route": "/docs/framework/communication-email-sms-templates",
      "section": "communication-and-notifications",
      "sectionTitle": "Communication and Notifications",
      "group": "communication-and-notifications",
      "groupTitle": "Communication and Notifications",
      "parentId": "communication-and-notifications",
      "hierarchyPath": [
        "Communication and Notifications",
        "Email and SMS Templates"
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
      "summary": "Detailed notification flow, existing inventory, typed manifests, configuration and adoption, layered overrides, locale precedence, safe HTML, new email/SMS examples, frozen retries and troubleshooting.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.14",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "communication.overview",
        "communication.provider-runbooks"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "src/service/defaultCommunicationTemplateService.js",
        "src/service/defaultCommunicationRuntimeService.js",
        "config/properties.js",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "configuration-table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "email",
        "sms",
        "templates",
        "notifications",
        "customization",
        "locale",
        "parameters"
      ],
      "topicKeywords": [
        "Communication and Notifications",
        "Email and SMS Templates"
      ],
      "headings": [
        {
          "text": "Signed Integration Source Authority",
          "anchor": "communicationEmailSmsTemplates-1-signed-integration-source-authority",
          "level": 2
        },
        {
          "text": "Employee Lifecycle Intent Integration",
          "anchor": "communicationEmailSmsTemplates-2-employee-lifecycle-intent-integration",
          "level": 2
        },
        {
          "text": "Scope, audience and maturity",
          "anchor": "communicationEmailSmsTemplates-3-scope-audience-and-maturity",
          "level": 2
        },
        {
          "text": "Ownership and source map",
          "anchor": "communicationEmailSmsTemplates-4-ownership-and-source-map",
          "level": 2
        },
        {
          "text": "How a notification travels",
          "anchor": "communicationEmailSmsTemplates-5-how-a-notification-travels",
          "level": 2
        },
        {
          "text": "Standard folder layout",
          "anchor": "communicationEmailSmsTemplates-6-standard-folder-layout",
          "level": 2
        },
        {
          "text": "Existing template inventory",
          "anchor": "communicationEmailSmsTemplates-7-existing-template-inventory",
          "level": 2
        },
        {
          "text": "Manifest reference",
          "anchor": "communicationEmailSmsTemplates-8-manifest-reference",
          "level": 2
        },
        {
          "text": "Configuration and activation",
          "anchor": "communicationEmailSmsTemplates-9-configuration-and-activation",
          "level": 2
        },
        {
          "text": "Selection precedence and published references",
          "anchor": "communicationEmailSmsTemplates-10-selection-precedence-and-published-references",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "communicationEmailSmsTemplates-11-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Choose the smallest change",
          "anchor": "communicationEmailSmsTemplates-12-choose-the-smallest-change",
          "level": 3
        },
        {
          "text": "Override a subject without copying the framework",
          "anchor": "communicationEmailSmsTemplates-13-override-a-subject-without-copying-the-framework",
          "level": 3
        },
        {
          "text": "Override HTML and plain text together",
          "anchor": "communicationEmailSmsTemplates-14-override-html-and-plain-text-together",
          "level": 3
        },
        {
          "text": "Customize optional branding defaults",
          "anchor": "communicationEmailSmsTemplates-15-customize-optional-branding-defaults",
          "level": 3
        },
        {
          "text": "Layer precedence",
          "anchor": "communicationEmailSmsTemplates-16-layer-precedence",
          "level": 3
        },
        {
          "text": "Locale fallback",
          "anchor": "communicationEmailSmsTemplates-17-locale-fallback",
          "level": 3
        },
        {
          "text": "Build a new email notification",
          "anchor": "communicationEmailSmsTemplates-18-build-a-new-email-notification",
          "level": 2
        },
        {
          "text": "1. Define the business contract",
          "anchor": "communicationEmailSmsTemplates-19-1-define-the-business-contract",
          "level": 3
        },
        {
          "text": "2. Add the manifest",
          "anchor": "communicationEmailSmsTemplates-20-2-add-the-manifest",
          "level": 3
        },
        {
          "text": "3. Add all three representations",
          "anchor": "communicationEmailSmsTemplates-21-3-add-all-three-representations",
          "level": 3
        },
        {
          "text": "4. Select the notification",
          "anchor": "communicationEmailSmsTemplates-22-4-select-the-notification",
          "level": 3
        },
        {
          "text": "5. Request through the existing owner",
          "anchor": "communicationEmailSmsTemplates-23-5-request-through-the-existing-owner",
          "level": 3
        },
        {
          "text": "Build a new SMS notification",
          "anchor": "communicationEmailSmsTemplates-24-build-a-new-sms-notification",
          "level": 2
        },
        {
          "text": "Parameter safety and supported interaction",
          "anchor": "communicationEmailSmsTemplates-25-parameter-safety-and-supported-interaction",
          "level": 2
        },
        {
          "text": "Durability, privacy and upgrades",
          "anchor": "communicationEmailSmsTemplates-26-durability-privacy-and-upgrades",
          "level": 2
        },
        {
          "text": "Troubleshooting matrix",
          "anchor": "communicationEmailSmsTemplates-27-troubleshooting-matrix",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "communicationEmailSmsTemplates-28-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification workflow",
          "anchor": "communicationEmailSmsTemplates-29-verification-workflow",
          "level": 2
        },
        {
          "text": "Related topics",
          "anchor": "communicationEmailSmsTemplates-30-related-topics",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 2,
          "text": "Signed Integration Source Authority",
          "anchor": "communicationEmailSmsTemplates-1-signed-integration-source-authority"
        },
        {
          "kind": "paragraph",
          "text": "The internal intent request API requires a verified service principal, matching authenticated/request tenant, explicit communication.request permission and signed module scopes containing both commsApi and the selected trusted source module. The configured trusted-source list alone is not a grant. A runtime authorized for Profile cannot impersonate Order by changing sourceModule in a payload."
        },
        {
          "kind": "paragraph",
          "text": "Retry and uncertainty resolution authorize exactly one stored intent's source, not a source supplied by the caller. They validate the signed context before reading private intent evidence; unreadable, missing or ambiguous records refuse the action. No recipient, template variables or message body is disclosed. Deployments use existing nAuth/nRouter runtime grants. This source boundary remains subject to installed token/transport acceptance; no delivery is activated by it."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Employee Lifecycle Intent Integration",
          "anchor": "communicationEmailSmsTemplates-2-employee-lifecycle-intent-integration"
        },
        {
          "kind": "paragraph",
          "text": "Profile's exported `DefaultEnterpriseNotificationService` owns invitation and account-ready decisions. Framework defaults live in `enterpriseManagement.notifications`: enabled/qualified are false, with declarations for INVITATION and ACCOUNT_READY. This policy selects resources, not inline HTML. Existing framework resource bundles provide subject, HTML and plain text. Later module, custom-project and runtime layers override those resource paths using the existing loader. Keep declared parameter contracts compatible with frozen inputs."
        },
        {
          "kind": "paragraph",
          "text": "On an admitted event Profile first stores private assignment lifecycleNotifications: the recipient, templateCode/purpose/locale, bounded variables and stable idempotency key. It then delegates to Communication's trusted internal communications API. Communication owns rendered snapshots, queueing, delivery and provider retries; Profile does not create another queue or call SMTP directly. An uncertain request retains the same frozen inputs/key, so an explicit retry reconciles the same intent. Once intentCode is saved, Profile returns that evidence rather than re-enqueuing. Its saved status is intent-request progress, not refreshed mailbox delivery proof."
        },
        {
          "kind": "paragraph",
          "text": "Invitation creation requests INVITATION only for an active unused unexpired invitation. Completed registration or membership acceptance requests ACCOUNT_READY only after stored completion. Delivery failure never rolls back account readiness and receiving mail never grants access. Frozen recipient changes, withdrawals or incomplete readiness fail closed. Generic CRUD cannot manufacture this evidence."
        },
        {
          "kind": "paragraph",
          "text": "For customization, set approved connection/purpose/locale/nextStep in a later Profile property layer and override the matching template resources. nextStep is plain text, not HTML or a URL; action links need declared safe https-url parameters and an owner-approved destination. Never pass credentials, OTP proof, access tokens, role grants or caller-selected recipients. A new lifecycle kind requires a domain readiness contract and reviewed owner implementation, not an arbitrary template code accepted from HTTP. Reuse Communication for any new channel."
        },
        {
          "kind": "paragraph",
          "text": "POST `/enterprise-team/retry-notification` takes only assignmentCode, current revision and INVITATION/ACCOUNT_READY under fresh administrator authority. It does not replace recipients/content or resend a known intent. Qualify trusted Profile source admission, approved sender/recipients, deployed resource layering and delivery/provider recovery before enabling policy. No delivery acceptance or mail send has been performed for this source increment."
        },
        {
          "kind": "paragraph",
          "text": "For beginners, start with the example below, then read the inventory and the smallest-change customization table before attempting a new notification."
        },
        {
          "kind": "paragraph",
          "text": "An email or SMS notification is a business message delivered through Communication. Think of the template as stationery, the domain service as the person deciding what to say, and the provider as the delivery service. Changing the stationery must not change who is allowed to send, what a verification code proves, or whether an enterprise application has been approved."
        },
        {
          "kind": "paragraph",
          "text": "For example, Profile decides that an employee may receive an email-verification challenge. It supplies the code and expiry to Communication. Communication resolves the effective template, safely inserts those values, stores the private rendered message and invokes the selected email provider. A customer can replace the subject or HTML without copying Profile, the renderer or SMTP into the customer project."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Scope, audience and maturity",
          "anchor": "communicationEmailSmsTemplates-3-scope-audience-and-maturity"
        },
        {
          "kind": "paragraph",
          "text": "Functional owner: `nodics.communication`. Technical owner: `commsCore`. Business presentation also has a domain owner, such as Profile or customerFeedback. This guide addresses business evaluators, notification authors, administrators, partner developers, framework maintainers, operators, QA engineers and AI tools."
        },
        {
          "kind": "paragraph",
          "text": "Layered files, typed rendering, durable intents, source gating and provider adapters are implemented. SMTP supports guarded controlled-test delivery. SMS remains a disabled-by-default injected sandbox boundary, not a supplied production carrier integration. A template editor, arbitrary email scripting, automatic localization, SMS segmentation and automatic uncertain-send retry are not promised capabilities. Authored configuration examples are not authorization to enable or send messages."
        },
        {
          "kind": "paragraph",
          "text": "Business users review wording, destination journeys and approved notifications. Developers author deployed resources. Operators select qualified transports and inspect redacted evidence. This guide does not assert that Axis provides a visual editor for these resource files. See [provider operations](/docs/framework/communication-provider-runbooks) for sender credentials, transport policy and delivery-result interpretation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Ownership and source map",
          "anchor": "communicationEmailSmsTemplates-4-ownership-and-source-map"
        },
        {
          "kind": "table",
          "headers": [
            "Concern",
            "Canonical owner",
            "What must not move here"
          ],
          "rows": [
            [
              "Business eligibility, purpose, recipient and values",
              "Requesting domain service",
              "Provider credentials and retries"
            ],
            [
              "Default wording and HTML for a domain",
              "Domain module `src/templates`",
              "Project-specific branding in framework defaults"
            ],
            [
              "Generic runtime notice presentation",
              "commsCore `src/templates`",
              "Another domain's business copy"
            ],
            [
              "Discovery, manifests, parameters and rendering",
              "DefaultCommunicationTemplateService",
              "A project-specific loader or renderer"
            ],
            [
              "Intents, source policy, claims, suppression and recovery",
              "DefaultCommunicationRuntimeService",
              "Domain approval or identity transitions"
            ],
            [
              "Schema source",
              "commsSchema",
              "Another message ledger in a project"
            ],
            [
              "SMTP/MIME transport",
              "smtpCommsProvider",
              "Template lookup and business decisions"
            ],
            [
              "SMS sandbox transport boundary",
              "smsCommsProvider",
              "HTML rendering or assumed carrier qualification"
            ],
            [
              "Reusable verification challenge lifecycle",
              "commsVerification",
              "Email-file ownership of proof or identity"
            ],
            [
              "Customer branding/deployment selection",
              "Existing concrete customer and runtime layers",
              "Copied framework services"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The main sources, relative to the framework repository, are:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "`nodics.communication/modules/commsCore/src/service/defaultCommunicationTemplateService.js`",
            "`nodics.communication/modules/commsCore/src/service/defaultCommunicationRuntimeService.js`",
            "`nodics.communication/modules/commsCore/config/properties.js`",
            "`nodics.communication/modules/commsCore/llm/contracts/template-resources.md`",
            "`nodics.communication/modules/commsSchema/src/schemas/schemas.js`",
            "`nodics.communication/modules/smtpCommsProvider/config/properties.js`",
            "`nodics.communication/modules/smsCommsProvider/config/properties.js`"
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "How a notification travels",
          "anchor": "communicationEmailSmsTemplates-5-how-a-notification-travels"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Domain[\"Domain validates business event and recipient\"] --> Request[\"Trusted Communication request\"]\n  Request --> Replay{\"Existing idempotency identity?\"}\n  Replay -->|Same command| Existing[\"Return stored safe result without resending\"]\n  Replay -->|Changed command| Conflict[\"Reject conflict\"]\n  Replay -->|New| Select[\"Select configured reference, resource or published version\"]\n  Select --> Validate[\"Check source, purpose, channel and typed parameters\"]\n  Validate --> Render[\"Render text and optional HTML\"]\n  Render --> Persist[\"Persist frozen private content and bundle provenance\"]\n  Persist --> Policy[\"Check suppression and expiry\"]\n  Policy --> Claim[\"Acquire managed delivery claim\"]\n  Claim --> Provider[\"Provider receives frozen representations\"]\n  Provider --> Evidence[\"Store redacted outcome or uncertain state\"]"
        },
        {
          "kind": "paragraph",
          "text": "The diagram is a reading aid, not an independent workflow engine. In the actual request path, trusted-source policy is checked before replay lookup. The command identity includes domain/source, template, recipient, purpose, channel, locale and variables. The same key with changed command data rejects. New content is rendered before intent persistence; send-time suppression, expiry and claim checks still apply. Invalid rendering creates no new intent."
        },
        {
          "kind": "paragraph",
          "text": "Transport failure does not undo the business event. A failed notification must not repeat enterprise approval, password reset, registration or feedback creation. The domain should retain the Communication reference and expose truthful progress. The dispatcher owns attempts; providers neither re-render nor perform hidden retries."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Standard folder layout",
          "anchor": "communicationEmailSmsTemplates-6-standard-folder-layout"
        },
        {
          "kind": "code",
          "language": "text",
          "text": "<owning-module>/\n  src/\n    templates/\n      email/\n        employee-email-verification/\n          template.json\n          en/\n            subject.txt\n            email.html\n            email.txt\n      sms/\n        runtime-notice/\n          template.json\n          en/\n            message.txt"
        },
        {
          "kind": "paragraph",
          "text": "Directories are lowercase `email` and `sms`; manifest channel values are uppercase `EMAIL` and `SMS`. OTP is a purpose, not a channel folder. An OTP sent by email uses the email layout; an OTP sent by SMS uses the SMS layout. Adding an SMS file does not make a caller that requests EMAIL switch channels."
        },
        {
          "kind": "paragraph",
          "text": "Email requires all three locale representations. The subject is plain text and must not contain CR/LF/NUL after rendering; trailing file newlines are trimmed. `email.txt` is the plain-text alternative, not source generated by stripping HTML. `email.html` is trusted static markup with escaped parameter insertion. SMS uses only `message.txt`; a provider refuses HTML in an SMS envelope."
        },
        {
          "kind": "paragraph",
          "text": "Resources are deployed source artifacts. They are not arbitrary uploaded paths, template URLs or editable database body blobs. A project/application root is not a concrete template owner: use a customer module or a selected runtime module."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Existing template inventory",
          "anchor": "communicationEmailSmsTemplates-7-existing-template-inventory"
        },
        {
          "kind": "paragraph",
          "text": "All current bundles below use manifest version 2 and default locale `en`. The resource folder is distinct from the stable code supplied by the caller."
        },
        {
          "kind": "table",
          "headers": [
            "Owner",
            "Channel and folder",
            "Stable template code",
            "Purpose",
            "Required variables"
          ],
          "rows": [
            [
              "profile",
              "email/employee-email-verification",
              "profile.employee.emailVerification",
              "EMPLOYEE_EMAIL_VERIFICATION",
              "verificationCode, expiresAt"
            ],
            [
              "profile",
              "email/employee-otp-verification",
              "profileEmployeeRecoveryCode",
              "EMPLOYEE_PASSWORD_RECOVERY",
              "verificationCode, expiresAt"
            ],
            [
              "profile",
              "email/employee-application-outcome",
              "profile.employee.applicationOutcome",
              "EMPLOYEE_APPLICATION_OUTCOME",
              "enterpriseName, decision, decidedAt, nextStep"
            ],
            [
              "profile",
              "email/employee-invitation",
              "profile.employee.invitation",
              "EMPLOYEE_INVITATION",
              "enterpriseName, responsibility, nextStep"
            ],
            [
              "profile",
              "email/employee-account-ready",
              "profile.employee.accountReady",
              "EMPLOYEE_ACCOUNT_READY",
              "enterpriseName, nextStep"
            ],
            [
              "profile",
              "email/employee-password-reset",
              "profileEmployeePasswordReset",
              "EMPLOYEE_PASSWORD_RESET_CONFIRMATION",
              "completedAt"
            ],
            [
              "commsCore",
              "email/runtime-notice",
              "COMMUNICATION_RUNTIME_NOTICE",
              "TRANSACTIONAL",
              "reference, message"
            ],
            [
              "commsCore",
              "sms/runtime-notice",
              "COMMUNICATION_RUNTIME_NOTICE",
              "TRANSACTIONAL",
              "reference, message"
            ],
            [
              "contactSubmission",
              "email/contact-acknowledgement",
              "CONTACT_ACKNOWLEDGEMENT",
              "TRANSACTIONAL",
              "reference"
            ],
            [
              "customerFeedback",
              "email/feedback-acknowledgement",
              "FEEDBACK_ACKNOWLEDGEMENT",
              "TRANSACTIONAL",
              "reference"
            ],
            [
              "customerReview",
              "email/review-acknowledgement",
              "REVIEW_ACKNOWLEDGEMENT",
              "TRANSACTIONAL",
              "reference"
            ],
            [
              "testimonial",
              "email/testimonial-consent-request",
              "TESTIMONIAL_CONSENT_REQUEST",
              "CONSENT",
              "reference"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Profile resources are under `nodics.platform/modules/profile`; Engagement resources are under `nodics.engagement/modules/<owner>`; commsCore is under `nodics.communication/modules/commsCore`. Source allowlists name those technical owners, not the functional group or customer brand."
        },
        {
          "kind": "paragraph",
          "text": "Profile bundles additionally accept optional `brandName`, maximum length 120, defaulting to `Account services`. Verification code/expiry, decision, timestamps and completion timestamp are bounded at 128 characters; enterpriseName at 256 and nextStep at 2000. Runtime notice reference is bounded at 256 and message at 10000; each Engagement reference at 256. These are parameter bounds, not provider delivery limits. In particular SMS still enforces its smaller final byte limit."
        },
        {
          "kind": "paragraph",
          "text": "The notice and four Engagement resources require explicit selection. Profile resources do not use that optional-resource selection gate, but Profile's business feature policy, trusted sources, recipient checks and provider gates still apply. Invitation/account-ready resources are presentation defaults only. Their durable lifecycle triggers are not wired or enabled by adding files; sender, recipients and delivery/recovery acceptance remain gated. Do not send readiness mail from application approval or treat an invitation message as an access grant. Customize these files through the same project/runtime overrides without copying services. Dynamic nextStep is plain text; introduce action links only through declared `https-url` parameters and an owner-approved destination, never bearer secrets."
        },
        {
          "kind": "paragraph",
          "text": "The application-outcome template does not itself make an approved applicant ready to sign in. The recovery OTP folder is not the registration verification template. New business scenarios may require additional resources and caller integration."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Manifest reference",
          "anchor": "communicationEmailSmsTemplates-8-manifest-reference"
        },
        {
          "kind": "paragraph",
          "text": "This is the implemented Profile email-verification declaration:"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"formatVersion\": 1,\n  \"code\": \"profile.employee.emailVerification\",\n  \"ownerModule\": \"profile\",\n  \"version\": 2,\n  \"status\": \"ACTIVE\",\n  \"purpose\": \"EMPLOYEE_EMAIL_VERIFICATION\",\n  \"sourceModules\": [\"profile\"],\n  \"channel\": \"EMAIL\",\n  \"defaultLocale\": \"en\",\n  \"parameters\": {\n    \"verificationCode\": {\n      \"type\": \"string\", \"required\": true, \"maximumLength\": 128\n    },\n    \"expiresAt\": {\n      \"type\": \"string\", \"required\": true, \"maximumLength\": 128\n    },\n    \"brandName\": {\n      \"type\": \"string\", \"required\": false, \"maximumLength\": 120,\n      \"default\": \"Account services\"\n    }\n  }\n}"
        },
        {
          "kind": "table",
          "headers": [
            "Field",
            "Meaning and constraint"
          ],
          "rows": [
            [
              "formatVersion",
              "Supported resource format is 1"
            ],
            [
              "code",
              "Stable identity, not a filename; simple bounded identifier"
            ],
            [
              "ownerModule",
              "First manifest must come from this discovered module"
            ],
            [
              "version",
              "Positive integer, distinct from a data-release semantic version"
            ],
            [
              "status",
              "ACTIVE is required for resolution"
            ],
            [
              "purpose",
              "Exact business purpose matched against the request"
            ],
            [
              "sourceModules",
              "Explicit non-empty source-module allowlist"
            ],
            [
              "channel",
              "EMAIL or SMS, matching the requested channel"
            ],
            [
              "defaultLocale",
              "Locale folder used when a requested-locale file is absent"
            ],
            [
              "requiresSelection",
              "Optional boolean; true requires explicit resource selection/adoption"
            ],
            [
              "parameters",
              "Declared simple parameter names and string contracts"
            ],
            [
              "type",
              "Resource parameters support string, not arbitrary objects or numbers"
            ],
            [
              "required",
              "Required strings must be supplied and nonblank; cannot have defaults"
            ],
            [
              "maximumLength",
              "Positive string-length limit; not a UTF-8 byte or SMS segment count"
            ],
            [
              "default",
              "Optional presentation default, never a secret or a required proof value"
            ],
            [
              "format",
              "Optional https-url for safe dynamic href/src insertion"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "A later complete manifest may change version, default locale and optional presentation defaults. It cannot change owner, code, purpose, channel, source allowlist, requiresSelection behavior or parameter names/types/requiredness/limits/ format. Use a new owner-defined identity for an incompatible contract, not a branding override. Duplicate identities under different resource folder names reject."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Configuration and activation",
          "anchor": "communicationEmailSmsTemplates-9-configuration-and-activation"
        },
        {
          "kind": "paragraph",
          "text": "Four separate decisions are involved:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "The sending runtime discovers the files' owner module.",
            "The relevant template is selected and valid.",
            "The requesting business operation and trusted source are allowed.",
            "A selected, enabled and qualified provider can deliver to the recipient."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Neither installing a package nor adding a template passes the other gates. Configuration must be effective in the sending runtime, not only in a web or Profile runtime that makes the original request."
        },
        {
          "kind": "table",
          "headers": [
            "Configuration",
            "Default",
            "Purpose"
          ],
          "rows": [
            [
              "communication.templateResources.enabled",
              "true",
              "Enable file-resource resolution"
            ],
            [
              "communication.templateResources.modules",
              "empty object",
              "Explicit discovered inactive owners whose files may be used"
            ],
            [
              "communication.templateResources.selections",
              "empty object",
              "Optional resource codes explicitly selected with true"
            ],
            [
              "communication.templateResources.maximumFileBytes",
              "65536",
              "Bound each source file"
            ],
            [
              "communication.templateResources.maximumTemplatesPerModule",
              "100",
              "Bound resource catalogue scanning"
            ],
            [
              "communication.templateResources.maximumLayers",
              "512",
              "Bound effective resource layers"
            ],
            [
              "communication.rendering.maximumVariables",
              "50",
              "Bound declared/accepted render data"
            ],
            [
              "communication.rendering.maximumRenderedBytes",
              "65536",
              "Bound serialized rendered output, including private identity"
            ],
            [
              "communication.trustedSourceModules",
              "empty array",
              "Permit requesting technical module names"
            ],
            [
              "communication.templates",
              "empty object",
              "Existing explicit configured selection/compatibility map"
            ],
            [
              "communication.providers.EMAIL",
              "absent",
              "Select email provider type and deployment differences"
            ],
            [
              "communication.providers.SMS",
              "absent",
              "Select SMS provider type and deployment differences"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Resource rendering rejects unknown variables regardless of a legacy permissive policy expectation. Defaults are inherited; customer properties should contain only the intended differences, not a copy of this table."
        },
        {
          "kind": "paragraph",
          "text": "For example, an existing customer module may select a framework acknowledgement:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  communication: {\n    trustedSourceModules: [\"contactSubmission\"],\n    templateResources: {\n      selections: { CONTACT_ACKNOWLEDGEMENT: true }\n    }\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "This is a fragment for a runtime whose intended trusted-source set includes that module. Preserve other required sources according to the existing configuration merge contract; do not blindly replace a live allowlist. It does not select a provider, enable contact intake or create a notification request."
        },
        {
          "kind": "paragraph",
          "text": "For a split sending runtime that discovers but does not activate Profile:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  communication: {\n    templateResources: { modules: { profile: true } }\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "This only makes Profile's deployed files eligible. The existing runtime discovery roots must already include the owner package. Unknown selected owners fail closed. Do not activate all Profile services just to obtain email files."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Selection precedence and published references",
          "anchor": "communicationEmailSmsTemplates-10-selection-precedence-and-published-references"
        },
        {
          "kind": "paragraph",
          "text": "For a new intent, selection is:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Explicit `communication.templates[templateCode]`.",
            "A matching available/selected module resource.",
            "An active parent and active locale/channel version in the existing published store."
          ]
        },
        {
          "kind": "paragraph",
          "text": "A configured inline legacy entry therefore shadows a same-code resource. Remove that old selection through a reviewed migration when adopting files. Do not diagnose its unchanged wording as a file-override failure."
        },
        {
          "kind": "paragraph",
          "text": "An explicit configured resource reference can pin version selection without bodies:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  communication: {\n    templates: {\n      CONTACT_ACKNOWLEDGEMENT: {\n        code: \"CONTACT_ACKNOWLEDGEMENT\",\n        resourceCode: \"CONTACT_ACKNOWLEDGEMENT\",\n        version: 2,\n        status: \"ACTIVE\",\n        purpose: \"TRANSACTIONAL\",\n        channels: [\"EMAIL\"],\n        sourceModules: [\"contactSubmission\"]\n      }\n    }\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Use one deliberate selection approach, not every example simultaneously. A reference's resourceCode must equal the requested code. The effective resource version, purpose and source must match. A reference cannot also have subjectTemplate or bodyTemplate. Resource availability still follows existing discovery."
        },
        {
          "kind": "paragraph",
          "text": "Published parents store explicit sourceModules, declared variables, channels, purpose and currentVersion. Active version rows select resourceCode, version, channel and locale; they do not own HTML/text presentation. Missing source ownership is not a wildcard. The published lookup requires its requested locale/version row; resource-file locale fallback does not invent a missing published selection row."
        },
        {
          "kind": "paragraph",
          "text": "Current commsCore releases use core-v001 and optional sample-v001 source roots at release version 0.0.1, with message resource version 2. The pre-production records are consolidated into the active v001 manifest inputs; future production changes must use forward immutable releases. The IN_APP notice remains legacy text because this migration concerns EMAIL/SMS. Import schema changes and adoption records only through the governed owner path in an authorized runtime. Do not edit old releases or bulk-rewrite queued messages."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "communicationEmailSmsTemplates-11-customize-and-extend-safely"
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Choose the smallest change",
          "anchor": "communicationEmailSmsTemplates-12-choose-the-smallest-change"
        },
        {
          "kind": "table",
          "headers": [
            "Desired change",
            "Correct extension"
          ],
          "rows": [
            [
              "Change one email subject",
              "Override only locale subject.txt"
            ],
            [
              "Change HTML branding/layout",
              "Override email.html; review email.txt for equivalent information"
            ],
            [
              "Change wording for SMS",
              "Override message.txt"
            ],
            [
              "Change a declared optional brand default",
              "Supply a complete compatible template.json"
            ],
            [
              "Add a language",
              "Add corresponding locale files, select that request locale"
            ],
            [
              "Different server-specific wording",
              "Same resource path under the selected server/node module"
            ],
            [
              "New purpose or parameter contract",
              "New domain-owned code and manifest"
            ],
            [
              "Different provider",
              "Existing provider selection/extension, not template changes"
            ],
            [
              "Different business trigger or recipient rule",
              "Owning domain extension, not presentation or transport"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Override a subject without copying the framework",
          "anchor": "communicationEmailSmsTemplates-13-override-a-subject-without-copying-the-framework"
        },
        {
          "kind": "paragraph",
          "text": "In an already discovered and active concrete customer module:"
        },
        {
          "kind": "code",
          "language": "text",
          "text": "<customer-module>/src/templates/email/employee-email-verification/en/subject.txt"
        },
        {
          "kind": "code",
          "language": "text",
          "text": "Your Example Company verification code"
        },
        {
          "kind": "paragraph",
          "text": "That is the entire presentation override. The framework manifest, HTML and plain text remain inherited. The folder name must remain employee-email-verification, even though the caller uses profile.employee.emailVerification. Do not add a template registration service or duplicate renderer."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Override HTML and plain text together",
          "anchor": "communicationEmailSmsTemplates-14-override-html-and-plain-text-together"
        },
        {
          "kind": "paragraph",
          "text": "Create the same two locale files in the customer module:"
        },
        {
          "kind": "code",
          "language": "html",
          "text": "<!doctype html>\n<html lang=\"en\">\n  <body style=\"margin:0;padding:24px;font-family:Arial,sans-serif;color:#202724;\">\n    <h1 style=\"font-size:24px;\">Verify your Example Company email</h1>\n    <p>Your verification code is <strong>{{verificationCode}}</strong>.</p>\n    <p>It expires at {{expiresAt}}.</p>\n    <p>If you did not request this code, ignore this message.</p>\n  </body>\n</html>"
        },
        {
          "kind": "code",
          "language": "text",
          "text": "Verify your Example Company email.\nYour verification code is {{verificationCode}}.\nIt expires at {{expiresAt}}.\nIf you did not request this code, ignore this message."
        },
        {
          "kind": "paragraph",
          "text": "Use email-compatible static markup and inline CSS. Preserve essential information in the text version. Static images, when used, need trusted HTTPS URLs and useful alt text; remote image loading depends on the recipient client. The renderer does not fetch assets. Never place secrets in asset URLs."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Customize optional branding defaults",
          "anchor": "communicationEmailSmsTemplates-15-customize-optional-branding-defaults"
        },
        {
          "kind": "paragraph",
          "text": "Copy the complete owner manifest into the matching customer resource folder, preserve its identity and parameter contract, and change only the optional brandName default. There is no partial JSON merge for manifests. A file containing only parameters.brandName.default is invalid. Caller-supplied brandName takes precedence over that default."
        },
        {
          "kind": "paragraph",
          "text": "Existing resources without a brandName parameter cannot acquire one through a branding override. Use static wording in the HTML or introduce an owner-reviewed new template identity when a new dynamic parameter is genuinely required."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Layer precedence",
          "anchor": "communicationEmailSmsTemplates-16-layer-precedence"
        },
        {
          "kind": "paragraph",
          "text": "Resource resolution follows the existing module graph, low to high:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Explicitly selected discovered inactive owners, before indexed active modules.",
            "Indexed active concrete modules in their existing order.",
            "Selected environment, server-root, server and node modules, deduplicated in that order."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Runtime scopes are evaluated last even if normal module indexes differ. Project/ application roots are excluded. A customer package merely installed on disk is not automatically an active overriding layer. Inspect the sending runtime's indexed/raw module metadata rather than guessing precedence from directory names."
        },
        {
          "kind": "paragraph",
          "text": "To make an environment override, put the same relative resource path under that selected environment module, for example:"
        },
        {
          "kind": "code",
          "language": "text",
          "text": "<environment-module>/src/templates/email/employee-email-verification/en/subject.txt\n<server-module>/src/templates/email/employee-email-verification/en/email.html\n<node-module>/src/templates/sms/runtime-notice/en/message.txt"
        },
        {
          "kind": "paragraph",
          "text": "These are placeholders for existing discovered module roots, not new loader directories. The highest eligible existing file wins. Missing files inherit; an existing invalid, oversized or unreadable file rejects instead of silently falling back. No automatic tenant-name directory lookup exists. Tenant-specific branding requires an explicitly governed existing deployment/customization route; do not infer a new per-tenant filesystem loader."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Locale fallback",
          "anchor": "communicationEmailSmsTemplates-17-locale-fallback"
        },
        {
          "kind": "paragraph",
          "text": "Add translated files under a locale such as fr. For each required file, requested locale is preferred across all layers; only then does defaultLocale fallback apply. A framework fr file therefore beats a customer en file for a fr request."
        },
        {
          "kind": "table",
          "headers": [
            "Available files for a fr request",
            "Effective file"
          ],
          "rows": [
            [
              "Owner en, customer en, no fr anywhere",
              "Highest eligible en file"
            ],
            [
              "Owner fr, customer en",
              "Owner fr"
            ],
            [
              "Owner fr, customer fr",
              "Customer fr"
            ],
            [
              "Customer fr subject only",
              "Customer fr subject; other files fall back independently"
            ],
            [
              "No requested/default file for a required representation",
              "Reject incomplete bundle"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Partial translations can produce mixed-language representations. Supply the full locale bundle when consistency is required. The renderer does not translate dates, choose a customer's language or format numbers. The trusted caller supplies localized strings and the desired locale."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Build a new email notification",
          "anchor": "communicationEmailSmsTemplates-18-build-a-new-email-notification"
        },
        {
          "kind": "paragraph",
          "text": "This worked example is an illustrative customer-domain notification, not a newly shipped framework capability. Assume an existing discovered module acmeOrders owns the approved order-ready event. Do not create a module solely to hold framework mechanics or change a framework module from a partner project."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "1. Define the business contract",
          "anchor": "communicationEmailSmsTemplates-19-1-define-the-business-contract"
        },
        {
          "kind": "paragraph",
          "text": "The domain has already determined that the order is ready and selected the eligible recipient from authoritative data. It supplies only orderNumber and a safe HTTPS orderUrl. Purpose is TRANSACTIONAL. The message neither marks an order ready nor grants access to the order. Use a stable event identity and authorize the linked page independently."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "2. Add the manifest",
          "anchor": "communicationEmailSmsTemplates-20-2-add-the-manifest"
        },
        {
          "kind": "paragraph",
          "text": "`<acmeOrders-module>/src/templates/email/order-ready/template.json`:"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"formatVersion\": 1,\n  \"code\": \"acme.orderReady\",\n  \"ownerModule\": \"acmeOrders\",\n  \"version\": 1,\n  \"status\": \"ACTIVE\",\n  \"purpose\": \"TRANSACTIONAL\",\n  \"sourceModules\": [\"acmeOrders\"],\n  \"channel\": \"EMAIL\",\n  \"defaultLocale\": \"en\",\n  \"requiresSelection\": true,\n  \"parameters\": {\n    \"orderNumber\": {\n      \"type\": \"string\", \"required\": true, \"maximumLength\": 64\n    },\n    \"orderUrl\": {\n      \"type\": \"string\", \"required\": true, \"maximumLength\": 512,\n      \"format\": \"https-url\"\n    }\n  }\n}"
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "3. Add all three representations",
          "anchor": "communicationEmailSmsTemplates-21-3-add-all-three-representations"
        },
        {
          "kind": "paragraph",
          "text": "`en/subject.txt`:"
        },
        {
          "kind": "code",
          "language": "text",
          "text": "Order {{orderNumber}} is ready"
        },
        {
          "kind": "paragraph",
          "text": "`en/email.txt`:"
        },
        {
          "kind": "code",
          "language": "text",
          "text": "Your order {{orderNumber}} is ready.\nView the order: {{orderUrl}}"
        },
        {
          "kind": "paragraph",
          "text": "`en/email.html`:"
        },
        {
          "kind": "code",
          "language": "html",
          "text": "<!doctype html>\n<html lang=\"en\">\n  <body style=\"margin:0;padding:24px;font-family:Arial,sans-serif;color:#202724;\">\n    <h1 style=\"font-size:24px;\">Order ready</h1>\n    <p>Your order <strong>{{orderNumber}}</strong> is ready.</p>\n    <p><a href=\"{{orderUrl}}\">View your order</a></p>\n  </body>\n</html>"
        },
        {
          "kind": "paragraph",
          "text": "The full href is one quoted https-url parameter. Do not construct it with `href=\"https://example.test/{{orderNumber}}\"`: mixed dynamic attributes are not supported. Construct and validate the complete URL in the domain service. HTTPS validation alone does not authorize an arbitrary destination; apply the domain's approved host/path policy before passing it."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "4. Select the notification",
          "anchor": "communicationEmailSmsTemplates-22-4-select-the-notification"
        },
        {
          "kind": "paragraph",
          "text": "Add only the necessary differences in the existing customer configuration:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  communication: {\n    trustedSourceModules: [\"acmeOrders\"],\n    templateResources: { selections: { \"acme.orderReady\": true } }\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Compose the customer owner and Communication into the appropriate runtime or use the existing secured Communication service route for a split topology. Do not assume a service global from another process exists locally. Provider selection is separate; see the runbook. New resources do not require a new schema, router or data-release pack when direct configured selection meets the requirement."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "5. Request through the existing owner",
          "anchor": "communicationEmailSmsTemplates-23-5-request-through-the-existing-owner"
        },
        {
          "kind": "paragraph",
          "text": "Within an authorized server-side domain service, the in-process call shape is:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "return SERVICE.DefaultCommunicationRuntimeService.request(request, {\n  sourceModule: \"acmeOrders\",\n  sourceType: \"ORDER\",\n  sourceCode: order.code,\n  templateCode: \"acme.orderReady\",\n  purpose: \"TRANSACTIONAL\",\n  channel: \"EMAIL\",\n  locale: \"en\",\n  recipientId: recipient.code,\n  recipientAddressReference: recipient.approvedEmail,\n  variables: {\n    orderNumber: order.number,\n    orderUrl: approvedOrderUrl\n  },\n  idempotencyKey: notificationEventKey,\n  correlationId: request.correlationId\n});"
        },
        {
          "kind": "paragraph",
          "text": "The shown identifiers represent values already validated by the domain, not browser body fields. The request must carry trusted tenant/authentication context. The service route additionally requires its existing service permission. Keep real recipient addresses and values out of logs. For SMTP, the recipient reference is a validated single mailbox; another provider may resolve a reference differently."
        },
        {
          "kind": "paragraph",
          "text": "notificationEventKey must be deterministic for that domain event, channel and recipient. Replaying the same event reuses it; changing variables under it conflicts. Do not append a timestamp on every retry. A later distinct authorized event gets a distinct key. Supply expiresAt when business delivery validity is bounded. For OTP, align delivery validity with the existing verification authority."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Build a new SMS notification",
          "anchor": "communicationEmailSmsTemplates-24-build-a-new-sms-notification"
        },
        {
          "kind": "paragraph",
          "text": "Use the same domain event and renderer, with a separate channel resource:"
        },
        {
          "kind": "code",
          "language": "text",
          "text": "<acmeOrders-module>/src/templates/sms/order-ready/template.json\n<acmeOrders-module>/src/templates/sms/order-ready/en/message.txt"
        },
        {
          "kind": "paragraph",
          "text": "Use the complete email manifest above with channel changed to SMS; retain the same code, owner, purpose and parameter declarations for this illustrative dual-channel message. The channel separates resource lookup. The message file is:"
        },
        {
          "kind": "code",
          "language": "text",
          "text": "Order {{orderNumber}} is ready. View: {{orderUrl}}"
        },
        {
          "kind": "paragraph",
          "text": "Request channel SMS, supply the recipient reference understood by the selected SMS transport, and use a distinct channel-specific event key. An email idempotency key cannot be reused with a changed channel. The existing optional selection is code-scoped: selecting acme.orderReady makes either matching channel resource eligible; it does not authorize both channels for every domain event."
        },
        {
          "kind": "paragraph",
          "text": "SMS is text, not a miniature HTML email. No subject or email.html is required. The sandbox provider enforces a default maximum of 1600 UTF-8 bytes. Multi-byte characters consume more bytes; this bound is not a promise of a particular number of GSM/UCS-2 segments or a carrier price. Segmentation, opt-out handling, recipient resolution and real carrier delivery need an explicitly qualified transport. Do not invent an SMS OTP proof store or a live carrier adapter in a template file."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Parameter safety and supported interaction",
          "anchor": "communicationEmailSmsTemplates-25-parameter-safety-and-supported-interaction"
        },
        {
          "kind": "paragraph",
          "text": "Only simple `{{name}}` expressions are supported. HTML output escapes dynamic values; text output preserves literal characters. Required values must be nonblank strings. Unknown values reject, optional absent values become blank unless a default exists, and object/array/number values are not resource parameters."
        },
        {
          "kind": "paragraph",
          "text": "Rejected syntax includes raw triple braces, helpers, blocks, loops, partials, dynamic lookup and prototype/property traversal. Reserved helper/prototype names are invalid declarations. Compose alternative messages in the domain by selecting the correct template or supplying an already-approved string, not by executing business logic inside HTML."
        },
        {
          "kind": "paragraph",
          "text": "HTML parsing rejects script/style blocks, embedded documents, forms, event handlers, unsafe URLs and active CSS. Use static inline styling. Dynamic attributes are only quoted href/src whose entire value is a declared https-url parameter. This is trusted deployment-resource validation, not a general public HTML sanitizer."
        },
        {
          "kind": "paragraph",
          "text": "Supported interaction means safe links to authorized application journeys. JavaScript, form submission, embedded payment actions and executable email widgets are not supported. Never make the presence of a link or a rendered decision string the authority for a privileged action."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Durability, privacy and upgrades",
          "anchor": "communicationEmailSmsTemplates-26-durability-privacy-and-upgrades"
        },
        {
          "kind": "paragraph",
          "text": "Each new intent records templateVersion and private renderedContent, including text, optional HTML and templateIdentity. That identity contains a checksum, owner and per-file module/locale/resource provenance, not absolute filesystem paths or variable values. The checksum covers the effective manifest and files, so branding changes are distinguishable even if a compatible version is retained."
        },
        {
          "kind": "paragraph",
          "text": "Provider payloads contain only required representations; private provenance stays local. Public results, events and logs remain content-free. The private intent can contain sensitive message content, including an OTP; it needs existing storage access and retention controls. Do not incorrectly claim that only a hash is stored. Proof hashing in commsVerification is a separate security contract."
        },
        {
          "kind": "paragraph",
          "text": "Existing intents are not re-rendered after a template change. Identical replay returns stored evidence even if the files have been removed; retry uses frozen content. New requests use the then-effective resources. An operator must not resend to apply a new brand layout or change an idempotency key to evade uncertainty."
        },
        {
          "kind": "paragraph",
          "text": "Published release checksums identify framework bundles; the actual customized bundle hash is pinned in a new intent. A reference-pinned version must continue to match its selected resource. Plan manifest version/adoption changes together. Legacy persisted/configured text stays on the shared restricted compatibility renderer and cannot silently become HTML."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Troubleshooting matrix",
          "anchor": "communicationEmailSmsTemplates-27-troubleshooting-matrix"
        },
        {
          "kind": "table",
          "headers": [
            "Symptom",
            "Likely cause",
            "Safe next action"
          ],
          "rows": [
            [
              "Communication source is not configured",
              "Source missing from sending runtime policy",
              "Review effective trustedSourceModules, not browser fields"
            ],
            [
              "Resource owner is unavailable",
              "Owner not discovered or wrong selected name",
              "Inspect raw metadata and existing discovery roots"
            ],
            [
              "Template unavailable for source",
              "Purpose/channel/source mismatch or optional unselected resource",
              "Compare manifest, caller and selection/adoption"
            ],
            [
              "Resource reference unavailable",
              "Pinned version does not match effective resource",
              "Coordinate version and governed adoption"
            ],
            [
              "Old wording after file override",
              "Configured legacy entry shadows files, or wrong runtime/locale",
              "Inspect selection precedence and provenance"
            ],
            [
              "Incomplete bundle",
              "Required file missing in requested and default locales",
              "Supply/inherit all required representations"
            ],
            [
              "Parameter missing or invalid",
              "Wrong type, blank required value, too long or unsafe URL",
              "Fix trusted caller data; never weaken security for bad input"
            ],
            [
              "Unknown variable",
              "Caller supplied undeclared input",
              "Minimize data or create an owner-reviewed new contract"
            ],
            [
              "Manifest override rejected",
              "Changed source/purpose/parameter contract or partial manifest",
              "Keep compatible full manifest or create a new identity"
            ],
            [
              "Rendered content too large",
              "Output plus identity exceeds configured byte bound",
              "Reduce copy/markup and check all representation sizes"
            ],
            [
              "SMS rejected despite valid rendering",
              "Final text exceeds provider bytes or contains HTML",
              "Shorten SMS and retain provider safety bounds"
            ],
            [
              "UNCONFIGURED",
              "Provider disabled, missing references/ports or invalid auth",
              "Follow provider runbook; do not change template copy"
            ],
            [
              "UNCERTAIN",
              "Transport may have accepted before reply was lost",
              "Reconcile exact managed revision; no blind retry"
            ],
            [
              "New layout absent on retry",
              "Intent correctly retained frozen content",
              "Use a genuinely new authorized event to observe new files"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Errors must remain content-free. Investigate with template/intent/correlation codes and protected metadata; do not paste production bodies, addresses, credentials or verification values into support records."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "communicationEmailSmsTemplates-28-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Copying the renderer into a customer project instead of overriding files.",
            "Using a resource folder name as the request code or confusing OTP with a channel.",
            "Treating optional selection as permission to send or as production qualification.",
            "Adding undeclared parameters through a partial manifest or using raw HTML values.",
            "Expecting a customer default-locale file to replace an existing exact-locale file.",
            "Retrying with a new idempotency key because the first send outcome is uncertain.",
            "Claiming that private intents contain no message content."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification workflow",
          "anchor": "communicationEmailSmsTemplates-29-verification-workflow"
        },
        {
          "kind": "paragraph",
          "text": "For joint testing, prepare a fake-value preview before enabling any transport:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Resolve each default and each intended customer/environment/server/node override.",
            "Check subject, HTML, text and SMS independently; include long strings and small screens.",
            "Exercise requested-locale precedence and incomplete/malformed resource rejection.",
            "Reject unknown/missing/oversized values, raw markup, helper syntax and unsafe URLs.",
            "Confirm optional resources stay unavailable until explicitly selected/adopted.",
            "Confirm wrong source, purpose, channel and published version reject before persistence.",
            "Prove replay and retry retain content, and changed data under the same key conflicts.",
            "Check disabled providers, tenant/lease/expiry, suppression and uncertain recovery.",
            "Confirm private identity never reaches provider content, public DTOs or logs.",
            "Qualify actual database schema installation, live mailbox/client rendering and approved SMS carrier behavior separately from source and sandbox tests."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Existing focused suites are Communication template resources, channel migration, durable runtime, SMTP runtime adapter, SMS runtime adapter and Profile employee template resources under their owning module test directories. They are a map for testing, not evidence that a particular customer deployment has passed."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Related topics",
          "anchor": "communicationEmailSmsTemplates-30-related-topics"
        },
        {
          "kind": "unordered-list",
          "items": [
            "[Communication overview](/docs/framework/communication-overview)",
            "[Provider configuration and operations](/docs/framework/communication-provider-runbooks)",
            "[Resource implementation contract](../../../../nodics.communication/modules/commsCore/llm/contracts/template-resources.md)",
            "[Framework presentation principle](../../../../nodics.foundation/modules/nSetup/llm/contracts/nodics-principles.md#module-owned-email-and-sms-presentation)"
          ]
        }
      ],
      "searchText": "Email and SMS Templates Detailed notification flow, existing inventory, typed manifests, configuration and adoption, layered overrides, locale precedence, safe HTML, new email/SMS examples, frozen retries and troubleshooting. # Email and SMS Templates\n\n## Signed Integration Source Authority\n\nThe internal intent request API requires a verified service principal, matching authenticated/request tenant, explicit communication.request permission and signed module scopes containing both commsApi and the selected trusted source module. The configured trusted-source list alone is not a grant. A runtime authorized for Profile cannot impersonate Order by changing sourceModule in a payload.\n\nRetry and uncertainty resolution authorize exactly one stored intent's source, not a source supplied by the caller. They validate the signed context before reading private intent evidence; unreadable, missing or ambiguous records refuse the action. No recipient, template variables or message body is disclosed. Deployments use existing nAuth/nRouter runtime grants. This source boundary remains subject to installed token/transport acceptance; no delivery is activated by it.\n\n## Employee Lifecycle Intent Integration\n\nProfile's exported `DefaultEnterpriseNotificationService` owns invitation and account-ready decisions. Framework defaults live in `enterpriseManagement.notifications`: enabled/qualified are false, with declarations for INVITATION and ACCOUNT_READY. This policy selects resources, not inline HTML. Existing framework resource bundles provide subject, HTML and plain text. Later module, custom-project and runtime layers override those resource paths using the existing loader. Keep declared parameter contracts compatible with frozen inputs.\n\nOn an admitted event Profile first stores private assignment lifecycleNotifications: the recipient, templateCode/purpose/locale, bounded variables and stable idempotency key. It then delegates to Communication's trusted internal communications API. Communication owns rendered snapshots, queueing, delivery and provider retries; Profile does not create another queue or call SMTP directly. An uncertain request retains the same frozen inputs/key, so an explicit retry reconciles the same intent. Once intentCode is saved, Profile returns that evidence rather than re-enqueuing. Its saved status is intent-request progress, not refreshed mailbox delivery proof.\n\nInvitation creation requests INVITATION only for an active unused unexpired invitation. Completed registration or membership acceptance requests ACCOUNT_READY only after stored completion. Delivery failure never rolls back account readiness and receiving mail never grants access. Frozen recipient changes, withdrawals or incomplete readiness fail closed. Generic CRUD cannot manufacture this evidence.\n\nFor customization, set approved connection/purpose/locale/nextStep in a later Profile property layer and override the matching template resources. nextStep is plain text, not HTML or a URL; action links need declared safe https-url parameters and an owner-approved destination. Never pass credentials, OTP proof, access tokens, role grants or caller-selected recipients. A new lifecycle kind requires a domain readiness contract and reviewed owner implementation, not an arbitrary template code accepted from HTTP. Reuse Communication for any new channel.\n\nPOST `/enterprise-team/retry-notification` takes only assignmentCode, current revision and INVITATION/ACCOUNT_READY under fresh administrator authority. It does not replace recipients/content or resend a known intent. Qualify trusted Profile source admission, approved sender/recipients, deployed resource layering and delivery/provider recovery before enabling policy. No delivery acceptance or mail send has been performed for this source increment.\n\nFor beginners, start with the example below, then read the inventory and the smallest-change customization table before attempting a new notification.\n\nAn email or SMS notification is a business message delivered through Communication. Think of the template as stationery, the domain service as the person deciding what to say, and the provider as the delivery service. Changing the stationery must not change who is allowed to send, what a verification code proves, or whether an enterprise application has been approved.\n\nFor example, Profile decides that an employee may receive an email-verification challenge. It supplies the code and expiry to Communication. Communication resolves the effective template, safely inserts those values, stores the private rendered message and invokes the selected email provider. A customer can replace the subject or HTML without copying Profile, the renderer or SMTP into the customer project.\n\n## Scope, audience and maturity\n\nFunctional owner: `nodics.communication`. Technical owner: `commsCore`. Business presentation also has a domain owner, such as Profile or customerFeedback. This guide addresses business evaluators, notification authors, administrators, partner developers, framework maintainers, operators, QA engineers and AI tools.\n\nLayered files, typed rendering, durable intents, source gating and provider adapters are implemented. SMTP supports guarded controlled-test delivery. SMS remains a disabled-by-default injected sandbox boundary, not a supplied production carrier integration. A template editor, arbitrary email scripting, automatic localization, SMS segmentation and automatic uncertain-send retry are not promised capabilities. Authored configuration examples are not authorization to enable or send messages.\n\nBusiness users review wording, destination journeys and approved notifications. Developers author deployed resources. Operators select qualified transports and inspect redacted evidence. This guide does not assert that Axis provides a visual editor for these resource files. See [provider operations](/docs/framework/communication-provider-runbooks) for sender credentials, transport policy and delivery-result interpretation.\n\n## Ownership and source map\n\n| Concern | Canonical owner | What must not move here |\n| --- | --- | --- |\n| Business eligibility, purpose, recipient and values | Requesting domain service | Provider credentials and retries |\n| Default wording and HTML for a domain | Domain module `src/templates` | Project-specific branding in framework defaults |\n| Generic runtime notice presentation | commsCore `src/templates` | Another domain's business copy |\n| Discovery, manifests, parameters and rendering | DefaultCommunicationTemplateService | A project-specific loader or renderer |\n| Intents, source policy, claims, suppression and recovery | DefaultCommunicationRuntimeService | Domain approval or identity transitions |\n| Schema source | commsSchema | Another message ledger in a project |\n| SMTP/MIME transport | smtpCommsProvider | Template lookup and business decisions |\n| SMS sandbox transport boundary | smsCommsProvider | HTML rendering or assumed carrier qualification |\n| Reusable verification challenge lifecycle | commsVerification | Email-file ownership of proof or identity |\n| Customer branding/deployment selection | Existing concrete customer and runtime layers | Copied framework services |\n\nThe main sources, relative to the framework repository, are:\n\n- `nodics.communication/modules/commsCore/src/service/defaultCommunicationTemplateService.js`\n- `nodics.communication/modules/commsCore/src/service/defaultCommunicationRuntimeService.js`\n- `nodics.communication/modules/commsCore/config/properties.js`\n- `nodics.communication/modules/commsCore/llm/contracts/template-resources.md`\n- `nodics.communication/modules/commsSchema/src/schemas/schemas.js`\n- `nodics.communication/modules/smtpCommsProvider/config/properties.js`\n- `nodics.communication/modules/smsCommsProvider/config/properties.js`\n\n## How a notification travels\n\n```mermaid\nflowchart TD\n  Domain[\"Domain validates business event and recipient\"] --> Request[\"Trusted Communication request\"]\n  Request --> Replay{\"Existing idempotency identity?\"}\n  Replay -->|Same command| Existing[\"Return stored safe result without resending\"]\n  Replay -->|Changed command| Conflict[\"Reject conflict\"]\n  Replay -->|New| Select[\"Select configured reference, resource or published version\"]\n  Select --> Validate[\"Check source, purpose, channel and typed parameters\"]\n  Validate --> Render[\"Render text and optional HTML\"]\n  Render --> Persist[\"Persist frozen private content and bundle provenance\"]\n  Persist --> Policy[\"Check suppression and expiry\"]\n  Policy --> Claim[\"Acquire managed delivery claim\"]\n  Claim --> Provider[\"Provider receives frozen representations\"]\n  Provider --> Evidence[\"Store redacted outcome or uncertain state\"]\n```\n\nThe diagram is a reading aid, not an independent workflow engine. In the actual request path, trusted-source policy is checked before replay lookup. The command identity includes domain/source, template, recipient, purpose, channel, locale and variables. The same key with changed command data rejects. New content is rendered before intent persistence; send-time suppression, expiry and claim checks still apply. Invalid rendering creates no new intent.\n\nTransport failure does not undo the business event. A failed notification must not repeat enterprise approval, password reset, registration or feedback creation. The domain should retain the Communication reference and expose truthful progress. The dispatcher owns attempts; providers neither re-render nor perform hidden retries.\n\n## Standard folder layout\n\n```text\n<owning-module>/\n  src/\n    templates/\n      email/\n        employee-email-verification/\n          template.json\n          en/\n            subject.txt\n            email.html\n            email.txt\n      sms/\n        runtime-notice/\n          template.json\n          en/\n            message.txt\n```\n\nDirectories are lowercase `email` and `sms`; manifest channel values are uppercase `EMAIL` and `SMS`. OTP is a purpose, not a channel folder. An OTP sent by email uses the email layout; an OTP sent by SMS uses the SMS layout. Adding an SMS file does not make a caller that requests EMAIL switch channels.\n\nEmail requires all three locale representations. The subject is plain text and must not contain CR/LF/NUL after rendering; trailing file newlines are trimmed. `email.txt` is the plain-text alternative, not source generated by stripping HTML. `email.html` is trusted static markup with escaped parameter insertion. SMS uses only `message.txt`; a provider refuses HTML in an SMS envelope.\n\nResources are deployed source artifacts. They are not arbitrary uploaded paths, template URLs or editable database body blobs. A project/application root is not a concrete template owner: use a customer module or a selected runtime module.\n\n## Existing template inventory\n\nAll current bundles below use manifest version 2 and default locale `en`. The resource folder is distinct from the stable code supplied by the caller.\n\n| Owner | Channel and folder | Stable template code | Purpose | Required variables |\n| --- | --- | --- | --- | --- |\n| profile | email/employee-email-verification | profile.employee.emailVerification | EMPLOYEE_EMAIL_VERIFICATION | verificationCode, expiresAt |\n| profile | email/employee-otp-verification | profileEmployeeRecoveryCode | EMPLOYEE_PASSWORD_RECOVERY | verificationCode, expiresAt |\n| profile | email/employee-application-outcome | profile.employee.applicationOutcome | EMPLOYEE_APPLICATION_OUTCOME | enterpriseName, decision, decidedAt, nextStep |\n| profile | email/employee-invitation | profile.employee.invitation | EMPLOYEE_INVITATION | enterpriseName, responsibility, nextStep |\n| profile | email/employee-account-ready | profile.employee.accountReady | EMPLOYEE_ACCOUNT_READY | enterpriseName, nextStep |\n| profile | email/employee-password-reset | profileEmployeePasswordReset | EMPLOYEE_PASSWORD_RESET_CONFIRMATION | completedAt |\n| commsCore | email/runtime-notice | COMMUNICATION_RUNTIME_NOTICE | TRANSACTIONAL | reference, message |\n| commsCore | sms/runtime-notice | COMMUNICATION_RUNTIME_NOTICE | TRANSACTIONAL | reference, message |\n| contactSubmission | email/contact-acknowledgement | CONTACT_ACKNOWLEDGEMENT | TRANSACTIONAL | reference |\n| customerFeedback | email/feedback-acknowledgement | FEEDBACK_ACKNOWLEDGEMENT | TRANSACTIONAL | reference |\n| customerReview | email/review-acknowledgement | REVIEW_ACKNOWLEDGEMENT | TRANSACTIONAL | reference |\n| testimonial | email/testimonial-consent-request | TESTIMONIAL_CONSENT_REQUEST | CONSENT | reference |\n\nProfile resources are under `nodics.platform/modules/profile`; Engagement resources are under `nodics.engagement/modules/<owner>`; commsCore is under `nodics.communication/modules/commsCore`. Source allowlists name those technical owners, not the functional group or customer brand.\n\nProfile bundles additionally accept optional `brandName`, maximum length 120, defaulting to `Account services`. Verification code/expiry, decision, timestamps and completion timestamp are bounded at 128 characters; enterpriseName at 256 and nextStep at 2000. Runtime notice reference is bounded at 256 and message at 10000; each Engagement reference at 256. These are parameter bounds, not provider delivery limits. In particular SMS still enforces its smaller final byte limit.\n\nThe notice and four Engagement resources require explicit selection. Profile resources do not use that optional-resource selection gate, but Profile's business feature policy, trusted sources, recipient checks and provider gates still apply. Invitation/account-ready resources are presentation defaults only. Their durable lifecycle triggers are not wired or enabled by adding files; sender, recipients and delivery/recovery acceptance remain gated. Do not send readiness mail from application approval or treat an invitation message as an access grant. Customize these files through the same project/runtime overrides without copying services. Dynamic nextStep is plain text; introduce action links only through declared `https-url` parameters and an owner-approved destination, never bearer secrets.\n\nThe application-outcome template does not itself make an approved applicant ready to sign in. The recovery OTP folder is not the registration verification template. New business scenarios may require additional resources and caller integration.\n\n## Manifest reference\n\nThis is the implemented Profile email-verification declaration:\n\n```json\n{\n  \"formatVersion\": 1,\n  \"code\": \"profile.employee.emailVerification\",\n  \"ownerModule\": \"profile\",\n  \"version\": 2,\n  \"status\": \"ACTIVE\",\n  \"purpose\": \"EMPLOYEE_EMAIL_VERIFICATION\",\n  \"sourceModules\": [\"profile\"],\n  \"channel\": \"EMAIL\",\n  \"defaultLocale\": \"en\",\n  \"parameters\": {\n    \"verificationCode\": {\n      \"type\": \"string\", \"required\": true, \"maximumLength\": 128\n    },\n    \"expiresAt\": {\n      \"type\": \"string\", \"required\": true, \"maximumLength\": 128\n    },\n    \"brandName\": {\n      \"type\": \"string\", \"required\": false, \"maximumLength\": 120,\n      \"default\": \"Account services\"\n    }\n  }\n}\n```\n\n| Field | Meaning and constraint |\n| --- | --- |\n| formatVersion | Supported resource format is 1 |\n| code | Stable identity, not a filename; simple bounded identifier |\n| ownerModule | First manifest must come from this discovered module |\n| version | Positive integer, distinct from a data-release semantic version |\n| status | ACTIVE is required for resolution |\n| purpose | Exact business purpose matched against the request |\n| sourceModules | Explicit non-empty source-module allowlist |\n| channel | EMAIL or SMS, matching the requested channel |\n| defaultLocale | Locale folder used when a requested-locale file is absent |\n| requiresSelection | Optional boolean; true requires explicit resource selection/adoption |\n| parameters | Declared simple parameter names and string contracts |\n| type | Resource parameters support string, not arbitrary objects or numbers |\n| required | Required strings must be supplied and nonblank; cannot have defaults |\n| maximumLength | Positive string-length limit; not a UTF-8 byte or SMS segment count |\n| default | Optional presentation default, never a secret or a required proof value |\n| format | Optional https-url for safe dynamic href/src insertion |\n\nA later complete manifest may change version, default locale and optional presentation defaults. It cannot change owner, code, purpose, channel, source allowlist, requiresSelection behavior or parameter names/types/requiredness/limits/ format. Use a new owner-defined identity for an incompatible contract, not a branding override. Duplicate identities under different resource folder names reject.\n\n## Configuration and activation\n\nFour separate decisions are involved:\n\n1. The sending runtime discovers the files' owner module.\n2. The relevant template is selected and valid.\n3. The requesting business operation and trusted source are allowed.\n4. A selected, enabled and qualified provider can deliver to the recipient.\n\nNeither installing a package nor adding a template passes the other gates. Configuration must be effective in the sending runtime, not only in a web or Profile runtime that makes the original request.\n\n| Configuration | Default | Purpose |\n| --- | --- | --- |\n| communication.templateResources.enabled | true | Enable file-resource resolution |\n| communication.templateResources.modules | empty object | Explicit discovered inactive owners whose files may be used |\n| communication.templateResources.selections | empty object | Optional resource codes explicitly selected with true |\n| communication.templateResources.maximumFileBytes | 65536 | Bound each source file |\n| communication.templateResources.maximumTemplatesPerModule | 100 | Bound resource catalogue scanning |\n| communication.templateResources.maximumLayers | 512 | Bound effective resource layers |\n| communication.rendering.maximumVariables | 50 | Bound declared/accepted render data |\n| communication.rendering.maximumRenderedBytes | 65536 | Bound serialized rendered output, including private identity |\n| communication.trustedSourceModules | empty array | Permit requesting technical module names |\n| communication.templates | empty object | Existing explicit configured selection/compatibility map |\n| communication.providers.EMAIL | absent | Select email provider type and deployment differences |\n| communication.providers.SMS | absent | Select SMS provider type and deployment differences |\n\nResource rendering rejects unknown variables regardless of a legacy permissive policy expectation. Defaults are inherited; customer properties should contain only the intended differences, not a copy of this table.\n\nFor example, an existing customer module may select a framework acknowledgement:\n\n```js\nmodule.exports = {\n  communication: {\n    trustedSourceModules: [\"contactSubmission\"],\n    templateResources: {\n      selections: { CONTACT_ACKNOWLEDGEMENT: true }\n    }\n  }\n};\n```\n\nThis is a fragment for a runtime whose intended trusted-source set includes that module. Preserve other required sources according to the existing configuration merge contract; do not blindly replace a live allowlist. It does not select a provider, enable contact intake or create a notification request.\n\nFor a split sending runtime that discovers but does not activate Profile:\n\n```js\nmodule.exports = {\n  communication: {\n    templateResources: { modules: { profile: true } }\n  }\n};\n```\n\nThis only makes Profile's deployed files eligible. The existing runtime discovery roots must already include the owner package. Unknown selected owners fail closed. Do not activate all Profile services just to obtain email files.\n\n## Selection precedence and published references\n\nFor a new intent, selection is:\n\n1. Explicit `communication.templates[templateCode]`.\n2. A matching available/selected module resource.\n3. An active parent and active locale/channel version in the existing published store.\n\nA configured inline legacy entry therefore shadows a same-code resource. Remove that old selection through a reviewed migration when adopting files. Do not diagnose its unchanged wording as a file-override failure.\n\nAn explicit configured resource reference can pin version selection without bodies:\n\n```js\nmodule.exports = {\n  communication: {\n    templates: {\n      CONTACT_ACKNOWLEDGEMENT: {\n        code: \"CONTACT_ACKNOWLEDGEMENT\",\n        resourceCode: \"CONTACT_ACKNOWLEDGEMENT\",\n        version: 2,\n        status: \"ACTIVE\",\n        purpose: \"TRANSACTIONAL\",\n        channels: [\"EMAIL\"],\n        sourceModules: [\"contactSubmission\"]\n      }\n    }\n  }\n};\n```\n\nUse one deliberate selection approach, not every example simultaneously. A reference's resourceCode must equal the requested code. The effective resource version, purpose and source must match. A reference cannot also have subjectTemplate or bodyTemplate. Resource availability still follows existing discovery.\n\nPublished parents store explicit sourceModules, declared variables, channels, purpose and currentVersion. Active version rows select resourceCode, version, channel and locale; they do not own HTML/text presentation. Missing source ownership is not a wildcard. The published lookup requires its requested locale/version row; resource-file locale fallback does not invent a missing published selection row.\n\nCurrent commsCore releases use core-v001 and optional sample-v001 source roots at release version 0.0.1, with message resource version 2. The pre-production records are consolidated into the active v001 manifest inputs; future production changes must use forward immutable releases. The IN_APP notice remains legacy text because this migration concerns EMAIL/SMS. Import schema changes and adoption records only through the governed owner path in an authorized runtime. Do not edit old releases or bulk-rewrite queued messages.\n\n## Customize and extend safely\n\n### Choose the smallest change\n\n| Desired change | Correct extension |\n| --- | --- |\n| Change one email subject | Override only locale subject.txt |\n| Change HTML branding/layout | Override email.html; review email.txt for equivalent information |\n| Change wording for SMS | Override message.txt |\n| Change a declared optional brand default | Supply a complete compatible template.json |\n| Add a language | Add corresponding locale files, select that request locale |\n| Different server-specific wording | Same resource path under the selected server/node module |\n| New purpose or parameter contract | New domain-owned code and manifest |\n| Different provider | Existing provider selection/extension, not template changes |\n| Different business trigger or recipient rule | Owning domain extension, not presentation or transport |\n\n### Override a subject without copying the framework\n\nIn an already discovered and active concrete customer module:\n\n```text\n<customer-module>/src/templates/email/employee-email-verification/en/subject.txt\n```\n\n```text\nYour Example Company verification code\n```\n\nThat is the entire presentation override. The framework manifest, HTML and plain text remain inherited. The folder name must remain employee-email-verification, even though the caller uses profile.employee.emailVerification. Do not add a template registration service or duplicate renderer.\n\n### Override HTML and plain text together\n\nCreate the same two locale files in the customer module:\n\n```html\n<!doctype html>\n<html lang=\"en\">\n  <body style=\"margin:0;padding:24px;font-family:Arial,sans-serif;color:#202724;\">\n    <h1 style=\"font-size:24px;\">Verify your Example Company email</h1>\n    <p>Your verification code is <strong>{{verificationCode}}</strong>.</p>\n    <p>It expires at {{expiresAt}}.</p>\n    <p>If you did not request this code, ignore this message.</p>\n  </body>\n</html>\n```\n\n```text\nVerify your Example Company email.\nYour verification code is {{verificationCode}}.\nIt expires at {{expiresAt}}.\nIf you did not request this code, ignore this message.\n```\n\nUse email-compatible static markup and inline CSS. Preserve essential information in the text version. Static images, when used, need trusted HTTPS URLs and useful alt text; remote image loading depends on the recipient client. The renderer does not fetch assets. Never place secrets in asset URLs.\n\n### Customize optional branding defaults\n\nCopy the complete owner manifest into the matching customer resource folder, preserve its identity and parameter contract, and change only the optional brandName default. There is no partial JSON merge for manifests. A file containing only parameters.brandName.default is invalid. Caller-supplied brandName takes precedence over that default.\n\nExisting resources without a brandName parameter cannot acquire one through a branding override. Use static wording in the HTML or introduce an owner-reviewed new template identity when a new dynamic parameter is genuinely required.\n\n### Layer precedence\n\nResource resolution follows the existing module graph, low to high:\n\n1. Explicitly selected discovered inactive owners, before indexed active modules.\n2. Indexed active concrete modules in their existing order.\n3. Selected environment, server-root, server and node modules, deduplicated in that order.\n\nRuntime scopes are evaluated last even if normal module indexes differ. Project/ application roots are excluded. A customer package merely installed on disk is not automatically an active overriding layer. Inspect the sending runtime's indexed/raw module metadata rather than guessing precedence from directory names.\n\nTo make an environment override, put the same relative resource path under that selected environment module, for example:\n\n```text\n<environment-module>/src/templates/email/employee-email-verification/en/subject.txt\n<server-module>/src/templates/email/employee-email-verification/en/email.html\n<node-module>/src/templates/sms/runtime-notice/en/message.txt\n```\n\nThese are placeholders for existing discovered module roots, not new loader directories. The highest eligible existing file wins. Missing files inherit; an existing invalid, oversized or unreadable file rejects instead of silently falling back. No automatic tenant-name directory lookup exists. Tenant-specific branding requires an explicitly governed existing deployment/customization route; do not infer a new per-tenant filesystem loader.\n\n### Locale fallback\n\nAdd translated files under a locale such as fr. For each required file, requested locale is preferred across all layers; only then does defaultLocale fallback apply. A framework fr file therefore beats a customer en file for a fr request.\n\n| Available files for a fr request | Effective file |\n| --- | --- |\n| Owner en, customer en, no fr anywhere | Highest eligible en file |\n| Owner fr, customer en | Owner fr |\n| Owner fr, customer fr | Customer fr |\n| Customer fr subject only | Customer fr subject; other files fall back independently |\n| No requested/default file for a required representation | Reject incomplete bundle |\n\nPartial translations can produce mixed-language representations. Supply the full locale bundle when consistency is required. The renderer does not translate dates, choose a customer's language or format numbers. The trusted caller supplies localized strings and the desired locale.\n\n## Build a new email notification\n\nThis worked example is an illustrative customer-domain notification, not a newly shipped framework capability. Assume an existing discovered module acmeOrders owns the approved order-ready event. Do not create a module solely to hold framework mechanics or change a framework module from a partner project.\n\n### 1. Define the business contract\n\nThe domain has already determined that the order is ready and selected the eligible recipient from authoritative data. It supplies only orderNumber and a safe HTTPS orderUrl. Purpose is TRANSACTIONAL. The message neither marks an order ready nor grants access to the order. Use a stable event identity and authorize the linked page independently.\n\n### 2. Add the manifest\n\n`<acmeOrders-module>/src/templates/email/order-ready/template.json`:\n\n```json\n{\n  \"formatVersion\": 1,\n  \"code\": \"acme.orderReady\",\n  \"ownerModule\": \"acmeOrders\",\n  \"version\": 1,\n  \"status\": \"ACTIVE\",\n  \"purpose\": \"TRANSACTIONAL\",\n  \"sourceModules\": [\"acmeOrders\"],\n  \"channel\": \"EMAIL\",\n  \"defaultLocale\": \"en\",\n  \"requiresSelection\": true,\n  \"parameters\": {\n    \"orderNumber\": {\n      \"type\": \"string\", \"required\": true, \"maximumLength\": 64\n    },\n    \"orderUrl\": {\n      \"type\": \"string\", \"required\": true, \"maximumLength\": 512,\n      \"format\": \"https-url\"\n    }\n  }\n}\n```\n\n### 3. Add all three representations\n\n`en/subject.txt`:\n\n```text\nOrder {{orderNumber}} is ready\n```\n\n`en/email.txt`:\n\n```text\nYour order {{orderNumber}} is ready.\nView the order: {{orderUrl}}\n```\n\n`en/email.html`:\n\n```html\n<!doctype html>\n<html lang=\"en\">\n  <body style=\"margin:0;padding:24px;font-family:Arial,sans-serif;color:#202724;\">\n    <h1 style=\"font-size:24px;\">Order ready</h1>\n    <p>Your order <strong>{{orderNumber}}</strong> is ready.</p>\n    <p><a href=\"{{orderUrl}}\">View your order</a></p>\n  </body>\n</html>\n```\n\nThe full href is one quoted https-url parameter. Do not construct it with `href=\"https://example.test/{{orderNumber}}\"`: mixed dynamic attributes are not supported. Construct and validate the complete URL in the domain service. HTTPS validation alone does not authorize an arbitrary destination; apply the domain's approved host/path policy before passing it.\n\n### 4. Select the notification\n\nAdd only the necessary differences in the existing customer configuration:\n\n```js\nmodule.exports = {\n  communication: {\n    trustedSourceModules: [\"acmeOrders\"],\n    templateResources: { selections: { \"acme.orderReady\": true } }\n  }\n};\n```\n\nCompose the customer owner and Communication into the appropriate runtime or use the existing secured Communication service route for a split topology. Do not assume a service global from another process exists locally. Provider selection is separate; see the runbook. New resources do not require a new schema, router or data-release pack when direct configured selection meets the requirement.\n\n### 5. Request through the existing owner\n\nWithin an authorized server-side domain service, the in-process call shape is:\n\n```js\nreturn SERVICE.DefaultCommunicationRuntimeService.request(request, {\n  sourceModule: \"acmeOrders\",\n  sourceType: \"ORDER\",\n  sourceCode: order.code,\n  templateCode: \"acme.orderReady\",\n  purpose: \"TRANSACTIONAL\",\n  channel: \"EMAIL\",\n  locale: \"en\",\n  recipientId: recipient.code,\n  recipientAddressReference: recipient.approvedEmail,\n  variables: {\n    orderNumber: order.number,\n    orderUrl: approvedOrderUrl\n  },\n  idempotencyKey: notificationEventKey,\n  correlationId: request.correlationId\n});\n```\n\nThe shown identifiers represent values already validated by the domain, not browser body fields. The request must carry trusted tenant/authentication context. The service route additionally requires its existing service permission. Keep real recipient addresses and values out of logs. For SMTP, the recipient reference is a validated single mailbox; another provider may resolve a reference differently.\n\nnotificationEventKey must be deterministic for that domain event, channel and recipient. Replaying the same event reuses it; changing variables under it conflicts. Do not append a timestamp on every retry. A later distinct authorized event gets a distinct key. Supply expiresAt when business delivery validity is bounded. For OTP, align delivery validity with the existing verification authority.\n\n## Build a new SMS notification\n\nUse the same domain event and renderer, with a separate channel resource:\n\n```text\n<acmeOrders-module>/src/templates/sms/order-ready/template.json\n<acmeOrders-module>/src/templates/sms/order-ready/en/message.txt\n```\n\nUse the complete email manifest above with channel changed to SMS; retain the same code, owner, purpose and parameter declarations for this illustrative dual-channel message. The channel separates resource lookup. The message file is:\n\n```text\nOrder {{orderNumber}} is ready. View: {{orderUrl}}\n```\n\nRequest channel SMS, supply the recipient reference understood by the selected SMS transport, and use a distinct channel-specific event key. An email idempotency key cannot be reused with a changed channel. The existing optional selection is code-scoped: selecting acme.orderReady makes either matching channel resource eligible; it does not authorize both channels for every domain event.\n\nSMS is text, not a miniature HTML email. No subject or email.html is required. The sandbox provider enforces a default maximum of 1600 UTF-8 bytes. Multi-byte characters consume more bytes; this bound is not a promise of a particular number of GSM/UCS-2 segments or a carrier price. Segmentation, opt-out handling, recipient resolution and real carrier delivery need an explicitly qualified transport. Do not invent an SMS OTP proof store or a live carrier adapter in a template file.\n\n## Parameter safety and supported interaction\n\nOnly simple `{{name}}` expressions are supported. HTML output escapes dynamic values; text output preserves literal characters. Required values must be nonblank strings. Unknown values reject, optional absent values become blank unless a default exists, and object/array/number values are not resource parameters.\n\nRejected syntax includes raw triple braces, helpers, blocks, loops, partials, dynamic lookup and prototype/property traversal. Reserved helper/prototype names are invalid declarations. Compose alternative messages in the domain by selecting the correct template or supplying an already-approved string, not by executing business logic inside HTML.\n\nHTML parsing rejects script/style blocks, embedded documents, forms, event handlers, unsafe URLs and active CSS. Use static inline styling. Dynamic attributes are only quoted href/src whose entire value is a declared https-url parameter. This is trusted deployment-resource validation, not a general public HTML sanitizer.\n\nSupported interaction means safe links to authorized application journeys. JavaScript, form submission, embedded payment actions and executable email widgets are not supported. Never make the presence of a link or a rendered decision string the authority for a privileged action.\n\n## Durability, privacy and upgrades\n\nEach new intent records templateVersion and private renderedContent, including text, optional HTML and templateIdentity. That identity contains a checksum, owner and per-file module/locale/resource provenance, not absolute filesystem paths or variable values. The checksum covers the effective manifest and files, so branding changes are distinguishable even if a compatible version is retained.\n\nProvider payloads contain only required representations; private provenance stays local. Public results, events and logs remain content-free. The private intent can contain sensitive message content, including an OTP; it needs existing storage access and retention controls. Do not incorrectly claim that only a hash is stored. Proof hashing in commsVerification is a separate security contract.\n\nExisting intents are not re-rendered after a template change. Identical replay returns stored evidence even if the files have been removed; retry uses frozen content. New requests use the then-effective resources. An operator must not resend to apply a new brand layout or change an idempotency key to evade uncertainty.\n\nPublished release checksums identify framework bundles; the actual customized bundle hash is pinned in a new intent. A reference-pinned version must continue to match its selected resource. Plan manifest version/adoption changes together. Legacy persisted/configured text stays on the shared restricted compatibility renderer and cannot silently become HTML.\n\n## Troubleshooting matrix\n\n| Symptom | Likely cause | Safe next action |\n| --- | --- | --- |\n| Communication source is not configured | Source missing from sending runtime policy | Review effective trustedSourceModules, not browser fields |\n| Resource owner is unavailable | Owner not discovered or wrong selected name | Inspect raw metadata and existing discovery roots |\n| Template unavailable for source | Purpose/channel/source mismatch or optional unselected resource | Compare manifest, caller and selection/adoption |\n| Resource reference unavailable | Pinned version does not match effective resource | Coordinate version and governed adoption |\n| Old wording after file override | Configured legacy entry shadows files, or wrong runtime/locale | Inspect selection precedence and provenance |\n| Incomplete bundle | Required file missing in requested and default locales | Supply/inherit all required representations |\n| Parameter missing or invalid | Wrong type, blank required value, too long or unsafe URL | Fix trusted caller data; never weaken security for bad input |\n| Unknown variable | Caller supplied undeclared input | Minimize data or create an owner-reviewed new contract |\n| Manifest override rejected | Changed source/purpose/parameter contract or partial manifest | Keep compatible full manifest or create a new identity |\n| Rendered content too large | Output plus identity exceeds configured byte bound | Reduce copy/markup and check all representation sizes |\n| SMS rejected despite valid rendering | Final text exceeds provider bytes or contains HTML | Shorten SMS and retain provider safety bounds |\n| UNCONFIGURED | Provider disabled, missing references/ports or invalid auth | Follow provider runbook; do not change template copy |\n| UNCERTAIN | Transport may have accepted before reply was lost | Reconcile exact managed revision; no blind retry |\n| New layout absent on retry | Intent correctly retained frozen content | Use a genuinely new authorized event to observe new files |\n\nErrors must remain content-free. Investigate with template/intent/correlation codes and protected metadata; do not paste production bodies, addresses, credentials or verification values into support records.\n\n## Common mistakes\n\n- Copying the renderer into a customer project instead of overriding files.\n- Using a resource folder name as the request code or confusing OTP with a channel.\n- Treating optional selection as permission to send or as production qualification.\n- Adding undeclared parameters through a partial manifest or using raw HTML values.\n- Expecting a customer default-locale file to replace an existing exact-locale file.\n- Retrying with a new idempotency key because the first send outcome is uncertain.\n- Claiming that private intents contain no message content.\n\n## Verification workflow\n\nFor joint testing, prepare a fake-value preview before enabling any transport:\n\n- Resolve each default and each intended customer/environment/server/node override.\n- Check subject, HTML, text and SMS independently; include long strings and small screens.\n- Exercise requested-locale precedence and incomplete/malformed resource rejection.\n- Reject unknown/missing/oversized values, raw markup, helper syntax and unsafe URLs.\n- Confirm optional resources stay unavailable until explicitly selected/adopted.\n- Confirm wrong source, purpose, channel and published version reject before persistence.\n- Prove replay and retry retain content, and changed data under the same key conflicts.\n- Check disabled providers, tenant/lease/expiry, suppression and uncertain recovery.\n- Confirm private identity never reaches provider content, public DTOs or logs.\n- Qualify actual database schema installation, live mailbox/client rendering and approved SMS carrier behavior separately from source and sandbox tests.\n\nExisting focused suites are Communication template resources, channel migration, durable runtime, SMTP runtime adapter, SMS runtime adapter and Profile employee template resources under their owning module test directories. They are a map for testing, not evidence that a particular customer deployment has passed.\n\n## Related topics\n\n- [Communication overview](/docs/framework/communication-overview)\n- [Provider configuration and operations](/docs/framework/communication-provider-runbooks)\n- [Resource implementation contract](../../../../nodics.communication/modules/commsCore/llm/contracts/template-resources.md)\n- [Framework presentation principle](../../../../nodics.foundation/modules/nSetup/llm/contracts/nodics-principles.md#module-owned-email-and-sms-presentation)\n",
      "previous": {
        "title": "Waste impact providers and mock carbon estimates",
        "route": "/docs/framework/waste-impact-providers"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.communication",
        "technicalModule": "commsCore",
        "owner": "commsCore",
        "sourcePath": "data/docs-v001/records/documentation/commsCoreDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/commsCoreDocumentationComponentData.js",
        "wordCount": 4928,
        "checksum": "03512c265ef5ebb97658f10dceafe66bf65359c9577f1b72c61d7adbac0b2cdc"
      },
      "slug": "communication-email-sms-templates",
      "locale": "en",
      "navigationGroup": "Communication Delivery and Verification",
      "navigationGroupCode": "communication-delivery-and-verification",
      "navigationGroupOrder": 10,
      "navigationOrder": 20,
      "references": [
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
