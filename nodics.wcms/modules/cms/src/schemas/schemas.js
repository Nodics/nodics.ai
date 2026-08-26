/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/schemas/schemas
 * @description CMS schema contribution defining type codes, renderer mappings, sites, pages, components, and component-detail relationships.
 * @layer schema
 * @owner cms
 * @override Project modules may extend or govern CMS schemas through layered schema fragments without modifying this definition.
 */
module.exports = {
    cms: {
        cmsTypeCode: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            cache: {
                enabled: true,
                ttl: 10000
            },
            router: {
                enabled: true
            },
            definition: {
                kind: {
                    type: 'string',
                    required: true,
                    default: 'COMPONENT',
                    enum: ['PAGE', 'COMPONENT'],
                    description: 'Declares whether the type classifies pages or components'
                },
                contractVersion: {
                    type: 'int',
                    required: true,
                    default: 1,
                    description: 'Major version of the declarative type contract'
                },
                propertySchema: {
                    type: 'object',
                    required: false,
                    description: 'Declarative property contract; executable code is prohibited'
                },
                mediaSchema: {
                    type: 'object',
                    required: false,
                    description: 'Declarative CMS media-association contract; actual media lifecycle remains owned by media'
                }
            }
        },
        cmsTypeCode2Renderer: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            cache: {
                enabled: true,
                ttl: 10000
            },
            router: {
                enabled: true
            },
            definition: {
                renderer: {
                    type: 'string',
                    required: true,
                    description: 'Logical renderer key resolved by an API consumer; never an executable path or URL',
                },
                contractVersion: {
                    type: 'int',
                    required: true,
                    default: 1,
                    description: 'Major renderer contract version understood by compatible API consumers',
                },
                channels: {
                    type: 'array',
                    required: true,
                    default: ['web'],
                    description: 'Delivery channels for which the renderer mapping is supported',
                },
                deprecated: {
                    type: 'bool',
                    required: true,
                    default: false,
                    description: 'Signals that new content should migrate away from this renderer contract',
                },
                replacementRenderer: {
                    type: 'string',
                    required: false,
                    description: 'Optional logical renderer key recommended when this mapping is deprecated',
                }
            }
        },
        cmsBase: {
            super: 'base',
            model: false,
            service: {
                enabled: false
            },
            cache: {
                enabled: true,
                ttl: 10000
            },
            router: {
                enabled: false
            },
            definition: {
            }
        },
        cmsComponentTypeGroup: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: {
                enabled: true
            },
            cache: {
                enabled: true,
                ttl: 10000
            },
            router: {
                enabled: true
            },
            search: {
                enabled: false,
                idPropertyName: 'code',
            },
            refSchema: {
                componentTypeCodes: {
                    enabled: true,
                    schemaName: 'cmsTypeCode',
                    type: 'many',
                    propertyName: 'code',
                    searchEnabled: true
                }
            },
            definition: {
                name: {
                    type: 'string',
                    required: true,
                    description: 'Human-readable component type group name',
                    searchOptions: {
                        enabled: true,
                    }
                },
                description: {
                    type: 'string',
                    required: false,
                    description: 'Business description of the component type group'
                },
                componentTypeCodes: {
                    type: 'array',
                    required: true,
                    description: 'CMS component type codes belonging to this authoring group',
                    searchOptions: {
                        enabled: true,
                    }
                },
                status: {
                    type: 'string',
                    required: true,
                    default: 'ACTIVE',
                    enum: ['ACTIVE', 'INACTIVE'],
                    description: 'Authoring availability for this component type group',
                    searchOptions: {
                        enabled: true,
                    }
                },
                sortOrder: {
                    type: 'int',
                    required: true,
                    default: 100,
                    description: 'Authoring display order for this component type group'
                }
            }
        },
        cmsSite: {
            super: 'cmsBase',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            search: {
                enabled: false,
                idPropertyName: 'code',
            },
            refSchema: {
                catalog: {
                    enabled: true,
                    schemaName: "catalog",
                    type: 'one',
                    propertyName: 'code',
                    searchEnabled: true
                },
            },
            definition: {
                name: {
                    type: 'string',
                    required: false,
                    description: 'Required cms site name',
                    searchOptions: {
                        enabled: true,
                    }
                },
                catalog: {
                    type: 'string',
                    required: true,
                    description: 'Required Code of associated catalog',
                    searchOptions: {
                        enabled: true,
                    }
                }
            }
        },

        cmsComponentDetail: {
            super: 'base',
            isVersionedEnabled: false,
            model: true,
            service: {
                enabled: true
            },
            cache: {
                enabled: true,
                ttl: 10000
            },
            router: {
                enabled: false
            },
            refSchema: {
                target: {
                    enabled: true,
                    schemaName: "cmsComponent",
                    type: 'one',
                    propertyName: 'code',
                    searchEnabled: true
                },
            },
            definition: {
                source: {
                    type: 'string',
                    required: true,
                    default: 0,
                    description: 'Required source component, it could be a page or component itself',
                },
                target: {
                    type: 'string',
                    required: true,
                    default: 0,
                    description: 'Required target component, it will be component',
                },
                index: {
                    type: 'int',
                    required: true,
                    default: 0,
                    description: 'Required position of this component in the super component',
                },
                slot: {
                    type: 'string',
                    required: false,
                    default: 'default',
                    description: 'Logical template slot containing this ordered component association',
                }
            },
            indexes: {
                composite: {
                    source: {
                        enabled: true,
                        name: 'source',
                        options: {
                            unique: true
                        }
                    },
                    target: {
                        enabled: true,
                        name: 'target',
                        options: {
                            unique: true
                        }
                    },
                    slot: {
                        enabled: true,
                        name: 'slot',
                        options: {
                            unique: true
                        }
                    }
                }
            }
        },

        cmsPage: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            search: {
                enabled: false,
                idPropertyName: 'code',
            },
            refSchema: {
                cmsSite: {
                    enabled: true,
                    schemaName: "cmsSite",
                    type: 'many',
                    propertyName: 'code',
                    searchEnabled: true
                },
                typeCode: {
                    enabled: true,
                    schemaName: "cmsTypeCode",
                    type: 'one',
                    propertyName: 'code',
                    searchEnabled: true
                },
                cmsComponents: {
                    enabled: true,
                    schemaName: "cmsComponentDetail",
                    type: 'many',
                    propertyName: 'code',
                    searchEnabled: true
                },
            },
            definition: {
                name: {
                    type: 'string',
                    required: true,
                    description: 'Required cms site name',
                    searchOptions: {
                        enabled: true,
                    }
                },
                cmsSite: {
                    type: 'array',
                    required: true,
                    description: 'Required Code of associated cmsSites. One page could be associated with multiple cmsSites',
                    searchOptions: {
                        enabled: true,
                    }
                },
                typeCode: {
                    type: 'string',
                    required: true,
                    description: 'Required type code, this is used filter same type of pages. like ProductDetailPage',
                    searchOptions: {
                        enabled: true,
                    }
                },
                template: {
                    type: 'string',
                    required: false,
                    description: 'Optional page template code defining the available composition slots'
                },
                renderer: {
                    type: 'string',
                    required: false,
                    description: 'Optional logical renderer key overriding the type-code renderer mapping',
                },
                cmsComponents: {
                    type: 'array',
                    required: true,
                    description: 'Required Code of associated cmsComponent. One page could be have multiple cmsComponent',
                    searchOptions: {
                        enabled: true,
                    }
                },
            }
        },
        cmsComponent: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            search: {
                enabled: false,
                idPropertyName: 'code',
            },
            cache: {
                enabled: false,
                ttl: 1000
            },
            refSchema: {
                subComponents: {
                    enabled: true,
                    schemaName: "cmsComponentDetail",
                    type: 'many',
                    propertyName: 'code',
                    searchEnabled: true
                },
                typeCode: {
                    enabled: true,
                    schemaName: "cmsTypeCode",
                    type: 'one',
                    propertyName: 'code',
                    searchEnabled: true
                },
            },
            definition: {
                subComponents: {
                    type: 'array',
                    required: false,
                    description: 'List of sub cmsComponents if any'
                },
                typeCode: {
                    type: 'string',
                    required: true,
                    description: 'Required type code, this is used filter same type of components. like ',
                    searchOptions: {
                        enabled: true,
                    }
                },
                renderer: {
                    type: 'string',
                    required: false,
                    description: 'Optional logical renderer key overriding the type-code renderer mapping',
                },
                properties: {
                    type: 'object',
                    required: false,
                    description: 'Declarative client-safe component properties validated against the component type contract'
                },
                accessMode: {
                    type: 'string',
                    required: true,
                    default: 'AUTHENTICATED',
                    enum: ['PUBLIC', 'AUTHENTICATED', 'CUSTOMER'],
                    description: 'Fail-closed component delivery boundary; public pages may contain only PUBLIC components'
                }
            }
        },
        cmsComponentLocalization: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            cache: { enabled: false, ttl: 1000 },
            search: { enabled: false, idPropertyName: 'code' },
            refSchema: {
                componentCode: {
                    enabled: true,
                    schemaName: 'cmsComponent',
                    type: 'one',
                    propertyName: 'code',
                    searchEnabled: true
                }
            },
            definition: {
                componentCode: {
                    type: 'string',
                    required: true,
                    description: 'Stable CMS component identity shared by every locale variant'
                },
                locale: {
                    type: 'string',
                    required: true,
                    description: 'Canonical BCP47 locale for this component property variant'
                },
                properties: {
                    type: 'object',
                    required: true,
                    description: 'Localized properties declared by the owning cmsTypeCode propertySchema'
                },
                seo: {
                    type: 'object',
                    required: false,
                    description: 'Optional localized, declarative SEO metadata for this component'
                },
                status: {
                    type: 'string',
                    required: true,
                    default: 'DRAFT',
                    enum: ['DRAFT', 'READY'],
                    description: 'Authoring completeness state; publication readiness remains backend validated'
                }
            },
            indexes: {
                common: {
                    componentCode: { enabled: true, name: 'componentCode' },
                    locale: { enabled: true, name: 'locale' }
                },
                composite: {
                    componentCode: { enabled: true, name: 'componentCode', options: { unique: true } },
                    locale: { enabled: true, name: 'locale', options: { unique: true } }
                }
            }
        },
        cmsComponentMedia: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            search: {
                enabled: false,
                idPropertyName: 'componentMediaCode',
            },
            cache: {
                enabled: false,
                ttl: 1000
            },
            refSchema: {
                componentCode: {
                    enabled: true,
                    schemaName: 'cmsComponent',
                    type: 'one',
                    propertyName: 'code',
                    searchEnabled: true
                }
            },
            definition: {
                componentMediaCode: {
                    type: 'string',
                    required: true,
                    description: 'Stable CMS-owned media association identity'
                },
                componentCode: {
                    type: 'string',
                    required: true,
                    description: 'CMS component code that owns this media placement'
                },
                mediaCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional media-owned single media item reference'
                },
                mediaSetCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional media-owned media set reference for responsive, localized, or gallery assets'
                },
                mediaType: {
                    type: 'string',
                    required: true,
                    enum: ['IMAGE', 'VIDEO', 'DOCUMENT', 'FILE', 'MIXED'],
                    default: 'IMAGE',
                    description: 'Business media category expected by the CMS component renderer'
                },
                role: {
                    type: 'string',
                    required: true,
                    description: 'CMS-owned role such as primary, background, thumbnail, icon, gallery, or document'
                },
                slot: {
                    type: 'string',
                    required: false,
                    default: 'default',
                    description: 'Optional logical media slot within the component'
                },
                localeCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional locale for localized media selection'
                },
                position: {
                    type: 'int',
                    required: true,
                    default: 100,
                    description: 'Ordered media position within component, role, slot, and locale'
                },
                altText: {
                    type: 'string',
                    required: false,
                    description: 'Accessible media text owned by CMS content'
                },
                caption: {
                    type: 'string',
                    required: false,
                    description: 'Optional CMS-owned caption for the media placement'
                }
            },
            indexes: {
                common: {
                    componentCode: { enabled: true, name: 'componentCode' },
                    componentMediaCode: { enabled: true, name: 'componentMediaCode' }
                },
                individual: {
                    componentMediaCode: { enabled: true, name: 'componentMediaCode' },
                    componentCode: { enabled: true, name: 'componentCode' },
                    mediaCode: { enabled: true, name: 'mediaCode' },
                    mediaSetCode: { enabled: true, name: 'mediaSetCode' },
                    role: { enabled: true, name: 'role' },
                    slot: { enabled: true, name: 'slot' },
                    position: { enabled: true, name: 'position' }
                }
            }
        },
        cmsPageRoute: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            cache: { enabled: true, ttl: 10000 },
            definition: {
                site: { type: 'string', required: true, description: 'CMS site code owning the route' },
                path: { type: 'string', required: true, description: 'Normalized absolute route path' },
                locale: { type: 'string', required: true, default: 'default', description: 'Locale scope or default fallback' },
                channel: { type: 'string', required: true, default: 'web', description: 'Delivery channel scope' },
                page: { type: 'string', required: true, description: 'Target CMS page code' },
                routeType: { type: 'string', required: true, default: 'PAGE', enum: ['PAGE', 'ALIAS', 'REDIRECT'], description: 'Route resolution behavior' },
                redirectPath: { type: 'string', required: false, description: 'Safe relative redirect target for REDIRECT routes' },
                deliveryState: { type: 'string', required: true, default: 'DRAFT', enum: ['DRAFT', 'ONLINE'], description: 'Fail-closed delivery activation state; workflow publishing may govern transition later' },
                accessMode: { type: 'string', required: true, default: 'AUTHENTICATED', enum: ['PUBLIC', 'AUTHENTICATED', 'CUSTOMER'], description: 'Required delivery access boundary' }
            },
            indexes: {
                composite: {
                    site: { enabled: true, name: 'site', options: { unique: true } },
                    path: { enabled: true, name: 'path', options: { unique: true } },
                    locale: { enabled: true, name: 'locale', options: { unique: true } },
                    channel: { enabled: true, name: 'channel', options: { unique: true } }
                }
            }
        },
        cmsNavigationNode: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            cache: { enabled: true, ttl: 10000 },
            search: {
                enabled: false,
                idPropertyName: 'code',
            },
            refSchema: {
                site: { enabled: true, schemaName: 'cmsSite', type: 'one', propertyName: 'code', searchEnabled: true },
                parent: { enabled: true, schemaName: 'cmsNavigationNode', type: 'one', propertyName: 'code', searchEnabled: true },
                targetPage: { enabled: true, schemaName: 'cmsPage', type: 'one', propertyName: 'code', searchEnabled: true },
                targetRoute: { enabled: true, schemaName: 'cmsPageRoute', type: 'one', propertyName: 'code', searchEnabled: true },
                restrictions: { enabled: true, schemaName: 'cmsRestriction', type: 'many', propertyName: 'code', searchEnabled: true }
            },
            definition: {
                site: { type: 'string', required: true, description: 'CMS site code owning this navigation node', searchOptions: { enabled: true } },
                parent: { type: 'string', required: false, description: 'Optional parent navigation node code', searchOptions: { enabled: true } },
                name: { type: 'string', required: true, description: 'Internal navigation node name', searchOptions: { enabled: true } },
                title: { type: 'string', required: false, description: 'Display title for navigation renderers', searchOptions: { enabled: true } },
                nodeType: { type: 'string', required: true, default: 'PAGE', enum: ['PAGE', 'ROUTE', 'EXTERNAL', 'CONTAINER'], description: 'Navigation target behavior' },
                targetPage: { type: 'string', required: false, description: 'Target CMS page when nodeType is PAGE', searchOptions: { enabled: true } },
                targetRoute: { type: 'string', required: false, description: 'Target CMS page route when nodeType is ROUTE', searchOptions: { enabled: true } },
                externalUrl: { type: 'string', required: false, description: 'Safe external URL when nodeType is EXTERNAL; validation remains service-owned' },
                position: { type: 'int', required: true, default: 100, description: 'Sibling ordering position' },
                status: { type: 'string', required: true, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'], description: 'Authoring availability for this navigation node', searchOptions: { enabled: true } },
                locale: { type: 'string', required: true, default: 'default', description: 'Locale scope or default fallback', searchOptions: { enabled: true } },
                channel: { type: 'string', required: true, default: 'web', description: 'Delivery channel scope', searchOptions: { enabled: true } },
                restrictions: { type: 'array', required: false, description: 'Optional CMS restriction codes applied to this navigation node' }
            },
            indexes: {
                composite: {
                    site: { enabled: true, name: 'site', options: { unique: true } },
                    parent: { enabled: true, name: 'parent', options: { unique: true } },
                    position: { enabled: true, name: 'position', options: { unique: true } },
                    locale: { enabled: true, name: 'locale', options: { unique: true } },
                    channel: { enabled: true, name: 'channel', options: { unique: true } }
                },
                individual: {
                    site: { enabled: true, name: 'site' },
                    parent: { enabled: true, name: 'parent' },
                    targetPage: { enabled: true, name: 'targetPage' },
                    targetRoute: { enabled: true, name: 'targetRoute' },
                    status: { enabled: true, name: 'status' }
                }
            }
        },
        cmsPageTemplate: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            refSchema: {
                slots: { enabled: true, schemaName: 'cmsSlotDefinition', type: 'many', propertyName: 'code', searchEnabled: true }
            },
            definition: {
                name: { type: 'string', required: true, description: 'Human-readable template name' },
                renderer: { type: 'string', required: true, description: 'Logical renderer key for the template shell' },
                contractVersion: { type: 'int', required: true, default: 1, description: 'Template contract major version' },
                slots: { type: 'array', required: false, description: 'Owned slot definitions' }
            }
        },
        cmsSlotDefinition: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: false },
            definition: {
                template: { type: 'string', required: true, description: 'Owning page template code' },
                name: { type: 'string', required: true, description: 'Stable logical slot name' },
                minItems: { type: 'int', required: false, default: 0, description: 'Minimum allowed component count' },
                maxItems: { type: 'int', required: false, description: 'Maximum allowed component count' },
                allowedComponentTypes: { type: 'array', required: false, description: 'Optional allowlist of component type codes' },
                allowedComponentTypeGroups: { type: 'array', required: false, description: 'Optional allowlist of CMS component type group codes' }
            }
        },
        cmsRestrictionType: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            cache: { enabled: true, ttl: 10000 },
            search: {
                enabled: false,
                idPropertyName: 'code',
            },
            definition: {
                name: { type: 'string', required: true, description: 'Human-readable restriction type name', searchOptions: { enabled: true } },
                description: { type: 'string', required: false, description: 'Business description of the restriction type' },
                targetTypes: { type: 'array', required: true, default: ['PAGE', 'COMPONENT', 'SLOT', 'NAVIGATION', 'ROUTE'], description: 'CMS target kinds to which this restriction type can apply', searchOptions: { enabled: true } },
                propertySchema: { type: 'object', required: false, description: 'Declarative restriction property contract; executable code is prohibited' },
                evaluator: { type: 'string', required: false, description: 'Logical backend evaluator key resolved by CMS services; never executable code or a client path' },
                status: { type: 'string', required: true, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'], description: 'Authoring availability for this restriction type', searchOptions: { enabled: true } }
            }
        },
        cmsRestriction: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            cache: { enabled: true, ttl: 10000 },
            search: {
                enabled: false,
                idPropertyName: 'code',
            },
            refSchema: {
                restrictionType: { enabled: true, schemaName: 'cmsRestrictionType', type: 'one', propertyName: 'code', searchEnabled: true }
            },
            definition: {
                name: { type: 'string', required: true, description: 'Human-readable restriction name', searchOptions: { enabled: true } },
                restrictionType: { type: 'string', required: true, description: 'CMS restriction type code', searchOptions: { enabled: true } },
                targetType: { type: 'string', required: true, enum: ['PAGE', 'COMPONENT', 'SLOT', 'NAVIGATION', 'ROUTE'], description: 'CMS target kind guarded by this restriction', searchOptions: { enabled: true } },
                targetCode: { type: 'string', required: true, description: 'Code of the page, component, slot, navigation node, or route guarded by this restriction', searchOptions: { enabled: true } },
                mode: { type: 'string', required: true, default: 'INCLUDE', enum: ['INCLUDE', 'EXCLUDE'], description: 'Whether matching users or contexts can access or are excluded from the target' },
                properties: { type: 'object', required: false, description: 'Declarative restriction values validated against the restriction type propertySchema' },
                status: { type: 'string', required: true, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'], description: 'Restriction lifecycle state', searchOptions: { enabled: true } },
                priority: { type: 'int', required: true, default: 100, description: 'Evaluation order for multiple restrictions on the same target' }
            },
            indexes: {
                composite: {
                    targetType: { enabled: true, name: 'targetType', options: { unique: true } },
                    targetCode: { enabled: true, name: 'targetCode', options: { unique: true } },
                    restrictionType: { enabled: true, name: 'restrictionType', options: { unique: true } }
                },
                individual: {
                    restrictionType: { enabled: true, name: 'restrictionType' },
                    targetType: { enabled: true, name: 'targetType' },
                    targetCode: { enabled: true, name: 'targetCode' },
                    status: { enabled: true, name: 'status' }
                }
            }
        },
        cmsDocumentationProduct: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            cache: { enabled: true, ttl: 10000 },
            search: { enabled: false, idPropertyName: 'code' },
            refSchema: {
                contentCatalog: { enabled: true, schemaName: 'catalog', type: 'one', propertyName: 'code', searchEnabled: true },
                site: { enabled: true, schemaName: 'cmsSite', type: 'one', propertyName: 'code', searchEnabled: true },
                defaultNavigation: { enabled: true, schemaName: 'cmsDocumentationNavigation', type: 'one', propertyName: 'code', searchEnabled: true }
            },
            definition: {
                name: { type: 'string', required: true, description: 'Business-facing documentation product name', searchOptions: { enabled: true } },
                description: { type: 'string', required: true, description: 'Detailed product summary shown on documentation landing surfaces' },
                contentCatalog: { type: 'string', required: true, description: 'CONTENT catalog that owns documentation records and release scope', searchOptions: { enabled: true } },
                site: { type: 'string', required: true, description: 'CMS Site that exposes the documentation product', searchOptions: { enabled: true } },
                defaultNavigation: { type: 'string', required: false, description: 'Default documentation navigation component for this product' },
                publicRootPath: { type: 'string', required: true, description: 'Absolute public root route for this documentation product' },
                defaultLocale: { type: 'string', required: true, default: 'en', description: 'Default documentation locale' },
                channels: { type: 'array', required: true, default: ['web'], description: 'Channels where this documentation product can be rendered' },
                ownerFunctionalModule: { type: 'string', required: true, description: 'Canonical functional-module owner for governance and release evidence', searchOptions: { enabled: true } },
                audience: { type: 'array', required: true, default: ['business', 'developer', 'operator'], description: 'Primary reader audiences supported by this product' },
                accessMode: { type: 'string', required: true, default: 'PUBLIC', enum: ['PUBLIC', 'AUTHENTICATED', 'ROLE_BASED'], description: 'Default access boundary for the documentation product' },
                lifecycleState: { type: 'string', required: true, default: 'DRAFT', enum: ['DRAFT', 'STAGED', 'REVIEW_IN_PROGRESS', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'ONLINE', 'ARCHIVED', 'RETIRED', 'ROLLBACK_PENDING', 'PUBLICATION_FAILED'], description: 'Governed documentation lifecycle state', searchOptions: { enabled: true } },
                maturityState: { type: 'string', required: true, default: 'IMPLEMENTED', enum: ['IMPLEMENTED', 'REFERENCE', 'PLANNED', 'ROADMAP'], description: 'Truth-in-documentation maturity label' },
                status: { type: 'string', required: true, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'], description: 'Authoring availability for this documentation product' }
            }
        },
        cmsDocumentationNavigation: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            cache: { enabled: true, ttl: 10000 },
            search: { enabled: false, idPropertyName: 'code' },
            refSchema: {
                product: { enabled: true, schemaName: 'cmsDocumentationProduct', type: 'one', propertyName: 'code', searchEnabled: true },
                rootNode: { enabled: true, schemaName: 'cmsDocumentationNode', type: 'one', propertyName: 'code', searchEnabled: true },
                dashboard: { enabled: true, schemaName: 'cmsDocumentationDashboard', type: 'one', propertyName: 'code', searchEnabled: true }
            },
            definition: {
                product: { type: 'string', required: true, description: 'Owning documentation product code', searchOptions: { enabled: true } },
                name: { type: 'string', required: true, description: 'Business-facing navigation name', searchOptions: { enabled: true } },
                rootNode: { type: 'string', required: false, description: 'Optional root node for hierarchical rendering' },
                dashboard: { type: 'string', required: false, description: 'Optional dashboard content shown for this navigation tree' },
                renderer: { type: 'string', required: true, default: 'documentation.component.navigation', description: 'Logical renderer key for navigation display' },
                searchLabel: { type: 'string', required: false, description: 'Search label shown by Axis or Nexus renderers' },
                searchPlaceholder: { type: 'string', required: false, description: 'Search input placeholder shown by Axis or Nexus renderers' },
                emptyMessage: { type: 'string', required: false, description: 'Message shown when no navigation or search result matches' },
                expandable: { type: 'bool', required: true, default: true, description: 'Whether child nodes render through expandable navigation controls' },
                status: { type: 'string', required: true, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'], description: 'Authoring availability for this navigation tree' }
            },
            indexes: {
                individual: {
                    product: { enabled: true, name: 'product' },
                    status: { enabled: true, name: 'status' }
                }
            }
        },
        cmsDocumentationNode: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            cache: { enabled: true, ttl: 10000 },
            search: { enabled: false, idPropertyName: 'code' },
            refSchema: {
                product: { enabled: true, schemaName: 'cmsDocumentationProduct', type: 'one', propertyName: 'code', searchEnabled: true },
                navigation: { enabled: true, schemaName: 'cmsDocumentationNavigation', type: 'one', propertyName: 'code', searchEnabled: true },
                parentNode: { enabled: true, schemaName: 'cmsDocumentationNode', type: 'one', propertyName: 'code', searchEnabled: true },
                targetDocumentationPage: { enabled: true, schemaName: 'cmsDocumentationPage', type: 'one', propertyName: 'code', searchEnabled: true },
                targetPage: { enabled: true, schemaName: 'cmsPage', type: 'one', propertyName: 'code', searchEnabled: true },
                targetRoute: { enabled: true, schemaName: 'cmsPageRoute', type: 'one', propertyName: 'code', searchEnabled: true },
                nodeDashboard: { enabled: true, schemaName: 'cmsDocumentationDashboard', type: 'one', propertyName: 'code', searchEnabled: true },
                accessPolicy: { enabled: true, schemaName: 'cmsDocumentationAccessPolicy', type: 'one', propertyName: 'code', searchEnabled: true },
                relatedNodes: { enabled: true, schemaName: 'cmsDocumentationNode', type: 'many', propertyName: 'code', searchEnabled: true }
            },
            definition: {
                product: { type: 'string', required: true, description: 'Owning documentation product code', searchOptions: { enabled: true } },
                navigation: { type: 'string', required: true, description: 'Owning documentation navigation tree code', searchOptions: { enabled: true } },
                parentNode: { type: 'string', required: false, description: 'Optional parent node in the documentation hierarchy', searchOptions: { enabled: true } },
                nodeLevel: { type: 'string', required: true, enum: ['SECTION', 'GROUP', 'SUBGROUP', 'TOPIC', 'PAGE_LINK'], description: 'Business hierarchy level for documentation navigation', searchOptions: { enabled: true } },
                nodeType: { type: 'string', required: true, default: 'CONTAINER', enum: ['CONTAINER', 'PAGE', 'ROUTE', 'EXTERNAL'], description: 'Navigation behavior for this node' },
                nodeTitle: { type: 'string', required: true, description: 'Business-facing node title', searchOptions: { enabled: true } },
                nodeSummary: { type: 'string', required: true, description: 'Detailed node summary or landing description for child navigation' },
                nodeContentArea: { type: 'object', required: false, description: 'Structured landing/dashboard content for section, group, subgroup, or topic nodes' },
                nodeDashboard: { type: 'string', required: false, description: 'Optional dashboard record rendered when this node is opened' },
                childSummaryCards: { type: 'array', required: false, description: 'Backend-managed summary cards for child navigation landing areas' },
                childJourneyLinks: { type: 'array', required: false, description: 'Backend-managed journey links for this node landing area' },
                childStatusSummary: { type: 'object', required: false, description: 'Backend-managed child readiness, maturity, or lifecycle summary' },
                targetDocumentationPage: { type: 'string', required: false, description: 'Target documentation page when nodeType is PAGE' },
                targetPage: { type: 'string', required: false, description: 'Target CMS page when nodeType is PAGE or ROUTE' },
                targetRoute: { type: 'string', required: false, description: 'Target CMS route when nodeType is ROUTE' },
                externalUrl: { type: 'string', required: false, description: 'Safe external URL when nodeType is EXTERNAL; validation remains service-owned' },
                nodeOrder: { type: 'int', required: true, default: 100, description: 'Sibling ordering within the parent node' },
                expandable: { type: 'bool', required: true, default: true, description: 'Whether the node can expand when child nodes exist' },
                expandedByDefault: { type: 'bool', required: true, default: false, description: 'Whether the node opens expanded in the initial navigation view' },
                nodeIcon: { type: 'string', required: false, description: 'Logical icon key for navigation renderers' },
                nodeAudience: { type: 'array', required: true, default: ['business', 'developer', 'operator'], description: 'Audiences that should see this node' },
                accessPolicy: { type: 'string', required: false, description: 'Optional documentation access policy override' },
                accessMode: { type: 'string', required: true, default: 'AUTHENTICATED', enum: ['PUBLIC', 'AUTHENTICATED', 'ROLE_BASED'], description: 'Node visibility boundary for Axis and Nexus rendering' },
                allowedRoles: { type: 'array', required: false, description: 'Optional role codes allowed when accessMode is ROLE_BASED' },
                allowedGroups: { type: 'array', required: false, description: 'Optional group codes allowed when accessMode is ROLE_BASED' },
                allowedPermissions: { type: 'array', required: false, description: 'Optional permission codes allowed when accessMode is ROLE_BASED' },
                lifecycleState: { type: 'string', required: true, default: 'DRAFT', enum: ['DRAFT', 'STAGED', 'REVIEW_IN_PROGRESS', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'ONLINE', 'ARCHIVED', 'RETIRED', 'ROLLBACK_PENDING', 'PUBLICATION_FAILED'], description: 'Governed lifecycle state for this navigation node', searchOptions: { enabled: true } },
                maturityState: { type: 'string', required: true, default: 'IMPLEMENTED', enum: ['IMPLEMENTED', 'REFERENCE', 'PLANNED', 'ROADMAP'], description: 'Truth-in-documentation maturity label' },
                searchKeywords: { type: 'array', required: false, description: 'Keywords used by current metadata search and future indexing' },
                relatedNodes: { type: 'array', required: false, description: 'Related documentation node codes' },
                locale: { type: 'string', required: true, default: 'en', description: 'Locale scope for this node', searchOptions: { enabled: true } },
                channel: { type: 'string', required: true, default: 'web', description: 'Delivery channel scope for this node', searchOptions: { enabled: true } },
                status: { type: 'string', required: true, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'], description: 'Authoring availability for this node' }
            },
            indexes: {
                composite: {
                    product: { enabled: true, name: 'product', options: { unique: true } },
                    navigation: { enabled: true, name: 'navigation', options: { unique: true } },
                    parentNode: { enabled: true, name: 'parentNode', options: { unique: true } },
                    nodeOrder: { enabled: true, name: 'nodeOrder', options: { unique: true } },
                    locale: { enabled: true, name: 'locale', options: { unique: true } },
                    channel: { enabled: true, name: 'channel', options: { unique: true } }
                },
                individual: {
                    product: { enabled: true, name: 'product' },
                    navigation: { enabled: true, name: 'navigation' },
                    parentNode: { enabled: true, name: 'parentNode' },
                    nodeLevel: { enabled: true, name: 'nodeLevel' },
                    lifecycleState: { enabled: true, name: 'lifecycleState' },
                    accessMode: { enabled: true, name: 'accessMode' },
                    status: { enabled: true, name: 'status' }
                }
            }
        },
        cmsDocumentationPage: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            cache: { enabled: true, ttl: 10000 },
            search: { enabled: false, idPropertyName: 'documentId' },
            refSchema: {
                product: { enabled: true, schemaName: 'cmsDocumentationProduct', type: 'one', propertyName: 'code', searchEnabled: true },
                targetPage: { enabled: true, schemaName: 'cmsPage', type: 'one', propertyName: 'code', searchEnabled: true },
                targetRoute: { enabled: true, schemaName: 'cmsPageRoute', type: 'one', propertyName: 'code', searchEnabled: true },
                articleComponent: { enabled: true, schemaName: 'cmsComponent', type: 'one', propertyName: 'code', searchEnabled: true },
                template: { enabled: true, schemaName: 'cmsDocumentationTemplate', type: 'one', propertyName: 'code', searchEnabled: true },
                accessPolicy: { enabled: true, schemaName: 'cmsDocumentationAccessPolicy', type: 'one', propertyName: 'code', searchEnabled: true },
                searchMetadata: { enabled: true, schemaName: 'cmsDocumentationSearchMetadata', type: 'one', propertyName: 'code', searchEnabled: true }
            },
            definition: {
                product: { type: 'string', required: true, description: 'Owning documentation product code', searchOptions: { enabled: true } },
                documentId: { type: 'string', required: true, description: 'Stable globally unique documentation identity that must not encode a file path', searchOptions: { enabled: true } },
                title: { type: 'string', required: true, description: 'Business-facing page title', searchOptions: { enabled: true } },
                summary: { type: 'string', required: true, description: 'Detailed page summary used on landing dashboards and search results' },
                businessSummary: { type: 'string', required: false, description: 'Business problem, user decision, supported operation, risk, and impact summary' },
                technicalSummary: { type: 'string', required: false, description: 'Owning module, data model, configuration, API, extension, validation, and troubleshooting summary' },
                ownerFunctionalModule: { type: 'string', required: true, description: 'Canonical functional-module owner', searchOptions: { enabled: true } },
                technicalModule: { type: 'string', required: false, description: 'Optional technical module detail; never replaces functional ownership' },
                targetPage: { type: 'string', required: true, description: 'CMS page record that renders this documentation page' },
                targetRoute: { type: 'string', required: true, description: 'CMS route record for this documentation page' },
                articleComponent: { type: 'string', required: false, description: 'CMS article component containing rendered documentation body blocks' },
                template: { type: 'string', required: false, description: 'Documentation template contract used to author and validate this page' },
                headings: { type: 'array', required: false, description: 'Extracted page headings and anchors' },
                diagrams: { type: 'array', required: false, description: 'Visual diagrams or data-flow references required by the documentation contract' },
                visualAssets: { type: 'array', required: false, description: 'Referenced visual assets, screenshots, tables, or schema-model diagrams' },
                relatedPages: { type: 'array', required: false, description: 'Related documentation page document IDs' },
                sourceRepository: { type: 'string', required: true, description: 'Repository or content package that authored the page source' },
                sourcePath: { type: 'string', required: false, description: 'Source path or external content identity retained as evidence, not as the public document ID' },
                sourceChecksum: { type: 'string', required: false, description: 'Checksum of the authored source used for publication evidence' },
                sourceWordCount: { type: 'int', required: false, description: 'Word count of the authored source used for quality and publication evidence' },
                audience: { type: 'array', required: true, default: ['business', 'developer', 'operator'], description: 'Primary reader audiences supported by this page' },
                accessPolicy: { type: 'string', required: false, description: 'Optional documentation access policy override' },
                accessMode: { type: 'string', required: true, default: 'AUTHENTICATED', enum: ['PUBLIC', 'AUTHENTICATED', 'ROLE_BASED'], description: 'Page visibility boundary for Axis and Nexus rendering' },
                lifecycleState: { type: 'string', required: true, default: 'DRAFT', enum: ['DRAFT', 'STAGED', 'REVIEW_IN_PROGRESS', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'ONLINE', 'ARCHIVED', 'RETIRED', 'ROLLBACK_PENDING', 'PUBLICATION_FAILED'], description: 'Governed lifecycle state for this page', searchOptions: { enabled: true } },
                maturityState: { type: 'string', required: true, default: 'IMPLEMENTED', enum: ['IMPLEMENTED', 'REFERENCE', 'PLANNED', 'ROADMAP'], description: 'Truth-in-documentation maturity label' },
                searchMetadata: { type: 'string', required: false, description: 'Documentation search metadata record for current search and future index projection' },
                status: { type: 'string', required: true, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'], description: 'Authoring availability for this documentation page' }
            },
            indexes: {
                composite: {
                    product: { enabled: true, name: 'product', options: { unique: true } },
                    documentId: { enabled: true, name: 'documentId', options: { unique: true } },
                    targetRoute: { enabled: true, name: 'targetRoute', options: { unique: true } }
                },
                individual: {
                    ownerFunctionalModule: { enabled: true, name: 'ownerFunctionalModule' },
                    lifecycleState: { enabled: true, name: 'lifecycleState' },
                    accessMode: { enabled: true, name: 'accessMode' }
                }
            }
        },
        cmsDocumentationDashboard: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            cache: { enabled: true, ttl: 10000 },
            search: { enabled: false, idPropertyName: 'code' },
            refSchema: {
                product: { enabled: true, schemaName: 'cmsDocumentationProduct', type: 'one', propertyName: 'code', searchEnabled: true },
                componentCode: { enabled: true, schemaName: 'cmsComponent', type: 'one', propertyName: 'code', searchEnabled: true },
                accessPolicy: { enabled: true, schemaName: 'cmsDocumentationAccessPolicy', type: 'one', propertyName: 'code', searchEnabled: true }
            },
            definition: {
                product: { type: 'string', required: true, description: 'Owning documentation product code', searchOptions: { enabled: true } },
                ownerType: { type: 'string', required: true, enum: ['PRODUCT', 'NAVIGATION', 'SECTION', 'GROUP', 'SUBGROUP', 'TOPIC'], description: 'Hierarchy level that owns this landing dashboard' },
                ownerCode: { type: 'string', required: true, description: 'Code of the product, navigation, or node that owns this dashboard', searchOptions: { enabled: true } },
                title: { type: 'string', required: true, description: 'Dashboard title', searchOptions: { enabled: true } },
                summary: { type: 'string', required: true, description: 'Detailed summary of child navigation, journeys, maturity, and reader intent' },
                contentArea: { type: 'object', required: false, description: 'Structured dashboard content rendered by Axis and Nexus' },
                cards: { type: 'array', required: false, description: 'Summary cards for child groups, topics, or pages' },
                journeyLinks: { type: 'array', required: false, description: 'Business and technical journey links for this dashboard' },
                statusSummary: { type: 'object', required: false, description: 'Readiness, maturity, publication, or validation summary for child content' },
                componentCode: { type: 'string', required: false, description: 'Optional CMS component used to render dashboard content' },
                accessPolicy: { type: 'string', required: false, description: 'Optional documentation access policy override' },
                accessMode: { type: 'string', required: true, default: 'AUTHENTICATED', enum: ['PUBLIC', 'AUTHENTICATED', 'ROLE_BASED'], description: 'Dashboard visibility boundary' },
                lifecycleState: { type: 'string', required: true, default: 'DRAFT', enum: ['DRAFT', 'STAGED', 'REVIEW_IN_PROGRESS', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'ONLINE', 'ARCHIVED', 'RETIRED', 'ROLLBACK_PENDING', 'PUBLICATION_FAILED'], description: 'Governed lifecycle state for this dashboard' },
                status: { type: 'string', required: true, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'], description: 'Authoring availability for this dashboard' }
            }
        },
        cmsDocumentationTemplate: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            cache: { enabled: true, ttl: 10000 },
            search: { enabled: false, idPropertyName: 'code' },
            definition: {
                name: { type: 'string', required: true, description: 'Human-readable documentation template name', searchOptions: { enabled: true } },
                templateType: { type: 'string', required: true, default: 'ARTICLE', enum: ['ARTICLE', 'DASHBOARD', 'NAVIGATION', 'NODE'], description: 'Documentation surface governed by this template' },
                renderer: { type: 'string', required: true, description: 'Logical renderer key; executable code is prohibited' },
                contractVersion: { type: 'int', required: true, default: 1, description: 'Template contract major version' },
                requiredSections: { type: 'array', required: false, description: 'Required authoring sections such as business perspective, technical perspective, diagrams, and validation' },
                visualRequirements: { type: 'array', required: false, description: 'Expected diagrams, tables, screenshots, schema models, or flow visuals' },
                contentQualityContract: { type: 'object', required: false, description: 'Declarative content-quality expectations for generated or manually authored documentation' },
                status: { type: 'string', required: true, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'], description: 'Authoring availability for this template' }
            }
        },
        cmsDocumentationAccessPolicy: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            cache: { enabled: true, ttl: 10000 },
            search: { enabled: false, idPropertyName: 'code' },
            definition: {
                name: { type: 'string', required: true, description: 'Human-readable access policy name', searchOptions: { enabled: true } },
                targetType: { type: 'string', required: true, enum: ['PRODUCT', 'NAVIGATION', 'NODE', 'PAGE', 'DASHBOARD', 'ROUTE', 'TEMPLATE'], description: 'Documentation item kind governed by this policy', searchOptions: { enabled: true } },
                targetCode: { type: 'string', required: true, description: 'Documentation item code governed by this policy', searchOptions: { enabled: true } },
                accessMode: { type: 'string', required: true, default: 'AUTHENTICATED', enum: ['PUBLIC', 'AUTHENTICATED', 'ROLE_BASED'], description: 'Visibility boundary applied by Axis, Nexus, and delivery services' },
                publiclyAvailable: { type: 'bool', required: true, default: false, description: 'Whether Nexus may render this item to non-logged-in readers' },
                requiresAuthentication: { type: 'bool', required: true, default: true, description: 'Whether the item requires a logged-in reader' },
                allowedRoles: { type: 'array', required: false, description: 'Role codes allowed when accessMode is ROLE_BASED' },
                allowedGroups: { type: 'array', required: false, description: 'User-group codes allowed when accessMode is ROLE_BASED' },
                allowedPermissions: { type: 'array', required: false, description: 'Permission codes allowed when accessMode is ROLE_BASED' },
                lifecycleVisibility: { type: 'array', required: true, default: ['ONLINE'], description: 'Lifecycle states visible to normal readers under this policy' },
                priority: { type: 'int', required: true, default: 100, description: 'Policy evaluation order where multiple policies match' },
                status: { type: 'string', required: true, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'], description: 'Authoring availability for this policy' }
            },
            indexes: {
                composite: {
                    targetType: { enabled: true, name: 'targetType', options: { unique: true } },
                    targetCode: { enabled: true, name: 'targetCode', options: { unique: true } },
                    priority: { enabled: true, name: 'priority', options: { unique: true } }
                }
            }
        },
        cmsDocumentationPublicationState: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            cache: { enabled: true, ttl: 10000 },
            search: { enabled: false, idPropertyName: 'code' },
            definition: {
                targetType: { type: 'string', required: true, enum: ['PRODUCT', 'NAVIGATION', 'NODE', 'PAGE', 'DASHBOARD', 'ROUTE', 'TEMPLATE', 'SEARCH_METADATA'], description: 'Documentation item kind governed by this lifecycle record', searchOptions: { enabled: true } },
                targetCode: { type: 'string', required: true, description: 'Documentation item code governed by this lifecycle record', searchOptions: { enabled: true } },
                lifecycleState: { type: 'string', required: true, default: 'DRAFT', enum: ['DRAFT', 'STAGED', 'REVIEW_IN_PROGRESS', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'ONLINE', 'ARCHIVED', 'RETIRED', 'ROLLBACK_PENDING', 'PUBLICATION_FAILED'], description: 'Governed lifecycle state for the target item', searchOptions: { enabled: true } },
                publicationCode: { type: 'string', required: false, description: 'Owning nPublish request identity when the item enters publication workflow' },
                workflowReference: { type: 'string', required: false, description: 'Workflow or approval task reference for review and approval evidence' },
                stagedVersion: { type: 'string', required: false, description: 'Immutable staged version identifier' },
                onlineVersion: { type: 'string', required: false, description: 'Immutable online version identifier' },
                previousOnlineVersion: { type: 'string', required: false, description: 'Rollback target or previous online version identifier' },
                validationResult: { type: 'object', required: false, description: 'Publication-readiness validation summary and errors' },
                checksum: { type: 'string', required: false, description: 'Deterministic checksum of the published target snapshot' },
                actor: { type: 'string', required: false, description: 'Last actor who changed this lifecycle record' },
                reviewer: { type: 'string', required: false, description: 'Reviewer identity where a separate reviewer is used' },
                approver: { type: 'string', required: false, description: 'Approver identity for publication evidence' },
                publishedAt: { type: 'string', required: false, description: 'Publication timestamp recorded as an ISO string' },
                status: { type: 'string', required: true, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'], description: 'Authoring availability for this lifecycle record' }
            },
            indexes: {
                composite: {
                    targetType: { enabled: true, name: 'targetType', options: { unique: true } },
                    targetCode: { enabled: true, name: 'targetCode', options: { unique: true } }
                },
                individual: {
                    lifecycleState: { enabled: true, name: 'lifecycleState' },
                    publicationCode: { enabled: true, name: 'publicationCode' }
                }
            }
        },
        cmsDocumentationSearchMetadata: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            cache: { enabled: true, ttl: 10000 },
            search: { enabled: false, idPropertyName: 'code' },
            refSchema: {
                product: { enabled: true, schemaName: 'cmsDocumentationProduct', type: 'one', propertyName: 'code', searchEnabled: true },
                accessPolicy: { enabled: true, schemaName: 'cmsDocumentationAccessPolicy', type: 'one', propertyName: 'code', searchEnabled: true }
            },
            definition: {
                product: { type: 'string', required: true, description: 'Owning documentation product code', searchOptions: { enabled: true } },
                targetType: { type: 'string', required: true, enum: ['PRODUCT', 'NAVIGATION', 'NODE', 'PAGE', 'DASHBOARD', 'TEMPLATE'], description: 'Documentation item kind represented by this search metadata', searchOptions: { enabled: true } },
                targetCode: { type: 'string', required: true, description: 'Documentation item code represented by this search metadata', searchOptions: { enabled: true } },
                title: { type: 'string', required: true, description: 'Search result title', searchOptions: { enabled: true } },
                summary: { type: 'string', required: true, description: 'Search result detailed summary' },
                searchText: { type: 'string', required: true, description: 'Normalized searchable text for current keyword search and future index projection', searchOptions: { enabled: true } },
                keywords: { type: 'array', required: false, description: 'Keyword list for topic and synonym matching' },
                facets: { type: 'object', required: false, description: 'Business and technical filters such as audience, module, document type, maturity, and lifecycle' },
                locale: { type: 'string', required: true, default: 'en', description: 'Locale scope for this search metadata', searchOptions: { enabled: true } },
                channel: { type: 'string', required: true, default: 'web', description: 'Delivery channel scope for this search metadata', searchOptions: { enabled: true } },
                accessPolicy: { type: 'string', required: false, description: 'Optional access policy used to filter search results' },
                accessMode: { type: 'string', required: true, default: 'AUTHENTICATED', enum: ['PUBLIC', 'AUTHENTICATED', 'ROLE_BASED'], description: 'Search visibility boundary' },
                lifecycleState: { type: 'string', required: true, default: 'DRAFT', enum: ['DRAFT', 'STAGED', 'REVIEW_IN_PROGRESS', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'ONLINE', 'ARCHIVED', 'RETIRED', 'ROLLBACK_PENDING', 'PUBLICATION_FAILED'], description: 'Lifecycle state used to filter search visibility', searchOptions: { enabled: true } },
                indexState: { type: 'string', required: true, default: 'NOT_INDEXED', enum: ['NOT_INDEXED', 'INDEX_READY', 'INDEXED', 'INDEX_FAILED'], description: 'Future external-search projection state without making Elasticsearch the source of truth' },
                status: { type: 'string', required: true, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'], description: 'Authoring availability for this search metadata' }
            },
            indexes: {
                composite: {
                    product: { enabled: true, name: 'product', options: { unique: true } },
                    targetType: { enabled: true, name: 'targetType', options: { unique: true } },
                    targetCode: { enabled: true, name: 'targetCode', options: { unique: true } },
                    locale: { enabled: true, name: 'locale', options: { unique: true } },
                    channel: { enabled: true, name: 'channel', options: { unique: true } }
                },
                individual: {
                    accessMode: { enabled: true, name: 'accessMode' },
                    lifecycleState: { enabled: true, name: 'lifecycleState' },
                    indexState: { enabled: true, name: 'indexState' }
                }
            }
        },
        cmsMigrationAudit: {
            super: 'base',
            model: true,
            service: { enabled: true },
            router: { enabled: false },
            event: { enabled: false },
            definition: {
                migrationVersion: { type: 'int', required: true },
                status: { type: 'string', required: true },
                tenant: { type: 'string', required: true },
                requestedBy: { type: 'string', required: false },
                preview: { type: 'object', required: false },
                snapshot: { type: 'object', required: false },
                result: { type: 'object', required: false },
                correlationId: { type: 'string', required: false }
            }
        },
        cmsPublicationManifest: {
            super: 'base',
            isVersionedEnabled: false,
            transaction: { enabled: true, sideEffects: 'none' },
            model: true,
            service: { enabled: true },
            router: { enabled: false },
            event: { enabled: false },
            definition: {
                publicationCode: { type: 'string', required: true, description: 'Owning nPublish request identity' },
                rootType: { type: 'string', required: true },
                rootCode: { type: 'string', required: true },
                sourceVersion: { type: 'string', required: true },
                dependencies: { type: 'array', required: true, description: 'Frozen schema, code, and version identities' },
                snapshot: { type: 'object', required: true, description: 'Immutable client-safe CMS delivery graph' },
                mediaAssets: { type: 'array', required: false, description: 'Checksum-verified referenced media transfer payloads; never exposed by delivery' },
                contentHash: { type: 'string', required: true, description: 'Deterministic manifest integrity identifier' },
                createdBy: { type: 'string', required: false },
                correlationId: { type: 'string', required: false }
            }
        },
        cmsOnlinePublicationPointer: {
            super: 'base',
            isVersionedEnabled: false,
            cache: { enabled: false },
            transaction: { enabled: true, sideEffects: 'none' },
            model: true,
            service: { enabled: true },
            router: { enabled: false },
            event: { enabled: false },
            definition: {
                site: { type: 'string', required: true },
                path: { type: 'string', required: true },
                locale: { type: 'string', required: true },
                channel: { type: 'string', required: true },
                accessMode: { type: 'string', required: true },
                manifestCode: { type: 'string', required: true },
                previousManifestCode: { type: 'string', required: false },
                revision: { type: 'int', required: true, default: 0 },
                activatedBy: { type: 'string', required: false },
                correlationId: { type: 'string', required: false }
            },
            indexes: {
                composite: {
                    site: { enabled: true, name: 'site', options: { unique: true } },
                    path: { enabled: true, name: 'path', options: { unique: true } },
                    locale: { enabled: true, name: 'locale', options: { unique: true } },
                    channel: { enabled: true, name: 'channel', options: { unique: true } },
                    accessMode: { enabled: true, name: 'accessMode', options: { unique: true } }
                }
            }
        },
        cmsPublicationDeploymentReceipt: {
            super: 'base',
            isVersionedEnabled: false,
            transaction: { enabled: true, sideEffects: 'none' },
            model: true,
            service: { enabled: true },
            router: { enabled: false },
            event: { enabled: false },
            definition: {
                publicationCode: { type: 'string', required: true },
                manifestCode: { type: 'string', required: true },
                sourceVersion: { type: 'string', required: true },
                operation: { type: 'string', required: true, enum: ['DEPLOY', 'ROLLBACK', 'WITHDRAW'] },
                status: { type: 'string', required: true, enum: ['ONLINE'] },
                targetVersion: { type: 'string', required: true },
                previousOnlineVersion: { type: 'string', required: false },
                operationKey: { type: 'string', required: false },
                correlationId: { type: 'string', required: false }
            }
        },
        cmsPublicationEventOutbox: {
            super: 'base',
            isVersionedEnabled: false,
            transaction: { enabled: true, sideEffects: 'none' },
            model: true,
            service: { enabled: true },
            router: { enabled: false },
            event: { enabled: false },
            definition: {
                publicationCode: { type: 'string', required: true },
                manifestCode: { type: 'string', required: true },
                operation: { type: 'string', required: true, enum: ['DEPLOY', 'ROLLBACK', 'WITHDRAW'] },
                operationKey: { type: 'string', required: false },
                sequence: { type: 'int', required: true, default: 0 },
                eventType: { type: 'string', required: true },
                status: { type: 'string', required: true, enum: ['PENDING', 'PROCESSING', 'DELIVERED', 'FAILED'] },
                attempts: { type: 'int', required: true, default: 0 },
                leaseToken: { type: 'string', required: false },
                leaseUntil: { type: 'string', required: false },
                correlationId: { type: 'string', required: false },
                deliveredAt: { type: 'string', required: false },
                lastAttemptAt: { type: 'string', required: false },
                failureCode: { type: 'string', required: false }
            }
        }
    }
};
