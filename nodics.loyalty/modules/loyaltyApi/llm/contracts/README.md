# loyaltyApi Contracts

API routes expose Loyalty resources and operations for service-to-service integrations.

After route authorization, wallet-by-code reads use
`DefaultLoyaltyRewardOperationService.serviceRequest`, as do the other Loyalty
operations. Runtime tokens deliberately have no expanded groups; do not copy
them directly into generated storage requests or grant runtime administrator
groups to satisfy schema access. Preserve the authenticated tenant, wallet query,
route permissions and unchanged caller credential. Commerce separately proves
customer wallet ownership before a reward payment.
