# Microsoft 365 sync foundation

Status: backend command-line foundation, not a deployed integration. The public dashboard and Pages deployment are unchanged. No credentials, workbook contents, scheduled jobs or authenticated data API are included.

## Authentication
Register a single-tenant application in Microsoft Entra ID. For a dedicated SharePoint site, request Microsoft Graph APPLICATION permission Sites.Selected, obtain administrator consent, and separately grant the application read access to the selected site. Consent alone does not grant site access. Granular Selected file/folder permissions are another option requiring their own grants and verification. Do not request tenant-wide write access for this read-only sync.

The script uses the OAuth client credentials flow through MSAL. Configure M365_TENANT_ID and M365_CLIENT_ID, then either M365_CERTIFICATE_PATH plus M365_CERTIFICATE_THUMBPRINT, or M365_CLIENT_SECRET. Prefer a certificate for production. Certificate files must contain the matching PEM private key and remain outside the repository. Federated credentials are not implemented in this scaffold. No user password or browser token is required by this flow.

This downloads workbook files through Microsoft Graph drive item content endpoints; it does not call the Excel workbook worksheet/range APIs. The latter have different authentication support.

## Local setup on a trusted backend host
Use Python 3.10 or newer. From the repository root:

```sh
python -m venv .venv
. .venv/bin/activate
pip install -r backend/requirements.txt
cp backend/sources.example.json backend/sources.local.json
python -m unittest discover -s backend -p 'test_*.py'
python backend/sync_m365.py
```

Export credentials into the server process environment using its secret manager. backend/.env.example documents names only; .env files are not loaded automatically. Do not paste credentials into chat, HTML, source configuration or GitHub.

## Workbook configuration
Each source requires a unique id, driveId, itemId and explicit sheet mappings. These are stable Microsoft Graph identifiers, not ordinary sharing links. All example sources are disabled; configure and set enabled to true only after access is granted. Add sources for additional workbooks. Map each worksheet name and dataset; columns maps dashboard field names to exact row-1 Excel headings. Each mapped field must exist exactly once. idField must identify a stable nonblank ID column. Supported dataset labels: alerts, projects, qualityGates, resources, inspections, commercial. These labels organise records only; dashboard widgets are not yet wired to them.

Only mapped sheets are imported. Downloaded .xlsx workbooks are limited to 25 MiB; old .xls, password-protected files and CSV are not supported by this backend parser. Excel dates and DD/MM/YYYY or YYYY-MM-DD Due values become ISO dates internally. Formula cells use values last cached by Excel; this code does not calculate formulas. Use trusted workbooks and apply host resource limits before enabling unattended processing.

## Private output and failure behaviour
The default output is .private-sync/state.json, excluded from Git. Keep it on private persistent storage: .gitignore is not access control. Never publish this directory, attach its contents to public build artifacts or commit it. The existing Pages workflow publishes explicit dashboard assets only.

Successful imports replace the corresponding source snapshot, including deleting rows absent from a valid new snapshot. Missing sheets/columns, duplicate IDs, download errors or invalid dates retain the previous successful snapshot for that source and mark it stale. Disabled/removed sources are excluded from the next output. Authentication/configuration errors abort before replacing the output. A source error stores its exception type, not provider response bodies or tokens.

The downloader follows at most one Microsoft Graph redirect, without forwarding its bearer token, to an allowed HTTPS Microsoft download host. Additional Microsoft cloud hostnames/redirect patterns require review rather than automatic allowlisting. No automatic retry/backoff, delta tracking, folder discovery or parallel execution is implemented.

## Remaining deployment work
1. Select a private Python-capable host and persistent storage. This Python script does not run directly on Cloudflare Workers or GitHub Pages.
2. Register the Entra app, grant selected resource access and configure backend secrets.
3. Configure actual drive/item IDs and mappings; test with representative workbooks.
4. Add a scheduler (for example every five minutes) with a single-run lock, retry/backoff, monitoring and deletion safeguards. Do not run multiple writers against the same state file.
5. Add an authenticated API and dashboard sign-in, then wire dataset records into dashboard widgets. Source authorisation and dashboard-user authentication are separate.
6. Verify access controls before exposing any real operational data.

Do not interpret this commit as active auto-sync or a working Microsoft connection.

## Microsoft documentation
- https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow
- https://learn.microsoft.com/en-us/graph/permissions-selected-overview
- https://learn.microsoft.com/en-us/graph/api/driveitem-get-content?view=graph-rest-1.0
- https://learn.microsoft.com/en-us/graph/api/workbook-list-worksheets?view=graph-rest-1.0
