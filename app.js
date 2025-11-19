// app.js (produção) — carrega dados de families.json e inicializa a aplicação
console.error(err);
alert('Erro ao carregar dados da tabela periódica. Verifique families.json');
}
}


function buildFamiliesFromElements(elements){
const families = {};
// exemplos de famílias comuns — você pode ajustar/expandir
families['gases-nobres'] = { name:'Gases Nobres', key:'gases-nobres', elements: elements.filter(e=>e.group===18) };
families['metais-transicao'] = { name:'Metais de Transição', key:'metais-transicao', groupRange:[3,12], elements: elements.filter(e=> typeof e.group === 'number' && e.group>=3 && e.group<=12 && e.period>=4) };
families['lantanideos'] = { name:'Lantanídeos', key:'lantanideos', fblock:true, elements: elements.filter(e=> e.group==='f' && e.period===6) };
families['actinideos'] = { name:'Actinídeos', key:'actinideos', fblock:true, elements: elements.filter(e=> e.group==='f' && e.period===7) };
// adiciona outras famílias por grupo fixo
[1,2,13,14,15,16,17].forEach(g=>{ families[`group-${g}`] = { name:`Grupo ${g}`, key:`group-${g}`, group:g, elements: elements.filter(e=> e.group===g) }; });
return families;
}


function buildFamilyMenu(){
const grid = $('familyGrid'); grid.innerHTML = '';
Object.keys(familiesData).forEach(key=>{
const fam = familiesData[key];
const btn = createEl('button',{class:'family-card',type:'button'});
btn.innerHTML = `<h3>${fam.name}</h3><p style="font-size:.85em">${(fam.elements||[]).length} elementos</p>`;
btn.addEventListener('click', ()=> startGame(key));
grid.appendChild(btn);
});
}


function startGame(familyKey){
currentFamily = familiesData[familyKey]; if(!currentFamily) return;
currentElements = (currentFamily.elements||[]).map(e=>({...e})); placedElements = 0;
$('selectionScreen').classList.remove('active'); $('gameScreen').classList.add('active');
$('familyTitle').textContent = currentFamily.name + (currentFamily.fblock? ' (F-bloco)' : (currentFamily.groupRange? ' (Grupos 3-12)' : ` - ${currentFamily.name}`));
initGame();
}


function initGame(){ placedElements=0; updateProgress(); createTableGrid(); createFBlockIfNeeded(); createElementsPool(); }


function createTableGrid(){
const grid = $('tableGrid'); grid.innerHTML = '';
const header = createEl('div'); header.className = 'element-row'; header.appendChild(createEl('div',{class:'col-label'}));
for(let g=1; g<=18; g++) header.appendChild(createEl('div',{class:'col-label', html:g})); grid.appendChild(header);
for(let period=1; period<=7; period++){
const row = createEl('div'); row.className = 'element-row'; row.appendChild(createEl('div',{class:'col-label', html:period}));
for(let group=1; group<=18; group++){
const isActive = currentElements.some(el=> el.period===period && (el.group===group || (currentFamily.groupRange && el.group>=currentFamily.groupRange[0] && el.group<=currentFamily.groupRange[1])));
const slot = createEl('div',{class: 'element-slot ' + (isActive? 'active' : 'inactive')});
if(isActive){ const elData = currentElements.find(el=> el.period===period && (el.group===group || (currentFamily.groupRange && el.group>=currentFamily.groupRange[0] && el.group<=currentFamily.groupRange[1]))); if(elData){ slot.dataset.number = elData.number; slot.dataset.period = elData.period; slot.dataset.group = elData.group; slot.addEventListener('dragover', handleDragOver); slot.addEventListener('drop', handleDrop); }}
row.appendChild(slot);
}
grid.appendChild(row);
}
}


function createFBlockIfNeeded(){ const container = $('fBlockContainer'); container.innerHTML = ''; function makeRow(title,elements){ if(!elements||!elements.length) return; const wrap = createEl('div'); wrap.style.marginTop='10px'; wrap.appendChild(createEl('h4',{html:title})); const grid = createEl('div'); grid.style.display='grid'; grid.style.gridTemplateColumns='repeat(15,55px)'; grid.style.gap='6px'; grid.style.overflow='auto'; grid.style.paddingTop='6px'; elements.forEach(el=>{ const slot = createEl('div',{class:'element-slot active'}); slot.dataset.number = el.number; slot.dataset.period = el.period; slot.dataset.group = 'f'; slot.innerHTML = `<div style="font-size:.65em;color:#666">${el.number}</div><div style="font-size:1.15em;font-weight:700;color:var(--primary-1)">${el.symbol}</div>`; slot.addEventListener('dragover', handleDragOver); slot.addEventListener('drop', handleDrop); grid.appendChild(slot); }); wrap.appendChild(grid); container.appendChild(wrap); }
if(currentFamily && currentFamily.fblock) makeRow(currentFamily.name, currentFamily.elements); else { makeRow('Lantanídeos (La → Lu)', familiesData.lantanideos.elements); makeRow('Actinídeos (Ac → Lr)', familiesData.actinideos.elements); } }


function createElementsPool(){ const pool = $('elementsPool'); pool.innerHTML = ''; if(!currentElements||currentElements.length===0) return; const shuffled = [...currentElements].sort(()=>Math.random()-0.5); shuffled.forEach(el=>{ const card = createEl('div',{class:'element-card', draggable:true}); card.dataset.number = el.number; card.innerHTML = `<div style="font-size:.75em;color:#666">${el.number}</div><div style="font-size:1.6em;font-weight:800;color:var(--primary-1)">${el.symbol}</div><div style="font-size:.85em">${el.name}</div>`; card.addEventListener('dragstart', handleDragStart); card.addEventListener('dragend', handleDragEnd); pool.appendChild(card); }); updateProgress(); }


function handleDragStart(e){ draggedElement = e.currentTarget; e.currentTarget.classList.add('dragging'); e.dataTransfer.setData('text/plain', e.currentTarget.dataset.number); }
function handleDragEnd(e){ if(e.currentTarget) e.currentTarget.classList.remove('dragging'); draggedElement = null; }
function handleDragOver(e){ e.preventDefault(); e.dataTransfer.dropEffect = 'move'; return false; }
function handleDrop(e){ e.preventDefault(); const slot = e.currentTarget; const droppedNumber = draggedElement?.dataset.number; const slotNumber = slot.dataset.number; if(!droppedNumber) return; if(slotNumber && droppedNumber===slotNumber && !slot.classList.contains('filled')){ slot.innerHTML = draggedElement.innerHTML; slot.classList.add('filled'); slot.classList.remove('active'); draggedElement.remove(); placedElements++; updateProgress(); const element = currentElements.find(el=>String(el.number)===String(droppedNumber)); if(element) showElementInfo(element); if(placedElements===currentElements.length) setTimeout(()=>showCompletionMessage(),450); } else { const prev = slot.style.background; slot.style.background = '#ffebee'; setTimeout(()=> slot.style.background = prev,300); } return false; }


function updateProgress(){ const bar = $('progressBar'); const total = currentElements.length||0; bar.textContent = `${placedElements} / ${total}`; const pct = total===0?0:Math.round((placedElements/total)*100); bar.style.width = pct + '%'; }


function showElementInfo(element){ if(!element) return; $('modalTitle').textContent = `${element.symbol} - ${element.name}`; $('modalBody').innerHTML = ` <p><strong>Número atômico:</strong> ${element.number}</p> <p><strong>Massa atômica:</strong> ${element.mass||'—'}</p> <p><strong>Período:</strong> ${element.period||'—'}</p> <p><strong>Grupo:</strong> ${element.group|| (element.group==='f'?'f-bloco':'—')}</p> <hr/> <p><strong>Descrição:</strong> ${element.description||'—'}</p> <p><strong>Propriedades:</strong> ${element.properties||'—'}</p> <p><strong>Descoberta:</strong> ${element.discovery||'—'}</p>`; $('infoModal').classList.add('active'); }


function closeModal(){ $('infoModal').classList.remove('active'); }
function showHint(){ if(!currentFamily) return; let hint = '<div class="hint-box"><h4>Dica</h4>'; if(currentFamily.name.includes('Transição')) hint += '<p>Metais de transição: grupos 3–12, condutores e com múltiplos estados de oxidação.</p>'; else if(currentFamily.fblock) hint += '<p>Elementos do f-bloco são agrupados abaixo da tabela (lantanídeos/actinídeos).</p>'; else hint += '<p>Organize por número atômico (crescente de cima para baixo na mesma coluna).</p>'; hint += '</div>'; $('modalTitle').textContent = '💡 Dica'; $('modalBody').innerHTML = hint; $('infoModal').classList.add('active'); }
function showCompletionMessage(){ $('modalTitle').textContent = '🎉 Parabéns!'; $('modalBody').innerHTML = `<div class="success-message">Você completou a família ${currentFamily.name}!</div><div style="display:flex;gap:8px;margin-top:12px;justify-content:center"><button class="btn btn-primary" onclick="resetGame();closeModal()">🔄 Jogar Novamente</button><button class="btn btn-secondary" onclick="backToMenu();closeModal()">🏠 Menu</button></div>`; $('infoModal').classList.add('active'); }
function resetGame(){ initGame(); }
function backToMenu(){ $('gameScreen').classList.remove('active'); $('selectionScreen').classList.add('active'); }


document.addEventListener('click',(e)=>{ if(e.target && e.target.id==='closeModalBtn') closeModal(); });
$('hintBtn').addEventListener('click', showHint);
$('resetBtn').addEventListener('click', resetGame);
$('menuBtn').addEventListener('click', backToMenu);
$('infoModal').addEventListener('click',(e)=>{ if(e.target===e.currentTarget) closeModal(); });
document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeModal(); });


// inicializa carregando families.json
loadData();


