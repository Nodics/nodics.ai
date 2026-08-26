/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const responseEnvelope = {
    type: 'object',
    required: ['contractVersion', 'operation', 'status', 'requestId', 'messages', 'data', 'diagnostics', 'redactions'],
    properties: {
        contractVersion: { type: 'string' },
        operation: { type: 'string' },
        status: { type: 'string', enum: ['SUCCESS', 'WARNING', 'FAILED', 'UNAVAILABLE'] },
        requestId: { type: 'string' },
        messages: { type: 'array', items: { type: 'object' } },
        data: { type: 'object' },
        diagnostics: { type: 'object' },
        redactions: { type: 'array', items: { type: 'string' } }
    }
};

const workspaceRequest = {
    type: 'object',
    required: ['workspaceRoot'],
    properties: {
        workspaceRoot: { type: 'string', minLength: 1 },
        ports: { type: 'array', items: { type: ['integer', 'string'] } }
    }
};

const setupPlanRequest = {
    type: 'object',
    required: ['workspaceRoot', 'applicationName'],
    properties: {
        workspaceRoot: { type: 'string', minLength: 1 },
        applicationName: { type: 'string', minLength: 1 },
        companySiteName: { type: 'string' },
        companyName: { type: 'string' },
        accelerator: { type: 'string', enum: ['apparel', 'electronics', 'telco'] },
        applicationType: { type: 'string', enum: ['apparel', 'electronics', 'telco'] },
        siteType: { type: 'string', enum: ['apparel', 'electronics', 'telco'] },
        environment: { type: 'string' }
    }
};

const evidenceReadRequest = {
    type: 'object',
    required: ['workspaceRoot'],
    properties: {
        workspaceRoot: { type: 'string', minLength: 1 },
        evidenceFile: { type: 'string' }
    }
};

/**
 * @module installer/schemas/apiContracts
 * @description Defines installer Phase 1 API request and response schema fragments for route metadata.
 * @layer schema
 * @owner installer
 * @override Keep request contracts read-only until future mutating contracts are approved.
 */
module.exports = {
    responseEnvelope,
    InstallerInfoResponse: responseEnvelope,
    InstallerOperationCatalogResponse: responseEnvelope,
    WorkspaceStatusRequest: workspaceRequest,
    WorkspaceStatusResponse: responseEnvelope,
    WorkspaceInventoryRequest: workspaceRequest,
    WorkspaceInventoryResponse: responseEnvelope,
    WorkspacePreflightRequest: workspaceRequest,
    WorkspacePreflightResponse: responseEnvelope,
    SetupPlanPreviewRequest: setupPlanRequest,
    SetupPlanPreviewResponse: responseEnvelope,
    EvidenceReadRequest: evidenceReadRequest,
    EvidenceReadResponse: responseEnvelope,
    InstallerErrorResponse: responseEnvelope,
    workspaceRequest,
    setupPlanRequest,
    evidenceReadRequest
};
