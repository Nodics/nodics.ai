/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module axis/data/init-v001/records/axis/axisCmsComponentData
 * @description Provides client-safe content for initial Axis employee authentication and dashboard components.
 * @layer data
 * @owner axis
 */
const AXIS_FUNCTIONAL_MODULE = 'nodics.platform';
const withAxisOwnership = records => {
    Object.keys(records).forEach(key => {
        records[key].functionalModule = AXIS_FUNCTIONAL_MODULE;
        records[key].activationMode = 'PLATFORM_ACTIVE';
    });
    return records;
};

module.exports = withAxisOwnership({
    "record0": {
        "code": "axisAuthenticationShowcaseComponent",
        "typeCode": "axisAuthenticationShowcaseComponentType",
        "accessMode": "PUBLIC",
        "properties": {
            "eyebrow": "Nodics enterprise operations",
            "title": "One governed workspace for every business capability.",
            "message": "Discover active modules, operate secure workflows, and keep every action inside its authoritative Nodics contract.",
            "highlights": [
                "Employee-only access",
                "Direct module connectivity",
                "Contract-governed operations"
            ],
            "logoAsset": "axis-brand-mark",
            "backgroundAsset": "axis-auth-microservices"
        },
        "active": true
    },
    "record1": {
        "code": "axisBrandComponent",
        "typeCode": "axisBrandComponentType",
        "accessMode": "PUBLIC",
        "properties": {
            "productName": "Nodics Axis",
            "tagline": "Business operations, connected.",
            "logoAsset": "axis-brand-mark",
            "displayMode": "authentication"
        },
        "active": true
    },
    "record2": {
        "code": "axisLoginIntroductionComponent",
        "typeCode": "axisMessageComponentType",
        "accessMode": "PUBLIC",
        "properties": {
            "title": "Welcome back",
            "message": "Sign in with your employee account to access Nodics Axis.",
            "tone": "default"
        },
        "active": true
    },
    "record3": {
        "code": "axisEmployeeLoginFormComponent",
        "typeCode": "axisEmployeeLoginFormComponentType",
        "accessMode": "PUBLIC",
        "properties": {
            "title": "Employee sign in",
            "usernameLabel": "Username",
            "usernamePlaceholder": "Enter your username",
            "passwordLabel": "Password",
            "passwordPlaceholder": "Enter your password",
            "submitLabel": "Sign in"
        },
        "active": true
    },
    "record4": {
        "code": "axisForgotPasswordLinkComponent",
        "typeCode": "axisLinkComponentType",
        "accessMode": "PUBLIC",
        "properties": {
            "label": "Forgot password?",
            "route": "/forgot-password"
        },
        "active": true
    },
    "record5": {
        "code": "axisLoginSecurityComponent",
        "typeCode": "axisMessageComponentType",
        "accessMode": "PUBLIC",
        "properties": {
            "title": "Employee access only",
            "message": "Customer accounts cannot access this application.",
            "tone": "security"
        },
        "active": true
    },
    "record6": {
        "code": "axisForgotPasswordIntroductionComponent",
        "typeCode": "axisMessageComponentType",
        "accessMode": "PUBLIC",
        "properties": {
            "title": "Recover employee access",
            "message": "Enter your employee account identifier to request recovery instructions.",
            "tone": "default"
        },
        "active": true
    },
    "record7": {
        "code": "axisEmployeeRecoveryFormComponent",
        "typeCode": "axisEmployeeRecoveryFormComponentType",
        "accessMode": "PUBLIC",
        "properties": {
            "title": "Reset password",
            "identifierLabel": "Employee username or email",
            "identifierPlaceholder": "Enter your employee identifier",
            "submitLabel": "Send recovery instructions",
            "successMessage": "If the account is eligible, recovery instructions will be sent."
        },
        "active": true
    },
    "record8": {
        "code": "axisBackToLoginLinkComponent",
        "typeCode": "axisLinkComponentType",
        "accessMode": "PUBLIC",
        "properties": {
            "label": "Back to sign in",
            "route": "/login"
        },
        "active": true
    },
    "record9": {
        "code": "axisLegalComponent",
        "typeCode": "axisMessageComponentType",
        "accessMode": "PUBLIC",
        "properties": {
            "title": "Authorized use",
            "message": "Use of Nodics Axis is limited to authorized employees.",
            "tone": "muted"
        },
        "active": true
    },
    "record10": {
        "code": "axisLockShowcaseComponent",
        "typeCode": "axisAuthenticationShowcaseComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "eyebrow": "Protected employee workspace",
            "title": "Your Axis workspace is locked, not signed out.",
            "message": "Re-enter your employee password to continue without exposing operational pages while you are away.",
            "highlights": [
                "Session remains memory-only",
                "Profile verifies every unlock",
                "Sign out is always available"
            ],
            "logoAsset": "axis-brand-mark",
            "backgroundAsset": "axis-auth-microservices"
        },
        "active": true
    },
    "record11": {
        "code": "axisLockBrandComponent",
        "typeCode": "axisBrandComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "productName": "Nodics Axis",
            "tagline": "Secure employee workspace",
            "logoAsset": "axis-brand-mark",
            "displayMode": "authentication"
        },
        "active": true
    },
    "record12": {
        "code": "axisLockIntroductionComponent",
        "typeCode": "axisMessageComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "title": "Screen locked",
            "message": "Enter your password to unlock this employee session.",
            "tone": "default"
        },
        "active": true
    },
    "record13": {
        "code": "axisEmployeeLockFormComponent",
        "typeCode": "axisEmployeeLockFormComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "title": "Unlock Axis",
            "employeeLabel": "Signed in as",
            "passwordLabel": "Password",
            "passwordPlaceholder": "Enter your password",
            "submitLabel": "Unlock",
            "signOutLabel": "Not you? Sign out"
        },
        "active": true
    },
    "record14": {
        "code": "axisLockLegalComponent",
        "typeCode": "axisMessageComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "title": "Protected session",
            "message": "Unlock attempts are verified by the Profile authentication authority.",
            "tone": "muted"
        },
        "active": true
    },
    "record15": {
        "code": "axisAssistantHeaderComponent",
        "typeCode": "axisBrandComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "productName": "Axis Assistant",
            "tagline": "Governed conversational operations",
            "logoAsset": "axis-brand-mark",
            "displayMode": "workspace"
        },
        "active": true
    },
    "record16": {
        "code": "axisAssistantWorkspaceComponent",
        "typeCode": "axisAssistantWorkspaceComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "title": "How can I help?",
            "welcomeMessage": "Ask about authorized Nodics business data or operations.",
            "inputPlaceholder": "Describe what you want to do",
            "submitLabel": "Send",
            "stopLabel": "Stop",
            "emptyState": "Responses, tool activity, confirmations, and workflow progress will appear here.",
            "employeeLabel": "You",
            "assistantLabel": "Axis Assistant",
            "workingLabel": "Working on your request",
            "cancellingLabel": "Stopping the current request",
            "errorLabel": "The request could not be completed",
            "historyLabel": "Conversations",
            "newConversationLabel": "New conversation",
            "noConversationsLabel": "No saved conversations yet",
            "loadMoreLabel": "Load more",
            "clarificationTitle": "More information required",
            "clarificationSubmitLabel": "Continue",
            "toolPlanTitle": "Proposed governed action",
            "confirmationTitle": "Review and confirm",
            "rejectLabel": "Reject",
            "approveLabel": "Approve action",
            "executeLabel": "Execute approved action",
            "confirmationExpiredLabel": "This confirmation has expired. Submit the request again.",
            "confirmationCompletedLabel": "The approved action completed successfully.",
            "toolPlannedLabel": "Action prepared",
            "toolRunningLabel": "Action in progress",
            "toolSucceededLabel": "Action completed",
            "toolFailedLabel": "Action failed",
            "citationsTitle": "Sources",
            "noCitationsLabel": "No sources were supplied for this response.",
            "usageTitle": "AI usage",
            "inputTokensLabel": "Input",
            "outputTokensLabel": "Output",
            "cachedTokensLabel": "Cached input",
            "reasoningTokensLabel": "Reasoning",
            "embeddingTokensLabel": "Embedding",
            "reconciliationLabel": "Accounting status"
        },
        "active": true
    },
    "record17": {
        "code": "axisSchemaWorkbenchHeaderComponent",
        "typeCode": "axisBrandComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "productName": "Schema Workbench",
            "tagline": "Governed business data administration",
            "logoAsset": "axis-brand-mark",
            "displayMode": "workspace"
        },
        "active": true
    },
    "record18": {
        "code": "axisSchemaWorkbenchComponent",
        "typeCode": "axisSchemaWorkbenchComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "title": "Business data",
            "introduction": "Find an authorized data type, review its records, and use only the operations allowed by its owning module.",
            "schemaSearchLabel": "Find a data type",
            "schemaSearchPlaceholder": "Search by data type or module",
            "schemasLabel": "Available data types",
            "recordsLabel": "Records",
            "noSchemasLabel": "No authorized data types are currently available.",
            "noRecordsLabel": "No matching records were found.",
            "selectSchemaLabel": "Select a data type to view its records.",
            "loadingLabel": "Loading authorized business data",
            "retryLabel": "Try again",
            "createLabel": "Create",
            "cancelLabel": "Cancel",
            "savingLabel": "Saving",
            "selectExistingLabel": "Select existing",
            "createRelatedLabel": "Create related",
            "addToDraftLabel": "Add to draft",
            "removeRelatedLabel": "Close",
            "noRelatedRecordsLabel": "No related records are currently available.",
            "relatedSearchLabel": "Search related records",
            "missingReferencePropertyLabel": "Related records were found, but none expose the required reference property: {property}.",
            "actionsLabel": "Actions",
            "viewLabel": "View",
            "editLabel": "Edit",
            "updateLabel": "Update",
            "updatingLabel": "Updating",
            "closeLabel": "Close",
            "trueLabel": "Yes",
            "falseLabel": "No",
            "deleteLabel": "Delete",
            "deletingLabel": "Deleting",
            "confirmDeleteLabel": "Delete record",
            "deleteTitle": "Delete this record?",
            "deleteWarning": "This action cannot be undone. Nodics will reject the request when authorization, ownership, references, or business rules do not allow deletion.",
            "tenantLabel": "Tenant",
            "enterpriseLabel": "Enterprise",
            "searchRecordsLabel": "Search records",
            "searchRecordsPlaceholder": "Enter a code or other searchable value",
            "moduleLabel": "Owning module",
            "availableOperationsLabel": "Available operations",
            "resultsLabel": "records",
            "pageSizeLabel": "Records per page",
            "paginationLabel": "Record pages",
            "filterBuilderLabel": "Advanced filters",
            "addConditionLabel": "Add condition",
            "addGroupLabel": "Add group",
            "applyFiltersLabel": "Apply filters",
            "clearFiltersLabel": "Clear filters",
            "filterFieldLabel": "Field",
            "filterOperatorLabel": "Operator",
            "filterValueLabel": "Value",
            "filterMatchLabel": "Match",
            "removeFilterLabel": "Remove",
            "requestPreviewLabel": "Request preview",
            "addFavouriteLabel": "Add favourite",
            "removeFavouriteLabel": "Remove favourite",
            "gridSettingsLabel": "Grid settings",
            "savedViewNameLabel": "View name",
            "saveViewLabel": "Save view",
            "selectVisibleRecordsLabel": "Select visible records",
            "selectRecordLabel": "Select record",
            "selectedRecordsLabel": "records selected",
            "bulkDeleteLabel": "Delete selected",
            "bulkDeletingLabel": "Deleting selected...",
            "deleteImpactLoadingLabel": "Checking related records before deletion...",
            "deleteImpactBlockedLabel": "Deletion is blocked by related records.",
            "deleteImpactClearLabel": "No governed references currently block deletion.",
            "editRelatedLabel": "Edit related"
        },
        "active": true
    },
    "record19": {
        "code": "axisMediaManagementWorkspaceComponent",
        "typeCode": "axisMediaManagementWorkspaceComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "title": "Media Management",
            "introduction": "Operate media files, folder policy, format policy, usage references, and delivery metadata through media-owned contracts.",
            "backendAuthority": "media owns storage, upload, delivery, folders, formats, media sets, permissions, and safe provider metadata. nImport and nExport compose media for file-backed data flows.",
            "customizationBoundary": "Customize presentation by replacing this CMS component or Axis renderer in a project layer. Keep storage rules, schemas, permissions, and import/export execution in their owning Nodics modules."
        },
        "active": true
    },
    "record20": {
        "code": "axisPlatformDashboardSummaryComponent",
        "typeCode": "axisPlatformSummaryComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "title": "Platform dashboard",
            "introduction": "Review protected Core and Platform availability before enabling optional runtime modules.",
            "primaryMetricLabel": "Registered modules",
            "secondaryMetricLabel": "Available modules",
            "emptyState": "Only protected Platform modules are active in this project."
        },
        "active": true
    },
    "record21": {
        "code": "axisPlatformInitializeComponent",
        "typeCode": "axisPlatformInitializeComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "title": "Initialize platform data",
            "introduction": "Run governed init, core, and sample data imports only for modules that are registered and active.",
            "disabledMessage": "Initialization execution is disabled until the governed backend orchestration API is active.",
            "previewLabel": "Preview initialization",
            "executeLabel": "Run initialization"
        },
        "active": true
    },
    "record22": {
        "code": "axisRuntimeModulesRegistryComponent",
        "typeCode": "axisRuntimeModulesRegistryComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "title": "Runtime modules",
            "introduction": "Register, activate, deactivate, or deregister optional functional modules for this project.",
            "registeredLabel": "Registered",
            "availableLabel": "Available",
            "protectedLabel": "Protected",
            "activeLabel": "Active"
        },
        "active": true
    },
    "record23": {
        "code": "axisDashboardOverviewTabMetrics",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "metrics",
            "title": "Application snapshot",
            "published": "Published",
            "approval": "Awaiting approval",
            "preparing": "Applications in preparation",
            "available": "Available to set up",
            "unknown": "Status unavailable",
            "configuration": "Configuration notices",
            "checked": "application statuses verified",
            "incomplete": "Some statuses are unavailable or stale. Counts show verified responses only.",
            "blocked": "Needs attention"
        },
        "active": true
    },
    "record24": {
        "code": "axisDashboardOverviewTabApplications",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "applications",
            "title": "Your applications",
            "published": "Published",
            "approval": "Awaiting approval",
            "preparing": "In preparation",
            "available": "Available to set up",
            "unknown": "Status unavailable",
            "previous": "Previous applications",
            "next": "Next applications",
            "steps": "preparation steps verified",
            "review": "Review setup",
            "empty": "No applications are available for your account.",
            "blocked": "Needs attention"
        },
        "active": true
    },
    "record25": {
        "code": "axisDashboardOverviewTabReadiness",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "readiness",
            "title": "Publication progress",
            "published": "Published",
            "approval": "Awaiting approval",
            "preparing": "In preparation",
            "available": "Available to set up",
            "unknown": "Status unavailable",
            "description": "Application publication only. Operational readiness and documentation are reported separately.",
            "blocked": "Needs attention"
        },
        "active": true
    },
    "record26": {
        "code": "axisDashboardOverviewTabAttention",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "attention",
            "title": "Needs your attention",
            "unknown": "Status could not be verified. Refresh or review the owning service.",
            "review": "Review setup",
            "empty": "No pending decisions reported by the current status checks.",
            "blocked": "Needs attention"
        },
        "active": true
    },
    "record27": {
        "code": "axisFrameworkOverviewTab",
        "typeCode": "axisDashboardTabComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "view": "overview",
            "title": "Overview",
            "description": "Business records, domain workspaces and decisions across your project.",
            "layout": "framework"
        },
        "subComponents": [
            {
                "target": "axisFrameworkOverviewContext",
                "slot": "sections",
                "index": 10,
                "active": true
            },
            {
                "target": "axisFrameworkOverviewPulse",
                "slot": "sections",
                "index": 20,
                "active": true
            },
            {
                "target": "axisFrameworkOverviewDomains",
                "slot": "sections",
                "index": 30,
                "active": true
            },
            {
                "target": "axisFrameworkOverviewWork",
                "slot": "sections",
                "index": 40,
                "active": true
            },
            {
                "target": "axisFrameworkOverviewActivity",
                "slot": "sections",
                "index": 50,
                "active": true
            },
            {
                "target": "axisFrameworkOverviewExceptions",
                "slot": "sections",
                "index": 60,
                "active": true
            }
        ],
        "active": true
    },
    "record28": {
        "code": "axisDashboardApplicationsTabSettings",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "settings",
            "title": "Review environment settings"
        },
        "active": true
    },
    "record29": {
        "code": "axisDashboardApplicationsTabCatalogue",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "catalogue",
            "title": "Applications & services"
        },
        "active": true
    },
    "record30": {
        "code": "axisDashboardApplicationsTabDetails",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "details",
            "title": "Setup plan"
        },
        "active": true
    },
    "record31": {
        "code": "axisDashboardApplicationsTab",
        "typeCode": "axisDashboardTabComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "view": "applications",
            "title": "Applications",
            "description": "Application publication, readiness and guided setup in one place.",
            "layout": "summary"
        },
        "subComponents": [
            {
                "target": "axisDashboardOverviewTabMetrics",
                "slot": "sections",
                "index": 10,
                "active": true
            },
            {
                "target": "axisDashboardApplicationsTabSettings",
                "slot": "sections",
                "index": 20,
                "active": true
            },
            {
                "target": "axisDashboardApplicationsTabCatalogue",
                "slot": "sections",
                "index": 30,
                "active": true
            },
            {
                "target": "axisDashboardOverviewTabApplications",
                "slot": "sections",
                "index": 40,
                "active": true
            },
            {
                "target": "axisDashboardOverviewTabReadiness",
                "slot": "sections",
                "index": 50,
                "active": true
            },
            {
                "target": "axisDashboardOverviewTabAttention",
                "slot": "sections",
                "index": 60,
                "active": true
            },
            {
                "target": "axisDashboardOverviewTabDocumentation",
                "slot": "sections",
                "index": 70,
                "active": true
            },
            {
                "target": "axisDashboardApplicationsTabDetails",
                "slot": "sections",
                "index": 80,
                "active": true
            },
            {
                "target": "axisDashboardOverviewTabOperations",
                "slot": "sections",
                "index": 90,
                "active": true
            }
        ],
        "active": true
    },
    "record32": {
        "code": "axisDashboardTechnicalTabContext",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "context",
            "title": "Runtime context"
        },
        "active": true
    },
    "record33": {
        "code": "axisDashboardTechnicalTabMetrics",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "metrics",
            "title": "Technical signals",
            "blocked": "Needs attention"
        },
        "active": true
    },
    "record34": {
        "code": "axisDashboardTechnicalTabReceipts",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "receipts",
            "title": "Repair results"
        },
        "active": true
    },
    "record35": {
        "code": "axisDashboardTechnicalTabRecovery",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "recovery",
            "title": "Go-live recovery"
        },
        "active": true
    },
    "record36": {
        "code": "axisDashboardTechnicalTabBlockers",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "blockers",
            "title": "Fix these first"
        },
        "active": true
    },
    "record37": {
        "code": "axisDashboardTechnicalTabWorkspaces",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "workspaces",
            "title": "Operational workspaces"
        },
        "active": true
    },
    "record38": {
        "code": "axisDashboardTechnicalTabTimeline",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "timeline",
            "title": "Readiness timeline"
        },
        "active": true
    },
    "record39": {
        "code": "axisDashboardTechnicalTabFootnotes",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "footnotes",
            "title": "Runtime inventory"
        },
        "active": true
    },
    "record40": {
        "code": "axisDashboardTechnicalTab",
        "typeCode": "axisDashboardTabComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "view": "technical",
            "title": "Technical overview",
            "description": "Runtime health, readiness and operational workspaces.",
            "presentation": "visual"
        },
        "subComponents": [
            {
                "target": "axisDashboardTechnicalTabContext",
                "slot": "sections",
                "index": 10,
                "active": true
            },
            {
                "target": "axisDashboardTechnicalTabMetrics",
                "slot": "sections",
                "index": 20,
                "active": true
            },
            {
                "target": "axisDashboardTechnicalTabReceipts",
                "slot": "sections",
                "index": 30,
                "active": true
            },
            {
                "target": "axisDashboardTechnicalTabRecovery",
                "slot": "sections",
                "index": 40,
                "active": true
            },
            {
                "target": "axisDashboardTechnicalTabBlockers",
                "slot": "sections",
                "index": 50,
                "active": true
            },
            {
                "target": "axisDashboardTechnicalTabWorkspaces",
                "slot": "sections",
                "index": 60,
                "active": true
            },
            {
                "target": "axisDashboardTechnicalTabTimeline",
                "slot": "sections",
                "index": 70,
                "active": true
            },
            {
                "target": "axisDashboardTechnicalTabFootnotes",
                "slot": "sections",
                "index": 80,
                "active": true
            }
        ],
        "active": true
    },
    "record41": {
        "code": "axisFrameworkDashboardWorkspaceComponent",
        "typeCode": "axisDashboardWorkspaceComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "title": "Dashboard",
            "defaultView": "overview"
        },
        "subComponents": [
            {
                "target": "axisFrameworkOverviewTab",
                "slot": "tabs",
                "index": 10,
                "active": true
            },
            {
                "target": "axisDashboardApplicationsTab",
                "slot": "tabs",
                "index": 20,
                "active": true
            },
            {
                "target": "axisDashboardTechnicalTab",
                "slot": "tabs",
                "index": 30,
                "active": true
            }
        ],
        "active": true
    },
    "record42": {
        "code": "axisDashboardOverviewTabOperations",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "operations",
            "ready": "Ready",
            "needsAttention": "Needs attention",
            "unknown": "Not verified",
            "areas": {
                "runtimeCommunication": {
                    "title": "Connected services",
                    "metric": "serverCount",
                    "label": "reported runtime servers"
                },
                "imports": {
                    "title": "Business data",
                    "metric": "releaseCount",
                    "label": "available data releases"
                },
                "approval": {
                    "title": "Approval workload",
                    "metric": "pendingApprovalCount",
                    "label": "pending application approvals"
                },
                "media": {
                    "title": "Media library",
                    "metric": "mediaObjectCount",
                    "label": "reported media objects"
                },
                "search": {
                    "title": "Search & discovery",
                    "metric": "initializedEngineCount",
                    "label": "initialized search engines"
                },
                "assistant": {
                    "title": "Knowledge & assistance",
                    "metric": "indexedSourceCount",
                    "label": "indexed knowledge sources"
                }
            },
            "title": "Operational pulse",
            "checked": "Last assessed",
            "details": "reported issues",
            "review": "Open workspace",
            "empty": "Operational evidence is not available. No healthy status has been assumed."
        },
        "active": true
    },
    "record43": {
        "code": "axisDashboardOverviewTabDocumentation",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "documentation",
            "title": "Documentation & guidance",
            "published": "Published",
            "approval": "Awaiting approval",
            "preparing": "In preparation",
            "available": "Available to install",
            "blocked": "Needs attention",
            "unknown": "Status unavailable",
            "review": "Review documentation",
            "empty": "No documentation packs are available for your account.",
            "route": "/setup-accelerators"
        },
        "active": true
    },
    "record44": {
        "code": "axisFrameworkOverviewContext",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "context",
            "title": "Your business at a glance",
            "scope": "Current enterprise scope · Authorised business data",
            "refresh": "Refresh business overview",
            "taskNavigationRef": "publish:publishing-approval-tasks",
            "search": "Find a dashboard or workspace",
            "openDashboard": "Open workspace",
            "allViews": "All views",
            "close": "Close workspace directory",
            "destinations": "available views",
            "records": "accessible records",
            "unavailable": "Data unavailable",
            "updated": "Updated",
            "noMetrics": "No business record snapshots are available for your current access.",
            "noDomains": "No business dashboards are available for your current access.",
            "noResults": "No matching dashboards or workspaces.",
            "workUnavailable": "Work summaries are unavailable for this scope. Open the authorised workspace or refresh to try again.",
            "openWork": "Open work queue",
            "escalated": "escalated",
            "overdue": "overdue in this sample",
            "due": "Due",
            "noTasks": "No open tasks in the current sample.",
            "bounded": "Recent authorised sample, not an organisation-wide total. Up to 25 records per owner query.",
            "observedTasks": "tasks observed",
            "observedProcesses": "processes observed",
            "noActivity": "No task activity was returned for this scope.",
            "noExceptions": "No process exceptions in the current sample."
        },
        "active": true
    },
    "record45": {
        "code": "axisFrameworkOverviewPulse",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "pulse",
            "title": "Business record snapshot",
            "description": "Current accessible records from the owning workspaces. Authoring content is not a count of published content.",
            "navigationRefs": [
                "order:orders",
                "cms:sites",
                "cms:pages",
                "editorial:editorial-articles",
                "media:media"
            ]
        },
        "active": true
    },
    "record46": {
        "code": "axisFrameworkOverviewDomains",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "domains",
            "title": "Your business dashboards",
            "description": "Open a domain workspace or go straight to its business views.",
            "excludedGroups": [
                "workspace",
                "system-integrations",
                "documentation",
                "publishing",
                "search-discovery",
                "administration"
            ]
        },
        "active": true
    },
    "record47": {
        "code": "axisFrameworkOverviewWork",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "work",
            "title": "Decisions & work",
            "description": "Open and escalated tasks in your authorised queue, with overdue work first."
        },
        "active": true
    },
    "record48": {
        "code": "axisFrameworkOverviewActivity",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "activity",
            "title": "Work activity",
            "description": "Status distribution of the most recently retrieved Process tasks."
        },
        "active": true
    },
    "record49": {
        "code": "axisFrameworkOverviewExceptions",
        "typeCode": "axisDashboardSectionComponentType",
        "accessMode": "AUTHENTICATED",
        "properties": {
            "kind": "exceptions",
            "title": "Business process exceptions",
            "description": "Recent owner-reported exceptions. Review their status and evidence in the work queue."
        },
        "active": true
    }
});
