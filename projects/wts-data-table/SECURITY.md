# Security policy

## Supported versions

Security fixes are released for the latest `1.x` minor version. Consumers
should upgrade to the newest patch before reporting an issue. Unsupported
Node.js releases are outside the support policy; see [SUPPORT.md](./SUPPORT.md).

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub's private
security-advisory form for the repository declared in `package.json` and
include:

- the affected version and public entry point;
- a minimal reproduction or proof of concept;
- the expected impact and any known mitigations;
- whether the issue is already public.

Reports are acknowledged within three business days. Valid issues receive a
coordinated fix and advisory before technical details are disclosed. Never
include production credentials, personal data, or third-party secrets in a
report or reproduction.

## Security design

The package has no runtime dependencies. Text values render through DOM text
nodes; rich content requires an application-provided `Node`. Print and export
formats escape data before serialization. Database adapters validate and quote
configured identifiers and bind user values as parameters.
