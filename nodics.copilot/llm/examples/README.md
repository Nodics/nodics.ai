# nodics.copilot examples

Example: “Create 10 iPhone Pro Max products” is incomplete. Copilot asks for
catalog, code prefix, currency, price, and any required schema attributes. It
then prepares ten records, runs the Schema Workbench validator, presents a
count plus first/last-record preview, requests explicit confirmation, and calls
the secured bulk-create API with an idempotency key. A provider response alone
can never mark the records as created.

Example: “Export these results to Excel” uses the already-authorized query
result and delegates workbook generation to `nExport/excelExport`. It refuses
rows beyond the configured maximum and never reads the database directly.
