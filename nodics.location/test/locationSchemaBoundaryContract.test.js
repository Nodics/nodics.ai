'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const locationRoot = path.resolve(__dirname, '..');
const moduleNames = [
    'locationCore',
    'locationType',
    'locationMap',
    'locationSearch',
    'locationDraft',
    'locationApproval',
    'locationProjection'
];

function loadNamespace(moduleName) {
    return require(path.join(locationRoot, 'modules', moduleName, 'src/schemas/schemas.js'))[moduleName];
}

function schemas() {
    return moduleNames.flatMap(moduleName => Object.entries(loadNamespace(moduleName)).map(([schemaName, schema]) => ({
        moduleName,
        schemaName,
        schema
    })));
}

function assertNoDomainTenantField(definition, label) {
    assert.strictEqual(definition.tenant, undefined, `${label} must not use tenant as a business field`);
    assert.strictEqual(definition.tenantCode, undefined, `${label} must not use tenantCode as a business field`);
}

function assertNoCoordinateArray(definition, label) {
    assert.strictEqual(definition.coordinates, undefined, `${label} must not store unlabeled coordinate arrays`);
    if (definition.latitude || definition.longitude) {
        assert(definition.latitude, `${label} latitude must be paired with longitude`);
        assert(definition.longitude, `${label} longitude must be paired with latitude`);
        assert.strictEqual(definition.latitude.type, 'number', `${label} latitude must be numeric`);
        assert.strictEqual(definition.longitude.type, 'number', `${label} longitude must be numeric`);
    }
}

schemas().forEach(item => {
    const label = `${item.moduleName}.${item.schemaName}`;
    assert.notStrictEqual(item.schemaName, 'locationAddress', 'Location must not create a duplicate address schema while Profile address owns reusable address fields');
    assert(item.schema.model, `${label} must be a persistent contract schema`);
    assertNoDomainTenantField(item.schema.definition, label);
    assertNoCoordinateArray(item.schema.definition, label);
});

const location = loadNamespace('locationCore').location.definition;
assert.strictEqual(location.latitude.required, true);
assert.strictEqual(location.longitude.required, true);
assert.strictEqual(location.addressRef.required, true);
assert.strictEqual(location.enterpriseRef.required, false);
assert.strictEqual(location.sourceRef.required, true);

[
    'flatNo',
    'building',
    'street',
    'addressLine1',
    'addressLine2',
    'locality',
    'city',
    'state',
    'postalCode',
    'countryCode',
    'landmarkHint',
    'accessNotes',
    'verificationStatus',
    'displayPolicy'
].forEach(field => assert.strictEqual(location[field], undefined, `Location must not duplicate Profile address field ${field}`));

console.log('location schema boundary contract passed');
