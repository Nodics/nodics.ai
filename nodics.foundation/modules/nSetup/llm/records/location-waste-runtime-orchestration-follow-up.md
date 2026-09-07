# Location And Waste Runtime Orchestration Follow-Up

## Recorded Action

Lock reference-project runtime orchestration so Platform starts first, then Location and Waste runtime services start after Platform health and registry readiness are confirmed. Location and Waste must register active leases through BackOffice governance without relying on manual restart order.

## Migration Target

- Add topology sequencing for `platformServer`, `locationServer`, and `wasteServer` in the reference customer project.
- Keep each runtime independently startable as a standalone microservice runtime.
- Add health and readiness checks that wait for Platform registry availability before dependent runtimes report ready.
- Preserve customer ownership of topology coordinates; do not move reference-project orchestration into reusable framework module code.
- Validate with `topology:start`, `topology:start:all`, runtime lease registration, and Axis route access after a clean process start.

## Status

Completed. Framework topology tooling supports environment-declared runtime dependencies and additional readiness checks, and Kickoff Local starts Platform before Location before Waste. Platform startup readiness remains health-only because public bootstrap depends on later WCMS Online availability; public bootstrap is validated by the live Axis smoke after the full topology is running.
