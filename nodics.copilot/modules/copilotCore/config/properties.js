/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module copilotCore/config/properties
 * @description Defines generated configurable defaults for copilotCore.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
  copilot: {
    core: {
      supportedChannels: ["axis", "storefront", "api"],
      defaultChannel: "axis",
      defaultLocale: "en",
      maximumMessageCharacters: 32000,
      intentPlanning: {
        enabled: false,
        clarificationMessage:
          "Please provide the exact enterprise, invitation, product, price, collection-centre, process definition, instance, task or trigger details, including identifiers, required references and explicit choices. Product creation needs quantity and active true or active false. Process creation needs a graph; instance start needs a new identifier and explicit context; retries need the current attempt. Task completion needs an explicit decision; trigger execution needs an instance identifier and context. I could not prepare a fully supported plan from the supplied values. No business change has been made.",
      },
      conversationContext: {
        journeys: {
          title: "Operation access",
          notice:
            "Current enterprise prerequisites only. Your selected knowledge groups, record and field permissions, domain rules, confirmation and budget are checked when the operation runs.",
          labels: {
            schemaCreate: "Create an allowlisted data record",
            schemaUpdate: "Update an allowlisted data record",
            schemaDelete: "Delete an allowlisted data record",
            definitionCreate: "Create a process definition draft",
            definitionUpdate: "Update a process definition draft",
            definitionPrepare: "Prepare the next process draft",
            definitionValidate: "Validate a process definition",
            definitionPublish: "Publish a process definition",
            definitionDelete: "Delete or archive a process definition",
            instanceStart: "Start a process instance",
            instanceCancel: "Cancel a process instance",
            instanceRetry: "Retry a failed process action",
            instanceCompensate: "Compensate a failed process action",
            triggerCreate: "Create a workflow trigger",
            triggerUpdate: "Update a workflow trigger",
            triggerArchive: "Archive a workflow trigger",
            triggerExecute: "Execute a workflow trigger",
            taskClaim: "Claim a workflow task",
            taskAssign: "Assign a workflow task",
            taskComplete: "Complete a workflow task",
            taskCancel: "Cancel a workflow task",
            knowledge: "Ask about internal knowledge",
            database: "Read business data",
            logs: "Investigate incident logs",
            prepare: "Prepare business changes",
            execute: "Execute an approved change",
            enterprise: "Create an enterprise and employee invitations",
            invitation: "Invite employees to an existing enterprise",
            price: "Create prices for existing products",
            transcript: "Inspect recorded conversations",
            recordedSearch: "Search recorded content",
            retention: "Review retention and legal holds",
            coupon: "Redeem a coupon through Copilot",
            collectionCentre: "Configure collection centres through Copilot",
          },
          states: {
            ADAPTER_REQUIRED: "Not implemented",
            PERMISSION_REQUIRED: "Permission required",
            CONFIGURATION_REQUIRED: "Configuration required",
            SOURCE_REQUIRED: "No available source",
            OWNER_CHECK_REQUIRED: "Owner validation required",
          },
          reasons: {
            ADAPTER_REQUIRED:
              "This Copilot adapter is not implemented. Additional permissions will not enable it.",
            PERMISSION_REQUIRED:
              "One or more independent grants are missing for your current enterprise. A Copilot grant never supplies domain access.",
            CONFIGURATION_REQUIRED:
              "The owning feature is not enabled in the current effective configuration. An administrator must review its approved setup.",
            SOURCE_REQUIRED:
              "No eligible active source is available in the current enterprise context. Hidden source identities are not disclosed.",
            OWNER_CHECK_REQUIRED:
              "Initial prerequisites are present, not final authorization. The owning API checks the actual records, fields and operation before returning data or making a change.",
          },
          steps: {
            schemaCreate:
              "Select the approved DATABASE source and collection, provide every required record field and review it. Business-owned setup forms are excluded.",
            schemaUpdate:
              "Select the approved source and collection, provide the exact code, current revision and changed fields. The native owner rechecks record and field access.",
            schemaDelete:
              "Inspect deletion impact first, then provide the exact code and current revision. Only one allowlisted generated record can be removed and uncertain outcomes use the original receipt.",
            definitionCreate:
              "Supply an explicit definition code, name and complete graph. Workflow validates and creates only a draft after review.",
            definitionUpdate:
              "Supply the exact draft definition and only the fields to replace. The complete graph and policy changes are visible before approval.",
            definitionPrepare:
              "Supply the exact published definition. Workflow copies its latest immutable version into a new editable draft.",
            definitionValidate:
              "Supply the exact draft definition. Validation records owner results but does not publish the definition.",
            definitionPublish:
              "Supply the exact validated draft and review publication. Workflow creates an immutable version and checks the original receipt after uncertainty.",
            definitionDelete:
              "Supply the exact definition. A new draft is deleted, a versioned draft is discarded, and a published definition is archived.",
            instanceStart:
              "Supply the published definition, a new explicit instance code and complete context. Starting can invoke downstream actions.",
            instanceCancel:
              "Supply the exact active instance and reason. Domain-governed review workflows can reject generic cancellation.",
            instanceRetry:
              "Supply the exact failed instance and current incident attempt. Workflow claims the incident before retrying its failed action.",
            instanceCompensate:
              "Supply the exact failed instance and any explicit payload. The domain-owned compensation adapter runs once under receipt recovery.",
            triggerCreate:
              "Supply the exact definition and new trigger identifiers, name, type, status and active choice. Trigger metadata does not create a Cron schedule.",
            triggerUpdate:
              "Supply the exact trigger and changed fields. Review activation and schedule metadata before approval.",
            triggerArchive:
              "Supply the exact trigger and review archival. This does not delete a Cron schedule or cancel existing workflow instances.",
            triggerExecute:
              "Supply the exact trigger, new instance identifier and explicit context. Execution can start downstream domain actions; inspect original evidence after uncertainty.",
            taskClaim:
              "Provide the exact task code and review the claim. Workflow validates the current employee and task policy.",
            taskAssign:
              "Provide the exact task and employee login identifiers. Workflow requires native assignment authority and checks current task state.",
            taskComplete:
              "Provide the exact task and explicit decision. Review before approval; completing a task can advance its workflow and does not prove downstream success.",
            taskCancel:
              "Provide the exact task and cancellation reason. Generic cancellation cannot replace a domain review withdrawal. Inspect original results after uncertainty.",
            knowledge:
              "A knowledge administrator can review group assignment, activation, source exclusions and current index readiness. Select only the groups needed for this conversation.",
            database:
              "Ask the data owner to review collection selection and your record, field and search permissions. An excluded collection cannot be queried through Copilot.",
            logs: "The observability owner must authorize the runtime, service, category and time window. Partial log coverage is not proof that an incident did not occur.",
            prepare:
              "Supply complete business values and review every proposed field. Preparation never creates a business record.",
            execute:
              "Review and approve the current actor-bound confirmation. Expired or changed plans require a new review. After an unknown outcome, inspect owner evidence before another attempt.",
            enterprise:
              "Profile validates enterprise placement and invitation roles. Supply explicit employee roles; pending invitations are not active employee accounts.",
            invitation:
              "Supply the existing enterprise code and each employee email and role. Profile checks access and creates pending invitations; this does not create an enterprise or activate accounts.",
            price:
              "Supply each new price-row code, existing product and price-book references, exact amount, currency and minimum quantity. Pricing checks authoring access; creation does not publish prices.",
            transcript:
              "Select an approved inspection purpose. A durable access receipt is required before content is read; recording-off turns cannot be restored.",
            recordedSearch:
              "Use a bounded time window and literal search term with an approved purpose. Only recorded, enterprise-bound messages are searchable.",
            retention:
              "Legal holds take precedence over expiry. The current review is metadata-only; destructive purge is not implemented or enabled.",
            coupon:
              "Use the secure coupon form to validate, review and confirm fulfillment through Commerce. Inspect the original receipt after an uncertain outcome; never repeat fulfillment or paste coupon secrets into chat.",
            collectionCentre:
              "Prepare explicit collection centres for the current enterprise, review every location and enterprise reference, then confirm. Waste validates and creates the records; switch enterprise context before preparing for another operator.",
          },
        },
        liveReads: {
          open: "Read live evidence",
          title: "Live evidence",
          source: "Source",
          collection: "Collection",
          inspectCollections: "List collections",
          inspectSchema: "View fields",
          inspectCapabilities: "View capabilities",
          search: "Search",
          page: "Page",
          correlation: "Journey correlation ID",
          from: "From (local time)",
          to: "To (local time)",
          submit: "Read in conversation",
          cancel: "Cancel",
          failed:
            "The source is unavailable or its permissions have changed. Close this dialog and refresh the conversation context.",
          database: "Business data",
          logs: "Incident logs",
        },
        groups: "Knowledge context",
        allGroups: "All permitted active groups",
        noGroups: "No knowledge groups selected",
        access: "My access",
        allowed: "Granted",
        denied: "Not granted",
        knowledge: "Internal knowledge",
        prepare: "Prepare changes",
        execute: "Execute approved changes",
        activity: "Enterprise activity",
        permissionRequired:
          "Ask an administrator to review the required Copilot permission for your current enterprise.",
        domainAuthorization:
          "A Copilot grant does not grant access to business records or operations. Each owning API checks your current enterprise, record, field and operation permissions again.",
        noActiveKnowledge:
          "No permitted active knowledge groups are available. An administrator can check enterprise assignments, source restrictions and group activation.",
      },
      workspace: {
        maximumRecentRecords: 12,
        presentation: {
          title: "Copilot Workspace",
          subtitle: "My enterprise activity",
          newConversation: "New conversation",
          details: "Details",
          refresh: "Refresh",
          conversations: "Recent conversations",
          tasks: "Recent requests",
          knowledge: "Knowledge readiness",
          provider: "Model configuration",
          budget: "Token allowance",
          budgetAssigned: "Assigned limit",
          budgetConsumed: "Consumed",
          budgetReserved: "In progress",
          budgetAvailable: "Available",
          budgetPending: "Pending reconciliation",
          budgetReset: "Next reset",
          budgetExhausted: "Capacity exhausted",
          budgetWarning: "Allowance warning",
          budgetUnassigned: "Unassigned",
          attention: "Needs attention",
          attentionEmpty: "No attention items in this window",
          attentionBudgetExhausted: "Token capacity exhausted",
          attentionBudgetWarning: "Token allowance approaching its limit",
          attentionBudgetReconciliation:
            "Token usage is pending reconciliation",
          attentionProviderUnavailable: "Model configuration needs attention",
          attentionKnowledge: "Knowledge freshness needs attention",
          attentionOutcomeUnknown: "Execution outcome requires reconciliation",
          attentionTaskRunning: "Execution in progress",
          attentionApproval: "Prepared or approved change awaiting action",
          attentionTasksUnavailable: "Task queue unavailable",
          recording: "Conversation recording",
          emptyConversations: "No conversations in this context",
          emptyTasks: "No recent tasks",
          untitled: "Untitled conversation",
          search: "Find a recent conversation",
          limitedWindow: "Showing a bounded recent activity window",
          configured: "Configured",
          notConfigured: "Not configured",
          unavailable: "Unavailable",
          healthNotChecked: "Live health not checked",
          recorded: "Recording enabled",
          retentionUnknown: "Retention period not available",
          sourceUnavailable: "Knowledge status unavailable",
          sourceRestricted: "Knowledge status requires permission",
          sourceDisabled: "Knowledge retrieval disabled",
          noSources: "No accessible sources",
          tenant: "Tenant",
          enterprise: "Enterprise",
          noEnterprise: "No enterprise context",
          personal: "Personal",
          stateCompleted: "Completed",
          stateFailed: "Failed",
          stateRunning: "In progress",
          stateCancelled: "Cancelled",
          sourceReady: "Indexed",
          sourcePending: "Pending",
          sourceFailed: "Failed",
          resume: "Resume",
          stateUnknown: "Unknown",
          operations: "Operation catalogue",
          operationImplemented: "Implemented",
          operationAdapterRequired: "Adapter required",
          operationFuture: "Planned",
          operationEmpty: "No accessible operations",
          operationApproval: "Approval required",
        },
      },
      systemPrompt:
        "You are Nodics Copilot for an authenticated BackOffice user. Resolve material ambiguity conversationally before proposing an action. Give concise, accurate help. Never claim that you changed data or executed a tool unless a governed Nodics capability reports success.",
    },
  },
};
