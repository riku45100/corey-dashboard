# Staff module prototype

Features: searchable staff directory, team and status filters, summary cards, add/edit forms, weekly capacity and allocation, over-allocation flags, Staff worksheet/CSV import, and filtered CSV export.

All sample people are fictional. Data and edits remain in memory. No database, localStorage, login, actual account creation, live API or Microsoft 365 integration is enabled. Do not use confidential staff data on the public demo. Roles are job titles, not authorisation roles. Allocations are entered totals, not computed from project assignments. No timesheets, historical weeks, payroll, certification expiry or leave date calculation is included.

## Preview
Keep staff.html beside staff-module.js and open staff.html. An internet connection is needed to load the Excel parser for imports. Other staff functions do not depend on that library.

## Import fields
Required canonical fields (case/space/underscore/hyphen variations accepted): StaffID, Name, Role, Team, CapacityHours, AllocatedHours. Optional: Status (Active / On leave / Inactive), Projects, Skills. Blank status defaults to Active. IDs are unique and immutable in the edit form. Hours must be finite numbers from 0 to 168 for the same working week. The form uses half-hour increments. A workbook must contain a Staff sheet; a CSV uses its first sheet. Imports are limited to 10 MiB and replace session data after confirmation. Import errors retain previous data.

## Integration
The Pages workflow copies staff.html and staff-module.js into the published assets and loads staff-module.js after date-format.js in the generated dashboard. The module appends an isolated section to main. The source index.html remains unchanged; open staff.html for a standalone local preview.

The Microsoft sync foundation currently does not accept a staff dataset label. Adding that label, a private authenticated staff API, access controls, durable CRUD and dashboard data fetching is separate work. window.CorexStaff.setRows(records) is a session-only import hook with replacement confirmation, not a network connection.

## Metric definitions
Total staff: all loaded records. Active and on-leave counts: exact status match. Active capacity and allocation are summed for utilisation. Utilisation can exceed 100%; no capacity returns an em dash. Available hours sum max(0, capacity minus allocated) per active person, so another person's overload does not erase available hours. Over-allocated counts active staff whose allocation exceeds their capacity. Card totals cover all loaded records; filters affect the table and CSV only.
