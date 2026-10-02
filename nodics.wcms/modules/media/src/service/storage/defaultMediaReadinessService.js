/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';

/**
 * @module media/service/storage/DefaultMediaReadinessService
 * @description Reads bounded persisted CURRENT metadata for setup without per-asset transport or provider-byte reads.
 * @layer service
 * @owner media
 * @override Later layers may narrow readiness; preserve tenant/enterprise scope, CURRENT proof and the distinction from byte verification.
 */
module.exports = {
    /** Returns exact descriptor matches from one fresh owner read; never certifies bytes or Online activation. */
    read: async function (input, request) {
        const library = SERVICE.DefaultMediaLibraryService;
        library.assertOperator(request, 'media.upload.create');
        library.assertInput(input, ['assets']);
        if (
            !Array.isArray(input.assets) ||
            !input.assets.length ||
            input.assets.length > 100
        )
            library.fail();
        const fields = [
            'folderCode',
            'formatCode',
            'name',
            'description',
            'businessPurpose',
            'ownerType',
            'ownerReference',
            'mimeType',
            'sizeBytes',
            'originalFileName',
        ];
        const keys = [
            'mediaCode',
            'checksum',
            'moduleName',
            'schemaName',
            ...fields,
        ];
        const codes = new Set();
        for (const asset of input.assets) {
            library.assertInput(asset, keys);
            if (
                !library.identifier(asset.mediaCode) ||
                codes.has(asset.mediaCode) ||
                !/^[a-f0-9]{64}$/.test(asset.checksum || '') ||
                !Number.isSafeInteger(asset.sizeBytes) ||
                asset.sizeBytes <= 0 ||
                asset.moduleName !== 'media' ||
                asset.schemaName !== 'media' ||
                fields
                    .filter((field) => field !== 'sizeBytes')
                    .some(
                        (field) =>
                            typeof asset[field] !== 'string' ||
                            asset[field].length > 1024,
                    )
            )
                library.fail();
            codes.add(asset.mediaCode);
            SERVICE.DefaultMediaStoragePolicyService.validateDescriptor({
                ...asset,
                tenant: request.tenant,
                authData: request.authData,
            });
        }
        const model = library.currentModel(request);
        const owner = SERVICE.DefaultMediaService;
        if (!owner || typeof owner.get !== 'function') library.fail();
        const response = await owner.get({
            tenant: request.tenant,
            authData: request.authData,
            query: {
                ...library.scope(request),
                code: { $in: Array.from(codes) },
            },
            options: { skipItemCache: true },
            searchOptions: { limit: 101, pageSize: 101, pageNumber: 1 },
        });
        if (
            !response ||
            response.code !== 'SUC_FIND_00000' ||
            response.success === false ||
            response.error != null ||
            response.errors != null ||
            response.errInfo != null ||
            !Array.isArray(response.result) ||
            response.result.length > input.assets.length
        )
            library.fail();
        const rows = new Map();
        for (const row of response.result) {
            if (
                !library.inScope(row, request) ||
                !codes.has(row.code) ||
                rows.has(row.code)
            )
                library.fail();
            rows.set(row.code, row);
        }
        const items = input.assets.map((asset) => {
            const row = rows.get(asset.mediaCode);
            const versionId =
                model.versioned === true &&
                row &&
                Number.isSafeInteger(row.versionId) &&
                row.versionId >= 0
                    ? row.versionId
                    : null;
            return {
                mediaCode: asset.mediaCode,
                checksum: asset.checksum,
                versionId,
                exists: Boolean(row),
                metadataMatched: Boolean(
                    row &&
                    versionId !== null &&
                    row.active === true &&
                    row.status === 'READY' &&
                    row.checksumAlgorithm === 'sha256' &&
                    row.checksum === asset.checksum &&
                    fields.every((field) => row[field] === asset[field]),
                ),
                storedBytesVerified: false,
            };
        });
        return {
            contractVersion: 1,
            owner: 'media',
            evidenceKind: 'PERSISTED_CURRENT_METADATA',
            checkedAt: new Date().toISOString(),
            items,
        };
    },
};
