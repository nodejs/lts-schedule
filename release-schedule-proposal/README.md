# Release schedule proposals

To add a new proposal to this list, update the `schedule` variable in `lib/index.js`, and use the following command:

```sh
node ./bin/lts.js -g release-schedule-proposal/<some-uniq-name>.svg >> release-schedule-proposal/README.md
```

Here are the release schedule proposals:

## Status quo

  1. current duration: 6 months
  2. active duration:
     - for even-numbered releases: 12 months
     - for odd-numbered releases: 0 months
  3. maintenance duration:
     - for even-numbered releases: 24 months
     - for odd-numbered releases: 3 months

  Total life span (from start of beta until end of maintenance):
  - for even-numbered releases: 42 months
  - for odd-numbered releases: 9 months

  ![Release schedule proposal preview](./status-quo.svg)

  ![Release schedule proposal preview](./status-quo2030.svg)

## LTS every year

  1. Alpha duration: 5 months
  2. Beta duration: 1 months
  3. Current duration: 6 months
  4. Active duration: 12 months
  5. Maintenance duration: 18 months

  Total life span (from start of beta until end of maintenance): 37 months

  ![Release schedule proposal preview](./lts-every-year.svg)

  ![Release schedule proposal preview](./lts-every-year2030.svg)

### Alpha and Beta definition

#### Stability expectations

Alpha releases may contain semver-major changes (assuming such change does not "break the ecosystem"), but no ABI-breaking changes (so native addons can be tested on those versions).

Once the release has reached the beta period, semver-major changes will no
longer be included, except:

- security fixes
- V8 update
- one-time exception granted by the TSC

Updating V8 during the Beta period is considered the optimal tradeoff, despite
the ABI and API potential breakage, as otherwise the included V8 version would
be 1 year old by the time the release line transitions to LTS.

#### Release frequency

Version | Tentative Date | Type of changes
--------|--------------| -------------
v27.0.0-alpha.0 |  2026-10-20  | Branch-off
v27.0.0-alpha.1 |  2026-11-03  | most changes[^1]
v27.0.0-alpha.2 |  2026-11-17  | most changes[^1]
v27.0.0-alpha.3 |  2026-12-01  | most changes[^1]
v27.0.0-alpha.4 |  2026-12-15  | most changes[^1]
v27.0.0-alpha.5 |  2026-12-29  | most changes[^1]
v27.0.0-alpha.6 |  2027-01-12  | most changes[^1]
v27.0.0-alpha.7 |  2027-01-26  | most changes[^1]
v27.0.0-alpha.8 |  2027-02-09  | most changes[^1]
v27.0.0-alpha.9 |  2027-02-23  | most changes[^1]
v27.0.0-alpha.10 |  2027-03-09  | most changes[^1]
v27.0.0-beta.0 |  2027-03-23  | most changes[^1] + V8 update
v27.0.0-beta.1 |  2027-04-06  | semver-minor only + V8 update
v27.0.0 |  2027-04-20  | semver-minor only
v27.x.x |  2027-05-04  | …
v27.x.x |  2027-10-05  | …
v27.x.x (LTS transition) |  2027-10-20  | 
(Maintenance transition) |  2028-10-20  | 
(End-of-Life) |  2030-10-20  | 

[^1]: Most changes from `main`, except those marked as `dont-land-on-v27.x` because e.g. they contain ABI-breaking changes, or are considered too breaking for the ecosystem, or are moving a deprecation to EOL if 27.x already contains the change moving it to Runtime.

#### Security support

TL;DR: TBD

It has not been decided whether security fixes would
trigger a security release, or if those would simply be included in the next
regular release (potentially ahead of schedule). The difference on a maintenance
perspective is that a security release requires locking the CI until all the
queued security releases are ready.

## Longer life cycle

  1. current duration:
     - for even-numbered releases: 6 months
     - for odd-numbered releases: 12 months
  2. active duration:
     - for even-numbered releases: 18 months
     - for odd-numbered releases: 0 months
  3. maintenance duration:
     - for even-numbered releases: 24 months
     - for odd-numbered releases: 2 months

  Total life span (from start of beta until end of maintenance):
  - for even-numbered releases: 48 months
  - for odd-numbered releases: 14 months

  ![Release schedule proposal preview](./longer-life-cycle.svg)

  ![Release schedule proposal preview](./longer-life-cycle2030.svg)

## Less frequent LTS

  1. current duration: 6 months
  2. active duration:
     - for modulo-4-numbered releases: 24 months
     - for other releases: 0 months
  3. maintenance duration:
     - for modulo-4-numbered releases: 18 months
     - for other releases: 2 months

  Total life span (from start of beta until end of maintenance):
  - for module-4-numbered releases: 48 months
  - for releases: 8 months

  ![Release schedule proposal preview](./less-frequent-lts.svg)

  ![Release schedule proposal preview](./less-frequent-lts2030.svg)

## No Active LTS anymore

  1. current duration: 12 months
  2. active duration: 0 months
  3. maintenance duration: 24 months

  Total life span (from start of beta until end of maintenance): 36 months

  ![Release schedule proposal preview](./no-active-lts.svg)

  ![Release schedule proposal preview](./no-active-lts2030.svg)
