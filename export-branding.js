(function(){
'use strict';
const ATTRIBUTION='data exported from Corey Engineering Ltd';
function csvCell(value){let text=String(value??'');if(typeof value!=='number'&&/^\s*[=+\-@]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"'}
function csvText(fields,rows,time){const columns=[...fields,'ExportedFrom','ExportedAt'];return '\uFEFF'+[columns,...rows.map(r=>[...fields.map(f=>r[f]),ATTRIBUTION,time])].map(r=>r.map(csvCell).join(',')).join('\r\n')}
window.CorexExportModel={ATTRIBUTION,csvCell,csvText};
if(typeof document==='undefined')return;
const $=id=>document.getElementById(id);
const text=id=>$(id)?.value||'';
function label(id){const el=$(id);return el?.options?.[el.selectedIndex]?.text||el?.value||''}
function dateText(value){if(typeof window.dueText==='function')return window.dueText(value);const s=String(value??'');return /^\d{4}-\d{2}-\d{2}$/.test(s)?s.slice(8)+'/'+s.slice(5,7)+'/'+s.slice(0,4):s}
function stamp(){const now=new Date();return dateText([now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-'))+' '+now.toLocaleTimeString('en-GB')}
function collect(kind){
 let rows,fields,filters,title;
 if(kind==='alerts'){
  if(typeof window.filtered!=='function')throw new Error('Alert data is unavailable.');
  rows=window.filtered().map(r=>({...r,Due:dateText(r.Due),Status:['resolved','closed','complete','completed','done'].includes(String(r.Status??'').trim().toLowerCase())?'Resolved':'Open',DaysOverdue:typeof window.days==='function'?(window.days(r)??''):'',OverdueOpen:typeof window.overdue==='function'&&window.overdue(r)?'Yes':'No'}));
  fields=['Severity','Status','Alert','Project','Owner','Due','DaysOverdue','OverdueOpen','Action'];title='Quality-gate alerts';filters=window.description();
 }else if(kind==='staff'){
  fields=['StaffID','Name','Role','Team','Status','CapacityHours','AllocatedHours','Projects','Skills'];
  const query=text('st-search').trim().toLowerCase();
  rows=(window.CorexStaff?.getRows()||[]).filter(r=>(!text('st-team')||r.Team===text('st-team'))&&(!text('st-status')||r.Status===text('st-status'))&&(!query||fields.map(f=>String(r[f])).join(' ').toLowerCase().includes(query)));
  title='Staff capacity';filters=[label('st-team'),label('st-status'),query?'Search: '+text('st-search'):''].filter(Boolean).join(' · ');
 }else if(kind==='jobs'){
  fields=['AssignmentID','StaffID','ProjectID','JobTitle','WeekStart','Hours','Status','Notes'];
  const model=window.CorexJobModel;if(!model)throw new Error('Assignment data is unavailable.');
  const week=model.monday(text('ja-week')),query=text('ja-search').trim().toLowerCase(),staff=window.CorexStaff?.getRows()||[];
  rows=(window.CorexAssignments?.getRows()||[]).filter(r=>{
   const projectName=Array.from($('ja-project')?.options||[]).find(o=>o.value===r.ProjectID)?.text||'';
   const searchable=[...fields.map(f=>r[f]),staff.find(s=>s.StaffID===r.StaffID)?.Name,projectName].join(' ').toLowerCase();
   return r.WeekStart===week&&(!text('ja-person')||r.StaffID===text('ja-person'))&&(!text('ja-project')||r.ProjectID===text('ja-project'))&&(!text('ja-status')||r.Status===text('ja-status'))&&(!query||searchable.includes(query));
  }).map(r=>({...r,WeekStart:model.display(r.WeekStart)}));
  title='Job assignments';filters=['Week beginning '+model.display(week),label('ja-person'),label('ja-project'),label('ja-status'),query?'Search: '+text('ja-search'):''].filter(Boolean).join(' · ');
 }else throw new Error('Unknown export.');
 if(!rows.length)throw new Error('No records match the current filters.');
 return {rows,fields,title,filters,kind};
}
function downloadCSV(report){const data=csvText(report.fields,report.rows,stamp()),url=URL.createObjectURL(new Blob([data],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='corey-engineering-'+report.kind+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function pdf(report){
 const w=window.open('','_blank');if(!w)throw new Error('Allow pop-ups to open the printable PDF report.');w.opener=null;
 const d=w.document;d.open();d.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Corey Engineering Ltd — Export</title><style>@page{size:A4 landscape;margin:12mm}*{box-sizing:border-box}body{font:12px Arial,sans-serif;color:#16232f;margin:24px}header{display:flex;gap:24px;align-items:center;margin-bottom:18px}.logo{background:#050505;padding:12px;border-radius:6px;flex-shrink:0}.logo img{width:200px;height:auto;display:block}h1{font-size:22px;margin:0 0 8px}.attribution{font-size:14px;margin:8px 0}.muted{color:#64748b;font-size:11px;line-height:1.6}.controls{display:flex;gap:12px;align-items:center;margin-bottom:20px}button{padding:10px 16px;border:0;border-radius:6px;background:#1c6fb8;color:white;cursor:pointer}button:disabled{opacity:.5;cursor:wait}table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:10px}th,td{text-align:left;vertical-align:top;border:1px solid #dbe2ea;padding:8px 6px;overflow-wrap:anywhere}th{background:#edf2f7}thead{display:table-header-group}tr{break-inside:avoid}footer{margin-top:18px;padding-top:10px;border-top:1px solid #dbe2ea;color:#64748b;font-size:11px}@media print{body{margin:0}.controls{display:none}*{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head><body><div class="controls"><button id="print" type="button" disabled>Print / Save as PDF</button><span id="logo-status" class="muted">Loading logo…</span></div><header><div class="logo" id="logo"></div><div id="heading"></div></header><p id="filters" class="muted"></p><p id="count" class="muted"></p><table><thead><tr id="headers"></tr></thead><tbody id="rows"></tbody></table><footer id="footer"></footer></body></html>`);d.close();
 function add(parent,tag,value,className){const el=d.createElement(tag);el.textContent=value;if(className)el.className=className;parent.appendChild(el);return el}
 add(d.getElementById('heading'),'h1',report.title);add(d.getElementById('heading'),'p',ATTRIBUTION,'attribution');add(d.getElementById('heading'),'p','Exported: '+stamp(),'muted');
 d.getElementById('filters').textContent='Filters: '+report.filters;d.getElementById('count').textContent='Records exported: '+report.rows.length;
 report.fields.forEach(f=>{const th=add(d.getElementById('headers'),'th',f);th.scope='col'});
 report.rows.forEach(record=>{const tr=d.createElement('tr');report.fields.forEach(f=>add(tr,'td',String(record[f]??'')));d.getElementById('rows').appendChild(tr)});
 d.getElementById('footer').textContent=ATTRIBUTION;
 const image=d.createElement('img');image.alt='Engineering company logo';
 const printButton=d.getElementById('print');
 const ready=()=>{printButton.disabled=false;d.getElementById('logo-status').textContent='Choose Save as PDF in the print destination.'};
 image.addEventListener('load',ready);image.addEventListener('error',()=>{d.getElementById('logo-status').textContent='Logo could not load. Close this report and check corex.jpg before exporting.'});
 image.src=new URL('corex.jpg',document.baseURI).href;d.getElementById('logo').appendChild(image);if(image.complete&&image.naturalWidth)ready();
 printButton.addEventListener('click',()=>{w.focus();w.print()});
}
const buttons={exportCSV:['alerts','csv'],exportPDF:['alerts','pdf'],'st-export':['staff','csv'],'ja-export':['jobs','csv'],'st-export-pdf':['staff','pdf'],'ja-export-pdf':['jobs','pdf']};
function addPDF(afterId,id){const after=$(afterId);if(!after||$(id))return;const button=document.createElement('button');button.type='button';button.id=id;button.className=after.className;button.textContent='Export branded PDF';after.after(button)}
addPDF('st-export','st-export-pdf');addPDF('ja-export','ja-export-pdf');
document.addEventListener('click',event=>{const target=event.target instanceof Element?event.target.closest('button'):null;const config=target&&buttons[target.id];if(!config)return;event.preventDefault();event.stopImmediatePropagation();try{const report=collect(config[0]);if(config[1]==='pdf')pdf(report);else downloadCSV(report)}catch(error){window.alert(error.message)}},true);
})();
