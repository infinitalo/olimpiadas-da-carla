(function () {
  "use strict";

  const cfg = window.OLIMPIADAS_CONFIG || {};
  const STORAGE_KEY = "olimpiadas-carla-confirmado";

  // Elements
  const signup = document.getElementById("signup");
  const confirmed = document.getElementById("confirmed");
  const form = document.getElementById("rsvp-form");
  const nameInput = document.getElementById("name");
  const honeypot = document.getElementById("website");
  const submitBtn = document.getElementById("submit-btn");
  const errorEl = document.getElementById("error");
  const confirmedMsg = document.getElementById("confirmed-msg");
  const catImg = document.getElementById("cat-img");
  const resetBtn = document.getElementById("reset-btn");

  // Fallback cat (inline SVG) if the cat service is unreachable
  const FALLBACK_CAT =
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320' viewBox='0 0 320 320'>
        <rect width='320' height='320' fill='#ffe8f1'/>
        <g transform='translate(160 170)'>
          <ellipse cx='0' cy='40' rx='95' ry='80' fill='#f7a8c4'/>
          <path d='M-70 -55 L-40 -10 L-90 -5 Z' fill='#f7a8c4'/>
          <path d='M70 -55 L40 -10 L90 -5 Z' fill='#f7a8c4'/>
          <circle cx='-30' cy='20' r='9' fill='#3a2b3f'/>
          <circle cx='30' cy='20' r='9' fill='#3a2b3f'/>
          <path d='M-12 45 Q0 58 12 45' stroke='#3a2b3f' stroke-width='4' fill='none' stroke-linecap='round'/>
          <path d='M-3 35 L0 42 L3 35 Z' fill='#e0608a'/>
        </g>
        <text x='160' y='305' text-anchor='middle' font-family='sans-serif' font-size='20' fill='#b3567c'>miau! 🐾</text>
      </svg>`
    );

  // Nossos bichinhos — uma foto aleatória a cada confirmação
  const PETS = [
    "images/pet-1.jpeg",
    "images/pet-2.jpeg",
    "images/pet-3.jpeg",
    "images/pet-4.jpeg",
    "images/pet-5.jpeg",
    "images/pet-6.jpeg",
    "images/pet-7.jpeg",
    "images/pet-8.jpeg",
  ];

  function freshCatUrl() {
    return PETS[Math.floor(Math.random() * PETS.length)];
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function clearError() {
    errorEl.hidden = true;
    errorEl.textContent = "";
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle("is-loading", isLoading);
  }

  function showConfirmed(name) {
    confirmedMsg.innerHTML =
      "Boa, <strong>" + escapeHtml(name) + "</strong>! Você está oficialmente na disputa. 🏟️";
    catImg.onerror = function () {
      catImg.onerror = null;
      catImg.src = FALLBACK_CAT;
    };
    catImg.src = freshCatUrl();
    signup.hidden = true;
    confirmed.hidden = false;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Show the confirmed state on reload if this browser already signed up
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    showConfirmed(saved);
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    clearError();

    const name = nameInput.value.trim().replace(/\s+/g, " ");

    if (name.length < 2) {
      showError("Por favor, escreva seu nome 🙂");
      nameInput.focus();
      return;
    }

    if (!cfg.ENDPOINT_URL || cfg.ENDPOINT_URL.indexOf("COLE_A_URL") === 0) {
      showError("O site ainda não foi configurado (falta a URL do Apps Script).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(cfg.ENDPOINT_URL, {
        method: "POST",
        // text/plain evita o "preflight" de CORS com o Apps Script
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          token: cfg.TOKEN,
          name: name,
          website: honeypot.value, // honeypot — deve vir vazio
        }),
      });

      const data = await res.json().catch(function () {
        return { ok: false };
      });

      if (!data.ok) {
        throw new Error(data.error || "falhou");
      }

      localStorage.setItem(STORAGE_KEY, name);
      showConfirmed(name);
    } catch (err) {
      showError("Não consegui confirmar agora. Tente de novo em instantes. 😿");
      setLoading(false);
    }
  });

  resetBtn.addEventListener("click", function () {
    localStorage.removeItem(STORAGE_KEY);
    form.reset();
    setLoading(false);
    clearError();
    confirmed.hidden = true;
    signup.hidden = false;
    nameInput.focus();
  });
})();
