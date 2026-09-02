(function setupProcessPath() {
  const board = document.querySelector(".process-board");
  const svg = board?.querySelector(".process-snake");
  const line = svg?.querySelector(".snake-line");
  const dot = svg?.querySelector(".snake-dot");
  const icon1 = board?.querySelector('.pstep--1 [data-node="start"]');
  const iconMid = board?.querySelector('.pstep--2 [data-node="mid"]');
  const icon3 = board?.querySelector('.pstep--3 [data-node="end"]');
  if (!board || !svg || !line || !dot || !icon1 || !iconMid || !icon3) return;

  const mq = window.matchMedia("(max-width: 800px)");

  function center(el) {
    const b = board.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      x: r.left - b.left + r.width / 2,
      y: r.top - b.top + r.height / 2,
      rad: r.width / 2,
    };
  }

  function draw() {
    if (mq.matches) return;

    const a = center(icon1);
    const m = center(iconMid);
    const c = center(icon3);
    const w = board.clientWidth;
    const h = board.clientHeight;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));

    const startX = a.x + a.rad;
    const startY = a.y;
    const endX = c.x - c.rad;
    const endY = c.y;
    const midY = m.y;
    const midLeft = m.x - m.rad;
    const midRight = m.x + m.rad;

    let dropX = a.x + a.rad + 72;
    let riseX = c.x - c.rad - 72;
    dropX = Math.min(dropX, midLeft - 40);
    riseX = Math.max(riseX, midRight + 40);
    dropX = Math.max(dropX, startX + 28);
    riseX = Math.min(riseX, endX - 28);

    const corner = Math.min(
      24,
      (midY - startY) / 2 - 8,
      (midY - endY) / 2 - 8,
      dropX - startX - 8,
      endX - riseX - 8,
      midLeft - dropX - 8,
      riseX - midRight - 8
    );
    const r = Math.max(10, corner);

    line.setAttribute(
      "d",
      [
        `M ${startX} ${startY}`,
        `L ${dropX - r} ${startY}`,
        `A ${r} ${r} 0 0 1 ${dropX} ${startY + r}`,
        `L ${dropX} ${midY - r}`,
        `A ${r} ${r} 0 0 0 ${dropX + r} ${midY}`,
        `L ${midLeft} ${midY}`,
        `M ${midRight} ${midY}`,
        `L ${riseX - r} ${midY}`,
        `A ${r} ${r} 0 0 0 ${riseX} ${midY - r}`,
        `L ${riseX} ${endY + r}`,
        `A ${r} ${r} 0 0 1 ${riseX + r} ${endY}`,
        `L ${endX} ${endY}`,
      ].join(" ")
    );
    line.setAttribute("pathLength", "1");

    dot.setAttribute("cx", String(dropX));
    dot.setAttribute("cy", String(startY + (midY - startY) * 0.42));
  }

  draw();
  window.addEventListener("resize", draw);
  mq.addEventListener("change", draw);
  if (window.ResizeObserver) new ResizeObserver(draw).observe(board);
})();

const portal = document.getElementById("portalModal");
const openPortal = document.getElementById("openPortal");
const closePortal = document.getElementById("closePortal");

function setPortal(open) {
  portal.classList.toggle("open", open);
  document.body.style.overflow = open ? "hidden" : "";
}

function bindPortal(el) {
  if (!el) return;
  el.addEventListener("click", (e) => {
    e.preventDefault();
    setPortal(true);
  });
}

bindPortal(openPortal);
bindPortal(document.getElementById("openPortal2"));

closePortal.addEventListener("click", () => setPortal(false));
portal.addEventListener("click", (e) => {
  if (e.target === portal) setPortal(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setPortal(false);
});

document.getElementById("portalForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const btn = e.currentTarget.querySelector("button");
  btn.textContent = "OPENING WORKSPACE…";
  setTimeout(() => {
    btn.textContent = "SIGNED IN";
  }, 700);
});

function setupCarousel({
  viewport,
  track,
  itemSelector,
  prevBtn,
  nextBtn,
  dotsWrap,
  desktopView = 2,
  breakWidth = 980,
}) {
  if (!viewport || !track) return;
  const items = [...track.querySelectorAll(itemSelector)];
  if (!items.length) return;

  let index = 0;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let dx = 0;
  let locked = null;

  const perView = () => (window.innerWidth <= breakWidth ? 1 : desktopView);
  const pageCount = () => Math.ceil(items.length / perView());

  function gapSize() {
    return parseFloat(getComputedStyle(track).gap) || 16;
  }

  function go(i, animate = true) {
    const pages = pageCount();
    index = ((i % pages) + pages) % pages;
    track.style.transition = animate
      ? "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)"
      : "none";
    const w = items[0].getBoundingClientRect().width;
    const offset = index * perView() * (w + gapSize());
    track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    items.forEach((item, idx) => {
      const first = index * perView();
      const on = idx >= first && idx < first + perView();
      item.classList.toggle("is-on", on);
    });
    if (dotsWrap) {
      [...dotsWrap.children].forEach((dot, di) => {
        dot.classList.toggle("active", di === index);
      });
    }
  }

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.replaceChildren();
    for (let i = 0; i < pageCount(); i += 1) {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Go to slide ${i + 1}`);
      b.addEventListener("click", () => go(i));
      dotsWrap.appendChild(b);
    }
  }

  prevBtn?.addEventListener("click", () => go(index - 1));
  nextBtn?.addEventListener("click", () => go(index + 1));

  viewport.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    dx = 0;
    locked = null;
    track.style.transition = "none";
    viewport.setPointerCapture?.(pointerId);
  });

  viewport.addEventListener("pointermove", (e) => {
    if (pointerId === null || e.pointerId !== pointerId) return;
    const mx = e.clientX - startX;
    const my = e.clientY - startY;
    if (!locked && Math.hypot(mx, my) > 8) {
      locked = Math.abs(mx) > Math.abs(my) ? "x" : "y";
    }
    if (locked !== "x") return;
    dx = mx;
    const w = items[0].getBoundingClientRect().width;
    const offset = index * perView() * (w + gapSize());
    track.style.transform = `translate3d(${-offset + dx}px, 0, 0)`;
  });

  const endPointer = (e) => {
    if (pointerId === null || (e && e.pointerId !== pointerId)) return;
    pointerId = null;
    if (locked === "x") {
      if (dx < -48) go(index + 1);
      else if (dx > 48) go(index - 1);
      else go(index);
    } else {
      go(index, false);
    }
    locked = null;
    dx = 0;
  };

  viewport.addEventListener("pointerup", endPointer);
  viewport.addEventListener("pointercancel", endPointer);

  window.addEventListener("resize", () => {
    buildDots();
    go(Math.min(index, pageCount() - 1), false);
  });

  buildDots();
  go(0, false);
}

setupCarousel({
  viewport: document.getElementById("caseCarousel"),
  track: document.getElementById("caseGrid"),
  itemSelector: ".case-page",
  prevBtn: document.querySelector("#portfolio [data-dir='-1']"),
  nextBtn: document.querySelector("#portfolio [data-dir='1']"),
  dotsWrap: document.getElementById("caseDots"),
  desktopView: 1,
  breakWidth: 0,
});

setupCarousel({
  viewport: document.getElementById("quoteCarousel"),
  track: document.getElementById("quotes"),
  itemSelector: ".quote-page",
  prevBtn: document.getElementById("prevQuote"),
  nextBtn: document.getElementById("nextQuote"),
  dotsWrap: document.getElementById("dots"),
  desktopView: 1,
  breakWidth: 0,
});

const navLinks = [...document.querySelectorAll(".nav-links a")];

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => {
        const href = a.getAttribute("href");
        if (href && href.startsWith("#") && href !== "#portal") {
          a.classList.toggle("active", href === `#${entry.target.id}`);
        }
      });
    });
  },
  { threshold: 0.35 }
);

["home", "work", "process", "about", "portfolio", "contact"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) io.observe(el);
});

function initReveals() {
  const revealIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        revealIo.unobserve(entry.target);
      });
    },
    { threshold: 0.14 }
  );

  document.querySelectorAll(".reveal").forEach((el) => revealIo.observe(el));

  function countUp(el) {
    const target = Number(el.dataset.count || 0);
    const start = performance.now();
    const duration = 1100;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = `${Math.round(target * p)}+`;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const statsIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll("[data-count]").forEach(countUp);
        statsIo.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  const statsRow = document.querySelector(".stats");
  if (statsRow) statsIo.observe(statsRow);
}

(function initLoader() {
  const loader = document.getElementById("pageLoader");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const release = () => {
    document.documentElement.classList.remove("is-loading");
    initReveals();
  };

  if (!loader || reduce) {
    loader?.remove();
    release();
    return;
  }

  let closed = false;
  let finishing = false;
  const MIN = 2600;

  const dismiss = () => {
    if (closed) return;
    closed = true;
    loader.classList.add("is-done");
    release();
    const drop = () => loader.remove();
    loader.addEventListener("transitionend", (e) => {
      if (e.target === loader && e.propertyName === "clip-path") drop();
    });
    setTimeout(drop, 1100);
  };

  const started = performance.now();
  const finish = () => {
    if (finishing) return;
    finishing = true;
    const wait = Math.max(0, MIN - (performance.now() - started));
    setTimeout(dismiss, wait);
  };

  if (document.readyState === "complete") finish();
  else window.addEventListener("load", finish);
  setTimeout(finish, 5000);
})();
