# Dependency security

Review date: 2026-10-19. This template is not vulnerability-free.

## Applied fix

`package.json` overrides only `xcode`'s `uuid` dependency to **11.1.1**.
This addresses [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq).
Version 11 retains CommonJS support needed by xcode; newer ESM-only major versions
are not a drop-in replacement. Tests exercise xcode project ID generation and
rejection of an undersized UUID output buffer. Revisit/remove the override when
upstream xcode adopts a patched dependency.

`npm audit` went from 22 findings (15 high, 7 moderate) to **15 high**. Most entries
are parent packages inheriting the same underlying advisory, not 15 separate bugs.

## Unresolved upstream advisories

| Package | Installed version | Advisory | Published patched version at review |
| --- | --- | --- | --- |
| braces | 3.0.3 | [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) | None |
| node-forge | 1.4.0 | [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv) | None |

`braces` is brought in through Metro's file matching; its recursive processing can
fail on adversarial nested patterns. `node-forge` is brought in through Expo CLI
and its code-signing certificate tooling; the advisory concerns RSA signature
verification. These dependency paths are tooling paths, but that alone does not
prove every affected operation is unreachable. Avoid untrusted build inputs and
do not expose the Metro development server to untrusted networks. These are
precautions, not fixes, and the npm warnings are intentionally not suppressed.

Do not use `npm audit fix --force` to clear this report: npm proposed downgrades
to Expo 44 / React Native 0.72, incompatible with this SDK 57 native integration.
Do not substitute a homemade crypto patch or merely change package versions to
hide an advisory. Track official fixes and retest compatible updates.

## Recheck

```powershell
npm.cmd ci
npm.cmd audit
npx.cmd expo install --check
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
```

A successful source check or npm audit does not replace an APK/native dependency
review. Never commit signing keys, credentials or private stream tokens. No
security reporting mailbox is configured; do not post secrets in public issues.

Verification after the override: Expo dependency compatibility check, lint,
TypeScript, all five tests, Expo prebuild config evaluation, and Android Hermes
bundle export passed. No APK was rebuilt as part of this dependency-only change.
