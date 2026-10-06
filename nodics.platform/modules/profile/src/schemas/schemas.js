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
    profileCommandReceipt: { super: 'commandReceipt', model: true, service: { enabled: true } },
    tenant: {
      super: "super",
      indexes: {
        individual: {
          tenantCode: { name: "code", enabled: true, options: { unique: true } },
        },
      },
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
            enabled: false, // Lifecycle provenance and storage bindings must not enter search indexes.
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
        displayProperties: [
          "building",
          "street",
          "city",
          "countryCode",
          "code",
        ],
        form: {
          sections: {
            address: {
              label: "Address",
              fields: [
                "type",
                "flatNo",
                "building",
                "street",
                "addressLine1",
                "addressLine2",
                "locality",
                "city",
                "state",
                "postalCode",
                "countryCode",
                "isPrimery",
              ],
            },
            contacts: {
              label: "Contact details",
              fields: ["contacts", "landmarkHint", "accessNotes"],
            },
            administration: {
              label: "Additional details",
              fields: ["code", "active", "description"],
            },
          },
          hiddenFields: [
            "geocodingProvider",
            "geocodingReference",
            "geocodingPrecision",
            "geocodingConfidence",
            "verificationSource",
            "verifiedByRef",
            "verifiedAt",
            "displayPolicy",
          ],
          defaultColumns: ["code", "type", "building", "city", "countryCode"],
        },
        operations: ["search", "read", "create", "update", "delete"],
        relationships: {
          contacts: {
            targetModule: "profile",
            actions: [
              "SELECT_EXISTING",
              "CREATE_RELATED",
              "EDIT_RELATED",
              "UNLINK",
            ],
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
      readProtection: {
        owner: "DefaultProfileVerifiedContactInterceptorService",
        qualified: false,
      },
      backoffice: {
        enabled: true,
        label: "Contact",
        displayProperty: "code",
        displayProperties: ["value", "type", "code"],
        form: {
          sections: {
            contact: {
              label: "Contact details",
              fields: ["type", "prefix", "value", "priority"],
            },
            administration: {
              label: "Additional details",
              fields: ["code", "active", "description"],
            },
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

          description: "Stores the numeric priority used by this record.",
        },
      },
    },

    enterprise: {
      readProtection: {
        owner: "DefaultProfileVerifiedContactInterceptorService",
        qualified: false,
      },
      super: "base",
      backoffice: {
        enabled: true,
        label: "Enterprise",
        excludedFields: [
          "setupRequestKey",
          "setupRequestHash",
          "defaultAdminAssignmentCode",
          "administrationConsent",
          "administrationHierarchyEpoch",
          "administrationHierarchyOperation",
          "administrationHierarchySerialOperation",
        ],
        displayProperty: "code",
        displayProperties: ["name", "code"],
        form: {
          createOperation: "setupEnterprise",
          completionAction: {
            label: "Set up enterprise users",
            path: "/profile/enterprises?tab=users&enterpriseCode={code}",
          },
          managedCreateFields: ["tenant"],
          sections: {
            enterprise: {
              label: "Enterprise details",
              fields: [
                "name",
                "code",
                "active",
                "description",
                "roleCodes",
                "adminEmail",
              ],
            },
            organisation: {
              label: "Organisation",
              fields: ["tenant", "superEnterprise", "subEnterprises"],
            },
            relationships: {
              label: "Addresses and contacts",
              fields: ["addresses", "contacts"],
            },
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
            controller: "DefaultEnterpriseManagementController",
            operation: "create",
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
        adminEmail: {
          type: "string",
          required: false,
          label: "Administrator email",
          description:
            "Initial administrator nomination. Leave blank only when one enterprise EMAIL contact is selected. Later contact edits never transfer access.",
        },
        defaultAdminAssignmentCode: {
          type: "string",
          required: false,
          readOnly: true,
          description:
            "Profile-owned initial/default administrator association; not a credential or editable access grant.",
        },
        administrationConsent: {
          type: "object",
          required: false,
          readOnly: true,
          description:
            "Private Profile-owned explicit ancestor consent, retained provenance and reviewed command evidence. Never editable through generic CRUD.",
        },
        administrationHierarchyEpoch: {
          type: "int",
          required: false,
          readOnly: true,
          description:
            "Managed relationship generation; prevents old relationship-dependent authority reviving after reparenting.",
        },
        administrationHierarchyOperation: {
          type: "object",
          required: false,
          readOnly: true,
          description:
            "Private held relationship change, dependent invalidation targets and original reviewed actor/command. Never generic CRUD input.",
        },
        administrationHierarchySerialOperation: {
          type: "object",
          required: false,
          readOnly: true,
          description:
            "Private platform-Enterprise serial fence for graph mutations; retained command and generation, never caller-owned authority.",
        },
        setupRequestKey: {
          type: "string",
          required: false,
          readOnly: true,
          description:
            "Identifies the authenticated enterprise setup request so an interrupted activation can be resumed without creating another enterprise.",
        },
        setupRequestHash: {
          type: "string",
          required: false,
          readOnly: true,
          description:
            "Detects changes to an enterprise setup request before a retry can reuse its completed creation.",
        },
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
          type: "string",
          required: false,
          label: "Parent enterprise",
          description: "Parent enterprise code resolved through the code-owned Profile hierarchy; never a database identifier",
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
          description:
            "Business association roles this enterprise can play, such as PLATFORM_OWNER, PROGRAM_OPERATOR, SERVICE_PROVIDER, MARKETPLACE_VENDOR, ISSUER, ASSET_OWNER, or BUSINESS_PARTNER",
          searchOptions: {
            enabled: true,
          },
        },
        capabilityScopes: {
          type: "array",
          required: false,
          description:
            "Capability-owned role scope metadata contributed by functional anchor modules while Profile remains the Enterprise schema authority",
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
      router: { groups: { schemaOperations: true }, enabled: true },
      definition: {
        personId: {
          type: "objectId",
          required: true,

          description:
            "Stores the person identifier used to correlate this record.",
        },
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
      readProtection: {
        owner: "DefaultProfileVerifiedContactInterceptorService",
        qualified: false,
      },
      super: "super",
      schemaPolicies: ["administrative"],
      model: true,
      service: {
        enabled: true,
      },
      router: { groups: { schemaOperations: true }, enabled: true },
      backoffice: { concurrency: { managed: false, field: "revision" } },
      credentialRetirement: {
        enabled: false,
        writerCoverageQualified: false,
        revisionField: "revision",
        credentialField: "password",
        activeField: "active",
        evidenceField: "identityLinkRetirement",
        ownerService: "DefaultCanonicalHistoricalIdentityLinkService",
      },
      definition: {
        revision: {
          type: "long",
          required: false,
          description: "Original generated credential revision; managed ownership is opt-in after approved migration",
        },
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

          description:
            "Stores the business display name shown to administrators and related user journeys.",
        },
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
      readProtection: {
        owner: "DefaultProfileVerifiedContactInterceptorService",
        qualified: false,
      },
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

          description:
            "Records when the api key created event or value applies.",
        },
        apiKeyExpiresAt: {
          type: "date",
          required: false,

          description:
            "Records when the api key expires event or value applies.",
        },
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
      readProtection: {
        owner: "DefaultProfileVerifiedContactInterceptorService",
        qualified: false,
      },
      definition: {
        "name.lastName": {
          type: "string",
          required: false,
          description:
            "Family name when the customer has one; mononyms remain valid",
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
        enabled: true,
        ttl: 20,
      },
    },

    externalIdentityLink: {
      super: "base",
      model: true,
      schemaPolicies: ["administrative"],
      service: { enabled: true },
      router: { enabled: false },
      cache: { enabled: false },
      search: { enabled: false },
      event: { enabled: false },
      backoffice: {
        enabled: false,
        concurrency: { managed: true, field: "revision" },
      },
      definition: {
        code: {
          type: "string",
          required: true,
          description:
            "Stable hash of verified enterprise, provider, application and external subject",
        },
        enterpriseCode: {
          type: "string",
          required: true,
          description:
            "Enterprise which owns this external identity integration",
        },
        provider: {
          type: "string",
          required: true,
          description: "Configured trusted identity provider",
        },
        applicationCode: {
          type: "string",
          required: true,
          description: "Configured application within the provider",
        },
        applicationSubject: {
          type: "string",
          required: true,
          description: "Verified external application identifier",
        },
        providerSubject: {
          type: "string",
          required: true,
          description: "Verified immutable external user identifier",
        },
        principalCode: {
          type: "string",
          required: true,
          description: "Canonical Profile customer login identifier",
        },
        authVersion: {
          type: "string",
          required: true,
          description: "Principal security stamp at explicit linking",
        },
        allowsWrite: {
          type: "bool",
          required: true,
          description:
            "Verified provider permission to send direct outcome messages",
        },
        revision: {
          type: "int",
          required: true,
          description: "Managed optimistic concurrency revision",
          default: 0,
        },
        status: {
          type: "string",
          required: true,
          enum: ["ACTIVE", "REVOKED"],
          description: "External identity link lifecycle",
        },
      },
      indexes: {
        individual: {
          externalIdentityKey: {
            name: "code",
            enabled: true,
            options: { unique: true },
          },
        },
      },
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
        enabled: false,
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
        runtimeScope: {
          type: "object",
          required: false,
          description:
            "Direct RUNTIME_DEPLOYMENT assignment: approved projectCode, environmentCode, serverCode, instanceCode, modules and permissions. Profile governance validates this scope before storage and issuance.",
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
        filterFields: ["enterpriseCode", "tenantCode", "roleCode", "status"],
        defaultSortField: "created",
        defaultSortDirection: "DESC",
      },
      model: true,
      service: {
        enabled: true,
      },
      router: { groups: { schemaOperations: true }, enabled: true },
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
          description:
            "Optional expiry timestamp for this pre-assigned registration",
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
      readProtection: {
        owner: "DefaultProfileVerifiedContactInterceptorService",
        qualified: false,
      },
      super: "base",
      schemaPolicies: ["administrative"],
      model: true,
      service: { enabled: true },
      event: { enabled: false },
      router: { groups: { schemaOperations: true }, enabled: true },
      definition: {
        migrationVersion: {
          type: "int",
          required: true,
          description:
            "Stores the numeric migration version used by this record.",
        },
        status: {
          type: "string",
          required: true,
          description:
            "Tracks the lifecycle state that controls whether this record can be used in business processes.",
        },
        tenant: {
          type: "string",
          required: true,
          description:
            "Identifies the runtime tenant partition that scopes this record.",
        },
        requestedBy: {
          type: "string",
          required: false,
          description: "Stores the requested by value used by this record.",
        },
        preview: {
          type: "object",
          required: false,
          description: "Stores structured preview details used by this record.",
        },
        snapshot: {
          type: "object",
          required: false,
          description:
            "Stores structured snapshot details used by this record.",
        },
        result: {
          type: "object",
          required: false,
          description: "Stores structured result details used by this record.",
        },
        correlationId: {
          type: "string",
          required: false,
          description:
            "Stores the correlation identifier used to correlate this record.",
        },
      },
    },
  },
};

// Extend the existing assignment, not a separate onboarding or identity registry.
// This private checkpoint must never be exposed through generated HTTP CRUD.
Object.assign(module.exports.profile.enterpriseAccessAssignment, {
  router: { enabled: false },
  cache: { enabled: false },
  event: { enabled: false },
  backoffice: {
    enabled: false,
    concurrency: { managed: true, field: "revision" },
  },
});
Object.assign(module.exports.profile.enterpriseAccessAssignment.definition, {
  revision: {
    type: "int",
    required: true,
    default: 0,
    description: "Generated managed compare-and-set revision.",
  },
  registration: {
    type: "object",
    required: false,
    description:
      "Private immutable command details and acknowledged provisioning checkpoint; contains no password or raw proof.",
  },
  identityClaimed: {
    type: "bool",
    required: false,
    description:
      "Reserves one invited-new-employee registration per normalised email in the Profile authority.",
  },
});
// Existing installed indexes require an authorised inspection/migration before
// enabling the journey. No startup script, reset or index execution is added.
module.exports.profile.enterpriseAccessAssignment.indexes.individual.normalizedEmail =
  {
    name: "normalizedEmail",
    enabled: true,
    options: {
      unique: true,
      partialFilterExpression: { identityClaimed: true },
    },
  };
module.exports.profile.employee.definition.registrationAssignmentCode = {
  type: "string",
  required: false,
  description:
    "Profile assignment used to gate initial employee session readiness. This reference itself grants no access.",
};
module.exports.profile.employee.backoffice.excludedFields = [
  ...module.exports.profile.employee.backoffice.excludedFields,
  "registrationAssignmentCode",
];

module.exports.profile.employee.definition.registrationSuspended = {
  type: "bool",
  required: false,
  description:
    "Explicit employee disable/reactivate decision; initial inactive registration is not a suspension. Inert for legacy principals without a registration reference.",
};
module.exports.profile.contact.definition.profileVerifiedContact = {
  type: "object",
  required: false,
  readOnly: true,
  description:
    "Private canonical contact proof checkpoints, explicit transactional consent and suppression. No raw verification secret or proof; only the verified Contact owner may mutate this evidence.",
};
module.exports.profile.contact.backoffice.excludedFields = [
  ...(module.exports.profile.contact.backoffice.excludedFields || []),
  "profileVerifiedContact",
];
module.exports.profile.employee.backoffice.excludedFields.push(
  "registrationSuspended",
);

// Original accounts still require credentials through the Profile save guard.
// Only the private membership owner may create a credential-free projection.
for (const name of ["employee", "customer", "password"]) {
  module.exports.profile[name].definition.identityLinkRetirement = {
    type: "object",
    required: false,
    readOnly: true,
    description:
      "Private original historical-link retirement handle and reviewed fingerprint. No credentials; generic replacement/reactivation is prohibited.",
  };
  if (module.exports.profile[name].backoffice) {
    module.exports.profile[name].backoffice.excludedFields = [
      ...(module.exports.profile[name].backoffice.excludedFields || []),
      "identityLinkRetirement",
    ];
  }
}
module.exports.profile.employee.definition.password = {
  type: "objectId",
  required: false,
  description:
    "Original account credential; absent only on an owner-proved canonical identity projection.",
};
for (const name of ["employee", "customer"]) {
  // Installation is governed separately; a property flag cannot certify indexes.
  const indexes = module.exports.profile[name].indexes || {};
  module.exports.profile[name].indexes = {
    ...indexes,
    composite: {
      ...indexes.composite,
      canonicalTenant: {
        name: "authenticationIdentity.tenantCode",
        enabled: false,
        options: {
          unique: true,
          partialFilterExpression: {
            "authenticationIdentity.tenantCode": { $type: "string" },
            "authenticationIdentity.recordKind": { $type: "string" },
            "authenticationIdentity.recordId": { $type: "string" },
          },
        },
      },
      canonicalKind: {
        name: "authenticationIdentity.recordKind",
        enabled: false,
      },
      canonicalRecord: {
        name: "authenticationIdentity.recordId",
        enabled: false,
      },
    },
  };
  module.exports.profile[name].definition.password = {
    type: "objectId",
    required: false,
    description:
      "Original credential, required by the owner save guard unless a privately admitted canonical projection.",
  };
  module.exports.profile[name].definition.authenticationIdentity = {
    type: "object",
    required: false,
    description:
      "Private direct immutable canonical locator. Never copied credentials, an email-based link, a chain or client-supplied identity proof.",
  };
  module.exports.profile[name].backoffice = {
    ...(module.exports.profile[name].backoffice || {}),
    excludedFields: [
      ...(module.exports.profile[name].backoffice?.excludedFields || []),
      "authenticationIdentity",
    ],
  };
}
module.exports.profile.customer.definition.customerParticipation = {
  type: "object",
  required: false,
  description:
    "Private explicit customer terms acceptance and independent participation revision. Never employee authority.",
};
module.exports.profile.customer.backoffice.excludedFields.push(
  "customerParticipation",
);
Object.assign(module.exports.profile.identityMigrationAudit.definition, {
  recoveryOperationId: {
    type: "string",
    required: false,
    description:
      "Unique structural recovery admission claim; ambiguous recovering audits remain locked.",
  },
  appliedChangeCount: {
    type: "int",
    required: false,
    description:
      "Count of structural writes whose progress was durably acknowledged; not automatic crash-resume authority.",
  },
  planFingerprint: {
    type: "string",
    required: false,
    description:
      "Reviewed structural change-set fingerprint retained for audit reconciliation.",
  },
});
module.exports.profile.enterpriseAccessAssignment.definition.lifecycleNotifications =
  {
    type: "object",
    required: false,
    description:
      "Private frozen lifecycle message/intent evidence; delivery belongs to Communication.",
  };
Object.assign(module.exports.profile.enterpriseAccessAssignment.definition, {
  invitationAuthority: {
    type: "object",
    required: false,
    description:
      "Private inviter identity and context, rechecked before membership acceptance.",
  },
  membership: {
    type: "object",
    required: false,
    description:
      "Private immutable identity binding and recoverable acceptance checkpoint, not a new identity reservation.",
  },
  membershipMutation: {
    type: "string",
    required: false,
    description: "Private exact own-write acknowledgement marker.",
  },
  invitationWithdrawal: {
    type: "object",
    required: false,
    description: "Private serialized unused-invitation withdrawal evidence.",
    backoffice: { exclude: true },
  },
});
Object.assign(module.exports.profile.enterprise.definition, {
  setupContinuation: {
    type: "object",
    required: false,
    readOnly: true,
    searchOptions: { enabled: false },
    description:
      "Private original setup nomination and monotonic continuation checkpoints.",
  },
  teamRevision: {
    type: "int",
    required: false,
    description:
      "Private serialized team-operation generation, not a last-writer timestamp.",
  },
  teamOperation: {
    type: "object",
    required: false,
    description:
      "Private immutable team command, pending recovery or safe completed outcome. No credentials.",
  },
});
module.exports.profile.enterprise.backoffice.excludedFields = [
  ...(module.exports.profile.enterprise.backoffice.excludedFields || []),
  "teamRevision",
  "teamOperation",
  "defaultAdminAssignmentCode",
  "setupContinuation",
];
module.exports.profile.enterprise.readProtection = {
  ...module.exports.profile.enterprise.readProtection,
  owner: "DefaultEnterpriseSetupContinuationService",
};
for (const field of [
  "setupRequestKey",
  "setupRequestHash",
  "defaultAdminAssignmentCode",
  "teamRevision",
  "teamOperation",
])
  module.exports.profile.enterprise.definition[field].searchOptions = {
    enabled: false,
  };

// Enterprise policy controls discovery; an application remains private pending data.
module.exports.profile.enterprise.definition.employeeApplicationPolicy = {
  type: "object",
  required: false,
  description:
    "Explicit employee application eligibility: enabled, supported method and configured initial role. Absence disables self-application. This policy never approves an applicant.",
};
Object.assign(module.exports.profile.enterpriseAccessAssignment.definition, {
  origin: {
    type: "string",
    required: false,
    description:
      "ADMIN_PRE_ENROLLED or SELF_APPLICATION; a self-application is never an administrator invitation.",
  },
  application: {
    type: "object",
    required: false,
    description:
      "Private proof-bound application details and submission checkpoint, separate from employee provisioning. No passwords or raw email proof.",
  },
});

// Eligibility evidence stays on the existing Customer, with no separate policy/revision authority.
module.exports.profile.customer.definition.customerEligibilityDecision = {
  type: "object",
  required: false,
  readOnly: true,
  description: "Private current Rules eligibility receipt, bounded retained history and pending policy invalidation fence. Owner-managed; no credentials, raw facts, regulated KYC certificate or invented policy revision.",
};
module.exports.profile.customer.backoffice.excludedFields = [
  ...(module.exports.profile.customer.backoffice.excludedFields || []),
  "customerEligibilityDecision",
];
