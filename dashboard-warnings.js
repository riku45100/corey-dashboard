(function(){
'use strict';
const css=document.createElement('style');css.textContent=`
#alertRows .badge{animation:none!important;box-shadow:none!important}#toggleAnimation{display:none!important}
#alertRows td:first-child .badge{font-weight:800;border:2px solid transparent}
#alertRows td:first-child .badge.red{background:#d90000;color:#fff;border-color:#850000}
#alertRows td:first-child .badge[data-severity=high]{background:#ff9800;color:#281500;border-color:#9a5100}
#alertRows td:first-child .badge[data-severity=medium]{background:#ffe600;color:#302b00;border-color:#8b7d00}
#alertRows tr[data-severity=critical] td:first-child{border-left:6px solid #d90000}
#alertRows tr[data-severity=high] td:first-child{border-left:6px solid #ff9800}
#alertRows tr[data-severity=medium] td:first-child{border-left:6px solid #d6bd00}
.cx-warningbar{position:sticky;top:0;z-index:1500;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:14px 20px;background:#fff1f0;color:#850000;border-bottom:3px solid #d90000;font-weight:700}
.cx-warningbar[data-clear=true]{background:#f1f5f9;color:#334155;border-color:#94a3b8}
.cx-overlay{position:fixed;inset:0;z-index:10000;background:#102030bb;display:flex;align-items:center;justify-content:center;padding:16px}.cx-overlay[hidden]{display:none}
.cx-dialog{width:660px;max-width:100%;max-height:90vh;overflow:auto;background:white;border:3px solid #d90000;border-radius:12px;padding:24px;color:#16232f;box-shadow:0 20px 70px #0006}.cx-dialog h2{font-size:22px;color:#a00000}.cx-dialog ul{max-height:45vh;overflow:auto;padding-left:22px}.cx-dialog li{padding:10px 0;border-bottom:1px solid #e2e8f0}.cx-dialog button{background:#a00000}
@media print{.cx-warningbar,.cx-overlay{display:none!important}}
`;document.head.appendChild(css);
const bar=document.createElement('section');bar.className='cx-warningbar';bar.setAttribute('aria-label','Open problem summary');
const summary=document.createElement('span');summary.setAttribute('role','status');summary.setAttribute('aria-live','polite');
const review=document.createElement('button');review.type='button';review.textContent='Review High/Critical';bar.append(summary,review);document.body.prepend(bar);
const overlay=document.createElement('div');overlay.className='cx-overlay';overlay.hidden=true;
const panel=document.createElement('section');panel.className='cx-dialog';panel.setAttribute('role','alertdialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','cx-popup-title');panel.setAttribute('aria-describedby','cx-popup-note');
const heading=document.createElement('h2');heading.id='cx-popup-title';heading.textContent='High/Critical alerts need attention';
const note=document.createElement('p');note.id='cx-popup-note';note.textContent='These are open alerts across all loaded data, not just the current filters. Acknowledging closes this popup only; it does not resolve any alert.';
const list=document.createElement('ul'),ack=document.createElement('button');ack.type='button';ack.textContent='Acknowledge';panel.append(heading,note,list,ack);overlay.append(panel);document.body.append(overlay);
const norm=v=>String(v??'').trim().toLowerCase(),closed=new Set(['resolved','closed','complete','completed','done']),key=a=>JSON.stringify([norm(a.Severity),a.Project,a.Alert]),seen=new Set();
let items=[],opened=false,last='',previousFocus=null;
function paint(){list.replaceChildren();items.forEach(a=>{const li=document.createElement('li'),title=document.createElement('strong'),detail=document.createElement('div');title.textContent=String(a.Severity)+': '+String(a.Alert||'Unnamed alert');detail.textContent=[a.Project,a.Owner,a.Action].filter(Boolean).join(' — ');li.append(title,detail);list.append(li)});if(!items.length){const li=document.createElement('li');li.textContent='No open High/Critical alerts.';list.append(li)}}
function show(){if(!opened)previousFocus=document.activeElement;paint();opened=true;overlay.hidden=false;ack.focus()}
function dismiss(){items.forEach(a=>seen.add(key(a)));opened=false;overlay.hidden=true;if(previousFocus&&previousFocus.isConnected)previousFocus.focus()}
ack.onclick=dismiss;review.onclick=show;
document.addEventListener('keydown',e=>{if(!opened)return;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();dismiss()}else if(e.key==='Tab'){e.preventDefault();ack.focus()}},true);
document.addEventListener('focusin',e=>{if(opened&&!panel.contains(e.target))ack.focus()});
const host=document.getElementById('alertRows');function mark(){host.querySelectorAll('tr').forEach(row=>{const b=row.querySelector('td:first-child .badge');if(b){const severity=norm(b.textContent);b.dataset.severity=severity;row.dataset.severity=severity}})}
mark();new MutationObserver(mark).observe(host,{childList:true,subtree:true});
function check(){const rows=currentAlerts.filter(a=>!closed.has(norm(a.Status))),counts={critical:0,high:0,medium:0};rows.forEach(a=>{const severity=norm(a.Severity);if(severity in counts)counts[severity]++});items=rows.filter(a=>['critical','high'].includes(norm(a.Severity))).sort((a,b)=>Number(norm(b.Severity)==='critical')-Number(norm(a.Severity)==='critical'));const active=new Set(items.map(key));for(const id of seen)if(!active.has(id))seen.delete(id);const signature=JSON.stringify([counts,items]);if(signature!==last){summary.textContent='OPEN PROBLEMS — Critical: '+counts.critical+' · High: '+counts.high+' · Medium: '+counts.medium;bar.dataset.clear=String(!counts.critical&&!counts.high);review.disabled=!items.length;parent.document.title=(items.length?'('+items.length+' High/Critical) ':'')+'Corey Engineering Dashboard';if(opened)paint();last=signature}if(items.some(a=>!seen.has(key(a)))&&!opened)show()}
window.CorexFocusPopup=()=>{if(opened)ack.focus()};check();setInterval(check,2000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
})();
(function(){
'use strict';
const css=document.createElement('style');css.textContent='@keyframes cxEdgePulse{0%,100%{opacity:1}50%{opacity:.35}}.cx-edge{position:fixed;inset:0;z-index:11000;pointer-events:none;border:6px solid transparent;box-sizing:border-box;animation:cxEdgePulse 2s ease-in-out infinite}.cx-edge[data-level=none]{display:none}.cx-edge[data-level=critical]{border-color:#ff1515;box-shadow:inset 0 0 20px #ff151599}.cx-edge[data-level=high]{border-color:#ffe000;box-shadow:inset 0 0 20px #ffe00099}@media(prefers-reduced-motion:reduce){.cx-edge{animation:none;opacity:1}}@media print{.cx-edge{display:none!important}}';document.head.appendChild(css);
const edge=document.createElement('div');edge.className='cx-edge';edge.dataset.level='none';edge.setAttribute('aria-hidden','true');document.body.appendChild(edge);
function update(){const open=currentAlerts.filter(a=>!['resolved','closed','complete','completed','done'].includes(String(a.Status??'').trim().toLowerCase())),levels=new Set(open.map(a=>String(a.Severity??'').trim().toLowerCase()));edge.dataset.level=levels.has('critical')?'critical':levels.has('high')?'high':'none'}
update();setInterval(update,2000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)update()});
})();
