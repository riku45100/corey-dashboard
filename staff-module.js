(function () {
'use strict';
const ST = ['Active', 'On leave', 'Inactive'];
const fields = ['StaffID','Name','Role','Team','Status','CapacityHours','AllocatedHours','Projects','Skills'];
const samples = [
 {StaffID:'DEMO-001',Name:'Alex Morgan',Role:'Commissioning Engineer',Team:'Commissioning',Status:'Active',CapacityHours:40,AllocatedHours:46,Projects:'Data Centre D4',Skills:'MEP; integrated testing'},
 {StaffID:'DEMO-002',Name:'Jamie Taylor',Role:'Validation Specialist',Team:'Validation',Status:'Active',CapacityHours:37.5,AllocatedHours:30,Projects:'Cleanroom validation',Skills:'IQ; OQ; PQ'},
 {StaffID:'DEMO-003',Name:'Sam Patel',Role:'Quality Manager',Team:'Quality',Status:'On leave',CapacityHours:40,AllocatedHours:0,Projects:'',Skills:'QA/QC; audits'},
 {StaffID:'DEMO-004',Name:'Casey Jordan',Role:'Project Manager',Team:'Delivery',Status:'Active',CapacityHours:40,AllocatedHours:32,Projects:'Hospital MEP',Skills:'Planning; client coordination'},
 {StaffID:'DEMO-005',Name:'Robin Lee',Role:'Site Engineer',Team:'Commissioning',Status:'Inactive',CapacityHours:0,AllocatedHours:0,Projects:'',Skills:'Inspections'}
];
function validate(input) {
 if (!Array.isArray(input)) throw new Error('Expected an array of staff records.');
 const seen=new Set();
 return input.map((row,index)=>{
  const r={};fields.forEach(f=>r[f]=String(row[f]??'').trim());
  for(const f of ['StaffID','Name','Role','Team']) if(!r[f]) throw new Error(`Row ${index+2}: ${f} is required.`);
  if(seen.has(r.StaffID)) throw new Error(`Row ${index+2}: duplicate StaffID.`);
  seen.add(r.StaffID);
  r.Status=r.Status||'Active';
  if(!ST.includes(r.Status)) throw new Error(`Row ${index+2}: status must be Active, On leave or Inactive.`);
  for(const f of ['CapacityHours','AllocatedHours']) {
   const value=row[f];
   if(value===undefined||value===null||String(value).trim()==='') throw new Error(`Row ${index+2}: ${f} is required.`);
   r[f]=Number(value);
   if(!Number.isFinite(r[f])||r[f]<0||r[f]>168) throw new Error(`Row ${index+2}: ${f} must be between 0 and 168.`);
  }
  return r;
 });
}
function metrics(rows){
 const active=rows.filter(r=>r.Status==='Active');
 const capacity=active.reduce((s,r)=>s+r.CapacityHours,0);
 const allocated=active.reduce((s,r)=>s+r.AllocatedHours,0);
 return {total:rows.length,active:active.length,leave:rows.filter(r=>r.Status==='On leave').length,
 capacity,allocated,available:active.reduce((s,r)=>s+Math.max(0,r.CapacityHours-r.AllocatedHours),0),
 utilisation:capacity?Math.round(allocated/capacity*100):null,
 over:active.filter(r=>r.AllocatedHours>r.CapacityHours).length};
}
function csvCell(value){let t=String(value??'');if(typeof value!=='number'&&/^\s*[=+\-@]/.test(t))t="'"+t;return '"'+t.replace(/"/g,'""')+'"';}
window.CorexStaffModel={validate,metrics,csvCell};
if(typeof document==='undefined')return;
if(document.getElementById('corex-staff'))return;
const style=document.createElement('style');
style.textContent=`
#corex-staff{background:white;border:1px solid #e2e8f0;border-radius:14px;padding:20px;margin:18px 0;color:#16232f;font-family:system-ui,sans-serif}#corex-staff *{box-sizing:border-box}#corex-staff h2{margin:0;font-size:20px}#corex-staff .st-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px}#corex-staff .st-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}#corex-staff button{font:inherit;font-size:13px;cursor:pointer;background:#1c6fb8;color:white;border:0;border-radius:8px;padding:10px 13px}#corex-staff .st-secondary{background:#e8eef5;color:#203a52}#corex-staff .st-small{font-size:12px;line-height:1.6;color:#64748b}#corex-staff .st-warning{background:#fff7ed;border-left:3px solid #d97706;padding:10px 12px;font-size:13px;line-height:1.6}#corex-staff .st-kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin:16px 0}#corex-staff .st-kpi{background:#f4f7fb;border:1px solid #e2e8f0;border-radius:10px;padding:14px;min-width:0}#corex-staff .st-kpi-label{font-size:11px;text-transform:uppercase;color:#64748b}#corex-staff .st-value{font-size:25px;font-weight:750;margin-top:7px}#corex-staff .st-filters{display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px;margin:16px 0}#corex-staff label{display:flex;flex-direction:column;gap:6px;color:#475569;font-size:13px;min-width:0}#corex-staff input,#corex-staff select{width:100%;min-width:0;padding:10px;border:1px solid #cbd5e1;border-radius:8px;background:white;color:#16232f;font:inherit}#corex-staff :is(button,input,select):focus-visible{outline:3px solid #79baff;outline-offset:2px}#corex-staff .st-scroll{overflow-x:auto}#corex-staff table{border-collapse:collapse;width:100%;font-size:13px}#corex-staff th,#corex-staff td{text-align:left;vertical-align:top;border-bottom:1px solid #e2e8f0;padding:12px 9px}#corex-staff th{color:#64748b;font-size:11px;text-transform:uppercase;white-space:nowrap}#corex-staff .st-badge{display:inline-block;padding:4px 8px;border-radius:99px;background:#e2e8f0;font-size:11px;white-space:nowrap}#corex-staff .st-green{background:#dcfce7;color:#166534}#corex-staff .st-red{background:#fee2e2;color:#991b1b}#corex-staff .st-amber{background:#fef3c7;color:#92400e}#corex-staff .st-over{background:#fff8f8}#corex-staff .st-form{padding:16px;border:1px solid #93c5fd;border-radius:10px;background:#eff6ff;margin:16px 0}#corex-staff .st-form-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:14px}#corex-staff .st-form h3{margin-top:0}#corex-staff [hidden]{display:none!important}#corex-staff .st-error{color:#b91c1c}#corex-staff input[type=file]{font-size:12px;max-width:280px}#corex-staff .st-empty{text-align:center;color:#64748b;padding:24px}@media(max-width:1000px){#corex-staff .st-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:650px){#corex-staff{padding:15px}#corex-staff .st-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}#corex-staff .st-form-grid,#corex-staff .st-filters{grid-template-columns:1fr}}@media print{#corex-staff .st-actions,#corex-staff .st-filters,#corex-staff .st-form,#corex-staff .st-warning{display:none!important}#corex-staff .st-scroll{overflow:visible}}
`;
document.head.appendChild(style);
const section=document.createElement('section');section.id='corex-staff';
section.setAttribute('aria-labelledby','st-title');
section.innerHTML=`
<div class="st-toolbar"><h2 id="st-title">Staff & resource capacity</h2><div class="st-actions"><button type="button" id="st-add">Add staff</button><button type="button" id="st-export" class="st-secondary">Export filtered CSV</button><button type="button" id="st-reset" class="st-secondary">Restore sample staff</button></div></div>
<p class="st-warning">Prototype: fictional sample staff. Edits and imports are kept in memory only and disappear on refresh. No login, shared storage or live Microsoft 365 sync. Do not enter confidential staff data on this public demo.</p>
<div class="st-kpis" id="st-kpis"></div>
<div class="st-filters"><label for="st-search">Search staff<input type="search" id="st-search" placeholder="Name, role, skills or project…"></label><label for="st-team">Team<select id="st-team"><option value="">All teams</option></select></label><label for="st-status">Status<select id="st-status"><option value="">All statuses</option><option>Active</option><option>On leave</option><option>Inactive</option></select></label></div>
<div class="st-actions"><label for="st-file">Import Staff worksheet<input type="file" id="st-file" accept=".xlsx,.csv"></label><button type="button" id="st-clear" class="st-secondary">Clear filters</button></div>
<p class="st-small">Required columns: StaffID, Name, Role, Team, CapacityHours, AllocatedHours. Optional: Status (default Active), Projects, Skills. Hours represent the same working week; this version does not track historical weeks.</p>
<p id="st-message" class="st-small" role="status"></p>
<form id="st-form" class="st-form" hidden><h3 id="st-form-title">Add staff</h3><div class="st-form-grid" id="st-form-fields"></div><div class="st-actions"><button type="submit">Save staff</button><button type="button" id="st-cancel" class="st-secondary">Cancel</button></div><p id="st-form-error" class="st-small st-error" role="alert"></p></form>
<p id="st-count" class="st-small" aria-live="polite"></p><div class="st-scroll"><table><thead><tr><th scope="col">Staff</th><th scope="col">Role / team</th><th scope="col">Status</th><th scope="col">Capacity h/week</th><th scope="col">Allocated h/week</th><th scope="col">Utilisation</th><th scope="col">Projects / skills</th><th scope="col">Action</th></tr></thead><tbody id="st-rows"></tbody></table></div><p class="st-small">Summary covers all loaded staff. Capacity, allocation, utilisation and available hours include Active staff only. Available hours sum each active person's unused capacity; they do not cancel another person's over-allocation.</p>`;
const main=document.querySelector('main')||document.body;
main.appendChild(section);
const el=id=>document.getElementById(id);
let rows=validate(samples),editing=null,returnFocus=null;
fields.forEach(f=>{
 const label=document.createElement('label');label.htmlFor='st-f-'+f;label.textContent=f;
 const input=f==='Status'?document.createElement('select'):document.createElement('input');
 input.id='st-f-'+f;input.name=f;
 if(f==='Status')ST.forEach(s=>{const o=document.createElement('option');o.textContent=s;input.appendChild(o)});
 else if(f.endsWith('Hours')){input.type='number';input.min='0';input.max='168';input.step='0.5'}
 else {input.type='text';input.maxLength=500}
 if(['StaffID','Name','Role','Team','CapacityHours','AllocatedHours'].includes(f))input.required=true;
 label.appendChild(input);el('st-form-fields').appendChild(label);
});
function announce(text,error=false){el('st-message').textContent=text;el('st-message').className='st-small'+(error?' st-error':'')}
function visible(){const q=el('st-search').value.trim().toLowerCase(),team=el('st-team').value,status=el('st-status').value;return rows.filter(r=>(!team||r.Team===team)&&(!status||r.Status===status)&&(!q||fields.map(f=>String(r[f])).join(' ').toLowerCase().includes(q)))}
function teams(){const select=el('st-team'),old=select.value;select.replaceChildren();const all=document.createElement('option');all.value='';all.textContent='All teams';select.appendChild(all);[...new Set(rows.map(r=>r.Team))].sort().forEach(t=>{const o=document.createElement('option');o.value=t;o.textContent=t;select.appendChild(o)});select.value=[...select.options].some(o=>o.value===old)?old:''}
function cell(tr,value){const td=document.createElement('td');if(value instanceof Node)td.appendChild(value);else td.textContent=String(value);tr.appendChild(td);return td}
function render(){
 const m=metrics(rows),host=el('st-kpis');host.replaceChildren();
 [['Staff',m.total],['Active',m.active],['On leave',m.leave],['Utilisation',m.utilisation===null?'—':m.utilisation+'%'],['Available h/week',m.available],['Over-allocated',m.over]].forEach(([label,value])=>{const card=document.createElement('div');card.className='st-kpi';const l=document.createElement('div');l.className='st-kpi-label';l.textContent=label;const v=document.createElement('div');v.className='st-value';v.textContent=value;card.append(l,v);host.appendChild(card)});
 const body=el('st-rows'),list=visible();body.replaceChildren();
 list.forEach(r=>{
  const tr=document.createElement('tr'),over=r.Status==='Active'&&r.AllocatedHours>r.CapacityHours;if(over)tr.className='st-over';
  cell(tr,r.Name+' ('+r.StaffID+')');cell(tr,r.Role+' / '+r.Team);
  const badge=document.createElement('span');badge.className='st-badge '+(r.Status==='Active'?'st-green':r.Status==='On leave'?'st-amber':'');badge.textContent=r.Status;cell(tr,badge);
  cell(tr,r.CapacityHours);cell(tr,r.AllocatedHours);
  const percent=r.CapacityHours?Math.round(r.AllocatedHours/r.CapacityHours*100)+'%':r.AllocatedHours?'Over capacity':'—';
  const u=cell(tr,percent);if(over){const b=document.createElement('span');b.className='st-badge st-red';b.textContent='Over-allocated';u.append(document.createElement('br'),b)}
  cell(tr,[r.Projects,r.Skills].filter(Boolean).join(' · ')||'—');
  const edit=document.createElement('button');edit.type='button';edit.className='st-secondary';edit.textContent='Edit';edit.setAttribute('aria-label','Edit '+r.Name);edit.addEventListener('click',()=>openForm(r,edit));cell(tr,edit);body.appendChild(tr);
 });
 if(!list.length){const tr=document.createElement('tr'),td=cell(tr,'No staff match these filters.');td.colSpan=8;td.className='st-empty';body.appendChild(tr)}
 el('st-count').textContent='Showing '+list.length+' of '+rows.length+' staff';
}
function openForm(record,trigger){editing=record?record.StaffID:null;returnFocus=trigger;el('st-form').reset();fields.forEach(f=>el('st-f-'+f).value=record?record[f]:f==='Status'?'Active':f.endsWith('Hours')?'0':'');el('st-f-StaffID').readOnly=!!record;el('st-form-title').textContent=record?'Edit staff':'Add staff';el('st-form-error').textContent='';el('st-form').hidden=false;el(record?'st-f-Name':'st-f-StaffID').focus()}
function closeForm(){el('st-form').hidden=true;editing=null;if(returnFocus?.isConnected)returnFocus.focus();else el('st-add').focus()}
el('st-form').addEventListener('submit',event=>{event.preventDefault();try{const draft=Object.fromEntries(fields.map(f=>[f,el('st-f-'+f).value]));const next=editing?rows.map(r=>r.StaffID===editing?draft:r):[...rows,draft];rows=validate(next);closeForm();teams();render();announce('Staff saved for this session only.')}catch(error){el('st-form-error').textContent=error.message}});
el('st-add').addEventListener('click',()=>openForm(null,el('st-add')));el('st-cancel').addEventListener('click',closeForm);el('st-form').addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closeForm()}});
['st-team','st-status'].forEach(id=>el(id).addEventListener('change',render));el('st-search').addEventListener('input',render);
el('st-clear').addEventListener('click',()=>{['st-team','st-status','st-search'].forEach(id=>el(id).value='');render()});
function replace(input,message){const next=validate(input);if(!window.confirm('Replace all staff in this session? Unsaved staff edits will be lost.'))return false;rows=next;el('st-form').hidden=true;editing=null;teams();render();announce(message);return true}
el('st-reset').addEventListener('click',()=>replace(samples,'Fictional sample staff restored.'));
el('st-file').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>10*1024*1024)throw new Error('Maximum import size is 10 MiB.');if(!window.XLSX)throw new Error('Excel library is unavailable. Check the internet connection.');const book=XLSX.read(await file.arrayBuffer(),{type:'array'});const name=book.SheetNames.find(n=>n.trim().toLowerCase()==='staff')||(file.name.toLowerCase().endsWith('.csv')?book.SheetNames[0]:null);if(!name)throw new Error('Workbook needs a Staff worksheet.');const source=XLSX.utils.sheet_to_json(book.Sheets[name],{defval:''});if(!source.length)throw new Error('No staff rows found.');const mapped=source.map(r=>{const normal={};Object.entries(r).forEach(([k,v])=>normal[k.toLowerCase().replace(/[\s_-]/g,'')]=v);return Object.fromEntries(fields.map(f=>[f,normal[f.toLowerCase()]]))});replace(mapped,'Imported '+source.length+' staff from '+file.name+' for this session.')}catch(error){announce(error.message,true)}finally{event.target.value=''}});
el('st-export').addEventListener('click',()=>{const selected=visible();if(!selected.length){announce('No staff match the filters.',true);return}const text=' '+[fields,...selected.map(r=>fields.map(f=>r[f]))].map(row=>row.map(csvCell).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='corex-staff.csv';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)});
window.CorexStaff={getRows:()=>rows.map(r=>({...r})),setRows:input=>replace(input,'Staff dataset replaced for this session.')};
teams();render();announce('Fictional sample staff loaded.');
})();
