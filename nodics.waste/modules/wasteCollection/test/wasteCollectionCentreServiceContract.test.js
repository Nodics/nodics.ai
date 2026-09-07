/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module wasteCollection/test/wasteCollectionCentreServiceContract @description Verifies collection-centre search uses enterprise association and runtime tenant context. @layer test @owner wasteCollection */
const assert = require('node:assert/strict');
const service = require('../src/service/defaultWasteCollectionCentreService');

async function main() {
    const calls = [];
    const moduleCalls = [];
    global.SERVICE = {
        DefaultWasteCollectionPointService: {
            get: async function (request) {
                calls.push(request);
                return {
                    result: [
                        {
                            code: 'WCP_001',
                            operatorEnterpriseRef: { moduleName: 'profile', schemaName: 'enterprise', code: 'NODICS_WASTE_MANAGEMENT_CO' },
                            assetOwnerEnterpriseRef: { moduleName: 'profile', schemaName: 'enterprise', code: 'BEAH_RECYCLING_SERVICES' },
                            locationRef: { moduleName: 'locationCore', schemaName: 'location', code: 'LOC_001' },
                            operatingStatus: 'ACTIVE',
                            publicVisibility: 'PUBLIC',
                            status: 'ACTIVE'
                        }
                    ],
                    totalCount: 1
                };
            }
        },
        DefaultModuleService: {
            invokeModule: async function (request) {
                moduleCalls.push(request);
                if (request.moduleName === 'locationCore') {
                    assert.strictEqual(request.connectionName, 'location');
                    assert.strictEqual(request.operationName, 'read');
                    assert.strictEqual(request.methodName, 'GET');
                    assert.strictEqual(request.request.locationCode, 'LOC_001');
                    return request.responseSelector({
                        data: {
                            result: [
                                {
                                    code: 'LOC_001',
                                    addressRef: { moduleName: 'profile', schemaName: 'address', code: 'ADDR_001' },
                                    latitude: 25.2,
                                    longitude: 55.3
                                }
                            ]
                        }
                    });
                }
                if (request.moduleName === 'profile' && request.apiName === '/address') {
                    return request.responseSelector({
                        result: [
                            {
                                code: 'ADDR_001',
                                addressLine1: 'Business Bay',
                                city: 'Dubai',
                                countryCode: 'AE'
                            }
                        ]
                    });
                }
                if (request.moduleName === 'profile' && request.apiName === '/enterprise') {
                    return request.responseSelector({
                        result: [
                            {
                                code: 'NODICS_WASTE_MANAGEMENT_CO',
                                name: 'Nodics Waste Management Co.'
                            },
                            {
                                code: 'BEAH_RECYCLING_SERVICES',
                                name: 'BEAH Recycling Services'
                            }
                        ]
                    });
                }
                return request.responseSelector({ result: [] });
            }
        }
    };

    const response = await service.search({
        tenant: 'runtimeTenantFromToken',
        authData: { tenant: 'runtimeTenantFromToken' },
        payload: {
            filters: {
                operatorEnterpriseCode: 'NODICS_WASTE_MANAGEMENT_CO',
                locationCode: 'LOC_001',
                publicVisibility: 'PUBLIC',
                status: 'ACTIVE',
                assetOwnerEnterpriseCode: 'BEAH_RECYCLING_SERVICES',
                pageSize: 250
            }
        }
    });

    assert.strictEqual(response.records[0].code, 'WCP_001');
    assert.strictEqual(response.records[0].operatorEnterpriseName, 'Nodics Waste Management Co.');
    assert.strictEqual(response.records[0].assetOwnerEnterpriseName, 'BEAH Recycling Services');
    assert.strictEqual(response.records[0].addressLine, 'Business Bay');
    assert.strictEqual(response.records[0].latitude, 25.2);
    assert.strictEqual(response.records[0].longitude, 55.3);
    assert.deepStrictEqual(response.sourceCounts, {
        collectionPoints: 1,
        locations: 1,
        addresses: 1,
        enterprises: 2
    });
    assert.deepStrictEqual(response.unavailableSources, []);
    assert.strictEqual(response.totalCount, 1);
    assert.strictEqual(response.pageSize, 100);
    assert.deepStrictEqual(calls[0].query, {
        publicVisibility: 'PUBLIC',
        status: 'ACTIVE',
        'operatorEnterpriseRef.code': 'NODICS_WASTE_MANAGEMENT_CO',
        'assetOwnerEnterpriseRef.code': 'BEAH_RECYCLING_SERVICES',
        'locationRef.code': 'LOC_001'
    });
    assert.strictEqual(calls[0].tenant, 'runtimeTenantFromToken');
    assert.deepStrictEqual(calls[0].searchOptions, { pageSize: 100, pageNumber: 1 });
    assert.deepStrictEqual(calls[0].options, { recursive: false, skipItemCache: true });
    assert.deepStrictEqual(moduleCalls.map(call => call.moduleName + call.apiName), [
        'locationCore/locations/LOC_001',
        'profile/address',
        'profile/enterprise'
    ]);
    assert.strictEqual(moduleCalls[0].request.tenant, 'runtimeTenantFromToken');

    const modelCalls = [];
    global.NODICS = {
        getModels: function (moduleName, tenant) {
            assert.strictEqual(moduleName, 'wasteCollection');
            assert.strictEqual(tenant, 'runtimeTenantFromToken');
            return {
                WasteCollectionPointModel: {
                    getItems: async function (request) {
                        modelCalls.push(request);
                        return { result: [{ code: 'WCP_MODEL' }], totalCount: 1 };
                    }
                }
            };
        }
    };

    const modelResponse = await service.search({
        tenant: 'runtimeTenantFromToken',
        authData: { tenant: 'runtimeTenantFromToken' },
        payload: { filters: { status: 'ACTIVE' } }
    });

    assert.strictEqual(modelResponse.records[0].code, 'WCP_MODEL');
    assert.strictEqual(modelCalls.length, 1);
    assert.strictEqual(calls.length, 1);
    assert.deepStrictEqual(modelCalls[0].options, { recursive: false, skipItemCache: true });

    assert.throws(() => service.query({ tenant: 'default' }), /Tenant is runtime context/);
    delete global.NODICS;
    delete global.SERVICE;
    console.log('Waste Collection centre service contract validated');
}

main().catch(function (error) {
    console.error(error);
    process.exitCode = 1;
});
