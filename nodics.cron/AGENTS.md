# nodics.cron

- Keep scheduled-job runtime authority inside the `cronjob` module.
- Do not move job scheduling, node ownership, or execution lifecycle into Axis.
- Treat `nodics.cron` as an optional functional module unless a customer
  server composition explicitly requires it.
