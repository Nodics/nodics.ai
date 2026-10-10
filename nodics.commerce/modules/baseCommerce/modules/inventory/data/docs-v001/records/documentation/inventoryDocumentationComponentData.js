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
    "code": "nodicsDocsComponentinventoryStockManagement",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "inventory.stock-management",
      "title": "Inventory and Stock Management",
      "route": "/docs/framework/inventory-stock-management",
      "section": "inventory-and-stock-management",
      "sectionTitle": "Inventory and Stock Management",
      "group": "inventory-and-stock-management",
      "groupTitle": "Inventory and Stock Management",
      "parentId": "inventory-and-stock-management",
      "hierarchyPath": [
        "Inventory and Stock Management",
        "Inventory and Stock Management"
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
      "summary": "Inventory balances, stock movements, reservations, warehouse relationships, availability summaries, and checkout protection.",
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
        "commerce.cart-order",
        "catalog.product-discovery-management",
        "fulfillment.shipping-management",
        "promotion.campaigns-coupon-issuance",
        "cart.customer-intent-calculation",
        "digital.purchase-delivery-reveal"
      ],
      "sourceEvidence": [
        "../../../../../nodics.docs/data/manifest.json",
        "../../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service",
        "src/service/defaultInventoryReservationOperationService.js",
        "src/service/defaultInventoryOpeningReceiptService.js",
        "src/service/defaultInventoryOperationService.js",
        "test/inventoryCheckoutReservationContract.test.js",
        "test/inventoryReturnAuthorityContract.test.js",
        "src/service/defaultInventoryPhysicalReversalService.js",
        "../../../fulfillment/modules/fulfillmentCore/src/service/defaultPhysicalOrderReversalService.js",
        "../../../checkout/modules/order/src/service/defaultOrderRefundRecoveryService.js",
        "../../../fulfillment/modules/fulfillmentCore/test/physicalOrderReversalContract.test.js"
      ],
      "visualRequirements": [
        "diagram",
        "configuration-table",
        "code-example",
        "troubleshooting-matrix",
        "table"
      ],
      "searchKeywords": [
        "opening-stock-data-pack",
        "inventory-and-stock-management",
        "stock-availability-and-reservation",
        "atomic-reservation",
        "return-authority",
        "compensation-required"
      ],
      "topicKeywords": [
        "Inventory and Stock Management",
        "Stock Availability and Reservation",
        "atomic-reservation",
        "return-authority",
        "compensation-required"
      ],
      "headings": [
        {
          "text": "Opening stock supplied by business data packs",
          "anchor": "inventory-opening-stock-packs",
          "level": 2
        },
        {
          "text": "Business context",
          "anchor": "inventoryStockManagement-1-business-context",
          "level": 2
        },
        {
          "text": "Journey and ownership",
          "anchor": "inventoryStockManagement-2-journey-and-ownership",
          "level": 2
        },
        {
          "text": "Data and configuration detail",
          "anchor": "inventoryStockManagement-3-data-and-configuration-detail",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "inventoryStockManagement-4-customization-and-extension",
          "level": 2
        },
        {
          "text": "Operations and governance",
          "anchor": "inventoryStockManagement-5-operations-and-governance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "inventoryStockManagement-6-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "inventoryStockManagement-7-verification",
          "level": 2
        },
        {
          "text": "Current implementation coverage",
          "anchor": "inventoryStockManagement-8-current-implementation-coverage",
          "level": 2
        },
        {
          "text": "Atomic physical stock holds during Checkout",
          "anchor": "inventory-checkout-atomic-reservations",
          "level": 2
        },
        {
          "text": "Return authority is separate from hold release",
          "anchor": "inventory-return-authority-gate",
          "level": 2
        },
        {
          "text": "Customize and verify stock recovery",
          "anchor": "inventory-reservation-customization",
          "level": 2
        },
        {
          "text": "Reviewed physical shipment, cancellation and return stock effects",
          "anchor": "inventory-reviewed-physical-stock-effects",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 2,
          "text": "Opening stock supplied by business data packs",
          "anchor": "inventory-opening-stock-packs"
        },
        {
          "kind": "paragraph",
          "text": "A ready-to-run accelerator or reference application can supply opening intake beside products, prices, promotions, CMS records and their assets. The pack owns the sample quantities and product references; Inventory owns the stock operation. Documentation remains independently selectable. Importing a catalog does not create stock, and a data file must never overwrite available, reserved or allocated balances. The existing coordinated application setup processes explicit Online intake contributions only after publication prerequisites, using the original authorized operator."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Pack[Business sample pack] --> Catalog[Products and warehouse policy]\n  Catalog --> Approval[Existing publication approvals]\n  Approval --> Online[Activated Store policy]\n  Pack --> Intake[Immutable opening intake instructions]\n  Online --> Owner[Inventory admission]\n  Intake --> Owner\n  Owner --> Atomic[Atomic first receipt transaction]\n  Atomic --> Balance[Initial balance]\n  Atomic --> Movement[RECEIPT movement]\n  Atomic --> Receipt[Original intake receipt]\n  Receipt --> Replay[Repeat verifies evidence without replenishing stock]"
        },
        {
          "kind": "table",
          "headers": [
            "Responsibility",
            "Owner",
            "Evidence required"
          ],
          "rows": [
            [
              "Sample quantities and SKU references",
              "Owning business pack",
              "Explicit local/demo contribution with immutable version and checksum"
            ],
            [
              "Source validation and installation history",
              "nImport",
              "Selected DATA_RELEASE and current byte qualification; no arbitrary paths"
            ],
            [
              "First balance and movement",
              "Inventory",
              "Human commerce.inventory.operate permission; activated Product and warehouse scope; atomic transaction"
            ],
            [
              "Repeated import",
              "Inventory and nImport",
              "Original intake digest and movement; live quantities may have changed through sales"
            ],
            [
              "Customer purchase and reservation",
              "Cart, Checkout and Inventory",
              "Actual customer journey; no seeded payment, Order or ownership"
            ],
            [
              "Documentation",
              "Capability documentation pack",
              "Stable references; no forced import alongside business samples"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "For developers and AI tools, declare an EXPLICIT sample DATA_RELEASE using installer INVENTORY_OPENING_RECEIPTS, lifecycle OPERATIONAL_VERSIONED and destination COMMERCE. Declare inventoryOpening.json with contractVersion 1 and receipts containing exactly code, storeCode, locale, warehouseCode, productCode, variantCode, sku, quantity and referenceCode. The default limit is 1000 unique warehouse/SKU receipts; quantities are positive whole-unit strings. Tenant, enterprise and actor come from authentication, never the file. Later-layer policy overrides may narrow admission but cannot replace Inventory persistence or skip source/permission checks."
        },
        {
          "kind": "table",
          "headers": [
            "Scenario",
            "Expected result",
            "Recovery"
          ],
          "rows": [
            [
              "First intake of 40 units",
              "Balance, RECEIPT movement and private original receipt commit together",
              "Verify owner receipt before starting checkout"
            ],
            [
              "Repeat after three units sell",
              "Original receipt returned; live available quantity remains 37",
              "No replenishment or revision reset"
            ],
            [
              "Movement write fails before commit",
              "Transaction rolls back; no partial sellable balance",
              "Restore owner persistence and use the same exact contribution"
            ],
            [
              "Commit acknowledgement is lost",
              "Read original receipt and movement; never blindly add quantity again",
              "Unproved outcomes remain failures"
            ],
            [
              "Different intake for existing warehouse/SKU",
              "Conflict; existing balance is not replaced",
              "Use Inventory reconciliation or subsequent receiving, not a new opening key"
            ],
            [
              "Provider lacks atomic transactions",
              "Read-only preflight blocker and no stock writes",
              "Qualify supported database topology; flags cannot grant atomicity"
            ],
            [
              "Wrong tenant, enterprise, Store policy or permission",
              "Owner rejection before mutation",
              "Correct authoritative scope or obtain normal operator permission"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "A pack is not one large database transaction: each receipt is atomic, the full input set is checked before writes, and a later failure does not erase earlier receipts. MongoDB requires a genuinely transaction-capable replica set or sharded topology. Source tests prove default and override contracts, rollback, races and recovery using independent persistence ports; only installed provider qualification and the complete Commerce customer journey prove live readiness. Never mark checkout, payment or Order lifecycle accepted merely because a pack is CURRENT."
        },
        {
          "kind": "paragraph",
          "text": "Inventory balances, stock movements, reservations, warehouse relationships, availability summaries, and checkout protection. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs."
        },
        {
          "kind": "paragraph",
          "text": "A customer promise is only trustworthy when product availability, reservation, release, and fulfillment handoff are accurate under concurrency. Inventory owns balances, movements, reservations, availability summaries, and stock evidence. Checkout asks Inventory for reservation decisions instead of guessing stock from product data."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context",
          "anchor": "inventoryStockManagement-1-business-context"
        },
        {
          "kind": "paragraph",
          "text": "For a business user, this topic answers what decision can be made, which operational journey is supported, and what risk is reduced. The practical value is faster delivery without losing governance: teams can understand the current capability, decide whether it applies to their project, and know when Axis, Nexus, content catalog, workflow, or runtime services are involved."
        },
        {
          "kind": "paragraph",
          "text": "For beginners, the mental model is simple: the page title is the business capability, the table identifies who owns each part, and the diagram shows how a request or change flows. A reader should not need source-code knowledge to understand the journey, but the developer path is still available when customization is needed."
        },
        {
          "kind": "table",
          "headers": [
            "Business question",
            "Answer for this topic"
          ],
          "rows": [
            [
              "What problem does it solve?",
              "A customer promise is only trustworthy when product availability, reservation, release, and fulfillment handoff are accurate under concurrency."
            ],
            [
              "Who uses it?",
              "Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools."
            ],
            [
              "What changes can it support?",
              "Inventory owns balances, movements, reservations, availability summaries, and stock evidence. Checkout asks Inventory for reservation decisions instead of guessing stock from product data."
            ],
            [
              "What must be governed?",
              "Permissions, validation, source ownership, publication state, runtime impact, audit evidence, and rollback boundaries."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Journey and ownership",
          "anchor": "inventoryStockManagement-2-journey-and-ownership"
        },
        {
          "kind": "paragraph",
          "text": "Inventory owns stock state and reservation contracts. Product owns catalog identity, Fulfillment owns shipment execution, and Order stores durable evidence after placement. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Reader[\"Business or developer request\"] --> Axis[\"Axis or Nexus view\"]\n  Axis --> Backend[\"Owning backend capability\"]\n  Backend --> Catalog[\"Content/catalog/schema/config records\"]\n  Catalog --> Runtime[\"Runtime behavior or published page\"]\n  Runtime --> Evidence[\"Audit, validation, and support evidence\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Responsibility",
            "Owner",
            "Notes"
          ],
          "rows": [
            [
              "Business capability name",
              "Inventory and Stock Management",
              "Used in navigation and dashboards so readers are not exposed to raw module names first."
            ],
            [
              "Source owner",
              "nodics.commerce",
              "Carries exact implementation, documentation, and validation evidence."
            ],
            [
              "Technical module",
              "inventory",
              "Holds the relevant schema, service, router, data, or contract detail where applicable."
            ],
            [
              "Axis experience",
              "Backend-declared workspace",
              "Axis renders metadata and actions but does not become the authority."
            ],
            [
              "Public experience",
              "Online content delivery",
              "Nexus renders only records approved for public access."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Data and configuration detail",
          "anchor": "inventoryStockManagement-3-data-and-configuration-detail"
        },
        {
          "kind": "paragraph",
          "text": "Every topic must explain the data that changes behavior. Some topics are schema-driven, some are configuration-driven, some are publishable content, and some are operational records. The documentation must say which category applies before showing code. That keeps production operators and developers aligned on whether a change needs publication, restart, event propagation, approval, or only a project-layer override."
        },
        {
          "kind": "table",
          "headers": [
            "Detail area",
            "What to document",
            "Verification signal"
          ],
          "rows": [
            [
              "Model or record",
              "Type code, catalog, tenant, enterprise, state, owner, and lifecycle.",
              "Schema contract or generated model test."
            ],
            [
              "Configuration key",
              "Default value, override location, environment scope, and runtime impact.",
              "Config validation and runtime refresh evidence."
            ],
            [
              "API or event",
              "Route/event name, payload boundary, permission, idempotency, and failure mode.",
              "Route, service, event, and authorization tests."
            ],
            [
              "Publication and access",
              "Staged/Online state, access mode, roles, groups, and permissions.",
              "Content-pack validation and access-policy test."
            ]
          ]
        },
        {
          "kind": "code",
          "language": "js",
          "text": "// Internal Checkout-to-Inventory owner port, not generic reservation row CRUD.\nawait SERVICE.DefaultInventoryReservationOperationService.reserveAll(\n  signedCheckoutRequest,\n  calculatedPhysicalCommands\n);\n// Commands retain original Order/hold identity, warehouse/SKU, exact quantity\n// and expectedBalanceRevision. The owner validates every field."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "inventoryStockManagement-4-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Developers should customize from the project layer first. A customer project may add properties, services, validators, pipelines, renderers, data packs, or provider configuration when the extension respects the owning capability. Business users may update governed records in Axis when the record is designed for administration. Framework source changes are reserved for improving the reusable product capability itself."
        },
        {
          "kind": "table",
          "headers": [
            "Customization type",
            "Recommended path",
            "Avoid"
          ],
          "rows": [
            [
              "Business label, navigation, or content area",
              "Axis-managed content catalog item with publication workflow.",
              "Hardcoding labels or page trees in the frontend."
            ],
            [
              "Runtime setting",
              "Module configuration with validation and governed runtime propagation.",
              "Editing node-local files on each server by hand."
            ],
            [
              "Domain behavior",
              "Extension service, validator, pipeline step, or provider adapter.",
              "Forking the standard module for customer-only logic."
            ],
            [
              "Public visibility",
              "Access policy with public/authenticated/role-based state.",
              "Exposing internal or draft pages through Nexus."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operations and governance",
          "anchor": "inventoryStockManagement-5-operations-and-governance"
        },
        {
          "kind": "paragraph",
          "text": "Operators need production-safe evidence, not only implementation notes. Each page must call out logging, tracing, permission checks, event propagation, data import/export, publication status, rollback behavior, and troubleshooting. If a capability affects multiple nodes, the documentation must explain how changes reach every node and how a partial failure is detected."
        },
        {
          "kind": "table",
          "headers": [
            "Operational concern",
            "Required documentation detail"
          ],
          "rows": [
            [
              "Security",
              "Authentication mode, permission code, role/group, tenant and enterprise isolation."
            ],
            [
              "Audit",
              "Actor, timestamp, source record, checksum, approval, route/event, and result."
            ],
            [
              "Resilience",
              "Retry, idempotency, compensation, fallback, cache invalidation, and rollback."
            ],
            [
              "Observability",
              "Logs, metrics, dashboard cards, health checks, and support evidence."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "inventoryStockManagement-6-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating a friendly navigation label as the technical source owner.",
            "Writing only developer details and skipping the business decision that the page supports.",
            "Updating Axis or Nexus code when the content catalog, schema, or backend capability should own the change.",
            "Forgetting access rules for public, authenticated, role-based, group-based, or permission-based pages.",
            "Skipping diagrams, comparison tables, source maps, or troubleshooting matrices because the topic feels obvious.",
            "Changing runtime behavior without explaining production impact, cluster propagation, and rollback.",
            "Leaving CMS documentation without source evidence, validation commands, and maturity state."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "inventoryStockManagement-7-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verification starts with the document itself: it must include business context, technical ownership, a visual flow, data or configuration tables, customization guidance, common mistakes, and validation evidence. Developers and AI tools maintain the page directly as backend-owned CMS data and validate its declared checksums, lifecycle, navigation, access policy, publication state, and search metadata. No separate Markdown authoring source or prose generator is required."
        },
        {
          "kind": "paragraph",
          "text": "For implementation verification, run the owning module tests and any Axis or Nexus renderer tests that consume the page. Operators should confirm that production-like runtime behavior matches the documentation: permissions reject unauthorized access, Online pages do not expose Staged data, runtime changes propagate through governed events, and troubleshooting evidence is available without exposing secrets."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Current implementation coverage",
          "anchor": "inventoryStockManagement-8-current-implementation-coverage"
        },
        {
          "kind": "paragraph",
          "text": "Inventory is the business capability that prevents the storefront from promising stock the enterprise cannot fulfill. The implementation covers InventoryBalance, InventoryMovement, InventoryReservation, Warehouse, and customer availability summaries. It is linked to checkout because order placement depends on durable reservation evidence, and it is linked to fulfillment because warehouse and shipment work consume reserved stock."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Warehouse[\"Warehouse policy\"] --> Balance[\"Operational balance\"]\n  Cart[\"Cart\"] --> Read[\"Read availability; no reservation\"]\n  Balance --> Read\n  Checkout[\"Checkout\"] --> Reserve[\"Inventory atomic reservation owner\"]\n  Balance --> Reserve\n  Reserve --> Hold[\"Hold + RESERVE movement\"]\n  Hold --> Order[\"Order placement evidence\"]\n  Order --> Fulfillment[\"Fulfillment handoff; shipment separately qualified\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Record",
            "Business meaning",
            "Customization detail"
          ],
          "rows": [
            [
              "Warehouse",
              "Physical or logical stock location.",
              "Add region, service area, capacity, or operational metadata."
            ],
            [
              "InventoryBalance",
              "Current available, reserved, or constrained quantity.",
              "Add availability rules and safety stock policy."
            ],
            [
              "InventoryMovement",
              "Audit trail for stock changes.",
              "Add reason codes, source references, and integration identifiers."
            ],
            [
              "InventoryReservation",
              "Checkout-safe claim against stock.",
              "Add expiry, idempotency, backorder, and release policy."
            ],
            [
              "CustomerAvailabilitySummary",
              "Storefront-safe availability answer.",
              "Add display rules without exposing internal stock detail."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "For business users, the Axis view should make low-stock, oversell risk, reservation expiry, warehouse mismatch, and pending movement issues visible. For developers, extension points sit in operation services, projection services, and schema additions. A project should document reservation idempotency, concurrency behavior, release/compensation, and how stock changes are reflected in search, storefront, order, and fulfillment views."
        },
        {
          "kind": "paragraph",
          "text": "Implementation evidence comes from inventory operation tests, Axis projection tests, customer availability summary tests, inventory publication tests, and generated schema contracts for Balance, Movement, Reservation, and Warehouse."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Atomic physical stock holds during Checkout",
          "anchor": "inventory-checkout-atomic-reservations"
        },
        {
          "kind": "paragraph",
          "text": "A stock hold is like putting the selected units aside while the customer pays. Cart add/read/calculation only asks about availability; it does not reserve physical or digital supply. Checkout submits trusted calculated warehouse/SKU candidates, the signed customer, original Order identity and original idempotency keys to DefaultInventoryReservationOperationService. Digital coupon pools go to DigitalCore and Promotion instead of being reconstructed from warehouse balances."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n  participant Cart\n  participant Checkout\n  participant Inventory\n  participant DB as Qualified transaction owner\n  Cart->>Inventory: Read availability only\n  Checkout->>Inventory: reserveAll with signed buyer and original Order intent\n  Inventory->>Inventory: Validate scope, revision, models and installed indexes\n  Inventory->>DB: One transaction for all physical entries\n  DB->>DB: Available decreases; reserved increases\n  DB->>DB: Insert original hold and RESERVE movement\n  DB-->>Inventory: Commit or rollback every entry\n  Inventory-->>Checkout: Exact hold evidence or honest uncertainty\n  Checkout->>Inventory: Release original hold during compensation\n  Inventory->>DB: Atomically release quantities, hold and RELEASE movement"
        },
        {
          "kind": "paragraph",
          "text": "reserveAll admits a nonempty set of at most 100 unique commands. Each binds tenant, enterprise, signed owner, ORDER ownerCode, warehouse, SKU, positive exact quantity, expectedBalanceRevision and stable original command identity. The COMMERCE owner requires customer access scope and commerce.checkout.place. Request fields cannot change authenticated buyer or enterprise. Persistence checks require generated unversioned side-effect-safe models, actual unconditional unique code identities, the unique balance stock identity and a qualified multiRecordAtomic transaction provider. Declaring indexes or enabling a flag is not installed evidence."
        },
        {
          "kind": "table",
          "headers": [
            "Operation",
            "Atomic stock effect",
            "Required evidence"
          ],
          "rows": [
            [
              "Acquire physical entries",
              "For every new hold, available decreases and reserved increases; onHand is unchanged. All supplied entries commit or roll back together.",
              "Observed balance revision, exact quantity, original ACTIVE hold and RESERVE movement."
            ],
            [
              "Repeat original acquisition",
              "No second subtraction; original ACTIVE hold is returned.",
              "Same immutable intent and valid balance/movement lineage, not unchanged live quantities."
            ],
            [
              "Compensate original hold",
              "Available is restored, reserved reduced, hold RELEASED and RELEASE movement appended in one owner transaction.",
              "Exact buyer/Order binding and original acquisition proof."
            ],
            [
              "Repeat release",
              "No extra stock effect.",
              "Original RELEASED hold and matching RELEASE movement."
            ],
            [
              "No original acquisition",
              "NOT_ACQUIRED; no quantity increase.",
              "Fresh scoped absence, not a failed or truncated read."
            ],
            [
              "Uncertain acquisition",
              "Confirmed holds are retained for compensation; unresolved identities stay uncertain.",
              "Checkout COMPENSATION_REQUIRED when acknowledgement cannot be established."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "A lost transaction acknowledgement is accepted as acquisition only when all original holds, movements and balance identities can be read independently. A partially readable result does not authorize inventing a hold or reporting successful compensation. Failed envelopes, stale revisions, wrong quantities, different buyers, foreign scope and legacy reservation-only rows without balance/movement proof refuse. Generated created/updated timestamps are persistence metadata, not equality tokens. Later sales can legitimately change live balance quantities."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Return authority is separate from hold release",
          "anchor": "inventory-return-authority-gate"
        },
        {
          "kind": "paragraph",
          "text": "Releasing a checkout hold is not receiving returned goods. The legacy balanceAction RETURN path and operationDelta reject ERR_INVENTORY_RETURN_UNQUALIFIED before any stock read or write. This is a stable HTTP 409 domain refusal, not successful restocking. Caller-supplied RMA, receipt, inspection, disposition or quantity cannot authorize it, even with an idempotency key. Do not relabel RETURN as RECEIVE or ADJUST. The physical shipment-to-return integration is not certified by these reservation contracts."
        },
        {
          "kind": "table",
          "headers": [
            "Lane",
            "Current boundary",
            "Operator next action"
          ],
          "rows": [
            [
              "Opening receipt",
              "Atomic first balance, RECEIPT movement and private intake receipt per instruction.",
              "Use the exact explicitly selected opening contribution."
            ],
            [
              "Checkout acquire/release",
              "Atomic stock hold and movement owner; release restores only acquired quantities.",
              "Use Checkout compensation and inspect original owner evidence."
            ],
            [
              "Ordinary RECEIVE/ADJUST",
              "Existing balanceAction saves balance then movement sequentially.",
              "Inspect both records after ambiguous failure; do not claim a cross-record transaction."
            ],
            [
              "Legacy RETURN",
              "Always refused before reads/writes; qualified physical reversal uses a separate guarded owner bridge.",
              "Retain the refusal and escalate to the physical reverse owner; never manufacture a receipt."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and verify stock recovery",
          "anchor": "inventory-reservation-customization"
        },
        {
          "kind": "paragraph",
          "text": "A customer can narrow stock admission or warehouse selection in its existing later active Inventory implementation. For example, a project may reject a warehouse outside its supported service area before calling the inherited reservation owner. Preserve signed context, original Order/command identities, exact arithmetic, revision predicates, installed uniqueness, generated transaction ownership and readback. Do not implement reservations by saving a row directly, replace the transaction provider with a successful stub, or broaden an inherited permission."
        },
        {
          "kind": "ordered-list",
          "items": [
            "Test all-or-none multi-entry acquisition, insufficient stock, stale revision, same-command replay, concurrent acquisition and cross-buyer/tenant/enterprise refusal.",
            "Interrupt acquisition and prove rollback or complete original-evidence readback. Carry any uncertainty into Checkout compensation rather than treating missing acknowledgement as no effect.",
            "Release once and replay; inspect balance, hold and RELEASE movement. Verify missing acquisition cannot increase stock and legacy reservation-only records cannot reconstruct quantities.",
            "Assert RETURN and lowercase/payload aliases refuse before generated reads/writes, including forged receipt/disposition input. Keep HTTP 409 evidence separate from provider failures.",
            "Qualify the installed transaction topology, effective schemas, unique indexes and native Checkout path separately. Source tests and diagrams do not prove shipment, physical restock or production-provider acceptance."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Reviewed physical shipment, cancellation and return stock effects",
          "anchor": "inventory-reviewed-physical-stock-effects"
        },
        {
          "kind": "paragraph",
          "text": "The guarded physical bridge is a separate owner path, not an enabled legacy RETURN action. Fulfillment owns dispatch and returned-package evidence; Order reloads the reviewed case, original capture, refund approval and Store policy; Inventory reloads the original Order holds and movements. The bridge admits full physical orders only, rejects mixed digital evidence and incomplete retained entries, and requires explicitly enabled MANUAL_ATTESTATION policy on COMMERCE, current Profile-backed staff scope, commerce.fulfillment.return and the normal dispute/refund permissions. It is not live-carrier confirmation."
        },
        {
          "kind": "table",
          "headers": [
            "Command",
            "Original evidence and atomic Inventory effect",
            "Refusal or recovery"
          ],
          "rows": [
            [
              "Dispatch",
              "Fulfillment CAS-locks the retained READY consignment; confirmed handover consumes ACTIVE holds, reduces reserved and onHand, appends SHIP and retains an owner-issued shipment.",
              "Cancellation and dispatch cannot own the same revision. Missing original hold/movement, foreign scope or unqualified installed transactions/indexes refuse."
            ],
            [
              "Pre-dispatch cancellation",
              "Reviewed full-order cancellation locks the READY consignment; RELEASE restores available and reduces reserved, keeping onHand unchanged.",
              "A shipped or dispatch-locked consignment cannot use cancellation. Replay must prove the original movement, not add stock again."
            ],
            [
              "Return receipt and inspection",
              "Original SHIPPED evidence is required. Actual package receipts cannot cumulatively exceed shipped quantities; every original receipt needs accepted RESTOCK or SCRAP inspection and full shipment coverage before stock settlement or Payment.",
              "Partial coverage, missing/rejected inspection, duplicate package references, changed replay intent or revoked staff scope blocks settlement."
            ],
            [
              "RESTOCK / SCRAP",
              "RESTOCK increases available and onHand; SCRAP records disposition without creating saleable stock. Original holds remain CONSUMED with exact returnedQuantity and retained RETURN movement identities.",
              "Every Inventory line commits or rolls back in one qualified owner transaction; ambiguous readback remains recoveryRequired."
            ],
            [
              "Financial completion",
              "Order requires original-capture preflight, PREPARE and SETTLE before Payment; Fulfillment completion requires persisted confirmed Payment refund and repeated exact stock proof.",
              "Stock settlement can precede a pending refund. Preserve RECONCILIATION_REQUIRED and the same refund identity; never repeat a stock delta or claim settlement from a request."
            ]
          ]
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Consignment[\"Retained READY consignment and original holds\"] --> Choice{\"Reviewed owner command\"}\n  Choice -->|dispatch| Ship[\"Manual handover lock, atomic SHIP, retained shipment\"]\n  Choice -->|cancel before dispatch| Release[\"Cancellation lock and atomic RELEASE\"]\n  Ship --> Return[\"Reviewed RETURN lock and actual package receipts\"]\n  Return --> Inspect[\"Full shipped coverage; every receipt inspected\"]\n  Inspect --> Stock[\"Atomic RESTOCK or SCRAP evidence\"]\n  Release --> Payment[\"Original-capture Payment refund and reconciliation\"]\n  Stock --> Payment\n  Payment --> Final[\"Confirm owner completion only from persisted evidence\"]"
        },
        {
          "kind": "paragraph",
          "text": "Customize existing physicalOperations policy and Order ownerByStore admission, retaining bounded maximumLines/maximumReceipts, signed employee scope, actual unconditional unique indexes and nonversioned transaction-safe models. Do not expose internal service calls as customer authority. Run physicalOrderReversalContract tests for cancellation/dispatch exclusion, over-quantity and concurrent receipts, SCRAP/rejection, rollback, lost acknowledgements and revocation. These isolated owner tests do not qualify a native database, warehouse handover, Card provider or browser workflow."
        }
      ],
      "searchText": "Inventory and Stock Management Inventory balances, stock movements, reservations, warehouse relationships, availability summaries, and checkout protection. # Inventory and Stock Management\n\n## Opening stock supplied by business data packs\n\nA ready-to-run accelerator or reference application can supply opening intake beside products, prices, promotions, CMS records and their assets. The pack owns the sample quantities and product references; Inventory owns the stock operation. Documentation remains independently selectable. Importing a catalog does not create stock, and a data file must never overwrite available, reserved or allocated balances. The existing coordinated application setup processes explicit Online intake contributions only after publication prerequisites, using the original authorized operator.\n\n```mermaid\nflowchart TD\n  Pack[Business sample pack] --> Catalog[Products and warehouse policy]\n  Catalog --> Approval[Existing publication approvals]\n  Approval --> Online[Activated Store policy]\n  Pack --> Intake[Immutable opening intake instructions]\n  Online --> Owner[Inventory admission]\n  Intake --> Owner\n  Owner --> Atomic[Atomic first receipt transaction]\n  Atomic --> Balance[Initial balance]\n  Atomic --> Movement[RECEIPT movement]\n  Atomic --> Receipt[Original intake receipt]\n  Receipt --> Replay[Repeat verifies evidence without replenishing stock]\n```\n\n| Responsibility | Owner | Evidence required |\n| --- | --- | --- |\n| Sample quantities and SKU references | Owning business pack | Explicit local/demo contribution with immutable version and checksum |\n| Source validation and installation history | nImport | Selected DATA_RELEASE and current byte qualification; no arbitrary paths |\n| First balance and movement | Inventory | Human commerce.inventory.operate permission; activated Product and warehouse scope; atomic transaction |\n| Repeated import | Inventory and nImport | Original intake digest and movement; live quantities may have changed through sales |\n| Customer purchase and reservation | Cart, Checkout and Inventory | Actual customer journey; no seeded payment, Order or ownership |\n| Documentation | Capability documentation pack | Stable references; no forced import alongside business samples |\n\nFor developers and AI tools, declare an EXPLICIT sample DATA_RELEASE using installer INVENTORY_OPENING_RECEIPTS, lifecycle OPERATIONAL_VERSIONED and destination COMMERCE. Declare inventoryOpening.json with contractVersion 1 and receipts containing exactly code, storeCode, locale, warehouseCode, productCode, variantCode, sku, quantity and referenceCode. The default limit is 1000 unique warehouse/SKU receipts; quantities are positive whole-unit strings. Tenant, enterprise and actor come from authentication, never the file. Later-layer policy overrides may narrow admission but cannot replace Inventory persistence or skip source/permission checks.\n\n| Scenario | Expected result | Recovery |\n| --- | --- | --- |\n| First intake of 40 units | Balance, RECEIPT movement and private original receipt commit together | Verify owner receipt before starting checkout |\n| Repeat after three units sell | Original receipt returned; live available quantity remains 37 | No replenishment or revision reset |\n| Movement write fails before commit | Transaction rolls back; no partial sellable balance | Restore owner persistence and use the same exact contribution |\n| Commit acknowledgement is lost | Read original receipt and movement; never blindly add quantity again | Unproved outcomes remain failures |\n| Different intake for existing warehouse/SKU | Conflict; existing balance is not replaced | Use Inventory reconciliation or subsequent receiving, not a new opening key |\n| Provider lacks atomic transactions | Read-only preflight blocker and no stock writes | Qualify supported database topology; flags cannot grant atomicity |\n| Wrong tenant, enterprise, Store policy or permission | Owner rejection before mutation | Correct authoritative scope or obtain normal operator permission |\n\nA pack is not one large database transaction: each receipt is atomic, the full input set is checked before writes, and a later failure does not erase earlier receipts. MongoDB requires a genuinely transaction-capable replica set or sharded topology. Source tests prove default and override contracts, rollback, races and recovery using independent persistence ports; only installed provider qualification and the complete Commerce customer journey prove live readiness. Never mark checkout, payment or Order lifecycle accepted merely because a pack is CURRENT.\n\nInventory balances, stock movements, reservations, warehouse relationships, availability summaries, and checkout protection. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs.\n\nA customer promise is only trustworthy when product availability, reservation, release, and fulfillment handoff are accurate under concurrency. Inventory owns balances, movements, reservations, availability summaries, and stock evidence. Checkout asks Inventory for reservation decisions instead of guessing stock from product data.\n\n## Business context\n\nFor a business user, this topic answers what decision can be made, which operational journey is supported, and what risk is reduced. The practical value is faster delivery without losing governance: teams can understand the current capability, decide whether it applies to their project, and know when Axis, Nexus, content catalog, workflow, or runtime services are involved.\n\nFor beginners, the mental model is simple: the page title is the business capability, the table identifies who owns each part, and the diagram shows how a request or change flows. A reader should not need source-code knowledge to understand the journey, but the developer path is still available when customization is needed.\n\n| Business question | Answer for this topic |\n| --- | --- |\n| What problem does it solve? | A customer promise is only trustworthy when product availability, reservation, release, and fulfillment handoff are accurate under concurrency. |\n| Who uses it? | Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools. |\n| What changes can it support? | Inventory owns balances, movements, reservations, availability summaries, and stock evidence. Checkout asks Inventory for reservation decisions instead of guessing stock from product data. |\n| What must be governed? | Permissions, validation, source ownership, publication state, runtime impact, audit evidence, and rollback boundaries. |\n\n## Journey and ownership\n\nInventory owns stock state and reservation contracts. Product owns catalog identity, Fulfillment owns shipment execution, and Order stores durable evidence after placement. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state.\n\n```mermaid\nflowchart LR\n  Reader[\"Business or developer request\"] --> Axis[\"Axis or Nexus view\"]\n  Axis --> Backend[\"Owning backend capability\"]\n  Backend --> Catalog[\"Content/catalog/schema/config records\"]\n  Catalog --> Runtime[\"Runtime behavior or published page\"]\n  Runtime --> Evidence[\"Audit, validation, and support evidence\"]\n```\n\n| Responsibility | Owner | Notes |\n| --- | --- | --- |\n| Business capability name | Inventory and Stock Management | Used in navigation and dashboards so readers are not exposed to raw module names first. |\n| Source owner | nodics.commerce | Carries exact implementation, documentation, and validation evidence. |\n| Technical module | inventory | Holds the relevant schema, service, router, data, or contract detail where applicable. |\n| Axis experience | Backend-declared workspace | Axis renders metadata and actions but does not become the authority. |\n| Public experience | Online content delivery | Nexus renders only records approved for public access. |\n\n## Data and configuration detail\n\nEvery topic must explain the data that changes behavior. Some topics are schema-driven, some are configuration-driven, some are publishable content, and some are operational records. The documentation must say which category applies before showing code. That keeps production operators and developers aligned on whether a change needs publication, restart, event propagation, approval, or only a project-layer override.\n\n| Detail area | What to document | Verification signal |\n| --- | --- | --- |\n| Model or record | Type code, catalog, tenant, enterprise, state, owner, and lifecycle. | Schema contract or generated model test. |\n| Configuration key | Default value, override location, environment scope, and runtime impact. | Config validation and runtime refresh evidence. |\n| API or event | Route/event name, payload boundary, permission, idempotency, and failure mode. | Route, service, event, and authorization tests. |\n| Publication and access | Staged/Online state, access mode, roles, groups, and permissions. | Content-pack validation and access-policy test. |\n\n```js\n// Internal Checkout-to-Inventory owner port, not generic reservation row CRUD.\nawait SERVICE.DefaultInventoryReservationOperationService.reserveAll(\n  signedCheckoutRequest,\n  calculatedPhysicalCommands\n);\n// Commands retain original Order/hold identity, warehouse/SKU, exact quantity\n// and expectedBalanceRevision. The owner validates every field.\n```\n\n## Customization and extension\n\nDevelopers should customize from the project layer first. A customer project may add properties, services, validators, pipelines, renderers, data packs, or provider configuration when the extension respects the owning capability. Business users may update governed records in Axis when the record is designed for administration. Framework source changes are reserved for improving the reusable product capability itself.\n\n| Customization type | Recommended path | Avoid |\n| --- | --- | --- |\n| Business label, navigation, or content area | Axis-managed content catalog item with publication workflow. | Hardcoding labels or page trees in the frontend. |\n| Runtime setting | Module configuration with validation and governed runtime propagation. | Editing node-local files on each server by hand. |\n| Domain behavior | Extension service, validator, pipeline step, or provider adapter. | Forking the standard module for customer-only logic. |\n| Public visibility | Access policy with public/authenticated/role-based state. | Exposing internal or draft pages through Nexus. |\n\n## Operations and governance\n\nOperators need production-safe evidence, not only implementation notes. Each page must call out logging, tracing, permission checks, event propagation, data import/export, publication status, rollback behavior, and troubleshooting. If a capability affects multiple nodes, the documentation must explain how changes reach every node and how a partial failure is detected.\n\n| Operational concern | Required documentation detail |\n| --- | --- |\n| Security | Authentication mode, permission code, role/group, tenant and enterprise isolation. |\n| Audit | Actor, timestamp, source record, checksum, approval, route/event, and result. |\n| Resilience | Retry, idempotency, compensation, fallback, cache invalidation, and rollback. |\n| Observability | Logs, metrics, dashboard cards, health checks, and support evidence. |\n\n## Common mistakes\n\n- Treating a friendly navigation label as the technical source owner.\n- Writing only developer details and skipping the business decision that the page supports.\n- Updating Axis or Nexus code when the content catalog, schema, or backend capability should own the change.\n- Forgetting access rules for public, authenticated, role-based, group-based, or permission-based pages.\n- Skipping diagrams, comparison tables, source maps, or troubleshooting matrices because the topic feels obvious.\n- Changing runtime behavior without explaining production impact, cluster propagation, and rollback.\n- Leaving CMS documentation without source evidence, validation commands, and maturity state.\n\n## Verification\n\nVerification starts with the document itself: it must include business context, technical ownership, a visual flow, data or configuration tables, customization guidance, common mistakes, and validation evidence. Developers and AI tools maintain the page directly as backend-owned CMS data and validate its declared checksums, lifecycle, navigation, access policy, publication state, and search metadata. No separate Markdown authoring source or prose generator is required.\n\nFor implementation verification, run the owning module tests and any Axis or Nexus renderer tests that consume the page. Operators should confirm that production-like runtime behavior matches the documentation: permissions reject unauthorized access, Online pages do not expose Staged data, runtime changes propagate through governed events, and troubleshooting evidence is available without exposing secrets.\n\n## Current implementation coverage\n\nInventory is the business capability that prevents the storefront from promising stock the enterprise cannot fulfill. The implementation covers InventoryBalance, InventoryMovement, InventoryReservation, Warehouse, and customer availability summaries. It is linked to checkout because order placement depends on durable reservation evidence, and it is linked to fulfillment because warehouse and shipment work consume reserved stock.\n\n```mermaid\nflowchart LR\n  Warehouse[\"Warehouse policy\"] --> Balance[\"Operational balance\"]\n  Cart[\"Cart\"] --> Read[\"Read availability; no reservation\"]\n  Balance --> Read\n  Checkout[\"Checkout\"] --> Reserve[\"Inventory atomic reservation owner\"]\n  Balance --> Reserve\n  Reserve --> Hold[\"Hold + RESERVE movement\"]\n  Hold --> Order[\"Order placement evidence\"]\n  Order --> Fulfillment[\"Fulfillment handoff; shipment separately qualified\"]\n```\n\n| Record | Business meaning | Customization detail |\n| --- | --- | --- |\n| Warehouse | Physical or logical stock location. | Add region, service area, capacity, or operational metadata. |\n| InventoryBalance | Current available, reserved, or constrained quantity. | Add availability rules and safety stock policy. |\n| InventoryMovement | Audit trail for stock changes. | Add reason codes, source references, and integration identifiers. |\n| InventoryReservation | Checkout-safe claim against stock. | Add expiry, idempotency, backorder, and release policy. |\n| CustomerAvailabilitySummary | Storefront-safe availability answer. | Add display rules without exposing internal stock detail. |\n\nFor business users, the Axis view should make low-stock, oversell risk, reservation expiry, warehouse mismatch, and pending movement issues visible. For developers, extension points sit in operation services, projection services, and schema additions. A project should document reservation idempotency, concurrency behavior, release/compensation, and how stock changes are reflected in search, storefront, order, and fulfillment views.\n\nImplementation evidence comes from inventory operation tests, Axis projection tests, customer availability summary tests, inventory publication tests, and generated schema contracts for Balance, Movement, Reservation, and Warehouse.\n\n## Atomic physical stock holds during Checkout\n\nA stock hold is like putting the selected units aside while the customer pays. Cart add/read/calculation only asks about availability; it does not reserve physical or digital supply. Checkout submits trusted calculated warehouse/SKU candidates, the signed customer, original Order identity and original idempotency keys to DefaultInventoryReservationOperationService. Digital coupon pools go to DigitalCore and Promotion instead of being reconstructed from warehouse balances.\n\n```mermaid\nsequenceDiagram\n  participant Cart\n  participant Checkout\n  participant Inventory\n  participant DB as Qualified transaction owner\n  Cart->>Inventory: Read availability only\n  Checkout->>Inventory: reserveAll with signed buyer and original Order intent\n  Inventory->>Inventory: Validate scope, revision, models and installed indexes\n  Inventory->>DB: One transaction for all physical entries\n  DB->>DB: Available decreases; reserved increases\n  DB->>DB: Insert original hold and RESERVE movement\n  DB-->>Inventory: Commit or rollback every entry\n  Inventory-->>Checkout: Exact hold evidence or honest uncertainty\n  Checkout->>Inventory: Release original hold during compensation\n  Inventory->>DB: Atomically release quantities, hold and RELEASE movement\n```\n\nreserveAll admits a nonempty set of at most 100 unique commands. Each binds tenant, enterprise, signed owner, ORDER ownerCode, warehouse, SKU, positive exact quantity, expectedBalanceRevision and stable original command identity. The COMMERCE owner requires customer access scope and commerce.checkout.place. Request fields cannot change authenticated buyer or enterprise. Persistence checks require generated unversioned side-effect-safe models, actual unconditional unique code identities, the unique balance stock identity and a qualified multiRecordAtomic transaction provider. Declaring indexes or enabling a flag is not installed evidence.\n\n| Operation | Atomic stock effect | Required evidence |\n| --- | --- | --- |\n| Acquire physical entries | For every new hold, available decreases and reserved increases; onHand is unchanged. All supplied entries commit or roll back together. | Observed balance revision, exact quantity, original ACTIVE hold and RESERVE movement. |\n| Repeat original acquisition | No second subtraction; original ACTIVE hold is returned. | Same immutable intent and valid balance/movement lineage, not unchanged live quantities. |\n| Compensate original hold | Available is restored, reserved reduced, hold RELEASED and RELEASE movement appended in one owner transaction. | Exact buyer/Order binding and original acquisition proof. |\n| Repeat release | No extra stock effect. | Original RELEASED hold and matching RELEASE movement. |\n| No original acquisition | NOT_ACQUIRED; no quantity increase. | Fresh scoped absence, not a failed or truncated read. |\n| Uncertain acquisition | Confirmed holds are retained for compensation; unresolved identities stay uncertain. | Checkout COMPENSATION_REQUIRED when acknowledgement cannot be established. |\n\nA lost transaction acknowledgement is accepted as acquisition only when all original holds, movements and balance identities can be read independently. A partially readable result does not authorize inventing a hold or reporting successful compensation. Failed envelopes, stale revisions, wrong quantities, different buyers, foreign scope and legacy reservation-only rows without balance/movement proof refuse. Generated created/updated timestamps are persistence metadata, not equality tokens. Later sales can legitimately change live balance quantities.\n\n## Return authority is separate from hold release\n\nReleasing a checkout hold is not receiving returned goods. The legacy balanceAction RETURN path and operationDelta reject ERR_INVENTORY_RETURN_UNQUALIFIED before any stock read or write. This is a stable HTTP 409 domain refusal, not successful restocking. Caller-supplied RMA, receipt, inspection, disposition or quantity cannot authorize it, even with an idempotency key. Do not relabel RETURN as RECEIVE or ADJUST. The physical shipment-to-return integration is not certified by these reservation contracts.\n\n| Lane | Current boundary | Operator next action |\n| --- | --- | --- |\n| Opening receipt | Atomic first balance, RECEIPT movement and private intake receipt per instruction. | Use the exact explicitly selected opening contribution. |\n| Checkout acquire/release | Atomic stock hold and movement owner; release restores only acquired quantities. | Use Checkout compensation and inspect original owner evidence. |\n| Ordinary RECEIVE/ADJUST | Existing balanceAction saves balance then movement sequentially. | Inspect both records after ambiguous failure; do not claim a cross-record transaction. |\n| Legacy RETURN | Always refused before reads/writes; qualified physical reversal uses a separate guarded owner bridge. | Retain the refusal and escalate to the physical reverse owner; never manufacture a receipt. |\n\n## Customize and verify stock recovery\n\nA customer can narrow stock admission or warehouse selection in its existing later active Inventory implementation. For example, a project may reject a warehouse outside its supported service area before calling the inherited reservation owner. Preserve signed context, original Order/command identities, exact arithmetic, revision predicates, installed uniqueness, generated transaction ownership and readback. Do not implement reservations by saving a row directly, replace the transaction provider with a successful stub, or broaden an inherited permission.\n\n1. Test all-or-none multi-entry acquisition, insufficient stock, stale revision, same-command replay, concurrent acquisition and cross-buyer/tenant/enterprise refusal.\n2. Interrupt acquisition and prove rollback or complete original-evidence readback. Carry any uncertainty into Checkout compensation rather than treating missing acknowledgement as no effect.\n3. Release once and replay; inspect balance, hold and RELEASE movement. Verify missing acquisition cannot increase stock and legacy reservation-only records cannot reconstruct quantities.\n4. Assert RETURN and lowercase/payload aliases refuse before generated reads/writes, including forged receipt/disposition input. Keep HTTP 409 evidence separate from provider failures.\n5. Qualify the installed transaction topology, effective schemas, unique indexes and native Checkout path separately. Source tests and diagrams do not prove shipment, physical restock or production-provider acceptance.\n\n## Reviewed physical shipment, cancellation and return stock effects\n\nThe guarded physical bridge is a separate owner path, not an enabled legacy RETURN action. Fulfillment owns dispatch and returned-package evidence; Order reloads the reviewed case, original capture, refund approval and Store policy; Inventory reloads the original Order holds and movements. The bridge admits full physical orders only, rejects mixed digital evidence and incomplete retained entries, and requires explicitly enabled MANUAL_ATTESTATION policy on COMMERCE, current Profile-backed staff scope, commerce.fulfillment.return and the normal dispute/refund permissions. It is not live-carrier confirmation.\n\n| Command | Original evidence and atomic Inventory effect | Refusal or recovery |\n| --- | --- | --- |\n| Dispatch | Fulfillment CAS-locks the retained READY consignment; confirmed handover consumes ACTIVE holds, reduces reserved and onHand, appends SHIP and retains an owner-issued shipment. | Cancellation and dispatch cannot own the same revision. Missing original hold/movement, foreign scope or unqualified installed transactions/indexes refuse. |\n| Pre-dispatch cancellation | Reviewed full-order cancellation locks the READY consignment; RELEASE restores available and reduces reserved, keeping onHand unchanged. | A shipped or dispatch-locked consignment cannot use cancellation. Replay must prove the original movement, not add stock again. |\n| Return receipt and inspection | Original SHIPPED evidence is required. Actual package receipts cannot cumulatively exceed shipped quantities; every original receipt needs accepted RESTOCK or SCRAP inspection and full shipment coverage before stock settlement or Payment. | Partial coverage, missing/rejected inspection, duplicate package references, changed replay intent or revoked staff scope blocks settlement. |\n| RESTOCK / SCRAP | RESTOCK increases available and onHand; SCRAP records disposition without creating saleable stock. Original holds remain CONSUMED with exact returnedQuantity and retained RETURN movement identities. | Every Inventory line commits or rolls back in one qualified owner transaction; ambiguous readback remains recoveryRequired. |\n| Financial completion | Order requires original-capture preflight, PREPARE and SETTLE before Payment; Fulfillment completion requires persisted confirmed Payment refund and repeated exact stock proof. | Stock settlement can precede a pending refund. Preserve RECONCILIATION_REQUIRED and the same refund identity; never repeat a stock delta or claim settlement from a request. |\n\n```mermaid\nflowchart TD\n  Consignment[\"Retained READY consignment and original holds\"] --> Choice{\"Reviewed owner command\"}\n  Choice -->|dispatch| Ship[\"Manual handover lock, atomic SHIP, retained shipment\"]\n  Choice -->|cancel before dispatch| Release[\"Cancellation lock and atomic RELEASE\"]\n  Ship --> Return[\"Reviewed RETURN lock and actual package receipts\"]\n  Return --> Inspect[\"Full shipped coverage; every receipt inspected\"]\n  Inspect --> Stock[\"Atomic RESTOCK or SCRAP evidence\"]\n  Release --> Payment[\"Original-capture Payment refund and reconciliation\"]\n  Stock --> Payment\n  Payment --> Final[\"Confirm owner completion only from persisted evidence\"]\n```\n\nCustomize existing physicalOperations policy and Order ownerByStore admission, retaining bounded maximumLines/maximumReceipts, signed employee scope, actual unconditional unique indexes and nonversioned transaction-safe models. Do not expose internal service calls as customer authority. Run physicalOrderReversalContract tests for cancellation/dispatch exclusion, over-quantity and concurrent receipts, SCRAP/rejection, rollback, lost acknowledgements and revocation. These isolated owner tests do not qualify a native database, warehouse handover, Card provider or browser workflow.\n",
      "previous": {
        "title": "Media Import and Publication",
        "route": "/docs/framework/wcms-media-import-publication"
      },
      "next": {
        "title": "Pricing, Promotions, and Tax Management",
        "route": "/docs/framework/pricing-promotions-tax-management"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.commerce",
        "technicalModule": "inventory",
        "owner": "inventory",
        "sourcePath": "data/docs-v001/records/documentation/inventoryDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/inventoryDocumentationComponentData.js",
        "wordCount": 3185,
        "checksum": "d22497d11efd21c9efca31b515147e336c3b09aba417eb534ab248f443a222f1"
      },
      "slug": "inventory-stock-management",
      "locale": "en",
      "navigationGroup": "Stock Availability and Reservation",
      "navigationGroupCode": "stock-availability-and-reservation",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "commerce.cart-order",
          "owner": "checkoutCore"
        },
        {
          "documentId": "catalog.product-discovery-management",
          "owner": "product"
        },
        {
          "documentId": "fulfillment.shipping-management",
          "owner": "fulfillmentCore"
        },
        {
          "documentId": "promotion.campaigns-coupon-issuance",
          "owner": "promotion"
        },
        {
          "documentId": "cart.customer-intent-calculation",
          "owner": "cart"
        },
        {
          "documentId": "digital.purchase-delivery-reveal",
          "owner": "digitalCore"
        }
      ]
    },
    "active": true
  }
};
