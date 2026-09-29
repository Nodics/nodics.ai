/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module checkoutCore/acceptance/defaultCheckoutContractAcceptanceService @description Proves effective transaction and recovery API coverage. @owner checkoutCore @layer tooling */
import { createAcceptanceContext } from '../../../../../../../../nodics.foundation/modules/nTooling/src/service/project/defaultProjectAcceptanceService.mjs';
import { pathToFileURL } from 'node:url';

/** Read-only capability contract, reusable by cross-domain qualification without copying its assertions. */
export async function runCheckoutContractAcceptance(options = {}) {
  const { request, authenticate } = await createAcceptanceContext(options);
  const headers = await authenticate();
  const contract = await request('COMMERCE', '/nodics/system/v0/contract/openapi', { headers });
  const paths = contract?.paths || contract?.openapi?.paths || {};
  for (const route of ['/nodics/cart/v0/carts/{cartCode}/calculations', '/nodics/checkoutCore/v0/checkouts/place',
    '/nodics/order/v0/orders/{orderCode}/lifecycle/preview', '/nodics/process/v0/incidents',
    '/nodics/process/v0/instances/{instanceCode}/retry', '/nodics/process/v0/instances/{instanceCode}/compensate']) {
    const method = route === '/nodics/process/v0/incidents' ? 'get' : 'post';
    const operation = paths[route]?.[method];
    if (!operation || typeof operation !== 'object' || Array.isArray(operation)) throw new Error('Commerce effective contract is missing ' + method.toUpperCase() + ' ' + route);
  }
  return { state: 'PASSED' };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  if (process.argv.includes('--help')) console.log('Read-only Checkout transaction and recovery OpenAPI contract acceptance; requires running runtimes.');
  else console.log(JSON.stringify(await runCheckoutContractAcceptance()));
}
