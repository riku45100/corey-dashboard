# Job assignment tracker

Session-only prototype. No real staff data, storage, authentication, API, Microsoft 365 integration or source-of-truth writeback. Does not fix the existing staff CSV prefix defect. Do not use confidential data on the public demo.

## Features
Add/edit weekly jobs linked by StaffID and ProjectID. Statuses: Planned, In progress, Completed, Cancelled. Search and filter by week/staff/project/status. CSV export uses current filters and DD/MM/YYYY; Excel/CSV import reads JobAssignments, validates rows and replaces assignments after confirmation. A 10 MiB import limit applies. Unknown IDs, duplicate AssignmentID, invalid dates and nonpositive or excessive hours reject the entire replacement. Previous data remains on error or cancellation.

## Capacity semantics
One row represents a person's planned hours on one job in one Monday-to-Sunday week. Split multi-week work into separate rows with distinct AssignmentIDs. Only Planned and In progress consume capacity. The workload table always uses ALL assignments for the selected week; staff/project/status/search filters affect only the assignment list and export. On leave or Inactive staff have zero effective capacity and any assignment to them is flagged. Status is current, not date-specific leave scheduling. No working-day schedule, actual hours or holiday calendar is calculated.

The tracker reads StaffID, Name, Status and CapacityHours from window.CorexStaff.getRows(). It does NOT add the staff module's manual AllocatedHours to assignment hours or modify it. The two panels remain separate until a canonical allocation model is implemented. Click Refresh staff after staff edits or imports; missing staff references are displayed as warnings, not silently deleted. Save/import validates all job references against the current staff/project catalogs.

The project dropdown starts with D4, PHARMA, HOSPITAL, MFG and SITE-B demo projects; it is not wired to the dashboard's project board. window.CorexAssignments.setProjects([{ProjectID,Project}]) can replace that catalog, rejecting changes that orphan jobs. getRows(), setRows(rows) and refresh() provide future adapter hooks; setRows remains a confirmed session-only replacement.

## Preview and tests
Keep job-assignments.html and job-assignments.js together and open the HTML. It supplies fictional staff fixtures, not the full staff editor. Click Load sample assignments to populate the current week. examples/job-assignments.csv uses week 26/10/2026: select that Monday after import. Excel import needs its CDN library. Run node job-assignments.test.cjs from the repository root for the model tests.

## Dashboard integration
The Pages workflow publishes job-assignments.js and job-assignments.html, then loads job-assignments.js after staff-module.js in the generated dashboard. The section appends to main. The existing date-format.js and logo handling are preserved. Source index.html is unchanged; the source preview works directly. A successful commit is not proof of a successful Pages deployment.

## Remaining work
Browser/UI and deployed integration testing; private durable API; source mappings for staff, projects and assignments; authenticated roles; scheduler/locking; audit history and conflict handling. No staff or assignment dataset is added to the Microsoft backend by these files.
