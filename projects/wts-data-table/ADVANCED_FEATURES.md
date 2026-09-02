# Licensed advanced features

Advanced capabilities ship inside the same `wts-data-table` package. They use
feature-named subpaths; there is no separate Pro package and no `/premium`
import namespace.

```ts
import { verifyDataTableLicense } from 'wts-data-table';
import { createRemoteRowModel } from 'wts-data-table/remote';

const license = await verifyDataTableLicense(entitlementToken);

const rows = createRemoteRowModel({
  license,
  origin: window.location.origin,
  // normal remote-row-model options
});
```

`verifyDataTableLicense()` accepts a signed WTS entitlement token. A plain API
key, forged object, expired token, wrong origin, or token without the required
feature fails closed before the feature implementation is constructed. Keep
the signing private key outside applications and npm packages.

The optional `origin` value is required only for an origin-bound entitlement.
Server-rendered and Node applications must supply the deployed HTTP(S) origin
explicitly when their entitlement is origin-bound.

## Issue a license

License issuance is a maintainer operation. From the source repository's
`projects/wts-data-table` directory, generate a new Ed25519 key pair:

```bash
npm run license:keygen
```

The command writes the private key and public-key record under
`.license-private/`, which Git ignores. Copy the printed public verifier entry
into `PUBLIC_KEYS` in `src/license.ts`, then build, test, and publish a package
version containing that public key before issuing tokens with the new key ID.
Never commit, publish, or send the private key to a customer.

Copy `scripts/license-claims.example.json` to
`.license-private/license-claims.json`, replace the customer ID, unique license
ID, Unix timestamps, enabled features, and exact allowed origins, then sign it:

```bash
npm run license:sign -- \
  .license-private/wts-data-table-ed25519-private.pem \
  .license-private/license-claims.json \
  .license-private/customer-license.token \
  wts-data-table-production-02
```

The signer validates the Data Table issuer, audience, timestamps, tier,
feature IDs, duplicate values, and origin syntax before writing a new token. It
refuses to overwrite an existing token. Distribute only the `.token` value;
retain the private key in an isolated secrets manager or licensing service.

## Feature entry points

| Capability | Entitlement | Primary imports |
| --- | --- | --- |
| Advanced row model | `advanced-row-model` | `wts-data-table/remote`, `wts-data-table/remote-viewport` |
| Indexed search | `indexed-search` | `wts-data-table/search`, `wts-data-table/search-filters` |
| Background export | `background-export` | `wts-data-table/export-jobs`, `wts-data-table/durable-export` |
| Worker processing | `worker-processing` | `wts-data-table/worker-engine`, `wts-data-table/worker-table` |
| Live data | `live-data` | `wts-data-table/live-data`, `wts-data-table/live-transports` |
| Server analytics | `server-analytics` | `wts-data-table/pivot-controller`, `wts-data-table/pivot-builder` |
| Spreadsheet formulas | `spreadsheet-formulas` | `wts-data-table/formula-engine`, `wts-data-table/formula-editor` |
| Collaborative editing | `collaborative-editing` | `wts-data-table/collaboration-client`, `wts-data-table/collaboration-table` |
| Governed editing | `governed-editing` | `wts-data-table/governance-client`, `wts-data-table/governance-panel` |
| Report designer | `report-designer` | `wts-data-table/report-controller`, `wts-data-table/report-designer` |

Supporting contracts, HTTP adapters, PostgreSQL stores, and worker runtimes use
the same feature-named package subpaths. See the detailed guides in
[`docs/advanced`](docs/advanced/ROADMAP.md).

## Security and licensing boundary

The entitlement check controls access to advanced APIs in an unmodified package.
It is not user authentication, server authorization, or tamper-proof DRM. Verify
identity, tenant access, query scope, and mutations on the server. The entire npm
package, including these features, is distributed under the package's MIT license.
