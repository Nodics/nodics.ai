/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcmsExperience/utils/enums
 * @description Stable WCMS Experience enum vocabulary for page, target, slot, publication, and delivery contracts.
 * @layer utility
 * @owner wcmsExperience
 * @override Later layers may map project-specific labels to these stable contract values.
 */
module.exports = {
    WcmsExperiencePageType: {
        definition: {
            PRODUCT_LISTING: 'PRODUCT_LISTING',
            COLLECTION_INDEX: 'COLLECTION_INDEX',
            COLLECTION_DETAIL: 'COLLECTION_DETAIL',
            BRAND_INDEX: 'BRAND_INDEX',
            BRAND_DETAIL: 'BRAND_DETAIL',
            CATEGORY_DETAIL: 'CATEGORY_DETAIL',
            SEARCH_RESULTS: 'SEARCH_RESULTS',
            HOME: 'HOME'
        }
    },
    WcmsExperienceTargetType: {
        definition: {
            DEFAULT: 'DEFAULT',
            COLLECTION: 'COLLECTION',
            CATEGORY: 'CATEGORY',
            BRAND: 'BRAND',
            SEARCH: 'SEARCH'
        }
    },
    WcmsExperienceSlot: {
        definition: {
            HERO: 'hero',
            TOP_PROMO: 'topPromo',
            PROMO_STRIP: 'promoStrip',
            FEATURED_CAROUSEL: 'featuredCarousel',
            FEATURED_PRODUCTS: 'featuredProducts',
            EDITORIAL_STORY: 'editorialStory',
            BELOW_GRID: 'belowGrid',
            SEO_CONTENT: 'seoContent'
        }
    },
    WcmsExperiencePublicationStatus: {
        definition: {
            STAGED: 'STAGED',
            ONLINE: 'ONLINE',
            ARCHIVED: 'ARCHIVED'
        }
    },
    WcmsExperienceDeliveryStatus: {
        definition: {
            ACTIVE: 'ACTIVE',
            INACTIVE: 'INACTIVE'
        }
    },
    WcmsExperienceSecurityScope: {
        definition: {
            VIEW: 'WCMS_EXPERIENCE_VIEW',
            EDIT: 'WCMS_EXPERIENCE_EDIT',
            PREVIEW: 'WCMS_EXPERIENCE_PREVIEW',
            PUBLISH_STATUS: 'WCMS_EXPERIENCE_PUBLISH_STATUS',
            OVERRIDE: 'WCMS_EXPERIENCE_OVERRIDE'
        }
    }
};
