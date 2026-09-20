# elastic AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `nodics.foundation/modules/nSearch/elastic` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

The Local Elasticsearch baseline is `http://localhost:9200` in this provider. Local customer properties inherit it. Other environments override only actual differences such as service DNS, TLS or authentication; do not copy the Local address into customer configuration.
