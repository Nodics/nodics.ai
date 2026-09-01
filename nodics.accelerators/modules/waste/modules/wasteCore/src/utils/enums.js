/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteCore/src/utils/enums @description Defines provider-neutral Waste enum contributions. @layer utility @owner wasteCore @override Later modules may add supported values without redefining meanings. */
module.exports = {
    WasteRecordStatus: { definition: ['DRAFT', 'ACTIVE', 'INACTIVE', 'DEPRECATED', 'ARCHIVED'] },
    WasteFamilyCode: { definition: ['ELECTRONICS', 'BATTERY', 'PLASTIC', 'PAPER', 'METAL', 'TEXTILE', 'GLASS', 'MIXED'] },
    WasteConditionGrade: { definition: ['NEW_UNUSED', 'WORKING', 'REUSABLE', 'REPAIRABLE', 'PARTS_ONLY', 'RECYCLABLE', 'DAMAGED', 'HAZARDOUS', 'UNKNOWN'] },
    WasteCollectionPointType: { definition: ['RECYCLING_BIN', 'RECYCLING_DROP_OFF', 'REPAIR_WORKSHOP', 'TRADE_IN_STORE', 'COLLECTION_WAREHOUSE', 'PROCESSING_FACILITY', 'MOBILE_COLLECTION_EVENT'] },
    WasteCollectionPointStatus: { definition: ['ACTIVE', 'TEMPORARILY_CLOSED', 'FULL', 'MAINTENANCE', 'INACTIVE'] },
    WasteSubmissionStatus: { definition: ['DRAFT', 'MEDIA_STAGED', 'METADATA_SUGGESTED', 'AWAITING_SUBMITTER_CONFIRMATION', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'ARCHIVED'] },
    WasteVerificationStatus: { definition: ['APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'NEEDS_RECEIPT', 'NEEDS_INSPECTION'] },
    WasteReceiptStatus: { definition: ['RECEIVED', 'PARTIALLY_RECEIVED', 'NOT_RECEIVED', 'DAMAGED', 'REJECTED_AT_RECEIPT', 'DISCREPANCY'] },
    WasteImpactStatus: { definition: ['ESTIMATED', 'CONFIRMED', 'RECALCULATED', 'FAILED'] },
    WasteMovementStatus: { definition: ['PLANNED', 'READY_FOR_PICKUP', 'IN_TRANSIT', 'ARRIVED', 'RECEIVED', 'CANCELLED', 'FAILED'] },
    WasteEvidenceType: { definition: ['PHOTO', 'DOCUMENT', 'WEIGHT_SLIP', 'RECEIPT', 'SIGNATURE', 'AI_METADATA', 'OPERATOR_NOTE', 'CERTIFICATE'] }
};
