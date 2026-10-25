const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    }
  }
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Typed prompt
const prompts = [
  "cyberpunk / futuristic",
  "neo-brutalist magazine, loud pink",
  "clean Apple keynote",
  "Windows 95 desktop",
  "calm Japanese rail planner",
];
const typed = document.getElementById("typed");
if (!reduced) {
  let p = 0, i = prompts[0].length, deleting = true;
  const tick = () => {
    i += deleting ? -1 : 1;
    typed.textContent = prompts[p].slice(0, i);
    if (deleting && i === 0) {
      deleting = false;
      p = (p + 1) % prompts.length;
    } else if (!deleting && i === prompts[p].length) {
      deleting = true;
      return setTimeout(tick, 2200);
    }
    setTimeout(tick, deleting ? 28 : 55);
  };
  setTimeout(tick, 2600);
}

// Before / after comparison
const pairs = {
  github: {
    before: "media/github-before.png",
    after: "media/github-after-cyberpunk.png",
    mode: "Reskin",
    beforeAlt: "GitHub before reskin, the original profile page",
    afterAlt: "GitHub after a cyberpunk reskin: same layout, with neon pink borders and type",
  },
  wikipedia: {
    before: "media/apple-wikipedia-before.png",
    after: "media/apple-wikipedia-after.png",
    mode: "Rebuild",
    beforeAlt: "Wikipedia's Apple article before, the standard article layout",
    afterAlt: "Wikipedia's Apple article rebuilt in a clean Apple-keynote layout",
  },
  hackernews: {
    before: "media/hackernews-before.png",
    after: "media/hackernews-after-windows95.png",
    mode: "Rebuild",
    beforeAlt: "Hacker News before, the original list of stories",
    afterAlt: "Hacker News rebuilt as a 90s-style computer window",
  },
  irctc: {
    before: "media/irctc-before.png",
    after: "media/irctc-after-japanese-rail.png",
    mode: "Rebuild",
    beforeAlt: "IRCTC train search before, the original booking page",
    afterAlt: "IRCTC train search rebuilt as a calm Japanese rail planner, with the booking form beside a departures board",
  },
};
Object.values(pairs).forEach(({ before, after }) => { new Image().src = before; new Image().src = after; });

const box = document.getElementById("compareBox");
const range = document.getElementById("cmpRange");
const imgBefore = document.getElementById("cmpBefore");
const imgAfter = document.getElementById("cmpAfter");
const captions = document.querySelectorAll("[data-caption]");
const modeLabel = document.getElementById("cmpMode");

range.addEventListener("input", () => box.style.setProperty("--pos", range.value + "%"));

const fitBox = () => {
  if (imgAfter.naturalWidth) box.style.aspectRatio = `${imgAfter.naturalWidth} / ${imgAfter.naturalHeight}`;
};
imgAfter.addEventListener("load", fitBox);
fitBox();

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const pair = pairs[tab.dataset.pair];
    document.querySelectorAll(".tab").forEach((t) => {
      t.classList.toggle("is-active", t === tab);
      t.setAttribute("aria-selected", t === tab);
    });
    box.classList.add("is-swapping");
    setTimeout(() => {
      imgBefore.src = pair.before;
      imgAfter.src = pair.after;
      imgBefore.alt = pair.beforeAlt;
      imgAfter.alt = pair.afterAlt;
      captions.forEach((p) => { p.hidden = p.dataset.caption !== tab.dataset.pair; });
      modeLabel.textContent = pair.mode;
      range.value = 50;
      box.style.setProperty("--pos", "50%");
      box.classList.remove("is-swapping");
    }, reduced ? 0 : 300);
  });
});

// Intro sweep so visitors notice the slider
const sweepIO = new IntersectionObserver(([e]) => {
  if (!e.isIntersecting || reduced) return;
  sweepIO.disconnect();
  const start = performance.now();
  const frame = (t) => {
    const k = Math.min((t - start) / 1600, 1);
    const v = 50 + Math.sin(k * Math.PI * 2) * 28 * (1 - k);
    box.style.setProperty("--pos", v + "%");
    range.value = v;
    if (k < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}, { threshold: 0.6 });
sweepIO.observe(box);

// Highlight the nav link for the section in view
const navLinks = [...document.querySelectorAll(".nav__links a")];
const navIO = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    navLinks.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + e.target.id));
  }
}, { rootMargin: "-45% 0px -50% 0px" });
navLinks.forEach((a) => navIO.observe(document.querySelector(a.getAttribute("href"))));

// Card spotlight
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", e.clientX - r.left + "px");
    card.style.setProperty("--my", e.clientY - r.top + "px");
  });
});

// Video modal
const modal = document.getElementById("modal");
const modalVideo = document.getElementById("modalVideo");
const openVideo = (id) => {
  modalVideo.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0" title="Remodel demo" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
};
const closeVideo = () => {
  modal.hidden = true;
  modalVideo.innerHTML = "";
  document.body.style.overflow = "";
};
document.querySelectorAll("[data-yt]").forEach((b) => b.addEventListener("click", () => openVideo(b.dataset.yt)));
modal.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeVideo(); });
addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeVideo(); });
