# Support matrix

## Runtime

- Node.js 22 and 24 LTS are supported for SSR, tooling, and server transports.
- The browser bundles target ES2022.
- Chromium, Firefox, and WebKit are tested on their current Playwright builds.
- Internet Explorer and end-of-life Node.js releases are not supported.

## Framework wrappers

The core package is framework-agnostic. Official Angular, React, and Vue
wrappers maintain their own peer-dependency ranges and versioning. Wrapper
issues should always include both the wrapper and `wts-data-table` versions.

## Compatibility policy

Public API and deprecation rules are documented in
[API_STABILITY.md](./API_STABILITY.md). Bug fixes target the latest minor
release. Security fixes may be backported when impact and adoption justify it.
