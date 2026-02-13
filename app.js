const UNLOCK_AT_ISO = "2026-02-14T00:00:00+05:30";

const lockScreen = document.getElementById('lock-screen');
const main = document.getElementById('main');
const cdDays = document.getElementById('cd-days');
const cdHours = document.getElementById('cd-hours');
const cdMins = document.getElementById('cd-mins');
const cdSecs = document.getElementById('cd-secs');
const beginBtn = document.getElementById('begin-btn');
const introCard = document.getElementById('intro-card');
const soundGate = document.getElementById('sound-gate');
const enableSoundBtn = document.getElementById('enable-sound');
const bgm = document.getElementById('bgm');
bgm.volume = 0.4;
const BGM_SRC = 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Erik_Satie_-_Gymnop%C3%A9die_No._1.ogg';

const moodSection = document.getElementById('mood');
const moodContinue = document.getElementById('mood-continue');
const questionSection = document.getElementById('question1');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const valentineNote = document.getElementById('valentine-note');
const tulipFlourish = document.querySelector('.tulip-flourish');
const progressRibbon = document.getElementById('progress-ribbon');
const toLetterBtn = document.getElementById('to-letter');
const letterEndLine = document.getElementById('letter-endline');
const toDoorFromLetter = document.getElementById('to-door-from-letter');

const revealEls = document.querySelectorAll('.reveal');

const rollBtn = document.getElementById('roll-btn');
const rollNextBtn = document.getElementById('roll-next');
const dice = document.getElementById('dice');
const reasonCard = document.getElementById('reason-card');
const reasonTitle = document.getElementById('reason-title');
const reasonText = document.getElementById('reason-text');
const favoriteBtn = document.getElementById('favorite-btn');
const favoritesToggle = document.getElementById('favorites-toggle');
const favoritesDrawer = document.getElementById('favorites-drawer');
const favoritesList = document.getElementById('favorites-list');
const toDoorBtn = document.getElementById('to-door');

const surprises = document.querySelectorAll('[data-egg]');
const tulipEgg = document.getElementById('tulip-egg');
const eggModal = document.getElementById('egg-modal');
const eggText = document.getElementById('egg-text');
const eggClose = document.getElementById('egg-close');

const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const passphrase = document.getElementById('passphrase');
const unlockDoor = document.getElementById('unlock-door');
const hintText = document.getElementById('hint-text');
const hintButtons = document.querySelectorAll('[data-hint]');
const doorPanel = document.getElementById('door-panel');

const finalOverlay = document.getElementById('final-overlay');
const finalYes = document.getElementById('final-yes');
const finalSoft = document.getElementById('final-soft');
const finalMessage = document.getElementById('final-message');
const finalActions = document.getElementById('final-actions');
const finalButtons = document.querySelector('.final-buttons');
const replayBtn = document.getElementById('replay');
const finalFavoritesBtn = document.getElementById('final-favorites');
const finalReasonBtn = document.getElementById('final-reason');

const particlesCanvas = document.getElementById('particles');
const confettiCanvas = document.getElementById('confetti');
const starsCanvas = document.getElementById('stars');

if (letterEndLine) {
  if (!letterEndLine.dataset.fullText) {
    letterEndLine.dataset.fullText = letterEndLine.textContent;
  }
  letterEndLine.textContent = '';
}

const state = {
  unlocked: false,
  begun: false,
  moodDone: false,
  accepted: false,
  letterDone: false,
  puzzleSolved: false,
  girlfriendYes: false,
  reduceMotion: false,
  mute: false,
  lowDensity: false,
  highContrast: false,
};

const stored = {
  seen: new Set(JSON.parse(localStorage.getItem('seenReasons') || '[]')),
  favorites: JSON.parse(localStorage.getItem('favoriteReasons') || '[]'),
  settings: JSON.parse(localStorage.getItem('settings') || '{}'),
  progress: JSON.parse(localStorage.getItem('progressState') || '{}')
};

Object.assign(state, stored.settings);
if (stored.settings.reduceMotion === undefined) {
  state.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const audioState = {
  ctx: null,
  enabled: false,
};

function on(el, event, handler) {
  if (el) el.addEventListener(event, handler);
}

function saveSettings() {
  localStorage.setItem('settings', JSON.stringify({
    reduceMotion: state.reduceMotion,
    mute: state.mute,
    lowDensity: state.lowDensity,
    highContrast: state.highContrast,
  }));
}

function saveProgress() {
  localStorage.setItem('progressState', JSON.stringify({
    begun: state.begun,
    moodDone: state.moodDone,
    accepted: state.accepted,
    letterDone: state.letterDone,
    puzzleSolved: state.puzzleSolved,
    girlfriendYes: state.girlfriendYes,
  }));
}

function resetProgress() {
  state.begun = false;
  state.moodDone = false;
  state.accepted = false;
  state.letterDone = false;
  state.puzzleSolved = false;
  state.girlfriendYes = false;
  saveProgress();
  gateSections();
  progressRibbon.hidden = true;
  toLetterBtn.hidden = true;
  finalOverlay.classList.remove('show');
  finalMessage.hidden = true;
  finalActions.hidden = true;
  if (finalButtons) finalButtons.hidden = false;
  valentineNote.textContent = '';
  doorPanel.classList.remove('unlocked', 'shake');
  letterEndLine.textContent = letterEndLine.dataset.fullText || letterEndLine.textContent;
  moodContinue.hidden = true;
  introCard.classList.remove('pulse');
  reasonCard.hidden = true;
  dice.textContent = '0';
  favoritesDrawer.hidden = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function applySettings() {
  document.body.classList.toggle('reduce-motion', state.reduceMotion);
  document.body.classList.toggle('high-contrast', state.highContrast);
}

function updateCountdown() {
  const now = new Date();
  const unlockAt = new Date(UNLOCK_AT_ISO);
  const diff = unlockAt - now;

  if (diff <= 0) {
    if (!state.unlocked) unlock();
    return;
  }

  if (location.hash) {
    history.replaceState(null, '', location.pathname);
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  cdDays.textContent = String(days).padStart(2, '0');
  cdHours.textContent = String(hours).padStart(2, '0');
  cdMins.textContent = String(mins).padStart(2, '0');
  cdSecs.textContent = String(secs).padStart(2, '0');
}

function unlock() {
  state.unlocked = true;
  document.body.classList.remove('is-locked');
  lockScreen.classList.add('unlocking');
  lockScreen.style.pointerEvents = 'none';
  lockScreen.style.opacity = '0';
  lockScreen.style.transition = 'opacity 1500ms ease';
  setTimeout(() => {
    lockScreen.hidden = true;
    main.hidden = false;
    main.setAttribute('aria-hidden', 'false');
    startIntroTyping();
    startParticles();
    gateSections();
  }, 1400);
}

function gateSections() {
  document.querySelectorAll('[data-stage]').forEach((section) => {
    const stage = section.dataset.stage;
    let open = false;
    if (stage === 'after-begin') open = state.begun;
    if (stage === 'after-mood') open = state.moodDone;
    if (stage === 'after-yes') open = state.accepted;
    if (stage === 'after-letter') open = state.letterDone;
    if (open) {
      section.hidden = false;
      requestAnimationFrame(() => section.classList.add('unlocked'));
    } else {
      section.classList.remove('unlocked');
      section.hidden = true;
    }
  });
}

const typingTimers = new WeakMap();

function clearTyping(el) {
  const timer = typingTimers.get(el);
  if (timer) {
    clearInterval(timer);
    typingTimers.delete(el);
  }
}

function typeText(el, text, speed = 32, done) {
  if (!el) return;
  const full = text || el.dataset.fullText || el.textContent;
  el.dataset.fullText = full;
  if (el.dataset.typed === 'true') {
    el.textContent = full;
    if (done) done();
    return;
  }
  if (state.reduceMotion) {
    el.textContent = full;
    el.dataset.typed = 'true';
    if (done) done();
    return;
  }
  clearTyping(el);
  el.textContent = '';
  let i = 0;
  const step = () => {
    el.textContent += full[i] || '';
    i += 1;
    if (i >= full.length) {
      el.dataset.typed = 'true';
      typingTimers.delete(el);
      if (done) done();
      return;
    }
    const timer = setTimeout(step, speed);
    typingTimers.set(el, timer);
  };
  const timer = setTimeout(step, speed);
  typingTimers.set(el, timer);
}

function typeLines(lines, done) {
  if (!lines.length) return;
  if (state.reduceMotion) {
    lines.forEach((line) => {
      const full = line.dataset.fullText || line.textContent;
      line.dataset.fullText = full;
      line.textContent = full;
      line.dataset.typed = 'true';
    });
    if (done) done();
    return;
  }
  let idx = 0;
  const next = () => {
    if (idx >= lines.length) {
      if (done) done();
      return;
    }
    const el = lines[idx];
    const full = el.dataset.fullText || el.textContent;
    el.dataset.fullText = full;
    if (el.dataset.typed === 'true') {
      idx += 1;
      setTimeout(next, 120);
      return;
    }
    clearTyping(el);
    el.textContent = '';
    let i = 0;
    const step = () => {
      el.textContent += full[i] || '';
      i += 1;
      if (i >= full.length) {
        el.dataset.typed = 'true';
        typingTimers.delete(el);
        idx += 1;
        setTimeout(next, 220);
        return;
      }
      const timer = setTimeout(step, 32);
      typingTimers.set(el, timer);
    };
    const timer = setTimeout(step, 32);
    typingTimers.set(el, timer);
  };
  next();
}

function startIntroTyping() {
  const lines = Array.from(document.querySelectorAll('#intro [data-type]'));
  lines.forEach((line) => {
    line.dataset.typed = 'false';
  });
  typeLines(lines);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
  },
  { threshold: 0.2 }
);

revealEls.forEach((el) => observer.observe(el));

const typedObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        typeText(entry.target);
        typedObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);

typedObserver.observe(letterEndLine);

gateSections();
applySettings();
updateCountdown();
setInterval(updateCountdown, 1000);

if (new Date() >= new Date(UNLOCK_AT_ISO)) {
  unlock();
}

window.addEventListener('hashchange', () => {
  if (!state.unlocked && location.hash) {
    history.replaceState(null, '', location.pathname);
  }
});

function initAudio() {
  if (audioState.enabled) return;
  try {
    audioState.ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioState.ctx.resume().then(() => {
      audioState.enabled = true;
      soundGate.hidden = true;
      if (BGM_SRC && !state.mute) {
        bgm.src = BGM_SRC;
        bgm.play().catch(() => {
          soundGate.hidden = false;
        });
      }
    }).catch(() => {
      soundGate.hidden = false;
    });
  } catch (err) {
    soundGate.hidden = false;
  }
}

function clickSound() {
  if (state.mute || !audioState.enabled || !audioState.ctx) return;
  const ctx = audioState.ctx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = 180;
  gain.gain.value = 0.02;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
  osc.stop(ctx.currentTime + 0.15);
}

function rumbleSound() {
  if (state.mute || !audioState.enabled || !audioState.ctx) return;
  const ctx = audioState.ctx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 60;
  gain.gain.value = 0.04;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
  osc.stop(ctx.currentTime + 0.4);
}

function rollSound() {
  if (state.mute || !audioState.enabled || !audioState.ctx) return;
  const ctx = audioState.ctx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 320;
  gain.gain.value = 0.03;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
  osc.stop(ctx.currentTime + 0.35);
}

on(beginBtn, 'click', () => {
  introCard.classList.add('pulse');
  state.begun = true;
  gateSections();
  initAudio();
  setTimeout(() => {
    clickSound();
    rumbleSound();
  }, 80);
  saveProgress();
  const moodLines = Array.from(document.querySelectorAll('#mood [data-type]'));
  moodContinue.hidden = true;
  typeLines(moodLines, () => {
    moodContinue.hidden = false;
  });
  if (moodSection) {
    moodSection.scrollIntoView({ behavior: state.reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }
});

function advanceToQuestion() {
  if (!state.begun || state.moodDone) return;
  state.moodDone = true;
  gateSections();
  saveProgress();
  questionSection.scrollIntoView({ behavior: state.reduceMotion ? 'auto' : 'smooth', block: 'start' });
}

on(moodContinue, 'click', () => {
  clickSound();
  advanceToQuestion();
});

window.addEventListener('scroll', () => {
  if (!state.begun || state.moodDone) return;
  const moodBottom = moodSection.offsetTop + moodSection.offsetHeight;
  if (window.scrollY > moodBottom - 120) {
    advanceToQuestion();
  }
});

on(enableSoundBtn, 'click', () => {
  initAudio();
});

function handleAcceptance() {
  if (state.accepted) return;
  state.accepted = true;
  gateSections();
  tulipFlourish.classList.add('show');
  confettiBurst();
  clickSound();
  progressRibbon.hidden = false;
  toLetterBtn.hidden = false;
  typeText(valentineNote, 'OKAY YOU SAID YES. LOCKED IN. NO REFUNDS.');
  saveProgress();
}

on(yesBtn, 'click', handleAcceptance);

on(toLetterBtn, 'click', () => {
  clickSound();
  const letterSection = document.getElementById('letter');
  if (letterSection) {
    letterSection.scrollIntoView({ behavior: state.reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }
});

on(toDoorFromLetter, 'click', () => {
  clickSound();
  state.letterDone = true;
  gateSections();
  saveProgress();
  document.getElementById('puzzle').scrollIntoView({ behavior: state.reduceMotion ? 'auto' : 'smooth', block: 'start' });
});

const buttonRow = document.getElementById('valentine-buttons');
let noPosition = { x: 0, y: 0 };
let lastNoMove = 0;

function relRect(rect, container) {
  return {
    left: rect.left - container.left,
    top: rect.top - container.top,
    right: rect.right - container.left,
    bottom: rect.bottom - container.top,
  };
}

function setNoPosition(x, y) {
  noPosition = { x, y };
  noBtn.style.left = '0px';
  noBtn.style.top = '0px';
  noBtn.style.transform = `translate(${x}px, ${y}px)`;
}

function moveNoButton() {
  const now = performance.now();
  if (now - lastNoMove < 80) return;
  lastNoMove = now;
  const container = buttonRow.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();
  const padding = 8;
  const maxX = Math.max(padding, container.width - btn.width - padding);
  const maxY = Math.max(padding, container.height - btn.height - padding);
  const yesRect = relRect(yesBtn.getBoundingClientRect(), container);
  let tries = 0;
  let x = noPosition.x;
  let y = noPosition.y;
  while (tries < 16) {
    x = padding + Math.random() * (maxX - padding);
    y = padding + Math.random() * (maxY - padding);
    const testRect = {
      left: x,
      top: y,
      right: x + btn.width,
      bottom: y + btn.height,
    };
    const overlap = (r) => !(testRect.right < r.left || testRect.left > r.right || testRect.bottom < r.top || testRect.top > r.bottom);
    if (!overlap(yesRect)) break;
    tries += 1;
  }
  setNoPosition(x, y);
}

function placeNoInitial() {
  const container = buttonRow.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();
  const x = container.width / 2 - btn.width / 2;
  const y = container.height / 2 + 28;
  setNoPosition(Math.max(8, x), Math.max(8, y));
}

window.addEventListener('resize', placeNoInitial);
setTimeout(placeNoInitial, 200);

on(noBtn, 'mouseover', () => {
  if (window.matchMedia('(hover: hover)').matches) moveNoButton();
});

on(noBtn, 'click', (e) => {
  e.preventDefault();
  moveNoButton();
  typeText(valentineNote, 'Not quite. I’ll wait for a yes.');
});

on(buttonRow, 'mousemove', () => {
  if (window.matchMedia('(hover: hover)').matches) moveNoButton();
});

on(noBtn, 'touchstart', (e) => {
  e.preventDefault();
  moveNoButton();
});

function setSoundMuted(mute) {
  state.mute = mute;
  if (mute) {
    bgm.pause();
  } else if (audioState.enabled && BGM_SRC) {
    bgm.play().catch(() => {
      soundGate.hidden = false;
    });
  }
  saveSettings();
}

const REASONS = window.REASONS || [];

const CATEGORIES = [];
if (REASONS.length) {
  for (let i = 0; i < 10; i += 1) {
    CATEGORIES.push(REASONS.slice(i * 50, i * 50 + 50));
  }
} else {
  rollBtn.disabled = true;
  rollNextBtn.disabled = true;
  reasonTitle.textContent = 'Reasons not loaded';
  reasonText.textContent = 'Add your reasons to data.js (window.REASONS = [...]) and reload.';
  reasonCard.hidden = false;
}

function pickReason(roll) {
  const categoryIndex = Math.floor((roll - 1) / 2);
  const category = CATEGORIES[categoryIndex] || REASONS;
  const unseen = category.filter((reason) => !stored.seen.has(reason));
  let choice;
  if (unseen.length) {
    choice = unseen[Math.floor(Math.random() * unseen.length)];
  } else {
    choice = category[Math.floor(Math.random() * category.length)];
  }
  stored.seen.add(choice);
  localStorage.setItem('seenReasons', JSON.stringify(Array.from(stored.seen)));
  return choice;
}

function rollReason() {
  if (!REASONS.length) return;
  dice.classList.remove('rolling');
  reasonCard.classList.remove('pop');
  void dice.offsetWidth;
  dice.classList.add('rolling');
  const roll = Math.floor(Math.random() * 500) + 1;
  dice.textContent = roll;
  rollSound();
  const reason = REASONS[roll - 1];
  const index = roll;
  reasonTitle.textContent = `Reason ${index}/500`;
  reasonText.textContent = reason;
  reasonCard.hidden = false;
  void reasonCard.offsetWidth;
  reasonCard.classList.add('pop');
  favoriteBtn.dataset.reason = reason;
}

on(rollBtn, 'click', rollReason);
on(rollNextBtn, 'click', rollReason);

on(favoriteBtn, 'click', () => {
  const reason = favoriteBtn.dataset.reason;
  if (!reason) return;
  if (!stored.favorites.includes(reason)) {
    stored.favorites.push(reason);
    localStorage.setItem('favoriteReasons', JSON.stringify(stored.favorites));
    renderFavorites();
  }
});

on(favoritesToggle, 'click', () => {
  favoritesDrawer.hidden = !favoritesDrawer.hidden;
  renderFavorites();
});

on(toDoorBtn, 'click', () => {
  clickSound();
  state.letterDone = true;
  gateSections();
  saveProgress();
  document.getElementById('puzzle').scrollIntoView({ behavior: state.reduceMotion ? 'auto' : 'smooth', block: 'start' });
});

function renderFavorites() {
  favoritesList.innerHTML = '';
  if (!stored.favorites.length) {
    favoritesList.textContent = 'No favorites yet.';
    return;
  }
  stored.favorites.forEach((reason) => {
    const div = document.createElement('div');
    div.textContent = reason;
    favoritesList.appendChild(div);
  });
}

function openEgg(type) {
  const messages = {
    shawarma: 'A shawarma night with you is still one of my favorite kinds of calm.',
    darkroom: 'Dark rooms feel warmer when you are there.',
    tulip: 'A tiny tulip for you, soft, bright, and brave.',
    phoenix: 'Forum still glows in my memory.',
    eepi: 'eepi sleepi, the smallest spell we share.',
  };
  clickSound();
  eggText.textContent = messages[type] || 'A small note, kept on purpose.';
  eggModal.hidden = false;
  eggModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

surprises.forEach((btn) => {
  on(btn, 'click', () => {
    openEgg(btn.dataset.egg);
  });
});

on(tulipEgg, 'click', () => {
  openEgg('tulip');
});

on(eggClose, 'click', () => {
  eggModal.hidden = true;
  eggModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
});

on(eggModal, 'click', (e) => {
  if (e.target === eggModal) {
    eggModal.hidden = true;
    eggModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !eggModal.hidden) {
    eggModal.hidden = true;
    eggModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
});

let keySeq = '';
window.addEventListener('keydown', (e) => {
  const target = e.target;
  const tag = target && target.tagName ? target.tagName.toLowerCase() : '';
  if (tag === 'input' || tag === 'textarea' || target.isContentEditable) return;
  keySeq += e.key.toLowerCase();
  if (keySeq.endsWith('eepi')) {
    openEgg('eepi');
    keySeq = '';
  }
  if (keySeq.length > 10) keySeq = keySeq.slice(-10);
});

hintButtons.forEach((btn) => {
  on(btn, 'click', () => {
    const level = btn.dataset.hint;
    if (level === '1') {
      hintText.textContent = 'Hint 1: something i always am.';
    } else if (level === '2') {
      hintText.textContent = 'Use N = 19. Take the 19th word in each line.';
    } else {
      hintText.textContent = 'N = 19. The 19th words are “eepi” and “sleepi”. Put them together.';
    }
  });
});

on(unlockDoor, 'click', () => {
  const pass = passphrase.value.trim().toLowerCase();
  if (pass === 'eepi sleepi') {
    state.puzzleSolved = true;
    saveProgress();
    doorPanel.classList.add('unlocked');
    passphrase.value = '';
    hintText.textContent = 'Door open.';
    clickSound();
    setTimeout(() => {
      finalOverlay.classList.add('show');
      drawStars();
    }, 900);
  } else {
    hintText.textContent = 'Not quite. Try again.';
    doorPanel.classList.add('shake');
    setTimeout(() => doorPanel.classList.remove('shake'), 500);
  }
});

on(finalYes, 'click', () => {
  finalMessage.hidden = false;
  finalActions.hidden = false;
  if (finalButtons) finalButtons.hidden = true;
  state.girlfriendYes = true;
  saveProgress();
  confettiBurst();
  clickSound();
});

on(finalSoft, 'click', () => {
  finalMessage.hidden = false;
  finalActions.hidden = false;
  if (finalButtons) finalButtons.hidden = true;
  finalMessage.innerHTML = '<div>Take all the time you need.</div><div>I’m here.</div>';
  clickSound();
});

on(replayBtn, 'click', () => {
  clickSound();
  resetProgress();
});

on(finalFavoritesBtn, 'click', () => {
  clickSound();
  finalOverlay.classList.remove('show');
  document.getElementById('reasons').scrollIntoView({ behavior: state.reduceMotion ? 'auto' : 'smooth', block: 'start' });
  favoritesDrawer.hidden = false;
  renderFavorites();
});

on(finalReasonBtn, 'click', () => {
  clickSound();
  finalOverlay.classList.remove('show');
  document.getElementById('reasons').scrollIntoView({ behavior: state.reduceMotion ? 'auto' : 'smooth', block: 'start' });
  rollReason();
});

function startParticles() {
  const ctx = particlesCanvas.getContext('2d');
  let particles = [];
  function resize() {
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function createParticles() {
    const count = state.lowDensity ? 24 : 60;
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * particlesCanvas.width,
      y: Math.random() * particlesCanvas.height,
      r: Math.random() * 2 + 0.8,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.4 + 0.2,
    }));
  }

  createParticles();

  function tick() {
    if (state.reduceMotion) return;
    ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    ctx.fillStyle = 'rgba(242, 182, 200, 0.6)';
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > particlesCanvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > particlesCanvas.height) p.vy *= -1;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // density changes can be wired back in if controls return
}

function confettiBurst() {
  if (state.reduceMotion) return;
  const ctx = confettiCanvas.getContext('2d');
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  const pieces = Array.from({ length: state.lowDensity ? 40 : 120 }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: -20 - Math.random() * 200,
    vy: Math.random() * 2 + 1,
    size: Math.random() * 6 + 2,
    color: Math.random() > 0.5 ? 'rgba(242,182,200,0.8)' : 'rgba(255,255,255,0.5)',
  }));
  let frames = 0;
  function frame() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    pieces.forEach((p) => {
      p.y += p.vy;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size * 0.6);
    });
    frames += 1;
    if (frames < 240) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function drawStars() {
  const ctx = starsCanvas.getContext('2d');
  starsCanvas.width = window.innerWidth;
  starsCanvas.height = window.innerHeight;
  const count = state.lowDensity ? 120 : 260;
  const stars = Array.from({ length: count }, () => ({
    x: Math.random() * starsCanvas.width,
    y: Math.random() * starsCanvas.height,
    r: Math.random() * 1.4 + 0.3,
  }));
  const start = performance.now();
  const duration = 3200;
  function frame(now) {
    const progress = Math.min(1, (now - start) / duration);
    ctx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
    ctx.globalAlpha = 0.2 + progress * 0.8;
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    const visible = Math.floor(stars.length * progress);
    for (let i = 0; i < visible; i += 1) {
      const s = stars[i];
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

setSoundMuted(state.mute);
