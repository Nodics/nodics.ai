/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module commsApi/src/router/routers @description Declares secured Communication customer, operator, and provider callback routes. @layer router @owner commsApi @override Provider modules may add secured callback mappings without exposing generic schema CRUD. */
module.exports = {
  commsApi: {
    customer: {
      listInbox: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["customerUserGroup"],
        permission: "communication.customer.read",
        apiExposure: "communicationCustomer",
        key: "/customer/communications",
        method: "GET",
        controller: "DefaultCommunicationApiController",
        operation: "listInbox",
      },
    },
    operator: {
      retryDelivery: {
        secured: true,
        authTokenTypes: ["access"],
        accessGroups: ["employeeUserGroup"],
        permission: "communication.delivery.retry",
        apiExposure: "communicationManagement",
        key: "/operator/communications/:intentCode/retry",
        requestPrivacy: { sensitive: true },
        cache: { enabled: false },
        method: "POST",
        controller: "DefaultCommunicationApiController",
        operation: "retryDelivery",
      },
    },
    internal: {
      diagnoseCommunication: {
        secured: true,
        authTokenTypes: ["service"],
        accessGroups: ["serviceAccountUserGroup"],
        permission: "communication.request",
        apiExposure: "communicationIntegration",
        key: "/internal/communications/:intentCode/diagnostic",
        requestPrivacy: { sensitive: true },
        method: "POST",
        controller: "DefaultCommunicationApiController",
        operation: "diagnoseDelivery",
        cache: { enabled: false },
        summary: "Read static diagnostics from the exact latest persisted delivery attempt",
        requestBody: { required: true, content: { "application/json": { schema: {
          type: "object", additionalProperties: false, required: ["sourceModule", "sourceType", "sourceCode"], properties: {
            sourceModule: { type: "string", maxLength: 180 }, sourceType: { type: "string", maxLength: 180 }, sourceCode: { type: "string", maxLength: 180 },
          },
        } } } },
        responses: {
          200: { description: "Source-authorized fixed latest-attempt classification without private provider data", content: { "application/json": { schema: {
            type: "object", additionalProperties: false, required: ["data"], properties: { data: {
              type: "object", additionalProperties: false, required: ["intentCode", "status", "revision", "diagnostic"], properties: {
                intentCode: { type: "string", pattern: "^COMM_[a-f0-9]{64}$" },
                status: { type: "string", enum: ["ACCEPTED", "SUPPRESSED", "QUEUED", "DELIVERING", "DELIVERED", "FAILED", "CANCELLED", "RETRY_PENDING", "UNCERTAIN", "DEAD_LETTER", "UNCONFIGURED"] },
                revision: { type: "integer", minimum: 0 },
                diagnostic: { type: "object", additionalProperties: false, required: ["classification", "attempt", "message"], properties: {
                  classification: { type: "string", enum: ["ATTEMPT_NOT_RECORDED", "TRANSPORT_ACK_UNCONFIRMED", "DELIVERY_INTERRUPTED", "INVALID_PROVIDER_OUTCOME", "PROVIDER_ACCEPTED", "PROVIDER_CONFIGURATION_REQUIRED", "DESTINATION_UNAVAILABLE", "PROVIDER_UNAVAILABLE", "PROVIDER_THROTTLED", "PROVIDER_REJECTED", "ATTEMPT_UNCLASSIFIED", "ATTEMPT_STATUS_DIFFERS"] },
                  attempt: { type: "integer", minimum: 0 }, message: { type: "string", maxLength: 400 },
                } },
              },
            } },
          } } } },
          400: { description: "Only the exact source binding and no query selectors are accepted" },
          403: { description: "Private entry or stored source authority was refused" },
          503: { description: "Current persisted intent or attempt evidence could not be qualified" },
        },
      },
      inspectCommunication: {
        secured: true,
        authTokenTypes: ["service"],
        accessGroups: ["serviceAccountUserGroup"],
        permission: "communication.request",
        apiExposure: "communicationIntegration",
        key: "/internal/communications/:intentCode/inspect",
        requestPrivacy: { sensitive: true },
        method: "POST",
        controller: "DefaultCommunicationApiController",
        operation: "inspectDelivery",
        cache: { enabled: false },
        summary: "Inspect one source-authorized persisted communication intent",
        description:
          "Read-only signed source inspection. Returns only intentCode, actual persisted status and revision; never recipient, rendered content, proofs or provider details. Does not send, retry or resolve delivery.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                maxProperties: 0,
                properties: {},
              },
            },
          },
        },
        responses: {
          200: {
            description: "Source-authorized current intent evidence",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: false,
                  required: ["data"],
                  properties: {
                    data: {
                      type: "object",
                      additionalProperties: false,
                      required: ["intentCode", "status", "revision"],
                      properties: {
                        intentCode: {
                          type: "string",
                          pattern: "^COMM_[a-f0-9]{64}$",
                        },
                        status: {
                          type: "string",
                          enum: [
                            "ACCEPTED",
                            "SUPPRESSED",
                            "QUEUED",
                            "DELIVERING",
                            "DELIVERED",
                            "FAILED",
                            "CANCELLED",
                            "RETRY_PENDING",
                            "UNCERTAIN",
                            "DEAD_LETTER",
                            "UNCONFIGURED",
                          ],
                        },
                        revision: { type: "integer", minimum: 0 },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: "Body must be exactly an empty object" },
          403: {
            description:
              "Caller or stored source unavailable; no private intent disclosure",
          },
          503: {
            description:
              "Owner read or persisted evidence could not be confirmed",
          },
        },
      },
      resolveCommunication: {
        secured: true,
        authTokenTypes: ["service"],
        accessGroups: ["serviceAccountUserGroup"],
        permission: "communication.request",
        apiExposure: "communicationIntegration",
        key: "/internal/communications/:intentCode/resolution",
        requestPrivacy: { sensitive: true },
        cache: { enabled: false },
        method: "POST",
        controller: "DefaultCommunicationApiController",
        operation: "resolveDelivery",
      },
      requestCommunication: {
        secured: true,
        authTokenTypes: ["service"],
        accessGroups: ["serviceAccountUserGroup"],
        permission: "communication.request",
        apiExposure: "communicationIntegration",
        key: "/internal/communications",
        requestPrivacy: { sensitive: true },
        cache: { enabled: false },
        method: "POST",
        controller: "DefaultCommunicationApiController",
        operation: "requestCommunication",
      },
      retryCommunication: {
        secured: true,
        authTokenTypes: ["service"],
        accessGroups: ["serviceAccountUserGroup"],
        permission: "communication.request",
        apiExposure: "communicationIntegration",
        key: "/internal/communications/:intentCode/retry",
        requestPrivacy: { sensitive: true },
        cache: { enabled: false },
        method: "POST",
        controller: "DefaultCommunicationApiController",
        operation: "retryDelivery",
      },
    },
    integration: {
      receiveTelegramStart: {
        secured: false,
        accessGroups: ["userGroup"],
        publicAccess: true,
        apiExposure: "communicationTelegramInbound",
        key: "/integrations/telegram/:receiverCode/start",
        method: "POST",
        requestPrivacy: { sensitive: true },
        cache: { enabled: false },
        bodyParserHandler: "telegramInboundBodyParserHandler",
        controller: "DefaultCommunicationApiController",
        operation: "receiveTelegramStart",
        summary: "Receive a secret-authenticated private Telegram Mini App launch update",
        description: "Native JSON authentication precedes route parsing. Only one durably claimed private /start update may return a raw Telegram method; duplicates and unsupported updates receive an empty acknowledgment. No login or delivered-outcome evidence is created.",
      },
      receiveCallback: {
        secured: true,
        authTokenTypes: ["service"],
        accessGroups: ["serviceAccountUserGroup"],
        permission: "communication.callback.receive",
        apiExposure: "communicationIntegration",
        key: "/integrations/:providerCode/communication-callback",
        method: "POST",
        controller: "DefaultCommunicationApiController",
        operation: "receiveCallback",
      },
    },
  },
};

// Transport exposure does not enable stored verification or grant a runtime permission.
module.exports.commsApi.internal.executeVerification = {
  secured: true,
  authTokenTypes: ["service"],
  accessGroups: ["serviceAccountUserGroup"],
  permission: "communication.verification.execute",
  apiExposure: "communicationIntegration",
  key: "/internal/verification/commands",
  requestPrivacy: { sensitive: true },
  cache: { enabled: false },
  method: "POST",
  controller: "DefaultCommunicationApiController",
  operation: "executeVerification",
  summary: "Execute one purpose-bound internal verification command",
  description:
    "Service-only sensitive RPC. The facade independently checks token type, tenant, source/target module scopes, explicit permission and payload. Does not register a person, send email or issue a login session. Unknown operations and extra fields are rejected. Never call this route from Axis.",
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          additionalProperties: false,
          required: [
            "operation",
            "sourceModule",
            "purpose",
            "subjectReference",
            "channel",
            "destination",
            "bindingReference",
          ],
          properties: {
            operation: {
              type: "string",
              enum: [
                "ISSUE",
                "VERIFY",
                "CONSUME",
                "RECEIPT",
                "REPLACE",
                "CANCEL",
              ],
            },
            sourceModule: {
              type: "string",
              minLength: 1,
              maxLength: 128,
            },
            purpose: {
              type: "string",
              minLength: 1,
              maxLength: 512,
            },
            subjectReference: {
              type: "string",
              minLength: 1,
              maxLength: 512,
            },
            channel: {
              type: "string",
              enum: ["EMAIL", "SMS"],
            },
            destination: {
              type: "string",
              minLength: 1,
              maxLength: 512,
              writeOnly: true,
            },
            bindingReference: {
              type: "string",
              pattern: "^[a-f0-9]{64}$",
              writeOnly: true,
            },
            challengeCode: {
              type: "string",
              pattern: "^CV_[a-f0-9]{64}$",
            },
            generation: {
              type: "integer",
              minimum: 1,
            },
            secret: {
              type: "string",
              minLength: 1,
              maxLength: 512,
              writeOnly: true,
            },
            proof: {
              type: "string",
              pattern: "^[a-f0-9]{64}$",
              writeOnly: true,
            },
            operationReference: {
              type: "string",
              minLength: 1,
              maxLength: 512,
              writeOnly: true,
            },
            expectedRevision: {
              type: "integer",
              minimum: 1,
            },
          },
          oneOf: [
            {
              properties: {
                operation: {
                  enum: ["ISSUE"],
                },
              },
              required: [],
              not: {
                anyOf: [
                  {
                    required: ["challengeCode"],
                  },
                  {
                    required: ["expectedRevision"],
                  },
                  {
                    required: ["generation"],
                  },
                  {
                    required: ["operationReference"],
                  },
                  {
                    required: ["proof"],
                  },
                  {
                    required: ["secret"],
                  },
                ],
              },
            },
            {
              properties: {
                operation: {
                  enum: ["VERIFY"],
                },
              },
              required: ["challengeCode", "generation", "secret"],
              not: {
                anyOf: [
                  {
                    required: ["expectedRevision"],
                  },
                  {
                    required: ["operationReference"],
                  },
                  {
                    required: ["proof"],
                  },
                ],
              },
            },
            {
              properties: {
                operation: {
                  enum: ["CONSUME"],
                },
              },
              required: [
                "challengeCode",
                "generation",
                "proof",
                "operationReference",
              ],
              not: {
                anyOf: [
                  {
                    required: ["expectedRevision"],
                  },
                  {
                    required: ["secret"],
                  },
                ],
              },
            },
            {
              properties: {
                operation: {
                  enum: ["RECEIPT"],
                },
              },
              required: [
                "challengeCode",
                "generation",
                "proof",
                "operationReference",
              ],
              not: {
                anyOf: [
                  {
                    required: ["expectedRevision"],
                  },
                  {
                    required: ["secret"],
                  },
                ],
              },
            },
            {
              properties: {
                operation: {
                  enum: ["REPLACE"],
                },
              },
              required: ["challengeCode", "expectedRevision"],
              not: {
                anyOf: [
                  {
                    required: ["generation"],
                  },
                  {
                    required: ["operationReference"],
                  },
                  {
                    required: ["proof"],
                  },
                  {
                    required: ["secret"],
                  },
                ],
              },
            },
            {
              properties: {
                operation: {
                  enum: ["CANCEL"],
                },
              },
              required: ["challengeCode", "expectedRevision"],
              not: {
                anyOf: [
                  {
                    required: ["generation"],
                  },
                  {
                    required: ["operationReference"],
                  },
                  {
                    required: ["proof"],
                  },
                  {
                    required: ["secret"],
                  },
                ],
              },
            },
          ],
        },
      },
    },
  },
  responses: {
    200: {
      description:
        "Operation-specific private service result; transient secret/proof only for the corresponding successful operation, never raw challenge storage",
    },
    400: {
      description: "Invalid bounded command",
    },
    403: {
      description: "Service/tenant/module/permission or rollout policy refused",
    },
    409: {
      description:
        "Stale generation, consumed proof or conflicting state; do not automatically repeat a business operation",
    },
  },
};
