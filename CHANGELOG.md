# Changelog

## 2026-10-09 — error-tracking follow-up

- Preserve required fixed platform/language/function metadata in redacted stack frames so browser exceptions group into PostHog issues. Add a regression test for the wire schema.

## 2026-10-09

- Add PostHog website analytics, explicit conversion events, web vitals, sanitized errors, and masked session replay sampling. Add a privacy page, browser opt-out, DNT/GPC support, and payload-redaction tests.

## 2026-10-08

- Add a public IndexNow ownership file and automated sitemap notifications after verified deployments and hourly retry checks. Track accepted revisions and URLs, including removals, with bounded retries and success-only checkpoints.
- Prevent caching of the sitemap, ownership proof, and deployment marker used to verify notifications.
