# Contracts Notes

`public-api.openapi.yaml` intentionally defines zero HTTP paths.

Reason:
- The specification and constitution require all initial tool processing to happen in the browser.
- Introducing app-managed API routes for UUID, Base64, Hash, or Cron processing would add unnecessary server scope.
- The schema components are kept so future non-MVP integrations can extend a known contract surface without rewriting the domain model.
