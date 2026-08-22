/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module testimonial/service/DefaultTestimonialBackofficeCapabilityService @description Publishes the concrete testimonial-owned BackOffice capability projection. @layer service @owner testimonial */
const capability = {
    "enabled": true,
    "capabilityId": "customer-engagement-testimonial",
    "displayName": "Testimonial Candidates",
    "category": "organization",
    "icon": "feedback",
    "contractVersion": 1,
    "minimumClientContractVersion": 1,
    "roles": [
        "FUNCTIONAL_CAPABILITY_PROVIDER"
    ],
    "requiredPermissions": [
        "engagement.backoffice.view"
    ],
    "navigation": [
        {
            "id": "testimonial-candidates",
            "parentId": "testimonials-advocacy",
            "label": "Testimonial Candidates",
            "route": "/engagement/testimonial-candidates",
            "icon": "format_quote",
            "order": 530,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.testimonial.read"
            ],
            "workbenchTarget": {
                "moduleName": "testimonial",
                "schemaName": "testimonialCandidate"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "code",
                    "sourceType",
                    "status",
                    "materialRelationship",
                    "capturedAt"
                ],
                "hiddenFields": [
                    "originalText",
                    "provenance",
                    "ownerId",
                    "evidenceReferences"
                ]
            },
            "help": {
                "summary": "Curate provenance-safe candidates while preserving original customer evidence."
            },
            "parentModuleName": "engagementCore"
        },
        {
            "id": "testimonial-editorial",
            "parentId": "testimonials-advocacy",
            "label": "Editorial Versions",
            "route": "/engagement/testimonial-editorial",
            "icon": "edit_note",
            "order": 540,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.testimonial.edit"
            ],
            "workbenchTarget": {
                "moduleName": "testimonial",
                "schemaName": "testimonialVersion"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "candidateCode",
                    "version",
                    "locale",
                    "variant",
                    "status",
                    "approvedAt"
                ],
                "hiddenFields": [
                    "editorialText",
                    "sanitizedText",
                    "mediaCodes"
                ]
            },
            "help": {
                "summary": "Manage immutable editorial versions, customer confirmation, and approval."
            },
            "parentModuleName": "engagementCore"
        },
        {
            "id": "testimonial-consents",
            "parentId": "testimonials-advocacy",
            "label": "Consent & Rights",
            "route": "/engagement/testimonial-consents",
            "icon": "verified_user",
            "order": 550,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.testimonial.read"
            ],
            "workbenchTarget": {
                "moduleName": "testimonial",
                "schemaName": "testimonialConsent"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "candidateCode",
                    "status",
                    "channels",
                    "regions",
                    "policyVersion",
                    "validFrom",
                    "expiresAt",
                    "withdrawnAt"
                ],
                "hiddenFields": [
                    "evidence",
                    "ownerId",
                    "attribution"
                ]
            },
            "help": {
                "summary": "Inspect attribution, channel, region, duration, likeness, and media rights."
            },
            "parentModuleName": "engagementCore"
        },
        {
            "id": "testimonial-publications",
            "parentId": "testimonials-advocacy",
            "label": "Publication Calendar",
            "route": "/engagement/testimonial-publications",
            "icon": "event_available",
            "order": 560,
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "engagement.testimonial.publish"
            ],
            "workbenchTarget": {
                "moduleName": "testimonial",
                "schemaName": "testimonialProjection"
            },
            "workbenchPresentation": {
                "defaultColumns": [
                    "candidateCode",
                    "projectionVersion",
                    "channel",
                    "region",
                    "locale",
                    "status",
                    "scheduledAt",
                    "publishedAt",
                    "expiresAt"
                ],
                "hiddenFields": [
                    "publicText",
                    "attribution"
                ]
            },
            "lifecycleActions": [
                {
                    "id": "emergency-hide",
                    "label": "Emergency hide",
                    "intent": "REJECT",
                    "permission": "engagement.testimonial.act",
                    "ownerModule": "engagementApi",
                    "operationRoute": "/operator/testimonials/:code/actions/EMERGENCY_HIDE",
                    "targetStatuses": [
                        "PREVIEW",
                        "SCHEDULED",
                        "PUBLISHED"
                    ],
                    "order": 10
                },
                {
                    "id": "reconcile",
                    "label": "Reconcile",
                    "intent": "UPDATE",
                    "permission": "engagement.testimonial.act",
                    "ownerModule": "engagementApi",
                    "operationRoute": "/operator/testimonials/:code/actions/RECONCILE",
                    "targetStatuses": [
                        "PREVIEW",
                        "SCHEDULED",
                        "PUBLISHED",
                        "HIDDEN",
                        "WITHDRAWN",
                        "EXPIRED",
                        "FAILED"
                    ],
                    "order": 20
                }
            ],
            "help": {
                "summary": "Preview, schedule, publish, hide, expire, and repair testimonial projections through domain and nPublish contracts."
            },
            "parentModuleName": "engagementCore"
        }
    ]
};

module.exports = {
    /** Registers this module BackOffice capability provider. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('testimonial', this);
        return Promise.resolve(true);
    },
    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns this module owned BackOffice capability contract. */
    getCapability: function () { return JSON.parse(JSON.stringify(capability)); }
};
