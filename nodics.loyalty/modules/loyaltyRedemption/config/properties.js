/** @module loyaltyRedemption/config/properties @description Defines loyaltyRedemption schema access policy. @layer config @owner loyaltyRedemption */
module.exports = {
    schemaPolicies: { loyaltyRedemption: {
        operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } }
    } }
};
