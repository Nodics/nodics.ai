/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/project/defaultFunctionalJourneyAcceptanceService @description Composes capability-owned suites without owning their assertions. @owner nTooling @layer tooling */
import { pathToFileURL } from 'node:url';
import { runEngagementJourneyAcceptance } from '../../../../../../nodics.engagement/modules/engagementApi/src/service/acceptance/defaultEngagementJourneyAcceptanceService.mjs';
import { runCheckoutContractAcceptance } from '../../../../../../nodics.commerce/modules/checkout/modules/checkoutCore/src/service/acceptance/defaultCheckoutContractAcceptanceService.mjs';

/** Calls the existing owners; no process lifecycle, data provisioning or permissions are inferred. */
export async function runFunctionalJourneyAcceptance(options = {}) {
  if (options.execute !== true) throw new Error('Explicit --execute is required');
  const checkout = await runCheckoutContractAcceptance(options);
  const engagement = await runEngagementJourneyAcceptance(options);
  return { checkout, engagement };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  if (process.argv.includes('--help')) console.log('Composes Checkout contract and Engagement journey acceptance; requires running runtimes and --execute.');
  else console.log(JSON.stringify(await runFunctionalJourneyAcceptance({ execute: process.argv.includes('--execute') })));
}
