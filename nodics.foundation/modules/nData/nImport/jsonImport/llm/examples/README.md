# jsonImport AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nData/nImport/jsonImport` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

JSON import parser construction in a CommonJS service method:

```js
const { streamArray } = await import("stream-json/streamers/stream-array.js");
const records = streamArray.withParserAsStream();
fileStream.pipe(records);
```

Attach data, end and error handlers before piping; keep lifecycle behavior in
the import service.
