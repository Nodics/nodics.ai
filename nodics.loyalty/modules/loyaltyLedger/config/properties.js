/** @module loyaltyLedger/config/properties @description Defines loyaltyLedger schema access policy. @layer config @owner loyaltyLedger */
module.exports = {
    schemaPolicies: { loyaltyLedger: {
        operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } }
    } }
};
