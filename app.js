'use strict';
const $ = id => document.getElementById(id);
const config = window.JOURNAL_CONFIG;
const species = {
  kabeljo: ['Kabeljou','#176a47'], red_roman: ['Red Roman','#bb483c'],
  red_steenbras: ['Red Steenbras','#9e396c'], miss_lucy: ['Miss Lucy','#7c4fa3'],
  geelbek: ['Geelbek','#9b7014'], haai: ['Shark','#546474'],
  carpenter: ['Carpenter','#297a88'], santer: ['Santer','#ce6130'],
  yellowbelly: ['Yellowbelly','#88781a'], musselcracker: ['Musselcracker','#3459a0'],
  hake: ['Hake','#666743']
};
const dayColours = ['#176a47','#7c4fa3','#ce6130','#3459a0','#9b7014','#bb483c','#297a88','#9e396c'];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateFormat = new Intl.DateTimeFormat('en-ZA', { timeZone: config.timezone, day:'numeric', month:'short', year:'numeric' });
const timeFormat = new Intl.DateTimeFormat('en-ZA', { timeZone: config.timezone, hour:'2-digit', minute:'2-digit', hour12:false });
const dayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: config.timezone, year:'numeric', month:'2-digit', day:'2-digit' });
function dayKey(value) { const parts = Object.fromEntries(dayFormat.formatToParts(new Date(value)).map(p => [p.type,p.value])); return `${parts.year}-${parts.month}-${parts.day}`; }
const dateLabel = value => dateFormat.format(new Date(value));
const timeLabel = value => timeFormat.format(new Date(value));
const nameOf = c => species[c.species_id]?.[0] || c.recorded_label || c.species_id;
function fishImage(id, large=false) {
  return species[id] ? `<img class="${large?'fish-portrait':'fish-thumb'}" src="fish/${id}.png" alt="${esc(species[id][0])} illustration" loading="${large?'eager':'lazy'}" decoding="async" width="${large?320:64}" height="${large?220:46}">` : '';
}
let client, session, catches = [], trips = [], map, markers, visible = [], loadGeneration = 0, conditionsGeneration = 0, mapFitted = false, lastRefreshAt = 0;
let dayPalette = new Map();
function message(text, error = false) { $('status').textContent = text; $('status').classList.toggle('error', error); }
function loginMessage(text, error = false) { $('login-status').textContent = text; $('login-status').classList.toggle('error', error); }
function resetPrivateView() {
  loadGeneration++; conditionsGeneration++; catches = []; trips = []; visible = []; dayPalette.clear();
  if (map) map.remove();
  map = null; markers = null; $('map').replaceChildren();
  for (const id of ['bars','totals','days','detail-body','legend','trip-summary','trip-rows','trip-status']) $(id).replaceChildren();
  for (const id of ['catch-count','species-count','day-count']) $(id).textContent = '0';
  $('details').close(); $('journal').hidden = true; $('login').hidden = false; $('signout').hidden = true;
  $('password').value = ''; mapFitted = false;
  $('refresh').disabled = false; lastRefreshAt = 0;
}
async function setSession(next) {
  session = next;
  if (!session) { resetPrivateView(); return; }
  if (config.ownerId && session.user.id !== config.ownerId) {
    await client.auth.signOut({scope:'local'});
    loginMessage('This account is not the owner of this fishing journal.', true); return;
  }
  $('login').hidden = true; $('journal').hidden = false; $('signout').hidden = false;
  $('password').value = ''; route();
  await loadCatches();
}
async function loadCatches() {
  if (!session) return;
  const generation = ++loadGeneration;
  $('refresh').disabled = true; message('Loading your catches…');
  try {
    const all = []; const pageSize = 500;
    // A bounded page size and stable order avoid Supabase's default row limit.
    for (let offset = 0;;offset += pageSize) {
      const { data, error } = await client.from('fishing_catches')
        .select('archive_id,device_id,watch_trip_id,catch_id,species_id,recorded_label,caught_at,gps_at,latitude,longitude,gps_quality,position_method,tackle_method,received_at')
        .eq('record_kind','catch').eq('owner_id',session.user.id)
        .order('caught_at',{ascending:false}).order('archive_id',{ascending:false}).range(offset,offset + pageSize - 1);
      if (generation !== loadGeneration || !session) return;
      if (error) throw error;
      all.push(...data);
      if (data.length < pageSize) break;
    }
    catches = all;
    dayPalette = new Map([...new Set(catches.map(c => dayKey(c.caught_at)))].sort().map((day,i) => [day,dayColours[i % dayColours.length]]));
    render(); message('');
    $('updated').textContent = `Updated ${timeLabel(new Date())}`;
    lastRefreshAt = Date.now();
    await loadTrips(generation);
  } catch (error) {
    if (generation === loadGeneration) message(`Could not refresh catches. ${catches.length ? 'Previously loaded catches are still shown. ' : ''}${error.message || 'Check your connection and try again.'}`, true);
  } finally { if (generation === loadGeneration) $('refresh').disabled = false; }
}
function filtered() {
  return catches.filter(c => {
    const day = dayKey(c.caught_at);
    return (!$('species').value || c.species_id === $('species').value) && (!$('from').value || day >= $('from').value) && (!$('to').value || day <= $('to').value);
  });
}
function colourOf(c) { return $('colour').value === 'day' ? dayPalette.get(dayKey(c.caught_at)) : species[c.species_id]?.[1] || '#11543e'; }
function render() {
  visible = filtered();
  $('filter-summary').textContent = `${species[$('species').value]?.[0] || 'All species'} · ${$('from').value || $('to').value ? `${$('from').value || 'Start'} to ${$('to').value || 'End'}` : 'All dates'}`;
  $('catch-count').textContent = visible.length;
  $('species-count').textContent = new Set(visible.map(c => c.species_id)).size;
  $('day-count').textContent = new Set(visible.map(c => dayKey(c.caught_at))).size;
  $('empty').hidden = location.hash === '#trips' || visible.length > 0;
  $('empty').textContent = catches.length ? 'No catches match these filters.' : 'No catches yet. Save one on your watch and sync it to see it here.';
  if ($('from').value && $('to').value && $('from').value > $('to').value) message('The start date must be before the end date.', true);
  else message('');
  renderTotals(); renderDays(); renderMap();
  renderTrips();
}

async function loadTrips(generation) {
  try {
    const all=[];
    for (let offset=0;;offset+=500) {
      const {data,error}=await client.from('fishing_trips').select('*').eq('owner_id',session.user.id)
        .order('started_at',{ascending:false}).order('archive_id',{ascending:false}).range(offset,offset+499);
      if (generation!==loadGeneration || !session) return;
      if (error) throw error;
      all.push(...data.filter(t => t.ended_at && t.record_kind!=='setup_test' && t.raw_payload?.record_kind!=='setup_test'));
      if (data.length<500) break;
    }
    trips=all; $('trip-status').textContent=trips.length ? '' : 'No completed trips uploaded yet. Start and end a trip on your watch, then leave the app open to sync.';
    renderTrips();
  } catch {
    if (generation===loadGeneration) $('trip-status').textContent='Trips could not refresh. Your catches remain available. Try Refresh when connected.';
  }
}
const durationLabel = seconds => { const minutes=Math.round(seconds/60); return `${Math.floor(minutes/60)}h ${minutes%60}m`; };
function catchDistance(a,b) {
  if (![a.latitude,a.longitude,b.latitude,b.longitude].every(Number.isFinite)) return null;
  const radians=value=>value*Math.PI/180;
  const angle=Math.sin(radians(b.latitude-a.latitude)/2)**2 + Math.cos(radians(a.latitude))*Math.cos(radians(b.latitude))*Math.sin(radians(b.longitude-a.longitude)/2)**2;
  return 6371*2*Math.asin(Math.sqrt(Math.min(1,Math.max(0,angle))));
}
function tripMetrics(t) {
  const total=Math.max(0,(new Date(t.ended_at)-new Date(t.started_at))/1000);
  const segments=t.raw_payload?.activity_segments || [];
  const fishing=segments.filter(s=>s.mode==='fishing').reduce((sum,s)=>sum+s.ended_at-s.started_at,0);
  const travelling=segments.filter(s=>s.mode==='travelling').reduce((sum,s)=>sum+s.ended_at-s.started_at,0);
  const all=catches.filter(c=>c.device_id===t.device_id && c.watch_trip_id===t.watch_trip_id).sort((a,b)=>new Date(a.caught_at)-new Date(b.caught_at) || a.catch_id.localeCompare(b.catch_id,undefined,{numeric:true}));
  const selected=all.filter(c=>!$('species').value || c.species_id===$('species').value);
  const fishingCatches=selected.filter(c=>segments.some(s=>s.mode==='fishing' && new Date(c.caught_at)/1000>=s.started_at && new Date(c.caught_at)/1000<s.ended_at)).length;
  let distance=0,validPairs=0;
  for (let i=1;i<all.length;i++) { const km=catchDistance(all[i-1],all[i]); if(km!==null) { distance+=km; validPairs++; } }
  return {total,fishing,travelling,unclassified:Math.max(0,total-fishing-travelling),count:selected.length,fishingCatches,rate:fishing>0?fishingCatches/(fishing/3600):null,distance:validPairs?distance:null,averageDistance:validPairs?distance/validPairs:null};
}
function renderTrips() {
  const rows=trips.map(t=>({trip:t,metrics:tripMetrics(t)})).filter(({trip,metrics})=>{
    const day=dayKey(trip.started_at);
    return (!$('from').value || day>=$('from').value) && (!$('to').value || day<=$('to').value) && (!$('species').value || metrics.count>0);
  });
  const totals=rows.reduce((sum,{metrics:m})=>({total:sum.total+m.total,fishing:sum.fishing+m.fishing,travelling:sum.travelling+m.travelling,count:sum.count+m.count}),{total:0,fishing:0,travelling:0,count:0});
  $('trip-summary').innerHTML=[['Trips',rows.length],['Total trip time',durationLabel(totals.total)],['Fishing time',durationLabel(totals.fishing)],['Travelling time',durationLabel(totals.travelling)],['Catches',totals.count]].map(([label,value])=>`<div><span>${label}</span><strong>${value}</strong></div>`).join('');
  $('trip-rows').innerHTML=rows.map(({trip:t,metrics:m})=>`<tr><td>${esc(dateLabel(t.started_at))}<br><span class="small muted">${esc(timeLabel(t.started_at))}</span></td><td>${durationLabel(m.total)}</td><td>${durationLabel(m.fishing)}</td><td>${durationLabel(m.travelling)}</td><td>${durationLabel(m.unclassified)}</td><td>${m.count}</td><td>${m.rate===null?'—':m.rate.toFixed(1)}</td><td>${m.distance===null?'—':m.distance.toFixed(2)+' km total<br><span class="small muted">'+m.averageDistance.toFixed(2)+' km average</span>'}</td></tr>`).join('') || '<tr><td colspan="8">No completed trips match these filters.</td></tr>';
}
function initMap() {
  if (map || $('map-page').hidden) return;
  if (!window.L || !L.markerClusterGroup) { $('map').textContent = 'The map could not load. Your catches are still available in Species and Days.'; return; }
  map = L.map('map').setView([-34.08,22.97],8);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
  markers = L.markerClusterGroup({maxClusterRadius:40,spiderfyOnMaxZoom:true,showCoverageOnHover:false}).addTo(map);
  map.on('zoomend', updateLabels);
}
function updateLabels() {
  if (!map || !markers) return;
  const show = map.getZoom() >= 13;
  markers.eachLayer(marker => {
    marker.unbindTooltip();
    if (show) marker.bindTooltip(marker.catchLabel, {permanent:true,direction:'top',offset:[0,-10]});
  });
}
function renderMap() {
  initMap(); if (!markers) return;
  markers.clearLayers();
  const legend = new Map();
  for (const c of visible) {
    if (!Number.isFinite(c.latitude) || !Number.isFinite(c.longitude)) continue;
    const colour = colourOf(c);
    const label = `${nameOf(c)} · ${dateLabel(c.caught_at)}`;
    const marker = L.marker([c.latitude,c.longitude], {title:label,alt:label,
      icon:L.divIcon({className:'catch-pin',html:'',iconSize:[20,20],iconAnchor:[10,10]})});
    marker.catchLabel = esc(label);
    marker.on('add', () => { if (marker.getElement()) marker.getElement().style.backgroundColor = colour; });
    marker.on('click', () => showDetail(c)); markers.addLayer(marker);
    legend.set($('colour').value === 'day' ? dateLabel(c.caught_at) : nameOf(c), colour);
  }
  $('legend').innerHTML = [...legend].map(([name,colour]) => `<span><i class="dot" style="background:${colour}"></i>${esc(name)}</span>`).join('');
  updateLabels();
  if (!mapFitted && visible.length) { fitMap(); mapFitted = true; }
}
function fitMap() {
  if (!map || !markers || !markers.getLayers().length) return;
  map.invalidateSize(); map.fitBounds(markers.getBounds(),{padding:[45,45],maxZoom:14});
}
function renderTotals() {
  const counts = new Map(Object.keys(species).map(id => [id,0]));
  for (const c of visible) counts.set(c.species_id,(counts.get(c.species_id) || 0) + 1);
  const rows = [...counts].sort((a,b) => b[1]-a[1] || (species[a[0]]?.[0] || a[0]).localeCompare(species[b[0]]?.[0] || b[0]));
  const max = Math.max(1,...rows.map(row => row[1]));
  $('bars').innerHTML = rows.filter(([,count]) => count > 0).map(([id,count]) => `<div class="bar-row"><span class="bar-species">${fishImage(id)}<span>${esc(species[id]?.[0] || id)}</span></span><div class="bar-track"><div class="bar-fill" style="background:${species[id]?.[1] || '#11543e'};width:${count/max*100}%"></div></div><strong>${count}</strong></div>`).join('') || '<p class="muted">Your species chart will appear after your first catch.</p>';
  $('totals').innerHTML = rows.map(([id,count]) => `<tr><td><span class="species-cell">${fishImage(id)}<span>${esc(species[id]?.[0] || id)}</span></span></td><td>${count}</td><td>${visible.length ? Math.round(count/visible.length*100) : 0}%</td></tr>`).join('');
}
function renderDays() {
  const groups = new Map();
  for (const c of visible) { const key = dayKey(c.caught_at); if (!groups.has(key)) groups.set(key,[]); groups.get(key).push(c); }
  $('days').replaceChildren();
  for (const [,rows] of groups) {
    const section = document.createElement('section'); section.className = 'day-card';
    const totals = new Map(); for (const c of rows) totals.set(nameOf(c),(totals.get(nameOf(c)) || 0) + 1);
    section.innerHTML = `<div class="day-header"><h3>${esc(dateLabel(rows[0].caught_at))}</h3><span class="day-total">${rows.length} ${rows.length === 1 ? 'catch' : 'catches'}</span></div><div class="day-summary">${[...totals].map(([name,count]) => `<span>${esc(name)} · ${count}</span>`).join('')}</div>`;
    for (const c of rows) {
      const button = document.createElement('button'); button.className = 'catch-row';
      button.innerHTML = `<span>${fishImage(c.species_id)}<i class="dot" style="background:${species[c.species_id]?.[1] || '#11543e'}"></i>${esc(nameOf(c))}</span><time datetime="${esc(c.caught_at)}">${esc(timeLabel(c.caught_at))}</time>`;
      button.onclick = () => showDetail(c); section.append(button);
    }
    $('days').append(section);
  }
}
function field(label,value) { return `<div><dt>${esc(label)}</dt><dd>${esc(value ?? 'Not recorded')}</dd></div>`; }
async function showDetail(c) {
  const generation = ++conditionsGeneration;
  const gpsDelay = Math.round((new Date(c.gps_at) - new Date(c.caught_at))/1000);
  $('detail-body').innerHTML = `${fishImage(c.species_id,true)}<h2>${esc(nameOf(c))}</h2><p class="muted">${esc(dateLabel(c.caught_at))} · ${esc(timeLabel(c.caught_at))}</p><dl class="detail-grid">${field('Latitude',c.latitude.toFixed(6))}${field('Longitude',c.longitude.toFixed(6))}${field('Position',c.position_method)}${field('Tackle',c.tackle_method)}${field('GPS fix',c.gps_quality === 4 ? 'Good' : 'Usable')}${field('Fix relative to catch',`${gpsDelay}s`)}</dl><p class="record-id muted">Catch ID: ${esc(c.catch_id)}</p><div id="conditions" class="condition"><h3>Conditions</h3><p class="muted">Checking saved conditions…</p></div>`;
  if (!$('details').open) $('details').showModal();
  try {
    const {data,error} = await client.from('fishing_condition_snapshots').select('provider,sample_at,retrieved_at,units,raw_payload').eq('catch_archive_id',c.archive_id).order('retrieved_at',{ascending:false}).limit(10);
    if (generation !== conditionsGeneration || !session || !$('details').open) return;
    if (error) throw error;
    // Provider schemas are not standardized yet. Show only explicitly named
    // scalar fields with their saved units; never invent weather or units.
    const supported = {sea_surface_temperature:'Sea surface temperature',temperature_2m:'Air temperature',wind_speed_10m:'Wind speed',wind_direction_10m:'Wind direction',pressure_msl:'Sea-level pressure',wave_height:'Wave height'};
    const blocks = data.map(snapshot => {
      const fields = Object.entries(supported).filter(([key]) => typeof snapshot.raw_payload?.[key] === 'number' && Number.isFinite(snapshot.raw_payload[key]));
      if (!fields.length) return '';
      return `<p class="small muted">${esc(snapshot.provider)}${snapshot.sample_at ? ' · '+esc(dateLabel(snapshot.sample_at))+' '+esc(timeLabel(snapshot.sample_at)) : ''}</p><dl class="detail-grid">${fields.map(([key,label]) => field(label,`${snapshot.raw_payload[key]} ${snapshot.units?.[key] || '(unit not recorded)'}`)).join('')}</dl>`;
    }).filter(Boolean);
    $('conditions').innerHTML = '<h3>Conditions</h3>' + (blocks.length ? blocks.join('') : `<p class="muted">${data.length ? 'Saved provider data exists; this format is not displayed yet.' : 'No conditions saved for this catch yet.'}</p>`) + (blocks.length ? '<p class="small muted">Saved provider estimates. Sea surface temperature is not temperature at your hook.</p>' : '');
  } catch { if (generation === conditionsGeneration && $('conditions')) $('conditions').innerHTML = '<h3>Conditions</h3><p class="muted">Conditions could not be loaded. Your catch is still saved.</p>'; }
}
function route() {
  const page = ['map','totals','days','trips'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'map';
  for (const key of ['map','totals','days','trips']) { $(`${key}-page`).hidden = page !== key; document.querySelector(`[data-page="${key}"]`).setAttribute('aria-current',page === key ? 'page' : 'false'); }
  $('page-title').textContent = {map:'Catch map',totals:'Species totals',days:'Catch journal',trips:'Trip overview'}[page];
  $('empty').hidden = page === 'trips' || visible.length > 0;
  if (page === 'map' && session) { renderMap(); requestAnimationFrame(() => map?.invalidateSize()); }
}
for (const [id,[name]] of Object.entries(species)) $('species').add(new Option(name,id));
for (const id of ['species','from','to','colour']) $(id).addEventListener('change',render);
$('clear').onclick = () => { for (const id of ['species','from','to']) $(id).value = ''; render(); };
$('fit').onclick = fitMap;
$('refresh').onclick = loadCatches;
$('close-detail').onclick = () => $('details').close();
$('details').addEventListener('close',() => { conditionsGeneration++; });
window.addEventListener('hashchange',route);
window.addEventListener('online',() => { if (session) loadCatches(); });
function refreshWhenVisible() { if (session && !document.hidden && !$('refresh').disabled && Date.now()-lastRefreshAt>15000) loadCatches(); }
window.addEventListener('focus',refreshWhenVisible);
document.addEventListener('visibilitychange',refreshWhenVisible);
setInterval(refreshWhenVisible,60000);
$('signout').onclick = async () => {
  $('signout').disabled = true;
  try { const {error} = await client.auth.signOut({scope:'local'}); if (error) throw error; session = null; resetPrivateView(); loginMessage('Signed out.'); }
  catch { message('Could not sign out. Please try again.',true); }
  finally { $('signout').disabled = false; }
};
$('login-form').onsubmit = async event => {
  event.preventDefault(); if (!client) return;
  $('login-button').disabled = true; loginMessage('Signing in…');
  try {
    const {error} = await client.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});
    if (error) throw error;
  } catch (error) { loginMessage(error.message || 'Could not sign in. Check your connection.',true); }
  finally { $('login-button').disabled = false; $('password').value = ''; }
};
async function start() {
  $('filter-panel').open = window.innerWidth > 600;
  if (!window.supabase) { loginMessage('The sign-in library could not load. Refresh and try again.',true); $('login-button').disabled = true; return; }
  const key = config.publishableKey;
  let allowed = typeof key === 'string' && key.startsWith('sb_publishable_');
  if (!allowed && typeof key === 'string' && key.split('.').length === 3) {
    try { allowed = JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).role === 'anon'; } catch { allowed = false; }
  }
  if (!allowed) { loginMessage('One setup step remains: add your Supabase publishable key to config.js.'); $('login-button').disabled = true; return; }
  client = window.supabase.createClient(config.supabaseUrl,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false},global:{fetch:async(url,options={})=>{
    const controller=new AbortController(); const abort=()=>controller.abort();
    if(options.signal?.aborted) controller.abort(); else options.signal?.addEventListener('abort',abort,{once:true});
    const timeout=setTimeout(abort,20000);
    try { return await fetch(url,{...options,signal:controller.signal}); }
    finally { clearTimeout(timeout); options.signal?.removeEventListener('abort',abort); }
  }}});
  client.auth.onAuthStateChange((event,next) => {
    // Leave the auth callback before making further Supabase requests.
    if (['SIGNED_IN','SIGNED_OUT','INITIAL_SESSION'].includes(event)) setTimeout(() => setSession(next),0);
    if (event === 'TOKEN_REFRESHED') session = next;
  });
}
start();
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => {});
