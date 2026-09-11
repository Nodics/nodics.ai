/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/src/schemas/schemas
 * @description Defines profile schema metadata, model contracts, and generated capability settings.
 * @layer schemas
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
  profile: {
    tenant: {
      super: "super",
      backoffice: {
        enabled: true,
        label: "Tenant",
        displayProperty: "code",
        displayProperties: ["code", "description"],
      },
      schemaPolicies: ["administrative"],
      model: true,
      service: {
        enabled: true,
      },
      cache: {
        enabled: true,
        ttl: 100,
      },
      router: {
        enabled: true,
      },
      tenants: ["default"],
      definition: {
        properties: {
          type: "object",
          required: false,
          description: "JSON formate of properties defined for this tenant",
          searchOptions: {
            enabled: true, // default is false
          },
        },
      },
    },

    address: {
      super: "base",
      backoffice: {
        enabled: true,
        label: "Address",
        displayProperty: "code",
        displayProperties: ["building", "street", "city", "countryCode", "code"],
        form: {
          sections: {
            address: { label: "Address", fields: ["type", "flatNo", "building", "street", "addressLine1", "addressLine2", "locality", "city", "state", "postalCode", "countryCode", "isPrimery"] },
            contacts: { label: "Contact details", fields: ["contacts", "landmarkHint", "accessNotes"] },
            administration: { label: "Additional details", fields: ["code", "active", "description"] },
          },
          hiddenFields: ["geocodingProvider", "geocodingReference", "geocodingPrecision", "geocodingConfidence", "verificationSource", "verifiedByRef", "verifiedAt", "displayPolicy"],
          defaultColumns: ["code", "type", "building", "city", "countryCode"],
        },
        operations: ["search", "read", "create", "update", "delete"],
        relationships: {
          contacts: {
            targetModule: "profile",
            actions: ["SELECT_EXISTING", "CREATE_RELATED", "EDIT_RELATED", "UNLINK"],
          },
        },
      },
      schemaPolicies: ["customerOwned"],
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: true,
      },
      cache: {
        enabled: false,
        ttl: 360,
      },
      search: {
        enabled: false,
        idPropertyName: "code", // if null, code will be taken
      },
      refSchema: {
        contacts: {
          enabled: true,
          schemaName: "contact",
          type: "many",
          propertyName: "code",
          onTargetDelete: "RESTRICT",
        },
      },
      definition: {
        type: {
          type: "string",
          required: true,
          description: "Type of address, like home, office",
        },
        isPrimery: {
          type: "bool",
          required: true,
          default: false,
          label: "Primary address",
          description: "Indicates whether this is the default address",
        },
        flatNo: {
          type: "string",
          required: false,
          description: "Flat number of the address",
        },
        building: {
          type: "string",
          required: false,
          description: "Name of Building of the address",
        },
        street: {
          type: "string",
          required: false,
          description: "Street name of the address",
        },
        addressLine1: {
          type: "string",
          required: false,
          description: "Can be used for landmark or optional properties",
        },
        addressLine2: {
          type: "string",
          required: false,
          description: "Can be used for landmark or optional properties",
        },
        landmarkHint: {
          type: "string",
          required: false,
          description: "Reusable landmark hint for finding this address",
        },
        accessNotes: {
          type: "string",
          required: false,
          description: "Reusable delivery or access notes for this address",
        },
        locality: {
          type: "string",
          required: false,
          description: "Locality of the address",
        },
        city: {
          type: "string",
          required: true,
          description: "City of the address",
        },
        state: {
          type: "string",
          required: true,
          description: "State of the address",
        },
        postalCode: {
          type: "string",
          required: true,
          description: "PastalCode of the address",
        },
        countryCode: {
          type: "string",
          required: true,
          description: "ISO country code of the address",
        },
        latitude: {
          type: "number",
          required: false,
          description: "Latitude of the geocoded address when available",
        },
        longitude: {
          type: "number",
          required: false,
          description: "Longitude of the geocoded address when available",
        },
        geocodingProvider: {
          type: "string",
          required: false,
          description: "Provider used to geocode or normalize this address",
        },
        geocodingReference: {
          type: "string",
          required: false,
          description: "Provider reference for the geocoded address",
        },
        geocodingPrecision: {
          type: "string",
          required: false,
          description: "Precision level of the geocoded address",
        },
        geocodingConfidence: {
          type: "number",
          required: false,
          description: "Normalized geocoding confidence from zero to one",
        },
        verificationStatus: {
          type: "string",
          required: false,
          enum: ["UNVERIFIED", "PENDING", "VERIFIED", "REJECTED", "STALE"],
          description: "Reusable address verification state",
        },
        verificationSource: {
          type: "string",
          required: false,
          description: "Source that verified this address",
        },
        verifiedByRef: {
          type: "object",
          required: false,
          description: "Actor or service reference that verified this address",
        },
        verifiedAt: {
          type: "date",
          required: false,
          description: "Timestamp when this address was verified",
        },
        displayPolicy: {
          type: "object",
          required: false,
          description: "Reusable privacy-safe display and redaction policy",
        },
        contacts: {
          type: "array",
          required: false,
          description: "All associated contacts with this enterprise",
        },
      },
    },

    contact: {
      super: "base",
      backoffice: {
        enabled: true,
        label: "Contact",
        displayProperty: "code",
        displayProperties: ["value", "type", "code"],
        form: {
          sections: {
            contact: { label: "Contact details", fields: ["type", "prefix", "value", "priority"] },
            administration: { label: "Additional details", fields: ["code", "active", "description"] },
          },
          defaultColumns: ["value", "type", "priority", "active"],
        },
        operations: ["search", "read", "create", "update", "delete"],
      },
      schemaPolicies: ["customerOwned"],
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: true,
      },
      definition: {
        prefix: {
          type: "string",
          required: false,
          description: "Add prefix if any like country code for mobile number",
        },
        type: {
          enum: [
            ENUMS.ContactType.EMAIL.key,
            ENUMS.ContactType.PHONE.key,
            ENUMS.ContactType.FAX.key,
            ENUMS.ContactType.PAGER.key,
          ],
          required: true,
          description:
            "Required value could be only in [EMAIL, PHONE, FAX, PAGER]",
        },
        value: {
          type: "string",
          required: true,
          description: "Required value of respective type",
        },
        priority: {
          type: "int",
          required: true,
          default: 0,

          description: 'Stores the numeric priority used by this record.'},
      },
    },

    enterprise: {
      super: "base",
      backoffice: {
        enabled: true,
        label: "Enterprise",
        excludedFields: ["setupRequestKey", "setupRequestHash"],
        displayProperty: "code",
        displayProperties: ["name", "code"],
        form: {
          createOperation: "setupEnterprise",
          completionAction: { label: "Set up enterprise users", path: "/profile/enterprises?tab=users&enterpriseCode={code}" },
          managedCreateFields: ["tenant"],
          sections: {
            enterprise: { label: "Enterprise details", fields: ["name", "code", "active", "description", "roleCodes"] },
            organisation: { label: "Organisation", fields: ["tenant", "superEnterprise", "subEnterprises"] },
            relationships: { label: "Addresses and contacts", fields: ["addresses", "contacts"] },
          },
          hiddenFields: ["capabilityScopes"],
          defaultColumns: ["name", "code", "active", "superEnterprise"],
        },
        aggregateOperations: {
          setupEnterprise: {
            enabled: true,
            label: "Set up enterprise",
            purpose: "CREATE",
            consistency: "MODULE_OWNED",
            confirmationRequired: true,
            service: "DefaultEnterpriseManagementService",
            operation: "createFromWorkbench",
          },
        },
        fields: {
          tenant: { readOnly: true },
          roleCodes: {
            label: "Business roles",
            component: "multiselect",
            enumOptions: [
              { value: "PROGRAM_OPERATOR", label: "Program operator" },
              { value: "SERVICE_PROVIDER", label: "Service provider" },
              { value: "MARKETPLACE_VENDOR", label: "Marketplace vendor" },
              { value: "ISSUER", label: "Issuer" },
              { value: "ASSET_OWNER", label: "Asset owner" },
              { value: "BUSINESS_PARTNER", label: "Business partner" },
            ],
          },
        },
      },
      schemaPolicies: ["administrative"],
      model: true,
      service: {
        enabled: true,
      },
      cache: {
        enabled: true,
        ttl: 360,
      },
      router: {
        enabled: true,
      },
      tenants: ["default"], // if not null, only tenant will be used
      search: {
        enabled: false,
        //indexName: 'enterprise', // if null, moduleName will be taken
        idPropertyName: "code", // if null, code will be taken
      },
      refSchema: {
        tenant: {
          enabled: true,
          schemaName: "tenant",
          type: "one",
          propertyName: "code",
          searchEnabled: true,
        },
        superEnterprise: {
          enabled: true,
          schemaName: "enterprise",
          type: "one",
          propertyName: "code",
        },
        subEnterprises: {
          enabled: true,
          schemaName: "enterprise",
          type: "many",
          propertyName: "code",
        },
        addresses: {
          enabled: true,
          schemaName: "address",
          type: "many",
          propertyName: "code",
        },
        contacts: {
          enabled: true,
          schemaName: "contact",
          type: "many",
          propertyName: "code",
        },
      },
      virtualProperties: {
        fullname: "DefaultEnterpriseVirtualService.getFullName",
        tenant: {
          fullname: "DefaultEnterpriseVirtualService.getFullName",
        },
      },
      definition: {
        setupRequestKey: { type: "string", required: false, readOnly: true, description: "Identifies the authenticated enterprise setup request so an interrupted activation can be resumed without creating another enterprise." },
        setupRequestHash: { type: "string", required: false, readOnly: true, description: "Detects changes to an enterprise setup request before a retry can reuse its completed creation." },
        name: {
          type: "string",
          required: true,
          description: "Name of enterprise",
          searchOptions: {
            enabled: true, // default is false
            default: "test",
          },
        },
        tenant: {
          type: "string",
          required: true,
          label: "Tenant",
          description: "Required Code of associated tenant",
          searchOptions: {
            enabled: true, // default is false
          },
        },
        superEnterprise: {
          type: "objectId",
          required: false,
          label: "Parent enterprise",
          description: "Parent enterprise code if any",
          searchOptions: {
            enabled: true, // default is false
          },
        },
        subEnterprises: {
          type: "array",
          required: false,
          label: "Sub-enterprises",
          description: "List of sub enterprises if any",
        },
        addresses: {
          type: "array",
          required: false,
          description: "All associated addresses with this enterprise",
          searchOptions: {
            enabled: true, // default is false
          },
        },
        contacts: {
          type: "array",
          required: false,
          description: "All associated contacts with this enterprise",
          searchOptions: {
            enabled: true, // default is false
          },
        },
        roleCodes: {
          type: "array",
          required: false,
          description: "Business association roles this enterprise can play, such as PLATFORM_OWNER, PROGRAM_OPERATOR, SERVICE_PROVIDER, MARKETPLACE_VENDOR, ISSUER, ASSET_OWNER, or BUSINESS_PARTNER",
          searchOptions: {
            enabled: true,
          },
        },
        capabilityScopes: {
          type: "array",
          required: false,
          description: "Capability-owned role scope metadata contributed by functional anchor modules while Profile remains the Enterprise schema authority",
        },
      },
      indexes: {
        individual: {
          entTenant: {
            name: "tenant",
            enabled: true,
          },
        },
      },
    },

    userState: {
      super: "super",
      schemaPolicies: ["administrative"],
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: false,
      },
      definition: {
        personId: {
          type: "objectId",
          required: true,

          description: 'Stores the person identifier used to correlate this record.'},
        loginId: {
          type: "string",
          required: true,
          description: "Required unique login id",
        },
        locked: {
          type: "bool",
          required: true,
          default: false,
          description: "Flag to check if user is locked",
        },
        attempts: {
          type: "int",
          required: true,
          default: 0,
          minimum: 0,
          maximum: 5,
          description: "must be an integer in [ 0, 5 ] and is required",
        },
      },
    },

    userGroup: {
      super: "base",
      schemaPolicies: ["administrative"],
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: true,
      },
      refSchema: {
        parentGroups: {
          enabled: true,
          schemaName: "userGroup",
          type: "many",
          propertyName: "code",
        },
      },
      definition: {
        name: {
          type: "string",
          required: true,
          description: "Name of the user group",
        },
        parentGroups: {
          type: "array",
          required: false,
          description: "List of parent groups",
        },
        permissions: {
          type: "array",
          required: false,
          description: "List of action permissions granted by this user group",
        },
      },
    },

    password: {
      super: "super",
      schemaPolicies: ["administrative"],
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: false,
      },
      definition: {
        loginId: {
          type: "string",
          required: true,
          description: "Required unique login id",
        },
        password: {
          type: "string",
          required: true,
          description: "Required password for the login",
        },
      },
    },

    user: {
      super: "base",
      model: false,
      service: {
        enabled: false,
      },
      router: {
        enabled: false,
      },
      refSchema: {
        password: {
          enabled: true,
          schemaName: "password",
          type: "one",
          propertyName: "_id",
        },
        userGroups: {
          enabled: true,
          schemaName: "userGroup",
          type: "many",
          propertyName: "code",
        },
        addresses: {
          enabled: true,
          schemaName: "address",
          type: "many",
          propertyName: "code",
        },
        contacts: {
          enabled: true,
          schemaName: "contact",
          type: "many",
          propertyName: "code",
        },
      },
      definition: {
        authVersion: {
          type: "int",
          required: false,
          default: 1,
          description:
            "Monotonic security stamp used to invalidate issued sessions",
        },
        identityMigrationVersion: {
          type: "int",
          required: false,
          description:
            "Last identity-governance migration applied to this principal",
        },
        principalType: {
          type: "string",
          required: true,
          description: "Principal category: human, service, or customer",
        },
        name: {
          type: "object",
          required: true,

          description: 'Stores the business display name shown to administrators and related user journeys.'},
        "name.title": {
          type: "string",
          required: false,
          description: "Title for the user",
        },
        "name.firstName": {
          type: "string",
          required: true,
          description: "First name for the user",
        },
        "name.middleName": {
          type: "string",
          required: false,
          description: "Middle name for the user if any",
        },
        "name.lastName": {
          type: "string",
          required: true,
          description: "Last name for the user",
        },
        loginId: {
          type: "string",
          required: true,
          description: "Required unique login id",
        },
        password: {
          type: "objectId",
          required: true,
          description: "Required password for the login",
        },
        userGroups: {
          type: "array",
          required: true,
          description: "User group code for which this user belongs",
        },
        addresses: {
          type: "array",
          required: false,
          description: "All associated addresses with this enterprise",
        },
        contacts: {
          type: "array",
          required: false,
          description: "All associated contacts with this enterprise",
        },
      },

      indexes: {
        // composite: {
        //     indexName: {
        //         name: 'name',
        //         enabled: true,
        //         options: {
        //             unique: true
        //         }
        //     },
        //     indexName1: {
        //         name: 'name1',
        //         enabled: true,
        //         options: {
        //             unique: true
        //         }
        //     }
        // },
        individual: {
          indexLoginId: {
            name: "loginId",
            enabled: true,
            options: {
              unique: true,
            },
          },
        },
      },
    },

    employee: {
      super: "user",
      schemaPolicies: ["administrative"],
      backoffice: {
        displayProperty: "loginId",
        displayProperties: ["loginId", "name.firstName", "name.lastName"],
        searchableFields: [
          "loginId",
          "code",
          "name.firstName",
          "name.lastName",
        ],
        sortableFields: [
          "loginId",
          "code",
          "name.firstName",
          "name.lastName",
          "created",
          "updated",
        ],
        filterFields: [
          "loginId",
          "code",
          "name.firstName",
          "name.lastName",
          "principalType",
          "created",
          "updated",
        ],
        defaultSortField: "loginId",
        defaultSortDirection: "ASC",
        excludedFields: [
          "apiKeyPrefix",
          "apiKeyStatus",
          "apiKeyCreatedAt",
          "apiKeyExpiresAt",
          "apiKeyScopes",
        ],
      },
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: true,
      },
      definition: {
        apiKey: {
          type: "string",
          required: false,
          description:
            "Legacy plaintext API key accepted only for governed migration and removed during rotation",
        },
        apiKeyHash: {
          type: "string",
          required: false,
          description:
            "Keyed digest used for service API-key lookup without persisting usable credential material",
        },
        apiKeyPrefix: {
          type: "string",
          required: false,
          description:
            "Non-secret API-key prefix used for operator identification",
        },
        apiKeyStatus: {
          type: "string",
          required: false,
          description: "API key lifecycle state: active, disabled, or revoked",
        },
        apiKeyCreatedAt: {
          type: "date",
          required: false,

          description: 'Records when the api key created event or value applies.'},
        apiKeyExpiresAt: {
          type: "date",
          required: false,

          description: 'Records when the api key expires event or value applies.'},
        apiKeyScopes: {
          type: "array",
          required: false,
          description:
            "Optional least-privilege permissions granted to the API key",
        },
      },
    },

    customer: {
      super: "user",
      definition: { "name.lastName": { type: "string", required: false, description: "Family name when the customer has one; mononyms remain valid" } },
      schemaPolicies: ["customerOwned"],
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: true,
      },
      cache: {
        enabled: true,
        ttl: 20,
      },
    },

    externalIdentityLink: {
      super: 'base', model: true, schemaPolicies: ['administrative'],
      service: { enabled: true }, router: { enabled: false }, cache: { enabled: false }, search: { enabled: false }, event: { enabled: false },
      backoffice: { enabled: false, concurrency: { managed: true, field: 'revision' } },
      definition: {
        code: { type: 'string', required: true, description: 'Stable hash of verified enterprise, provider, application and external subject' },
        enterpriseCode: { type: 'string', required: true, description: 'Enterprise which owns this external identity integration' },
        provider: { type: 'string', required: true, description: 'Configured trusted identity provider' },
        applicationCode: { type: 'string', required: true, description: 'Configured application within the provider' },
        applicationSubject: { type: 'string', required: true, description: 'Verified external application identifier' },
        providerSubject: { type: 'string', required: true, description: 'Verified immutable external user identifier' },
        principalCode: { type: 'string', required: true, description: 'Canonical Profile customer login identifier' },
        authVersion: { type: 'string', required: true, description: 'Principal security stamp at explicit linking' },
        allowsWrite: { type: 'bool', required: true, description: 'Verified provider permission to send direct outcome messages' },
        revision: { type: 'int', required: true, description: 'Managed optimistic concurrency revision', default: 0 },
        status: { type: 'string', required: true, enum: ['ACTIVE', 'REVOKED'], description: 'External identity link lifecycle' }
      },
      indexes: { individual: { externalIdentityKey: { name: 'code', enabled: true, options: { unique: true } } } }
    },

    principalScopeAssignment: {
      super: "base",
      schemaPolicies: ["administrative"],
      backoffice: {
        enabled: true,
        label: "Principal Scope Assignment",
        displayProperty: "code",
        displayProperties: [
          "code",
          "principalCode",
          "scopeType",
          "scopeCode",
          "effect",
          "status",
        ],
        searchableFields: [
          "code",
          "principalCode",
          "groupCode",
          "scopeCode",
          "permissionCode",
          "capabilityCode",
        ],
        sortableFields: [
          "code",
          "principalCode",
          "scopeType",
          "scopeCode",
          "effect",
          "status",
          "created",
          "updated",
        ],
        filterFields: [
          "principalType",
          "principalCode",
          "groupCode",
          "scopeType",
          "scopeCode",
          "effect",
          "status",
        ],
        defaultSortField: "code",
        defaultSortDirection: "ASC",
      },
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: true,
      },
      cache: {
        enabled: true,
        ttl: 120,
      },
      refSchema: {
        groupCode: {
          enabled: true,
          schemaName: "userGroup",
          type: "one",
          propertyName: "code",
        },
        tenantCode: {
          enabled: true,
          schemaName: "tenant",
          type: "one",
          propertyName: "code",
        },
        enterpriseCode: {
          enabled: true,
          schemaName: "enterprise",
          type: "one",
          propertyName: "code",
        },
      },
      definition: {
        principalType: {
          type: "string",
          required: true,
          description:
            "Principal category receiving the scope, such as human, service, customer, or group",
        },
        principalCode: {
          type: "string",
          required: false,
          description:
            "Login id or stable code of the direct principal receiving the scope",
        },
        groupCode: {
          type: "string",
          required: false,
          description:
            "User group code when the scope is granted through group membership",
        },
        permissionCode: {
          type: "string",
          required: false,
          description: "Optional permission narrowed by this scope assignment",
        },
        capabilityCode: {
          type: "string",
          required: false,
          description:
            "Optional BackOffice or business capability narrowed by this scope assignment",
        },
        scopeType: {
          type: "string",
          required: true,
          description:
            "Business scope type such as GLOBAL, TENANT, ENTERPRISE, CATALOG, CHANNEL, STORE, REGION, or BUSINESS_UNIT",
        },
        scopeCode: {
          type: "string",
          required: true,
          description: "Stable code for the scoped object",
        },
        tenantCode: {
          type: "string",
          required: false,
          description: "Tenant context for scoped authorization",
        },
        enterpriseCode: {
          type: "string",
          required: false,
          description: "Enterprise context for scoped authorization",
        },
        effect: {
          type: "string",
          required: true,
          description: "ALLOW or DENY effect for the assignment",
        },
        inheritanceMode: {
          type: "string",
          required: true,
          description:
            "How the scope assignment applies: DIRECT, GROUP, or GROUP_AND_DESCENDANTS",
        },
        status: {
          type: "string",
          required: true,
          description: "Lifecycle status for the assignment",
        },
        effectiveFrom: {
          type: "date",
          required: false,
          description: "Optional start time for this assignment",
        },
        effectiveTo: {
          type: "date",
          required: false,
          description: "Optional end time for this assignment",
        },
        reasonCode: {
          type: "string",
          required: false,
          description: "Operator-facing reason for the scope assignment",
        },
      },
      indexes: {
        individual: {
          principalType: { name: "principalType", enabled: true },
          principalCode: { name: "principalCode", enabled: true },
          groupCode: { name: "groupCode", enabled: true },
          scopeType: { name: "scopeType", enabled: true },
          scopeCode: { name: "scopeCode", enabled: true },
          status: { name: "status", enabled: true },
        },
      },
    },

    enterpriseAccessAssignment: {
      super: "base",
      schemaPolicies: ["administrative"],
      backoffice: {
        enabled: true,
        label: "Enterprise Access Assignment",
        displayProperty: "email",
        displayProperties: [
          "code",
          "email",
          "enterpriseCode",
          "roleCode",
          "status",
        ],
        searchableFields: [
          "code",
          "email",
          "normalizedEmail",
          "enterpriseCode",
          "tenantCode",
          "roleCode",
          "status",
        ],
        sortableFields: [
          "code",
          "email",
          "enterpriseCode",
          "roleCode",
          "status",
          "created",
          "updated",
        ],
        filterFields: [
          "enterpriseCode",
          "tenantCode",
          "roleCode",
          "status",
        ],
        defaultSortField: "created",
        defaultSortDirection: "DESC",
      },
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: false,
      },
      cache: {
        enabled: true,
        ttl: 60,
      },
      definition: {
        email: {
          type: "string",
          required: true,
          description:
            "Email address pre-approved for enterprise employee registration",
          searchOptions: {
            enabled: true,
          },
        },
        normalizedEmail: {
          type: "string",
          required: true,
          description:
            "Lower-case normalized email used for invite lookup and registration matching",
          searchOptions: {
            enabled: true,
          },
        },
        enterpriseCode: {
          type: "string",
          required: true,
          description: "Enterprise receiving the employee registration",
          searchOptions: {
            enabled: true,
          },
        },
        tenantCode: {
          type: "string",
          required: true,
          description:
            "Tenant where the registered employee identity will be stored",
          searchOptions: {
            enabled: true,
          },
        },
        roleCode: {
          type: "string",
          required: true,
          description:
            "Configured enterprise-user role selected by the inviting administrator",
          searchOptions: {
            enabled: true,
          },
        },
        groupCodes: {
          type: "array",
          required: true,
          description:
            "User groups assigned when the pre-approved employee completes registration",
        },
        scopeType: {
          type: "string",
          required: true,
          default: "ENTERPRISE",
          description: "Scope type applied to the registered employee",
        },
        scopeCode: {
          type: "string",
          required: true,
          description: "Stable scope code applied to the registered employee",
        },
        status: {
          type: "string",
          required: true,
          default: "PENDING",
          description: "PENDING, ACTIVE, REGISTERED, EXPIRED, or REVOKED",
          searchOptions: {
            enabled: true,
          },
        },
        expiresAt: {
          type: "date",
          required: false,
          description: "Optional expiry timestamp for this pre-assigned registration",
        },
        invitedBy: {
          type: "string",
          required: false,
          description: "Authenticated principal that created this assignment",
        },
        message: {
          type: "string",
          required: false,
          description: "Optional operator-facing note for the invited user",
        },
        registeredLoginId: {
          type: "string",
          required: false,
          description: "Employee login id created from this assignment",
        },
        registeredAt: {
          type: "date",
          required: false,
          description: "Registration completion timestamp",
        },
      },
      indexes: {
        individual: {
          normalizedEmail: { name: "normalizedEmail", enabled: true },
          enterpriseCode: { name: "enterpriseCode", enabled: true },
          tenantCode: { name: "tenantCode", enabled: true },
          roleCode: { name: "roleCode", enabled: true },
          status: { name: "status", enabled: true },
        },
      },
    },

    identityMigrationAudit: {
      super: "base",
      schemaPolicies: ["administrative"],
      model: true,
      service: { enabled: true },
      event: { enabled: false },
      router: { enabled: false },
      definition: {
        migrationVersion: { type: "int", required: true , description: 'Stores the numeric migration version used by this record.'},
        status: { type: "string", required: true , description: 'Tracks the lifecycle state that controls whether this record can be used in business processes.'},
        tenant: { type: "string", required: true , description: 'Identifies the runtime tenant partition that scopes this record.'},
        requestedBy: { type: "string", required: false , description: 'Stores the requested by value used by this record.'},
        preview: { type: "object", required: false , description: 'Stores structured preview details used by this record.'},
        snapshot: { type: "object", required: false , description: 'Stores structured snapshot details used by this record.'},
        result: { type: "object", required: false , description: 'Stores structured result details used by this record.'},
        correlationId: { type: "string", required: false , description: 'Stores the correlation identifier used to correlate this record.'},
      },
    },
  },
};
