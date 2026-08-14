# nodics.cron

`nodics.cron` is the standard Nodics scheduled-job functional module.

It extends `nodics.foundation` and currently contributes the `cronjob` technical
module copied from the legacy framework source. The functional module is
optional for a customer project: BackOffice should discover it as available
when a cron runtime is live, and Axis can register or activate it through the
Module Registry.

Core, Platform, and WCMS remain mandatory for Axis. Cron is intentionally not
mandatory because many deployments will not run scheduled jobs.
