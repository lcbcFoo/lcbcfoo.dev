// lcbcfoo.dev: tabs, studio routing, keyboard shortcuts. See .agents/skills/update-site-content/SKILL.md.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fixedMode = () => matchMedia('(min-width: 900px) and (min-height: 600px)').matches;

  // Clock, Pacific time, in ironbar's "%a %d %b  %H:%M".
  const fmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Los_Angeles' });
  const tick = () => {
    const p = Object.fromEntries(fmt.formatToParts(new Date()).map(x => [x.type, x.value]));
    $('#clock').textContent = `${p.weekday} ${p.day} ${p.month}  ${p.hour}:${p.minute} PT`;
  };
  tick(); setInterval(tick, 20000);

  const ORDER = ['hello', 'work', 'studio'];
  const tabs = $$('.tabs a');
  const winOf = name => $(`#${name} .win`);
  const getY = name => fixedMode() ? winOf(name).scrollTop : window.scrollY;
  const setY = (name, y) => { if (fixedMode()) winOf(name).scrollTop = y; else window.scrollTo(0, y); };
  let current = null;
  let detail = null;
  let overviewY = 0;

  const show = (name, animate) => {
    if (current === name) return false;
    const dir = current ? Math.sign(ORDER.indexOf(name) - ORDER.indexOf(current)) : 0;
    ORDER.forEach(n => {
      const el = document.getElementById(n);
      el.classList.toggle('on', n === name);
      el.classList.remove('from-left', 'from-right');
    });
    const el = document.getElementById(name);
    if (animate && dir) { void el.offsetWidth; el.classList.add(dir > 0 ? 'from-right' : 'from-left'); }
    tabs.forEach(t => {
      const on = t.dataset.ws === name;
      t.classList.toggle('on', on);
      if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    });
    current = name;
    setY(name, 0);
    if (fixedMode()) winOf(name).focus({ preventScroll: true });
    return true;
  };

  const overview = $('#studio-overview');
  const details = $$('.detail');
  const showStudio = (key, switched) => {
    const d = details.find(x => x.dataset.key === key) || null;
    const from = detail;
    if (d && !from && !switched) overviewY = getY('studio');
    overview.classList.toggle('on', !d);
    details.forEach(x => x.classList.toggle('on', x === d));
    detail = d ? key : null;
    if (d) {
      setY('studio', 0);
      if (fixedMode()) winOf('studio').focus({ preventScroll: true });
    } else if (from && !switched) {
      // Back from a project: return to where the visitor was, on the card they opened.
      setY('studio', overviewY);
      const card = $(`.card[data-key="${from}"]`, overview);
      if (card) card.focus({ preventScroll: true });
    }
  };

  const route = e => {
    const [name, key] = location.hash.slice(1).split('/');
    if (!ORDER.includes(name)) { if (!e) show('hello', false); return; }
    const switched = show(name, !!e);
    if (name === 'studio') showStudio(key, switched);
  };
  addEventListener('hashchange', route);
  route();
  // The browser jumps to the #id on load; the workspace already shows it.
  if (location.hash) requestAnimationFrame(() => window.scrollTo(0, 0));

  // Help popup.
  const help = $('#help');
  const keysBtn = $('#keys-btn');
  const toggleHelp = force => {
    const open = force === undefined ? help.hidden : force;
    help.hidden = !open;
    keysBtn.setAttribute('aria-expanded', String(open));
  };
  keysBtn.addEventListener('click', () => toggleHelp());

  // Arrow keys move between project cards: left/right in reading order, up/down by position.
  const cards = $$('.card', overview);
  const nearest = (from, down) => {
    const r = from.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let best = null, bestD = Infinity;
    for (const c of cards) {
      const q = c.getBoundingClientRect();
      const dy = q.top + q.height / 2 - cy, dx = q.left + q.width / 2 - cx;
      if (down ? dy <= 10 : dy >= -10) continue;
      const d = Math.abs(dy) + Math.abs(dx) * 2;
      if (d < bestD) { bestD = d; best = c; }
    }
    return best;
  };
  // Previous/next links on each project page follow the order of the cards above, and each
  // folder heading shows how many cards it holds, so adding a project needs no link bookkeeping.
  const order = cards.map(c => c.dataset.key);
  const nameOf = key => $(`.card[data-key="${key}"] .name`, overview).textContent;
  const link = (key, text, arrowFirst) => {
    const a = document.createElement('a');
    a.href = `#studio/${key}`;
    const arrow = document.createElement('span');
    arrow.textContent = arrowFirst ? '←' : '→';
    if (arrowFirst) a.append(arrow, ' ' + text); else a.append(text + ' ', arrow);
    return a;
  };
  details.forEach(d => {
    const i = order.indexOf(d.dataset.key);
    if (i < 0) return;
    const prev = order[(i - 1 + order.length) % order.length];
    const next = order[(i + 1) % order.length];
    const nav = document.createElement('nav');
    nav.className = 'pager';
    nav.setAttribute('aria-label', 'More projects');
    nav.append(link(prev, nameOf(prev), true), link(next, nameOf(next), false));
    $('.dtext', d).append(nav);
  });
  $$('.group', overview).forEach(g => {
    const list = g.nextElementSibling;
    const count = g.querySelector('small');
    if (list && count) count.textContent = list.querySelectorAll('.card').length;
  });

  const focusCard = c => { if (!c) return; c.focus({ preventScroll: true }); c.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' }); };

  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if (k === '?') { e.preventDefault(); toggleHelp(); return; }
    if (k === 'Escape') {
      if (!help.hidden) toggleHelp(false);
      else if (current === 'studio' && detail) location.hash = '#studio';
      return;
    }
    if (k === '1' || k === '2' || k === '3') { e.preventDefault(); location.hash = '#' + ORDER[+k - 1]; return; }
    if (current !== 'studio') return;
    if (detail) {
      const pager = $$('.detail.on .pager a');
      if (k === 'ArrowLeft') { e.preventDefault(); pager[0].click(); }
      else if (k === 'ArrowRight') { e.preventDefault(); pager[1].click(); }
      return;
    }
    const i = cards.indexOf(document.activeElement);
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(k)) return;
    e.preventDefault();
    if (i < 0) { focusCard(cards[0]); return; }
    if (k === 'ArrowRight') focusCard(cards[Math.min(cards.length - 1, i + 1)]);
    else if (k === 'ArrowLeft') focusCard(cards[Math.max(0, i - 1)]);
    else focusCard(nearest(cards[i], k === 'ArrowDown'));
  });
})();
