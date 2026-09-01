/** @module loyaltyCore/config/properties @description Provides shared Loyalty defaults. @layer config @owner loyaltyCore @override Later active modules may refine defaults through configuration layering. */
module.exports = {
    schemaPolicies: { loyaltyCore: {
        operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } }
    } },
    loyalty: {
        amount: {
            scale: 2,
            roundingMode: 'HALF_UP'
        },
        idempotency: {
            required: true
        }
    }
};
