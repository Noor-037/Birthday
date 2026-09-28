/* CUSTOMIZE EVERYTHING HERE */
const CONFIG ={
    /*BIRTHDAy PERSON NAME*/
    NAME:"SAGAR",
    /*COUNTDOWN */
    COUNTDOWN_FROM: 3,
    COUNTDOWN_LABEL: "Your celebration begins in...",
    /*CAKE SCENE */
    CAKE_CAPTION: "Make a wish, {name} ✨",
    CAKE_HINT: "Close your eyes, make a wish.... then blow! 🌟",
    WISH_MOMENT_TEXT: "Your wish is on its way... ✨",

    /*Birthday celebration start */
    HEADING: " 🎉 Happy Birthday 🎉",
    HERO_MESSAGE: 
       "Today is all about you, {name}. Thank you for being exactly who you are — the world is brighter with you in it. Let's make this day unforgettable! ",

    WISH_TITLE: " A SPECIAL WISH FOR YOU, {name} ✨",
    WISH_MESSAGE: "May your birthday be filled with laughter, love, and all the things that bring you joy. Here's to another year of amazing adventures and cherished memories. Happy Birthday! 🎂🎈",

};

const Sound = {
  snuff() {},
  celebrate() {},
};
const Lightbox = { close() {} };

/* =====================================================================
   Helpers
   ===================================================================== */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const fmt  = s => String(s).replaceAll("{name}", CONFIG.NAME);
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Every timeout goes through `later` so Replay can cancel them all */
const timers = new Set();
function later(fn, ms) {
  const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
  timers.add(id);
  return id;
}
const clearTimers = () => { timers.forEach(clearTimeout); timers.clear(); };

/* Fill every [data-cfg="KEY"] element from CONFIG */
$$("[data-cfg]").forEach(el => { el.textContent = fmt(CONFIG[el.dataset.cfg] ?? ""); });

/* =====================================================================
   Background: twinkling stars + bunting flags
   ===================================================================== */
(function buildBackground() {
  const tw = $("#twinkles");
  for (let i = 0; i < 30; i++) {
    const s = document.createElement("span");
    s.className = "twinkle";
    s.textContent = pick(["✦", "✧", "✦", "⋆"]);
    s.style.cssText = `left:${rand(1, 98)}%;top:${rand(1, 98)}%;font-size:${rand(9, 22)}px;--dur:${rand(3, 6.5)}s;--dl:${rand(0, 6)}s`;
    tw.appendChild(s);
  }
  const flags = $("#flags");
  const colors = ["#ff6f9f", "#ffc94d", "#9b7bff", "#5fd3b2", "#ff9e7a", "#6fa8ff"];
  const N = 13;
  for (let i = 0; i < N; i++) {
    const t = 0.03 + (i / (N - 1)) * 0.94;
    const f = document.createElement("i");
    f.className = "flag";
    f.style.cssText = `--t:${t};--y:${(8 + 104 * t * (1 - t)).toFixed(1)}px;--c:${colors[i % colors.length]};--dl:${(i * -0.3).toFixed(2)}s`;
    flags.appendChild(f);
  }
})();


/* =====================================================================
   Confetti (lightweight canvas)
   ===================================================================== */
const Confetti = (() => {
  const cv = $("#confetti"), c = cv.getContext("2d");
  const COLORS = ["#ff5f9e", "#ffb03b", "#ffd84d", "#7ee0c3", "#6fa8ff", "#b58cff", "#ff7a7a", "#ffffff"];
  let W = 0, H = 0, parts = [], raf = 0, last = 0;

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener("resize", resize); resize();

  function star(r) {
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 ? r * 0.45 : r, a = Math.PI / 5 * i - Math.PI / 2;
      c.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    c.closePath(); c.fill();
  }

  function spawn(x, y, angle, spread, speed, count, o = {}) {
    if (REDUCED) count = Math.ceil(count / 2);
    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - 0.5) * spread, v = speed * (0.45 + Math.random() * 0.55);
      parts.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        g: o.g ?? 0.32, drag: o.drag ?? 0.985, size: rand(6, 12),
        color: o.colors ? pick(o.colors) : pick(COLORS),
        rot: rand(0, 6.28), vr: rand(-0.25, 0.25), tilt: rand(0, 6.28), vt: rand(0.05, 0.2),
        shape: o.shapes ? pick(o.shapes) : pick([0, 0, 0, 1, 2]), life: rand(170, 260),
      });
    }
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }

  function draw(p) {
    c.globalAlpha = Math.min(1, p.life / 50);
    c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.color;
    if (p.shape === 0) {
      c.scale(1, Math.max(0.15, Math.abs(Math.cos(p.tilt))));
      c.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
    } else if (p.shape === 1) {
      c.beginPath(); c.arc(0, 0, p.size / 2.4, 0, 6.283); c.fill();
    } else star(p.size * 0.75);
    c.restore();
  }

  function frame(t) {
    const dt = Math.min(2.2, (t - last) / 16.667 || 1); last = t;
    c.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i], d = Math.pow(p.drag, dt);
      p.vx *= d; p.vy = p.vy * d + p.g * dt;
      p.x += (p.vx + Math.sin(p.tilt) * 0.5) * dt; p.y += p.vy * dt;
      p.rot += p.vr * dt; p.tilt += p.vt * dt; p.life -= dt;
      if (p.life <= 0 || p.y > H + 30) { parts.splice(i, 1); continue; }
      draw(p);
    }
    c.globalAlpha = 1;
    raf = parts.length ? requestAnimationFrame(frame) : 0;
  }

  return {
    cannon(side, count) {
      const narrow = W < 700, lean = (narrow ? 70 : 58) * Math.PI / 180;
      const left = side === "left";
      spawn(left ? -4 : W + 4, H * 0.86, left ? -lean : -(Math.PI - lean), 0.7, Math.min(H * 0.034, 27), count);
    },
    burst(x, y, count) {
      spawn(x, y, 0, Math.PI * 2, 12, count, { g: 0.16, drag: 0.972, shapes: [2, 2, 1], colors: ["#ffd84d", "#fff3b0", "#ff9ebb", "#ffffff"] });
    },
    clear() { parts = []; c.clearRect(0, 0, W, H); },
  };
})();

/* =====================================================================
   Balloons
   ===================================================================== */
const BALLOON_COLORS = ["#ff7fa6", "#ffb84d", "#b79cff", "#7ee0c3", "#8fb8ff", "#ff9a8b", "#ffd166"];
function launchBalloons(n = 14) {
  const layer = $("#balloons");
  for (let i = 0; i < n; i++) {
    const size = rand(50, 80);
    const b = document.createElement("div");
    b.className = "balloon";
    b.style.cssText = `--c:${pick(BALLOON_COLORS)};--s:${size}px;left:${rand(2, 92)}%;--dur:${rand(9, 15).toFixed(1)}s;--delay:${rand(0, 4.5).toFixed(1)}s;--sway:${rand(8, 22).toFixed(0)}px`;
    b.innerHTML = '<div class="balloon-body"><i class="balloon-string"></i></div>';
    b.addEventListener("animationend", e => { if (e.target === b) b.remove(); });
    layer.appendChild(b);
  }
}
const clearBalloons = () => { $("#balloons").innerHTML = ""; };

/* =====================================================================
   Floating hearts & sparkles (final section)
   ===================================================================== */
const Floaters = (() => {
  const layer = $("#heartsLayer"), SYMBOLS = ["❤️", "💖", "✨", "⭐", "💫", "💕", "🌟"];
  let timer = 0;
  function spawn() {
    if (layer.children.length > 26) return;
    const el = document.createElement("span");
    el.className = "floater";
    el.textContent = pick(SYMBOLS);
    el.style.cssText = `left:${rand(2, 96)}%;font-size:${rand(14, 30).toFixed(0)}px;--rise:${layer.clientHeight + 80}px;--dx:${rand(-40, 40).toFixed(0)}px;animation-duration:${rand(5, 9).toFixed(1)}s`;
    el.addEventListener("animationend", () => el.remove());
    layer.appendChild(el);
  }
  function sparkles() {
    if ($(".sparkle", layer)) return;
    for (let i = 0; i < 12; i++) {
      const s = document.createElement("span");
      s.className = "sparkle"; s.textContent = pick(["✦", "✧", "⋆"]);
      s.style.cssText = `left:${rand(3, 96)}%;top:${rand(4, 92)}%;font-size:${rand(10, 22).toFixed(0)}px;--dur:${rand(2.5, 5).toFixed(1)}s;--dl:${rand(0, 4).toFixed(1)}s`;
      layer.appendChild(s);
    }
  }
  return {
    start() { if (timer) return; sparkles(); spawn(); timer = setInterval(spawn, 520); },
    stop()  { clearInterval(timer); timer = 0; },
    clear() { this.stop(); layer.innerHTML = ""; },
  };
})();
new IntersectionObserver(([e]) => (e.isIntersecting ? Floaters.start() : Floaters.stop()), { threshold: 0.2 })
  .observe($("#final"));

  /* =====================================================================
   Scroll reveal
   ===================================================================== */
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); });
}, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
function observeReveals() {
  $$(".reveal:not([data-obs])").forEach(el => { el.dataset.obs = "1"; revealIO.observe(el); });
}

/* =====================================================================
   Experience flow: countdown → cake → candles → celebration → replay
   ===================================================================== */
const stages = { countdown: $("#stage-countdown"), cake: $("#stage-cake") };
const cakeStage = stages.cake, candles = $$(".candle"), blowBtn = $("#blowBtn");
const dim = $("#dim"), celebration = $("#celebration");
const heroTitle = $("#heroTitle"), heroName = $("#heroName"), heroMsg = $("#heroMsg");
const typed = $("#heroMsgTyped"), cue = $("#scrollCue");
let state = "idle";

function showStage(name) {
  Object.entries(stages).forEach(([k, el]) => el.classList.toggle("active", k === name));
}

/* ---- 1. Countdown ---- */
function setNumber(n) {
  const num = $("#cdNumber"), ring = $("#cdRing");
  num.textContent = n;
  [num, ring].forEach(el => { el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick"); });
}
function runCountdown() {
  state = "countdown";
  showStage("countdown");
  let n = CONFIG.COUNTDOWN_FROM;
  (function step() {
    if (n < 1) { later(showCake, 250); return; }
    setNumber(n--);
    later(step, 1000);
  })();
}

/* ---- 2. Cake ---- */
function showCake() {
  state = "cake";
  showStage("cake");
  later(() => {                                              // light the candles one by one
    candles.forEach((c, i) => later(() => c.classList.add("lit"), i * 380));
    later(() => cakeStage.classList.add("lit"), candles.length * 380 + 250);
  }, 1100);
}

/* ---- 3. Blow the candles ---- */
function blowCandles() {
  if (state !== "cake") return;
  state = "blowing";
  blowBtn.disabled = true;
  candles.forEach((c, i) => later(() => c.classList.remove("lit"), i * 140));
  cakeStage.classList.remove("lit");
  cakeStage.classList.add("blown");
  Sound.snuff();
  later(() => dim.classList.add("on"), 350);                 // room goes soft & dark
  later(celebrate, 2400);                                    // …then the party starts
}
blowBtn.addEventListener("click", blowCandles);

/* ---- 4. Celebration ---- */
function buildHeading() {
  heroTitle.textContent = "";
  heroTitle.setAttribute("aria-label", CONFIG.HEADING);
  const LETTER_COLORS = ["#ff5f9e", "#ff9f43", "#f2a900", "#2fc79a", "#5f8bff", "#b06bff"];
  let i = 0;
  CONFIG.HEADING.split(" ").forEach(word => {
    const w = document.createElement("span");
    w.className = "hw"; w.setAttribute("aria-hidden", "true");
    Array.from(word).forEach(ch => {
      const l = document.createElement("span");
      l.className = "hl"; l.textContent = ch; l.style.setProperty("--i", i);
      if (/[A-Za-z0-9!?.]/.test(ch)) l.style.color = LETTER_COLORS[i % LETTER_COLORS.length];
      i++; w.appendChild(l);
    });
    heroTitle.append(w, document.createTextNode(" "));
  });
  return i;
}

function typeMessage() {
  const full = fmt(CONFIG.HERO_MESSAGE), chars = Array.from(full);
  $("#heroMsgFull").textContent = full;
  typed.textContent = ""; heroMsg.classList.add("typing");
  let i = 0;
  (function step() {
    if (i >= chars.length) { heroMsg.classList.remove("typing"); cue.classList.add("show"); return; }
    const ch = chars[i++];
    typed.textContent += ch;
    later(step, /[.,!—]/.test(ch) ? 230 : rand(22, 48));
  })();
}

function fireConfetti() {
  const vol = [[0, 46], [250, 40], [600, 34], [1000, 30], [1500, 26], [2200, 22]];
  vol.forEach(([ms, n]) => later(() => { Confetti.cannon("left", n); Confetti.cannon("right", n); }, ms));
  later(() => Confetti.burst(innerWidth / 2, innerHeight * 0.34, 46), 450);
  later(() => Confetti.burst(innerWidth / 2, innerHeight * 0.4, 30), 1500);
}

function celebrate() {
  state = "celebrating";
  dim.classList.remove("on");
  const letters = buildHeading();
  celebration.classList.add("active");
  document.documentElement.classList.remove("locked");
  scrollTo(0, 0);
  cakeStage.classList.remove("active");                      // cake fades away, hero is underneath
  Sound.celebrate();
  fireConfetti();
  launchBalloons(innerWidth < 600 ? 10 : 15);

  heroTitle.classList.add("play");
  later(() => heroTitle.classList.add("settled"), letters * 55 + 1100);
  later(() => heroName.classList.add("show"), 1000);
  later(typeMessage, 1800);
  observeReveals();
}

cue.addEventListener("click", () => $("#wish").scrollIntoView({ behavior: "smooth", block: "start" }));

/* ---- 5. Replay ---- */
function replay() {
  clearTimers();
  Lightbox.close();
  Confetti.clear(); clearBalloons(); Floaters.clear();
  dim.classList.remove("on");
  celebration.classList.remove("active");
  heroTitle.classList.remove("play", "settled"); heroName.classList.remove("show");
  heroMsg.classList.remove("typing"); typed.textContent = ""; cue.classList.remove("show");
  $$(".reveal").forEach(el => el.classList.remove("in"));
  cakeStage.classList.remove("lit", "blown");
  candles.forEach(c => c.classList.remove("lit"));
  blowBtn.disabled = false;
  document.documentElement.classList.add("locked");
  scrollTo(0, 0);
  runCountdown();
}
$("#replayBtn").addEventListener("click", replay);

/* ---- Start automatically on page load ---- */
const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
Promise.race([fontsReady, new Promise(r => setTimeout(r, 1200))]).then(() => later(runCountdown, 300));
setTimeout(() => $("#soundHint")?.classList.add("gone"), 12000);