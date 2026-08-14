# Localization qualification and release evidence

This directory contains machine-readable release-qualification evidence. It
does not replace runtime authority or human approval.

`release-acceptance.json` separates repository-verifiable evidence from exercises that require the target customer topology and accountable owners. `CONDITIONALLY_READY` means the implementation may enter environment qualification; it does not authorize production release.

Release authority must change the decision only through the governed release process after attaching evidence for every `REQUIRED` item. Never record simulated, local, or mocked checks as live SLO, disaster-recovery, accessibility, security, or product-owner approval.
