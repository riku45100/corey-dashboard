/* DD/MM/YYYY presentation and import support. Loaded after the dashboard. */
(function () {
  'use strict';
  window.parseDue = function (value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    if (typeof value === 'number' && window.XLSX) {
      const parts = XLSX.SSF.parse_date_code(value);
      if (parts) return new Date(parts.y, parts.m - 1, parts.d);
    }
    const text = String(value ?? '').trim();
    let year, month, day;
    let match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      day = Number(match[1]); month = Number(match[2]); year = Number(match[3]);
    } else {
      match = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
      if (!match) return null;
      year = Number(match[1]); month = Number(match[2]); day = Number(match[3]);
    }
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 &&
      date.getDate() === day ? date : null;
  };
  window.dueText = function (value) {
    const date = window.parseDue(value);
    if (!date) return String(value ?? '') || '—';
    return [String(date.getDate()).padStart(2, '0'),
      String(date.getMonth() + 1).padStart(2, '0'), date.getFullYear()].join('/');
  };
  window.description = function () {
    const severity = document.getElementById('severityFilter');
    const status = document.getElementById('statusFilter');
    const parts = [severity.options[severity.selectedIndex].text,
      status.options[status.selectedIndex].text];
    const fromValue = document.getElementById('dateFrom').value;
    const toValue = document.getElementById('dateTo').value;
    const from = fromValue ? window.dueText(fromValue) : '';
    const to = toValue ? window.dueText(toValue) : '';
    const query = document.getElementById('alertSearch').value.trim();
    if (from && to) parts.push('Due ' + from + ' to ' + to);
    else if (from) parts.push('Due from ' + from);
    else if (to) parts.push('Due through ' + to);
    if (query) parts.push('Search: “' + query + '”');
    return parts.join(' · ');
  };
  const guidance = Array.from(document.querySelectorAll('p.small')).find(
    element => element.textContent.includes('Use YYYY-MM-DD dates.')
  );
  if (guidance) guidance.textContent = guidance.textContent.replace(
    'Use YYYY-MM-DD dates.', 'Use DD/MM/YYYY dates.'
  );
  window.preparePrint = function () {
    window.hideTip();
    const now = new Date();
    document.getElementById('printDate').textContent =
      'Generated: ' + window.dueText(now) + ' ' + now.toLocaleTimeString('en-GB');
    document.getElementById('printFilters').textContent =
      'Filters: ' + window.description();
  };
  window.addEventListener('beforeprint', window.preparePrint);
  window.summary();
  window.render();
})();
