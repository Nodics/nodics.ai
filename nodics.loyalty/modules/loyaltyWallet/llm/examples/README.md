# loyaltyWallet Examples

For a governed simulation deployment, override only
`loyalty.partnerRewardConversion.enabled: true` and
`loyalty.partnerRewardConversion.mock.enabled: true`; select `providerKey: "mock"`
on the governed integration. Framework registration and other defaults are
inherited, not copied. Use existing verified links and sample/test-only wallets.
To exercise a terminal refusal on a new quote, override `.mock.outcome` to
`"NOT_CREDITED"`. Existing quotes keep their original outcomes.

The [partner conversion contract](../contracts/partner-reward-conversion.md#permanent-simulated-adapter)
defines prerequisites, evidence labeling, unresolved holds and real adapter
replacement. These examples do not activate a runtime or qualify a real partner.
