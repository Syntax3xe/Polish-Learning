(function () {
  'use strict';

  /* =========================================================
   * Constants & helpers
   * ======================================================= */
  const MAX_HEARTS = 5;
  const HEART_MS = 30 * 60 * 1000; // one heart regenerates every 30 minutes
  const DAILY_GOAL = 30;
  const STORE_KEY = 'polskiPath.v1';
  const MASCOT = '🦬'; // Żubr, the European bison: a Polish national symbol
  const PRAISE = ['Nicely done!', 'Great job!', 'Brawo!', 'Świetnie! (Great!)', 'Dobrze! (Good!)', 'Excellent!', 'You got it!'];
  const PL_LETTERS = ['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż'];
  const KEEP_CASE = new Set(['Anna', 'Marek', 'I', 'Polish', 'English']);

  const arr = (v) => (Array.isArray(v) ? v : [v]);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const sample = (a, n) => shuffle(a.slice()).slice(0, n);
  const pickOne = (a) => a[Math.floor(Math.random() * a.length)];

  function el(tag, props, ...kids) {
    const n = document.createElement(tag);
    if (props) {
      for (const [k, v] of Object.entries(props)) {
        if (v == null || v === false) continue;
        if (k === 'class') n.className = v;
        else if (k === 'html') n.innerHTML = v;
        else if (k === 'style') n.style.cssText = v;
        else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
        else n.setAttribute(k, v === true ? '' : v);
      }
    }
    kids.flat(Infinity).forEach((c) => {
      if (c == null || c === false) return;
      n.append(c instanceof Node ? c : document.createTextNode(String(c)));
    });
    return n;
  }

  function dayStr(d = new Date()) {
    const z = (x) => String(x).padStart(2, '0');
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  }
  function yesterdayStr() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return dayStr(d);
  }
  function fmtTime(ms) {
    const s = Math.round(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  /* =========================================================
   * Course setup
   * ======================================================= */
  const UNITS = window.COURSE.units;
  const LESSONS = [];
  const ALL_WORDS = [];
  const ALL_SENTS = [];

  UNITS.forEach((u, ui) => {
    u.index = ui;
    u.lessons.forEach((l, li) => {
      l.id = `u${ui + 1}l${li + 1}`;
      l.unit = u;
      l.num = li + 1;
      l.index = LESSONS.length;
      l.words.forEach((w) => {
        w.pl = arr(w.pl);
        w.en = arr(w.en);
        w.lesson = l;
        ALL_WORDS.push(w);
      });
      l.sentences.forEach((s) => {
        s.pl = arr(s.pl);
        s.en = arr(s.en);
        s.lesson = l;
        ALL_SENTS.push(s);
      });
      LESSONS.push(l);
    });
  });

  const DICT = {};
  ALL_WORDS.forEach((w) => w.pl.forEach((p) => { if (!p.includes(' ')) DICT[p.toLowerCase()] = w.en[0]; }));
  const HINTS = window.COURSE.hints || {};
  const hintFor = (t) => {
    const k = t.toLowerCase().replace(/[.,!?;:"„”“…]/g, '');
    return HINTS[k] || DICT[k] || null;
  };

  /* =========================================================
   * State & persistence
   * ======================================================= */
  function defaults() {
    return {
      xp: 0,
      streak: 0,
      lastActive: null,
      hearts: MAX_HEARTS,
      heartsAt: Date.now(),
      completed: {},
      seen: {},
      daily: { date: dayStr(), xp: 0 },
      settings: { sfx: true, voice: true, rate: 0.9 },
    };
  }
  function load() {
    const d = defaults();
    let s = null;
    try { s = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { s = null; }
    if (!s || typeof s !== 'object') return d;
    return Object.assign(d, s, { settings: Object.assign(d.settings, s.settings || {}) });
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }
  let state = load();

  function regenHearts() {
    const now = Date.now();
    if (state.hearts >= MAX_HEARTS) {
      state.hearts = MAX_HEARTS;
      state.heartsAt = now;
      return;
    }
    const n = Math.floor((now - state.heartsAt) / HEART_MS);
    if (n > 0) {
      state.hearts = Math.min(MAX_HEARTS, state.hearts + n);
      state.heartsAt = state.hearts >= MAX_HEARTS ? now : state.heartsAt + n * HEART_MS;
    }
  }
  function loseHeart() {
    if (state.hearts >= MAX_HEARTS) state.heartsAt = Date.now();
    state.hearts = Math.max(0, state.hearts - 1);
    save();
  }
  function gainHeart() {
    if (state.hearts < MAX_HEARTS) state.hearts++;
    if (state.hearts >= MAX_HEARTS) state.heartsAt = Date.now();
  }
  const nextHeartIn = () => Math.max(0, HEART_MS - (Date.now() - state.heartsAt));

  function refreshDay() {
    const t = dayStr();
    if (!state.daily || state.daily.date !== t) state.daily = { date: t, xp: 0 };
    if (state.lastActive && state.lastActive !== t && state.lastActive !== yesterdayStr()) state.streak = 0;
    regenHearts();
  }
  function addXp(n) {
    refreshDay();
    state.xp += n;
    state.daily.xp += n;
  }
  function touchStreak() {
    const t = dayStr();
    if (state.lastActive === t) return false;
    state.streak = state.lastActive === yesterdayStr() ? state.streak + 1 : 1;
    state.lastActive = t;
    return true;
  }

  const isDone = (l) => (state.completed[l.id] || 0) > 0;
  const isUnlocked = (l) => l.index === 0 || isDone(LESSONS[l.index - 1]);
  const currentLesson = () => LESSONS.find((l) => !isDone(l)) || null;

  /* =========================================================
   * Audio: speech + sound effects
   * ======================================================= */
  let plVoice = null;
  const hasSpeech = 'speechSynthesis' in window;
  function pickVoice() {
    if (!hasSpeech) return;
    const vs = window.speechSynthesis.getVoices();
    plVoice =
      vs.find((v) => /^pl(-|_|$)/i.test(v.lang) && /google|natural|neural/i.test(v.name)) ||
      vs.find((v) => /^pl(-|_|$)/i.test(v.lang)) ||
      null;
  }
  if (hasSpeech) {
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
  }
  const canListen = () => state.settings.voice && !!plVoice;

  function speak(text, slow) {
    if (!hasSpeech || !state.settings.voice || !text) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pl-PL';
    if (plVoice) u.voice = plVoice;
    u.rate = slow ? 0.55 : state.settings.rate;
    synth.speak(u);
  }

  let actx = null;
  function tones(freqs, dur = 0.12, type = 'sine', gap = 0.09, vol = 0.16) {
    if (!state.settings.sfx) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      let t = actx.currentTime + 0.01;
      freqs.forEach((f) => {
        const o = actx.createOscillator();
        const g = actx.createGain();
        o.type = type;
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(actx.destination);
        o.start(t);
        o.stop(t + dur + 0.03);
        t += gap;
      });
    } catch (e) { /* audio unavailable */ }
  }
  const sfx = {
    correct: () => tones([659, 988], 0.16, 'sine', 0.1),
    wrong: () => tones([233, 185], 0.2, 'triangle', 0.13, 0.2),
    tick: () => tones([784], 0.08, 'sine', 0, 0.1),
    complete: () => tones([523, 659, 784, 1047], 0.22, 'sine', 0.12),
  };

  /* =========================================================
   * Answer checking
   * ======================================================= */
  const PL_MAP = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' };
  const CONTRACTIONS = [
    [/\bi'm\b/g, 'i am'], [/\byou're\b/g, 'you are'], [/\bhe's\b/g, 'he is'], [/\bshe's\b/g, 'she is'],
    [/\bit's\b/g, 'it is'], [/\bthat's\b/g, 'that is'], [/\bwhere's\b/g, 'where is'], [/\bwhat's\b/g, 'what is'],
    [/\bwho's\b/g, 'who is'], [/\bdon't\b/g, 'do not'], [/\bdoesn't\b/g, 'does not'], [/\bisn't\b/g, 'is not'],
    [/\bi've\b/g, 'i have'], [/\bwe're\b/g, 'we are'], [/\bthey're\b/g, 'they are'], [/\bthere's\b/g, 'there is'],
  ];
  function norm(s, lang) {
    s = String(s).toLowerCase().replace(/[’‘`´]/g, "'");
    if (lang === 'en') CONTRACTIONS.forEach(([r, v]) => { s = s.replace(r, v); });
    s = s.replace(/[.,!?;:"„”“«»…()¿¡—–]/g, ' ').replace(/-/g, ' ');
    if (lang === 'en') {
      s = s.replace(/'/g, '');
      s = s.replace(/\b(a|an|the)\b/g, ' ');
    }
    return s.replace(/\s+/g, ' ').trim();
  }
  const stripPl = (s) => s.replace(/[ąćęłńóśźż]/g, (c) => PL_MAP[c]);
  function lev(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[n];
  }
  function grade(input, answers, lang, allowTypo = true) {
    const n = norm(input, lang);
    if (!n) return { ok: false };
    for (const a of answers) if (norm(a, lang) === n) return { ok: true };
    if (lang === 'pl') {
      for (const a of answers) if (stripPl(norm(a, lang)) === stripPl(n)) return { ok: true, note: 'accents', match: a };
    }
    if (allowTypo) {
      for (const a of answers) {
        const na = norm(a, lang);
        const tol = na.length >= 14 ? 2 : na.length >= 5 ? 1 : 0;
        if (tol && lev(stripPl(na), stripPl(n)) <= tol) return { ok: true, note: 'typo', match: a };
      }
    }
    return { ok: false };
  }
  function tokens(s) {
    return s
      .replace(/[.,!?;:"„”“…¿¡]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .map((t, i) => (i === 0 && !KEEP_CASE.has(t) ? t.toLowerCase() : t));
  }

  /* =========================================================
   * Exercise generation
   * ======================================================= */
  function wordDistractors(word, n, prefer) {
    const out = [];
    const used = new Set([word.en[0].toLowerCase(), word.pl[0].toLowerCase(), word.e]);
    const add = (list) => {
      for (const w of shuffle(list.slice())) {
        if (out.length >= n) return;
        const a = w.en[0].toLowerCase(), b = w.pl[0].toLowerCase();
        if (used.has(a) || used.has(b) || used.has(w.e)) continue;
        used.add(a); used.add(b); used.add(w.e);
        out.push(w);
      }
    };
    add(prefer || []);
    add(word.lesson.unit.lessons.flatMap((l) => l.words));
    add(ALL_WORDS);
    return out;
  }
  function tokenDistractors(correct, lang, sent, n) {
    const have = new Set(correct.map((t) => t.toLowerCase()));
    const pools = [sent.lesson.sentences, sent.lesson.unit.lessons.flatMap((l) => l.sentences), ALL_SENTS];
    const out = [];
    for (const pool of pools) {
      for (const s of shuffle(pool.slice())) {
        if (s === sent) continue;
        for (const t of shuffle(tokens(s[lang][0]))) {
          const k = t.toLowerCase();
          if (have.has(k)) continue;
          have.add(k);
          out.push(t);
          if (out.length >= n) return out;
        }
      }
    }
    return out;
  }
  function uniqueByEn(words) {
    const seen = new Set();
    return words.filter((w) => {
      const k = w.en[0].toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  function buildLesson(l) {
    const W = l.words, S = l.sentences;
    const repeat = isDone(l);
    const intro = (repeat ? sample(W, 2) : shuffle(W.slice())).map((w) => ({ type: 'pick', word: w, pool: W }));
    const rest = [];
    sample(W, repeat ? 3 : 2).forEach((w) => rest.push({ type: 'mc', word: w, pool: W }));
    sample(W, repeat ? 3 : 2).forEach((w) => rest.push({ type: 'type', word: w }));
    if (canListen()) {
      rest.push({ type: 'listen', item: pickOne(W) });
      if (repeat) rest.push({ type: 'listen', item: pickOne(S) });
    }
    shuffle(S.slice()).slice(0, repeat ? 5 : 4).forEach((s, k) => rest.push({ type: 'build', sent: s, dir: k % 2 ? 'en2pl' : 'pl2en' }));
    return [...intro, { type: 'match', words: W }, ...shuffle(rest)];
  }

  function buildPractice() {
    const done = LESSONS.filter(isDone);
    const W = done.flatMap((l) => l.words);
    const S = done.flatMap((l) => l.sentences);
    const ex = [];
    sample(W, 3).forEach((w) => ex.push({ type: 'mc', word: w, pool: [] }));
    sample(W, 3).forEach((w) => ex.push({ type: 'type', word: w }));
    if (canListen()) ex.push({ type: 'listen', item: pickOne(Math.random() < 0.5 ? W : S) });
    sample(S, 4).forEach((s, k) => ex.push({ type: 'build', sent: s, dir: k % 2 ? 'en2pl' : 'pl2en' }));
    const mixed = shuffle(ex);
    const pairs = uniqueByEn(shuffle(W.slice()));
    if (pairs.length >= 4) mixed.splice(Math.min(3, mixed.length), 0, { type: 'match', words: pairs.slice(0, 5) });
    return mixed;
  }

  /* =========================================================
   * Shared exercise UI pieces
   * ======================================================= */
  function exTitle(text, badge) {
    return el('div', { class: 'ex-head' }, badge ? el('div', { class: 'badge-new' }, badge) : null, el('h2', { class: 'ex-title' }, text));
  }
  function speakerBtn(text, cls = 'speaker', slow = false) {
    return el('button', {
      class: cls, type: 'button', title: slow ? 'Listen slowly' : 'Listen', 'aria-label': slow ? 'Listen slowly' : 'Listen',
      onclick: (e) => { e.stopPropagation(); speak(text, slow); },
    }, slow ? '🐢' : '🔊');
  }
  function hintedText(text) {
    const wrap = el('span', { class: 'bubble-text', lang: 'pl' });
    text.split(/(\s+)/).forEach((part) => {
      if (/^\s+$/.test(part) || !part) { wrap.append(part); return; }
      const h = hintFor(part);
      wrap.append(h ? el('span', { class: 'hint', tabindex: '0', 'data-hint': h }, part) : part);
    });
    return wrap;
  }
  function bubble(text, lang, withHints = true) {
    return el('div', { class: 'prompt' },
      el('div', { class: 'mascot', 'aria-hidden': 'true' }, MASCOT),
      el('div', { class: 'bubble' },
        lang === 'pl' && hasSpeech && state.settings.voice ? speakerBtn(text, 'speaker') : null,
        lang === 'pl' && withHints ? hintedText(text) : el('span', { class: 'bubble-text', lang }, text)));
  }
  function textInput(placeholder, changed, polish) {
    const inp = el('textarea', {
      class: 'text-in', rows: '2', placeholder, spellcheck: 'false', autocapitalize: 'off',
      autocomplete: 'off', autocorrect: 'off', lang: polish ? 'pl' : 'en',
    });
    inp.addEventListener('input', changed);
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') e.preventDefault(); });
    const keys = polish
      ? el('div', { class: 'pl-keys', 'aria-label': 'Polish letters' },
        PL_LETTERS.map((c) => el('button', {
          class: 'pl-key', type: 'button', tabindex: '-1',
          onmousedown: (e) => e.preventDefault(),
          onclick: () => {
            if (inp.disabled) return;
            inp.setRangeText(c, inp.selectionStart, inp.selectionEnd, 'end');
            inp.focus();
            changed();
          },
        }, c)))
      : null;
    const wrap = el('div', { class: 'input-wrap' }, inp, keys);
    return {
      wrap,
      value: () => inp.value,
      focus: () => setTimeout(() => inp.focus(), 60),
      lock: () => { inp.disabled = true; },
    };
  }
  function markChoices(btns, selIdx, rightIdx) {
    btns.forEach((b, i) => {
      b.disabled = true;
      if (i === rightIdx) b.classList.add('right');
      else if (i === selIdx) b.classList.add('wrong');
    });
  }

  /* =========================================================
   * Exercise renderers
   * Each returns a controller: { ready(), check(), key?(n), back?(), focus?(), auto? }
   * ======================================================= */
  const RENDER = {};

  // Pick the right picture card for an English word (introduces new words)
  RENDER.pick = (ex, root, changed) => {
    const w = ex.word;
    const isNew = !state.seen[w.pl[0]];
    const opts = shuffle([w, ...wordDistractors(w, 2, ex.pool)]);
    let sel = null, locked = false;
    root.append(exTitle(`Which one is “${w.en[0]}”?`, isNew ? 'New word' : null));
    const btns = opts.map((o, k) => el('button', { class: 'card', type: 'button', onclick: () => choose(k) },
      el('span', { class: 'kbd' }, k + 1),
      el('span', { class: 'card-emoji', 'aria-hidden': 'true' }, o.e || '💬'),
      el('span', { class: 'card-word', lang: 'pl' }, o.pl[0])));
    root.append(el('div', { class: 'cards' }, btns));
    function choose(k) {
      if (locked) return;
      sel = k;
      btns.forEach((b, j) => b.classList.toggle('selected', j === k));
      speak(opts[k].pl[0]);
      changed();
    }
    return {
      ready: () => sel != null,
      key: (n) => { if (n >= 1 && n <= opts.length) choose(n - 1); },
      check: () => {
        locked = true;
        state.seen[w.pl[0]] = 1;
        const ok = opts[sel] === w;
        markChoices(btns, sel, opts.indexOf(w));
        return { ok, answer: w.pl[0], meaning: w.en[0], lang: 'pl' };
      },
    };
  };

  // Polish word -> pick English meaning
  RENDER.mc = (ex, root, changed) => {
    const w = ex.word;
    const opts = shuffle([w, ...wordDistractors(w, 3, ex.pool)]);
    let sel = null, locked = false;
    root.append(exTitle('What does this mean?'));
    root.append(bubble(w.pl[0], 'pl', false)); // no hover hint: it would reveal the answer
    const btns = opts.map((o, k) => el('button', { class: 'option', type: 'button', onclick: () => choose(k) },
      el('span', { class: 'kbd' }, k + 1), el('span', {}, o.en[0])));
    root.append(el('div', { class: 'options' }, btns));
    setTimeout(() => speak(w.pl[0]), 250);
    function choose(k) {
      if (locked) return;
      sel = k;
      btns.forEach((b, j) => b.classList.toggle('selected', j === k));
      changed();
    }
    return {
      ready: () => sel != null,
      key: (n) => { if (n >= 1 && n <= opts.length) choose(n - 1); },
      check: () => {
        locked = true;
        state.seen[w.pl[0]] = 1;
        const ok = opts[sel] === w;
        markChoices(btns, sel, opts.indexOf(w));
        return { ok, answer: w.en[0], lang: 'en' };
      },
    };
  };

  // English word -> type Polish
  RENDER.type = (ex, root, changed) => {
    const w = ex.word;
    root.append(exTitle('Write this in Polish'));
    root.append(el('div', { class: 'type-prompt' },
      el('span', { class: 'type-emoji', 'aria-hidden': 'true' }, w.e || '💬'),
      el('span', { class: 'type-word' }, `“${w.en[0]}”`)));
    const inp = textInput('Type in Polish', changed, true);
    root.append(inp.wrap);
    inp.focus();
    return {
      ready: () => inp.value().trim() !== '',
      focus: inp.focus,
      check: () => {
        inp.lock();
        const g = grade(inp.value(), w.pl, 'pl');
        return { ok: g.ok, note: g.note, match: g.match, answer: w.pl[0], meaning: w.en[0], lang: 'pl' };
      },
    };
  };

  // Hear Polish -> type it
  RENDER.listen = (ex, root, changed) => {
    const it = ex.item;
    const text = it.pl[0];
    root.append(exTitle('Type what you hear'));
    root.append(el('div', { class: 'listen-btns' },
      speakerBtn(text, 'big-speaker'),
      speakerBtn(text, 'slow-speaker', true)));
    const inp = textInput('Type in Polish', changed, true);
    root.append(inp.wrap);
    setTimeout(() => speak(text), 300);
    inp.focus();
    return {
      ready: () => inp.value().trim() !== '',
      focus: inp.focus,
      check: () => {
        inp.lock();
        const g = grade(inp.value(), it.pl, 'pl');
        return { ok: g.ok, note: g.note, match: g.match, answer: text, meaning: it.en[0], lang: 'pl' };
      },
    };
  };

  // Tap matching pairs
  RENDER.match = (ex, root, changed) => {
    const words = uniqueByEn(sample(ex.words, Math.min(5, ex.words.length)));
    const L = shuffle(words.slice()), R = shuffle(words.slice());
    let sl = null, sr = null, done = 0, busy = false;
    root.append(exTitle('Tap the matching pairs'));
    const lb = L.map((w, k) => el('button', { class: 'm-btn', type: 'button', lang: 'pl', onclick: () => tapL(k) },
      el('span', { class: 'kbd' }, k + 1), el('span', {}, w.pl[0])));
    const rb = R.map((w, k) => el('button', { class: 'm-btn', type: 'button', onclick: () => tapR(k) },
      el('span', { class: 'kbd' }, (words.length + k + 1) % 10), el('span', {}, w.en[0])));
    root.append(el('div', { class: 'match' }, el('div', { class: 'm-col' }, lb), el('div', { class: 'm-col' }, rb)));
    function refresh() {
      lb.forEach((b, k) => b.classList.toggle('selected', k === sl));
      rb.forEach((b, k) => b.classList.toggle('selected', k === sr));
    }
    function tapL(k) {
      if (busy || lb[k].disabled) return;
      sl = k; speak(L[k].pl[0]); refresh(); tryPair();
    }
    function tapR(k) {
      if (busy || rb[k].disabled) return;
      sr = k; refresh(); tryPair();
    }
    function tryPair() {
      if (sl == null || sr == null) return;
      const a = lb[sl], b = rb[sr];
      if (L[sl] === R[sr]) {
        sfx.tick();
        [a, b].forEach((x) => { x.classList.remove('selected'); x.classList.add('matched'); x.disabled = true; });
        done++;
        sl = sr = null;
        if (done === words.length) changed();
      } else {
        busy = true;
        [a, b].forEach((x) => x.classList.add('mismatch'));
        setTimeout(() => {
          [a, b].forEach((x) => x.classList.remove('mismatch', 'selected'));
          sl = sr = null;
          busy = false;
        }, 550);
      }
    }
    return {
      auto: true,
      ready: () => done === words.length,
      key: (n) => {
        const idx = n === 0 ? 9 : n - 1;
        if (idx < words.length) tapL(idx);
        else if (idx - words.length < words.length) tapR(idx - words.length);
      },
      check: () => ({ ok: true }),
    };
  };

  // Build a sentence from word tiles (or type it)
  RENDER.build = (ex, root, changed) => {
    const s = ex.sent;
    const fromPl = ex.dir === 'pl2en';
    const prompt = fromPl ? s.pl[0] : s.en[0];
    const answers = fromPl ? s.en : s.pl;
    const lang = fromPl ? 'en' : 'pl';
    const correct = tokens(answers[0]);
    const bankTokens = shuffle([...correct, ...tokenDistractors(correct, lang, s, Math.max(2, Math.min(4, 7 - correct.length)))]);
    let mode = 'tiles', locked = false;
    const chosen = [];

    root.append(exTitle(fromPl ? 'Translate this sentence' : 'Write this in Polish'));
    root.append(bubble(prompt, fromPl ? 'pl' : 'en'));
    if (fromPl) setTimeout(() => speak(prompt), 250);

    const line = el('div', { class: 'answer-line' });
    const bank = el('div', { class: 'bank' });
    const tiles = bankTokens.map((t, k) => {
      const b = el('button', { class: 'tile', type: 'button', lang, onclick: () => toggle(k) }, t);
      const slot = el('span', { class: 'slot' }, el('span', { class: 'tile ghost', 'aria-hidden': 'true' }, t), b);
      bank.append(slot);
      return { b, slot };
    });
    const tilesArea = el('div', { class: 'tiles-area' }, line, bank);
    const inp = textInput(fromPl ? 'Type in English' : 'Type in Polish', changed, !fromPl);
    inp.wrap.hidden = true;
    const toggleBtn = el('button', { class: 'link-btn', type: 'button', onclick: switchMode }, '⌨️ Use keyboard');
    root.append(tilesArea, inp.wrap, el('div', { class: 'mode-row' }, toggleBtn));

    function toggle(k) {
      if (locked) return;
      const pos = chosen.indexOf(k);
      if (pos >= 0) {
        chosen.splice(pos, 1);
        tiles[k].slot.append(tiles[k].b);
      } else {
        chosen.push(k);
        line.append(tiles[k].b);
        if (lang === 'pl') speak(bankTokens[k]);
      }
      changed();
    }
    function switchMode() {
      if (locked) return;
      mode = mode === 'tiles' ? 'kbd' : 'tiles';
      tilesArea.hidden = mode !== 'tiles';
      inp.wrap.hidden = mode !== 'kbd';
      toggleBtn.textContent = mode === 'tiles' ? '⌨️ Use keyboard' : '🧩 Use word bank';
      if (mode === 'kbd') inp.focus();
      changed();
    }
    return {
      ready: () => (mode === 'tiles' ? chosen.length > 0 : inp.value().trim() !== ''),
      back: () => { if (mode === 'tiles' && chosen.length) toggle(chosen[chosen.length - 1]); },
      check: () => {
        locked = true;
        inp.lock();
        tiles.forEach((t) => { t.b.disabled = true; });
        const text = mode === 'tiles' ? chosen.map((k) => bankTokens[k]).join(' ') : inp.value();
        const g = grade(text, answers, lang, mode === 'kbd');
        return { ok: g.ok, note: g.note, match: g.match, answer: answers[0], lang };
      },
    };
  };

  /* =========================================================
   * Lesson session
   * ======================================================= */
  let S = null;      // current session
  let ctrl = null;   // current exercise controller
  let phase = 'answer';

  function show(name) {
    $('#app').hidden = name !== 'home';
    $('#lesson').hidden = name !== 'lesson';
    $('#complete').hidden = name !== 'complete';
    if (name === 'home') renderAll();
  }

  function startSession(mode, lesson) {
    refreshDay();
    if (mode === 'lesson' && state.hearts <= 0) { openNoHearts(); return; }
    if (mode === 'practice' && !LESSONS.some(isDone)) { toast('Finish your first lesson to unlock practice.'); return; }
    const queue = mode === 'lesson' ? buildLesson(lesson) : buildPractice();
    queue.forEach((q, k) => { q.key = k; });
    S = { mode, lesson, queue, i: 0, total: queue.length, firstTryOk: 0, correct: 0, mistakes: 0, start: Date.now(), failed: false, attempted: new Set() };
    closeModal();
    show('lesson');
    renderExercise();
  }

  function updateProgress() {
    const remaining = S.queue.length - S.i - (phase === 'feedback' ? 1 : 0);
    const pct = S.correct / Math.max(1, S.correct + remaining) * 100;
    $('#progress-fill').style.width = `${pct}%`;
  }
  function updateLessonHearts() {
    const h = $('#lesson-hearts');
    if (S.mode === 'practice') {
      h.replaceChildren(el('span', { class: 'practice-tag' }, 'Practice'));
    } else {
      h.replaceChildren(el('span', { class: 'heart-ico' }, '❤️'), el('span', {}, state.hearts));
    }
  }

  function renderExercise() {
    const ex = S.queue[S.i];
    if (!ex) { finish(); return; }
    phase = 'answer';
    updateProgress();
    updateLessonHearts();
    const body = $('#lesson-body');
    body.replaceChildren();
    body.scrollTop = 0;
    const wrap = el('div', { class: `ex ex-${ex.type}` });
    body.append(wrap);
    ctrl = RENDER[ex.type](ex, wrap, onChanged);
    setFoot('idle');
  }

  function onChanged() {
    if (phase !== 'answer') return;
    const ready = ctrl.ready();
    $('#check-btn').disabled = !ready;
    if (ctrl.auto && ready) setTimeout(doCheck, 350);
  }

  function doCheck() {
    if (phase !== 'answer' || !ctrl || !ctrl.ready()) return;
    const ex = S.queue[S.i];
    const res = ctrl.check();
    phase = 'feedback';
    const first = !S.attempted.has(ex.key);
    S.attempted.add(ex.key);
    if (res.ok) {
      S.correct++;
      if (first) S.firstTryOk++;
      sfx.correct();
      if (res.lang === 'pl' && res.answer && ex.type !== 'pick') speak(res.answer);
    } else {
      S.mistakes++;
      sfx.wrong();
      S.queue.push(Object.assign({}, ex)); // retry it at the end
      if (S.mode === 'lesson') {
        loseHeart();
        updateLessonHearts();
        $('#lesson-hearts').classList.remove('bump');
        void $('#lesson-hearts').offsetWidth;
        $('#lesson-hearts').classList.add('bump');
        if (state.hearts <= 0) S.failed = true;
      }
      if (res.lang === 'pl' && res.answer) setTimeout(() => speak(res.answer), 350);
    }
    updateProgress();
    setFoot(res.ok ? 'correct' : 'wrong', res);
  }

  function next() {
    if (phase !== 'feedback') return;
    if (S.failed) { showFailed(); return; }
    S.i++;
    renderExercise();
  }

  function setFoot(kind, res) {
    const foot = $('#lesson-foot'), fb = $('#feedback'), btn = $('#check-btn');
    foot.className = 'lesson-foot' + (kind === 'correct' ? ' is-correct' : kind === 'wrong' ? ' is-wrong' : '');
    fb.replaceChildren();
    if (kind === 'idle') {
      btn.textContent = 'Check';
      btn.className = 'btn btn-primary';
      btn.disabled = !ctrl.ready();
      return;
    }
    if (kind === 'correct') {
      const note = res.note === 'accents'
        ? el('p', { class: 'fb-note' }, 'Watch the accents: ', el('b', { lang: 'pl' }, res.match || res.answer))
        : res.note === 'typo'
          ? el('p', { class: 'fb-note' }, 'You have a typo: ', el('b', {}, res.match || res.answer))
          : null;
      fb.append(el('div', { class: 'fb-icon', 'aria-hidden': 'true' }, '✓'),
        el('div', { class: 'fb-text' }, el('h3', {}, pickOne(PRAISE)), note,
          res.meaning && S.queue[S.i].type !== 'pick' ? el('p', { class: 'fb-meaning' }, `Meaning: ${res.meaning}`) : null));
    } else {
      fb.append(el('div', { class: 'fb-icon', 'aria-hidden': 'true' }, '✕'),
        el('div', { class: 'fb-text' },
          el('h3', {}, 'Correct solution:'),
          el('p', { class: 'fb-answer' },
            res.lang === 'pl' && hasSpeech && state.settings.voice ? speakerBtn(res.answer, 'speaker sm') : null,
            el('span', { lang: res.lang }, res.answer)),
          res.meaning ? el('p', { class: 'fb-meaning' }, `Meaning: ${res.meaning}`) : null));
    }
    btn.textContent = 'Continue';
    btn.className = 'btn ' + (kind === 'correct' ? 'btn-green' : 'btn-red');
    btn.disabled = false;
    btn.focus({ preventScroll: true });
  }

  function finish() {
    const perfect = S.mistakes === 0;
    const xp = S.mode === 'lesson' ? 10 + (perfect ? 5 : 0) : 5;
    const goalBefore = state.daily.date === dayStr() ? state.daily.xp : 0;
    addXp(xp);
    const streakUp = touchStreak();
    let heartGained = false;
    if (S.mode === 'lesson') {
      state.completed[S.lesson.id] = (state.completed[S.lesson.id] || 0) + 1;
    } else if (state.hearts < MAX_HEARTS) {
      gainHeart();
      heartGained = true;
    }
    save();
    sfx.complete();

    const acc = Math.round(S.firstTryOk / S.total * 100);
    const goalHit = goalBefore < DAILY_GOAL && state.daily.xp >= DAILY_GOAL;
    const c = $('#complete');
    c.replaceChildren(el('div', { class: 'complete-inner' },
      el('div', { class: 'complete-hero', 'aria-hidden': 'true' }, perfect ? '🏆' : '🎉'),
      el('h1', {}, S.mode === 'lesson' ? (perfect ? 'Perfect lesson!' : 'Lesson complete!') : 'Practice complete!'),
      el('p', { class: 'muted' }, S.mode === 'lesson' ? `${S.lesson.unit.title} · ${S.lesson.title}` : 'Your review session is done.'),
      el('div', { class: 'stat-cards' },
        statCard('Total XP', `+${xp}`, 'gold'),
        statCard('Accuracy', `${acc}%`, 'green'),
        statCard('Time', fmtTime(Date.now() - S.start), 'blue')),
      el('div', { class: 'complete-notes' },
        streakUp ? el('p', { class: 'note-pill' }, `🔥 ${state.streak} day streak!`) : null,
        goalHit ? el('p', { class: 'note-pill' }, '🎯 Daily goal reached!') : null,
        heartGained ? el('p', { class: 'note-pill' }, '❤️ +1 heart earned') : null),
      el('button', { class: 'btn btn-primary btn-wide', id: 'complete-continue', onclick: () => show('home') }, 'Continue')));
    show('complete');
    setTimeout(() => $('#complete-continue')?.focus(), 50);
    S = null;
  }
  function statCard(label, value, tone) {
    return el('div', { class: `stat-card tone-${tone}` }, el('div', { class: 'stat-label' }, label), el('div', { class: 'stat-value' }, value));
  }

  function showFailed() {
    const c = $('#complete');
    c.replaceChildren(el('div', { class: 'complete-inner' },
      el('div', { class: 'complete-hero', 'aria-hidden': 'true' }, '💔'),
      el('h1', {}, 'Out of hearts'),
      el('p', { class: 'muted' }, `Hearts refill over time (1 every ${HEART_MS / 60000} minutes). Practice sessions don't cost hearts and earn you one back.`),
      el('div', { class: 'btn-col' },
        el('button', { class: 'btn btn-primary btn-wide', id: 'complete-continue', onclick: () => startSession('practice') }, 'Practice to earn a heart'),
        el('button', { class: 'btn btn-ghost btn-wide', onclick: () => show('home') }, 'Back to path'))));
    S = null;
    show('complete');
  }

  function confirmQuit() {
    openModal([
      el('div', { class: 'modal-hero', 'aria-hidden': 'true' }, MASCOT),
      el('h2', {}, 'Quit this lesson?'),
      el('p', { class: 'muted' }, "You'll lose your progress in this lesson."),
      el('div', { class: 'btn-col' },
        el('button', { class: 'btn btn-primary btn-wide', onclick: closeModal }, 'Keep learning'),
        el('button', { class: 'btn btn-ghost btn-wide danger', onclick: () => { closeModal(); S = null; if (hasSpeech) speechSynthesis.cancel(); show('home'); } }, 'Quit')),
    ], 'modal-sm');
  }

  /* =========================================================
   * Home: path, words, stats
   * ======================================================= */
  function statChips() {
    return [
      el('div', { class: 'chip chip-streak' + (state.lastActive === dayStr() ? ' lit' : ''), title: 'Day streak' }, el('span', { class: 'chip-ico' }, '🔥'), state.streak),
      el('div', { class: 'chip chip-xp', title: 'Total XP' }, el('span', { class: 'chip-ico' }, '⭐'), state.xp),
      el('div', { class: 'chip chip-hearts', title: 'Hearts' }, el('span', { class: 'chip-ico' }, '❤️'), state.hearts),
    ];
  }
  function renderStats() {
    refreshDay();
    $('#topbar').replaceChildren(
      el('div', { class: 'topbar-logo' }, el('span', { class: 'flag', 'aria-hidden': 'true' }), el('span', { class: 'logo-text' }, 'polski', el('b', {}, 'path'))),
      el('div', { class: 'chips-row' }, statChips()));

    const pct = Math.min(100, state.daily.xp / DAILY_GOAL * 100);
    const doneCount = LESSONS.filter(isDone).length;
    const heartIcons = Array.from({ length: MAX_HEARTS }, (_, i) => (i < state.hearts ? '❤️' : '🤍')).join(' ');
    const mins = Math.ceil(nextHeartIn() / 60000);

    $('#rightbar').replaceChildren(
      el('div', { class: 'chips-row' }, statChips()),
      el('div', { class: 'panel' },
        el('h3', {}, 'Daily goal'),
        el('div', { class: 'goal-row' },
          el('span', { class: 'goal-ico', 'aria-hidden': 'true' }, '🎯'),
          el('div', { class: 'bar' }, el('div', { class: 'bar-fill gold', style: `width:${pct}%` })),
          el('span', { class: 'goal-num' }, `${Math.min(state.daily.xp, DAILY_GOAL)}/${DAILY_GOAL}`)),
        el('p', { class: 'muted small' }, pct >= 100 ? 'Goal reached today. Wspaniale!' : 'Earn XP by finishing lessons and practice.')),
      el('div', { class: 'panel' },
        el('h3', {}, 'Hearts'),
        el('div', { class: 'hearts-row', 'aria-label': `${state.hearts} of ${MAX_HEARTS} hearts` }, heartIcons),
        el('p', { class: 'muted small' }, state.hearts >= MAX_HEARTS ? 'Full hearts. Mistakes in lessons cost one heart.' : `Next heart in ${mins} min. Practice earns one now.`),
        state.hearts < MAX_HEARTS && doneCount ? el('button', { class: 'btn btn-ghost btn-wide sm', onclick: () => startSession('practice') }, 'Practice') : null),
      el('div', { class: 'panel' },
        el('h3', {}, 'Course progress'),
        el('div', { class: 'goal-row' },
          el('div', { class: 'bar' }, el('div', { class: 'bar-fill green', style: `width:${doneCount / LESSONS.length * 100}%` })),
          el('span', { class: 'goal-num' }, `${doneCount}/${LESSONS.length}`)),
        el('p', { class: 'muted small' }, `${ALL_WORDS.filter((w) => isDone(w.lesson)).length} of ${ALL_WORDS.length} words learned`)));
  }

  function renderLearn() {
    const v = $('#view-learn');
    v.replaceChildren();
    const cur = currentLesson();
    const offsets = [0, 52, 84, 52, 0, -52, -84, -52];
    UNITS.forEach((u) => {
      const sec = el('section', { class: 'unit', style: `--unit:${u.color}` });
      sec.append(el('div', { class: 'unit-banner' },
        el('div', {},
          el('div', { class: 'unit-kicker' }, `Unit ${u.index + 1}`),
          el('h2', {}, u.title),
          el('p', {}, u.desc)),
        el('button', { class: 'guide-btn', type: 'button', onclick: () => openGuide(u) }, el('span', { 'aria-hidden': 'true' }, '💡'), el('span', { class: 'lbl' }, 'Guidebook'))));
      const path = el('div', { class: 'path' });
      u.lessons.forEach((l) => {
        const unlocked = isUnlocked(l), done = state.completed[l.id] || 0, isCur = cur === l;
        const cls = ['node', done ? 'done' : '', !unlocked ? 'locked' : '', isCur ? 'current' : ''].join(' ');
        const icon = !unlocked ? '🔒' : done ? '✓' : '★';
        path.append(el('div', { class: 'node-wrap', style: `--off:${offsets[l.index % offsets.length]}px` },
          isCur ? el('div', { class: 'start-bubble' }, done ? 'REVIEW' : 'START') : null,
          el('button', {
            class: cls, type: 'button', 'aria-label': `${l.title}${!unlocked ? ' (locked)' : done ? ' (completed)' : ''}`,
            onclick: () => (unlocked ? openLessonSheet(l) : toast('Finish the previous lesson to unlock this one.')),
          }, icon, done > 1 ? el('span', { class: 'node-count' }, `×${done}`) : null),
          el('div', { class: 'node-label' }, l.title)));
      });
      sec.append(path);
      v.append(sec);
    });
    const allDone = !cur;
    v.append(el('div', { class: 'trophy' + (allDone ? ' won' : '') },
      el('div', { class: 'trophy-ico', 'aria-hidden': 'true' }, '🏆'),
      el('p', {}, allDone ? 'Gratulacje! You finished the course. Keep practicing to stay sharp.' : 'Finish every unit to earn the trophy')));
  }

  function renderWords() {
    const v = $('#view-words');
    v.replaceChildren(el('h1', { class: 'page-title' }, 'Words'),
      el('p', { class: 'muted' }, 'Everything you have learned so far. Tap 🔊 to hear it.'));
    UNITS.forEach((u) => {
      const box = el('section', { class: 'words-unit', style: `--unit:${u.color}` }, el('h2', {}, `Unit ${u.index + 1}: ${u.title}`));
      u.lessons.forEach((l) => {
        if (!isDone(l)) {
          box.append(el('div', { class: 'words-locked' }, '🔒 ', el('span', {}, `Finish “${l.title}” to add ${l.words.length} words`)));
          return;
        }
        const list = el('div', { class: 'word-list' });
        l.words.forEach((w) => list.append(el('div', { class: 'word-row' },
          hasSpeech ? speakerBtn(w.pl[0], 'speaker sm') : null,
          el('span', { class: 'word-emoji', 'aria-hidden': 'true' }, w.e),
          el('span', { class: 'word-pl', lang: 'pl' }, w.pl[0]),
          el('span', { class: 'word-en' }, w.en.slice(0, 3).join(', ')))));
        box.append(el('h3', { class: 'words-lesson' }, l.title), list);
      });
      v.append(box);
    });
  }

  let view = 'learn';
  function setView(name) {
    view = name;
    $$('.nav-item[data-view]').forEach((b) => b.classList.toggle('active', b.dataset.view === name));
    $('#view-learn').hidden = name !== 'learn';
    $('#view-words').hidden = name !== 'words';
    if (name === 'words') renderWords();
    window.scrollTo({ top: 0 });
  }

  function renderAll() {
    renderStats();
    renderLearn();
    if (view === 'words') renderWords();
  }

  /* =========================================================
   * Modals & toast
   * ======================================================= */
  function openModal(content, cls) {
    const box = $('#modal-box');
    box.className = 'modal ' + (cls || '');
    box.replaceChildren(...[].concat(content).filter(Boolean));
    $('#modal').hidden = false;
    setTimeout(() => box.querySelector('.btn')?.focus(), 30);
  }
  function closeModal() { $('#modal').hidden = true; }

  let toastTimer = null;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2400);
  }

  function openLessonSheet(l) {
    const done = state.completed[l.id] || 0;
    openModal([
      el('div', { class: 'sheet-head', style: `--unit:${l.unit.color}` },
        el('div', { class: 'unit-kicker' }, `Unit ${l.unit.index + 1} · Lesson ${l.num} of ${l.unit.lessons.length}`),
        el('h2', {}, l.title)),
      el('p', { class: 'muted' }, done ? `Completed ${done}× — review it to make the words stick.` : 'New words in this lesson:'),
      el('div', { class: 'chip-list' }, l.words.map((w) => el('span', { class: 'word-chip', lang: 'pl' }, `${w.e} ${w.pl[0]}`))),
      el('button', { class: 'btn btn-primary btn-wide', onclick: () => startSession('lesson', l) }, done ? 'Review +10 XP' : 'Start +10 XP'),
    ], 'modal-sm');
  }

  function openGuide(u) {
    openModal([
      el('div', { class: 'sheet-head', style: `--unit:${u.color}` },
        el('div', { class: 'unit-kicker' }, `Unit ${u.index + 1} guidebook`),
        el('h2', {}, u.title)),
      ...u.tips.map((t) => el('section', { class: 'tip' },
        el('h3', {}, t.h),
        el('p', { html: t.p }),
        t.ex && t.ex.length ? el('div', { class: 'tip-ex' }, t.ex.map(([pl, en]) => el('div', { class: 'tip-row' },
          hasSpeech ? speakerBtn(pl.replace(/→.*$/, '').replace(/—.*$/, ''), 'speaker sm') : null,
          el('div', {}, el('div', { class: 'tip-pl', lang: 'pl' }, pl), el('div', { class: 'tip-en' }, en))))) : null)),
      el('button', { class: 'btn btn-primary btn-wide', onclick: closeModal }, 'Got it'),
    ], 'modal-lg');
  }

  function openNoHearts() {
    const mins = Math.ceil(nextHeartIn() / 60000);
    openModal([
      el('div', { class: 'modal-hero', 'aria-hidden': 'true' }, '💔'),
      el('h2', {}, 'You have no hearts left'),
      el('p', { class: 'muted' }, `Your next heart arrives in ${mins} min. Practice old lessons to earn one right away.`),
      el('div', { class: 'btn-col' },
        el('button', { class: 'btn btn-primary btn-wide', onclick: () => startSession('practice') }, 'Practice +1 ❤️'),
        el('button', { class: 'btn btn-ghost btn-wide', onclick: closeModal }, 'Not now')),
    ], 'modal-sm');
  }

  function openSettings() {
    const voiceStatus = !hasSpeech
      ? 'Your browser does not support speech, so audio and listening exercises are off.'
      : plVoice
        ? `Polish voice: ${plVoice.name}`
        : 'No Polish voice was found on this device. Listening exercises are skipped. Install a Polish voice in your system settings, or try Chrome or Edge, for audio.';
    const toggle = (key, label, desc) => el('label', { class: 'set-row' },
      el('div', {}, el('div', { class: 'set-label' }, label), el('div', { class: 'muted small' }, desc)),
      el('input', {
        type: 'checkbox', class: 'switch', checked: state.settings[key] ? true : null,
        onchange: (e) => { state.settings[key] = e.target.checked; save(); },
      }));
    const rate = el('input', {
      type: 'range', min: '0.6', max: '1.2', step: '0.05', value: String(state.settings.rate),
      oninput: (e) => { state.settings.rate = parseFloat(e.target.value); save(); },
      onchange: () => speak('Dzień dobry! Jak się masz?'),
    });
    openModal([
      el('h2', {}, 'Settings'),
      toggle('sfx', 'Sound effects', 'Chimes for right and wrong answers'),
      toggle('voice', 'Pronunciation audio', 'Hear Polish words and sentences'),
      el('div', { class: 'set-row col' },
        el('div', { class: 'set-label' }, 'Speech speed'), rate,
        el('p', { class: 'muted small' }, voiceStatus),
        hasSpeech ? el('button', { class: 'btn btn-ghost sm', onclick: () => speak('Dzień dobry! Jak się masz?') }, '🔊 Test voice') : null),
      el('div', { class: 'set-row col' },
        el('div', { class: 'set-label' }, 'Progress'),
        el('p', { class: 'muted small' }, 'Progress is saved in this browser.'),
        el('button', { class: 'btn btn-ghost sm danger', onclick: confirmReset }, 'Reset all progress')),
      el('button', { class: 'btn btn-primary btn-wide', onclick: () => { closeModal(); renderAll(); } }, 'Done'),
    ], 'modal-md');
  }
  function confirmReset() {
    openModal([
      el('div', { class: 'modal-hero', 'aria-hidden': 'true' }, '⚠️'),
      el('h2', {}, 'Reset all progress?'),
      el('p', { class: 'muted' }, 'This clears your XP, streak and completed lessons. It cannot be undone.'),
      el('div', { class: 'btn-col' },
        el('button', { class: 'btn btn-ghost btn-wide', onclick: openSettings }, 'Cancel'),
        el('button', { class: 'btn btn-red btn-wide', onclick: () => { const st = state.settings; state = defaults(); state.settings = st; save(); closeModal(); renderAll(); toast('Progress reset.'); } }, 'Reset')),
    ], 'modal-sm');
  }

  /* =========================================================
   * Wiring
   * ======================================================= */
  $$('.nav-item').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.view) setView(b.dataset.view);
    else if (b.dataset.action === 'practice') startSession('practice');
    else if (b.dataset.action === 'settings') openSettings();
  }));
  $('#check-btn').addEventListener('click', () => (phase === 'feedback' ? next() : doCheck()));
  $('#quit-btn').addEventListener('click', confirmQuit);
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });

  document.addEventListener('keydown', (e) => {
    if (!$('#modal').hidden) {
      if (e.key === 'Escape') closeModal();
      return;
    }
    if (!$('#complete').hidden) {
      if (e.key === 'Enter') { e.preventDefault(); $('#complete-continue')?.click(); }
      return;
    }
    if ($('#lesson').hidden || !S) return;
    const typing = /^(INPUT|TEXTAREA)$/.test(e.target.tagName);
    if (e.key === 'Enter') {
      e.preventDefault();
      if (phase === 'feedback') next();
      else doCheck();
      return;
    }
    if (e.key === 'Escape') { confirmQuit(); return; }
    if (typing || phase !== 'answer') return;
    if (/^[0-9]$/.test(e.key) && ctrl.key) { e.preventDefault(); ctrl.key(+e.key); }
    else if (e.key === 'Backspace' && ctrl.back) { e.preventDefault(); ctrl.back(); }
  });

  setInterval(() => { if (!$('#app').hidden) renderStats(); }, 30000);

  refreshDay();
  save();
  renderAll();
})();
