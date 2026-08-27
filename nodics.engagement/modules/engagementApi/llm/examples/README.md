# engagementApi Examples

## Supported customization direction

An anonymous contact route may be enabled by later-layer policy only with rate, bot, replay, idempotency, tenant, field allow-list, and audit controls.

A contact-domain module may later implement the appropriate `DefaultEngagementDomainGatewayService` operations. The API facade still verifies tenant and owner before projecting the configured DTO.

Making a concrete form route anonymous requires a route override to `secured: false` and the exact operation in `engagementApi.anonymousRouteAllowList`. The default API boundary performs neither action.

## Rejected shortcut

Do not call archived/generated residue as a service authority, expose schema CRUD directly, return gateway records without projection, trust tenant or owner identifiers from URL/body input, or make a whole route family anonymous.
