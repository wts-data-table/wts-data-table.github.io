import { DATA_TABLE_PREMIUM_FEATURES } from 'wts-data-table/license';

if (DATA_TABLE_PREMIUM_FEATURES.CARD_VIEW !== 'card-view') {
  throw new Error(
    'This portal requires the card-view-entitled package build. Published 1.0.2 does not include it. ' +
    'Install wts-data-table 1.1.0 or later and update package.json/package-lock.json before deploying. ' +
    'For local verification only, install a tarball built from the updated library source.'
  );
}
console.log('Verified installed package supports licensed card view.');
