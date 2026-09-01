/** @module loyaltyWallet/config/properties @description Defines loyaltyWallet schema access policy. @layer config @owner loyaltyWallet */
module.exports = {
    schemaPolicies: { loyaltyWallet: {
        operational: { accessGroups: { adminGroup: 10, serviceAccountUserGroup: 10, employeeUserGroup: 10 } }
    } }
};
