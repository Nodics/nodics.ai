# loyaltyProgram Contracts

Program records identify reward program boundaries and lifecycle status.

`transferEnabled` is an explicit issuer selection, not permission inferred from
an active program. When enabled, `transferRewardTypeCodes` restricts eligible
types; omission admits only `defaultRewardTypeCode`. Wallet owns transfer limits,
fees, counters and settlement. Program records do not define framework defaults
or contain parallel balances. Cross-program movement is conversion, not transfer.
