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

const quotes = [...document.querySelectorAll("#quotes .quote")];
const dotsWrap = document.getElementById("dots");
let qIndex = 0;

quotes.forEach((_, i) => {
  const b = document.createElement("button");
  b.type = "button";
  if (i === 0) b.classList.add("active");
  b.addEventListener("click", () => showQuote(i));
  dotsWrap.appendChild(b);
});

function showQuote(i) {
  qIndex = (i + quotes.length) % quotes.length;
  quotes.forEach((card, idx) => {
    card.style.opacity = idx === qIndex || window.innerWidth > 680 ? "1" : "0.45";
    if (window.innerWidth <= 680) {
      card.style.display = idx === qIndex ? "block" : "none";
    } else {
      card.style.display = "block";
    }
  });
  [...dotsWrap.children].forEach((d, idx) => d.classList.toggle("active", idx === qIndex));
}

document.getElementById("prevQuote").addEventListener("click", () => showQuote(qIndex - 1));
document.getElementById("nextQuote").addEventListener("click", () => showQuote(qIndex + 1));
window.addEventListener("resize", () => showQuote(qIndex));
showQuote(0);

document.querySelectorAll(".arrows button[data-dir]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const dir = Number(btn.dataset.dir);
    document.getElementById("caseGrid").scrollBy({
      left: dir * 360,
      behavior: "smooth",
    });
  });
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
