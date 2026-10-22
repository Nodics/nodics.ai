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
  const contracts = [
    {
      owner: 'Commerce',
      role: 'COMMERCE',
      operations: [
        ['/nodics/cart/v0/carts/{cartCode}/calculations', 'post'],
        ['/nodics/checkoutCore/v0/checkouts/place', 'post'],
        ['/nodics/order/v0/orders/{orderCode}/lifecycle/preview', 'post'],
      ],
    },
    {
      owner: 'Process',
      role: 'PROCESS',
      operations: [
        ['/nodics/process/v0/incidents', 'get'],
        ['/nodics/process/v0/instances/{instanceCode}/retry', 'post'],
        ['/nodics/process/v0/instances/{instanceCode}/compensate', 'post'],
      ],
    },
  ];
  for (const expected of contracts) {
    const contract = await request(expected.role, '/nodics/system/v0/contract/openapi', { headers });
    const paths = contract?.paths || contract?.openapi?.paths || {};
    for (const [route, method] of expected.operations) {
      const operation = paths[route]?.[method];
      if (!operation || typeof operation !== 'object' || Array.isArray(operation)) throw new Error(expected.owner + ' effective contract is missing ' + method.toUpperCase() + ' ' + route);
    }
  }
  return { state: 'PASSED' };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  if (process.argv.includes('--help')) console.log('Read-only Checkout transaction and recovery OpenAPI contract acceptance; requires running runtimes.');
  else console.log(JSON.stringify(await runCheckoutContractAcceptance()));
}
