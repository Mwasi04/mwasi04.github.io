// Projects page: reads published projects from the Leiden system (Firestore) and groups each project's photos.
{
  const firebaseConfig = {
    apiKey: "AIzaSyDEwOyzI3NrIYu3pl1excnSScK7kCtBF5s",
    authDomain: "bible-faith-a6568.firebaseapp.com",
    projectId: "bible-faith-a6568",
    storageBucket: "bible-faith-a6568.firebasestorage.app",
    messagingSenderId: "830045110816",
    appId: "1:830045110816:web:7d0554853f1e9bd9763245"
  };
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const url = u => u.startsWith('site:') ? u.slice(5) : u;
  let projects = [], filter = 'All';

  function render(){
    const cats = [...new Set(projects.map(p => p.category).filter(Boolean))];
    const pf = $('#pjFilters');
    pf.hidden = cats.length < 2;
    pf.innerHTML = ['All', ...cats].map(c => `<button class="${c === filter ? 'on' : ''}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
    if(!projects.length){
      pf.hidden = true;
      $('#pjList').innerHTML = '<div class="pj-none"><h3>Projects coming soon</h3><p>We’re adding photos of our recent work. In the meantime, get in touch to hear about what we’ve delivered.</p><a class="btn" href="contact.html">Contact us</a></div>';
      return;
    }
    const shown = projects.filter(p => filter === 'All' || p.category === filter);
    $('#pjList').innerHTML = shown.length ? shown.map(p => {
      const i = projects.indexOf(p), ph = p.photos || [], cover = ph[Math.min(p.cover || 0, ph.length - 1)];
      const meta = [p.location, p.year, p.category].filter(Boolean).join(' · ');
      return `<button class="pcard reveal in" data-i="${i}" aria-label="Open ${esc(p.name)} photos">
        <div class="pc-img">${cover ? `<img src="${esc(url(cover))}" alt="" loading="lazy">` : ''}
          <span class="pc-s ${p.status === 'in-progress' ? 'prog' : ''}">${p.status === 'in-progress' ? 'In progress' : 'Completed'}</span>
          <span class="pc-n">${ph.length} photo${ph.length === 1 ? '' : 's'}</span></div>
        <div class="pc-b"><h3>${esc(p.name)}</h3>${meta ? `<span class="pc-m">${esc(meta)}</span>` : ''}${p.description ? `<p class="pc-d">${esc(p.description)}</p>` : ''}</div>
      </button>`;
    }).join('') : '<p class="note">No projects in this category yet.</p>';
  }
  $('#pjFilters').addEventListener('click', e => { const b = e.target.closest('button'); if(b){ filter = b.dataset.c; render(); } });
  $('#pjList').addEventListener('click', e => { const c = e.target.closest('.pcard'); if(c) openLb(+c.dataset.i, 0); });

  // ---- photo viewer ----
  const lb = $('#lb'); let cur = null, idx = 0, lastFocus = null;
  function openLb(i, start){
    cur = projects[i]; idx = start; lastFocus = document.activeElement;
    $('#lbTitle').textContent = cur.name;
    $('#lbMeta').textContent = [cur.location, cur.year, cur.status === 'in-progress' ? 'In progress' : 'Completed'].filter(Boolean).join(' · ');
    $('#lbDesc').textContent = cur.description || '';
    $('#lbStrip').innerHTML = (cur.photos || []).length > 1 ? cur.photos.map((u, k) => `<button data-k="${k}" aria-label="Photo ${k + 1}"><img src="${esc(url(u))}" alt="" loading="lazy"></button>`).join('') : '';
    lb.hidden = false; document.body.style.overflow = 'hidden';
    show(); $('#lbClose').focus();
  }
  function show(){
    const ph = cur.photos || [];
    $('#lbImg').src = ph.length ? url(ph[idx]) : '';
    $('#lbImg').alt = `${cur.name} — photo ${idx + 1} of ${ph.length}`;
    $('#lbPrev').disabled = idx <= 0; $('#lbNext').disabled = idx >= ph.length - 1;
    $('#lbPrev').hidden = $('#lbNext').hidden = ph.length < 2;
    document.querySelectorAll('#lbStrip button').forEach((b, k) => b.classList.toggle('on', k === idx));
    const on = $('#lbStrip button.on'); if(on) on.scrollIntoView({block:'nearest', inline:'center'});
  }
  const step = d => { const n = (cur.photos || []).length; if(idx + d >= 0 && idx + d < n){ idx += d; show(); } };
  function closeLb(){ lb.hidden = true; document.body.style.overflow = ''; if(lastFocus) lastFocus.focus(); }
  $('#lbPrev').onclick = () => step(-1); $('#lbNext').onclick = () => step(1); $('#lbClose').onclick = closeLb;
  $('#lbStrip').addEventListener('click', e => { const b = e.target.closest('button'); if(b){ idx = +b.dataset.k; show(); } });
  document.addEventListener('keydown', e => { if(lb.hidden) return; if(e.key === 'Escape') closeLb(); if(e.key === 'ArrowLeft') step(-1); if(e.key === 'ArrowRight') step(1); });
  let tx = null;
  $('#lbImg').addEventListener('touchstart', e => tx = e.touches[0].clientX, {passive:true});
  $('#lbImg').addEventListener('touchend', e => { if(tx === null) return; const dx = e.changedTouches[0].clientX - tx; if(Math.abs(dx) > 40) step(dx < 0 ? 1 : -1); tx = null; });

  // ---- load from the system ----
  async function load(){
    try{
      if(!window.firebase) throw new Error('offline');
      const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
      const snap = await app.firestore().collection('projects').where('published', '==', true).get();
      projects = snap.docs.map(d => ({id:d.id, ...d.data()}))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (b._t || 0) - (a._t || 0));
    }catch(err){ console.warn('Projects could not be loaded', err); projects = []; }
    render();
  }
  load();
}
