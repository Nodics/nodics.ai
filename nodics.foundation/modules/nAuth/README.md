# nAuth

nAuth owns bounded authentication and authorization contracts for people, services and API-key principals; Profile remains the identity and session-context owner.

Keep credential types distinct, preserve strict distributed security state and never use local fallback to bypass revocation or missing authority.

Detailed material is preserved in the adjacent [implementation and operations guide](authentication-security-guide.md). This README is the discovery index, not a replacement authority or evidence that runtime qualification passed.

Read [owner guidance](AGENTS.md) before changing behavior. Customize through the established later-loaded configuration, services, providers, schemas and runtime layers described in the guide; do not copy framework owners or bypass their invariants. Verification commands and their limits are retained in the guide. This documentation-only reorganization runs no behavioral tests or operations.

## Credential Boundaries

See [Credential Boundaries](authentication-security-guide.md#credential-boundaries).

## When To Use This Module

See [When To Use This Module](authentication-security-guide.md#when-to-use-this-module).

## Configuration

See [Configuration](authentication-security-guide.md#configuration).

## Identity governance

See [Identity governance](authentication-security-guide.md#identity-governance).

## Distributed authentication threat and acceptance contract

See [Distributed authentication threat and acceptance contract](authentication-security-guide.md#distributed-authentication-threat-and-acceptance-contract).

## Deployment and migration order

See [Deployment and migration order](authentication-security-guide.md#deployment-and-migration-order).

## Failure, Observability, And Performance

See [Failure, Observability, And Performance](authentication-security-guide.md#failure-observability-and-performance).

## Verification

See [Verification](authentication-security-guide.md#verification).

## Common Mistakes

See [Common Mistakes](authentication-security-guide.md#common-mistakes).

## Continue

See [Continue](authentication-security-guide.md#continue).
