# Branded exports

The attribution is exactly: data exported from Corey Engineering Ltd

PDF/print reports for alerts, staff and job assignments include the published corex.jpg logo, attribution, DD/MM/YYYY export timestamp, filter description, record count and the filtered records. The report opens in a new window: allow pop-ups, wait for the logo, then select Print / Save as PDF and choose Save as PDF. This is browser printing, not a direct PDF-file download. Printing is disabled until the logo loads; a failure is shown explicitly. Attribution appears in the report heading and at the end, not necessarily on every printed page. Charts are not included in these record reports.

CSV is text-only and cannot display an image. To keep imports compatible, attribution is appended in ExportedFrom and the timestamp in ExportedAt for every data row rather than inserted above the header. Original canonical field names are retained. Alerts retain DaysOverdue and OverdueOpen; staff and assignments retain their canonical columns. CSV output is UTF-8 with a BOM, CRLF row endings, quoted cells and formula-prefix protection.

export-branding.js is loaded last. It intercepts the existing CSV/PDF buttons in capture phase, and adds PDF buttons to staff and assignments. This supersedes the original staff CSV handler, including its incorrect leading character; it does not rewrite that original source handler. If this script does not load, the original handlers remain. No records are stored or uploaded by exporting.

The Pages workflow loads the export script in the dashboard and standalone staff/job previews while preserving existing modules. Run node export-branding.test.cjs for CSV model tests. PDF layout, pop-up behaviour, logo loading and live deployment still require browser verification.
