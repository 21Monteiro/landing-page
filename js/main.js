/* ============================================================================
   21MONTEIRO — SCRIPT PRINCIPAL
   Monta o conteúdo a partir de dados.js e cuida das interações.
   ========================================================================== */

(function () {
  "use strict";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- ÍCONES (inline, sem requisição externa) --------------------------- */
  const ICONES = {
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.8h-.02a9.8 9.8 0 0 1-4.99-1.37l-.36-.21-3.71.97.99-3.62-.23-.37a9.77 9.77 0 0 1-1.5-5.22c0-5.4 4.4-9.8 9.81-9.8 2.62 0 5.08 1.03 6.93 2.88a9.74 9.74 0 0 1 2.87 6.93c0 5.4-4.4 9.8-9.79 9.8m8.34-18.14A11.71 11.71 0 0 0 12.05 0C5.55 0 .26 5.29.26 11.79c0 2.08.54 4.1 1.57 5.89L.16 24l6.46-1.69a11.74 11.74 0 0 0 5.42 1.38h.01c6.5 0 11.79-5.29 11.79-11.79 0-3.15-1.23-6.11-3.45-8.34"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07c-1.28.06-2.15.26-2.91.56-.79.31-1.46.72-2.13 1.38A5.9 5.9 0 0 0 .63 4.14c-.3.76-.5 1.63-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.28.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13a5.9 5.9 0 0 0 2.13 1.38c.76.3 1.63.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.28-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.63.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.63-.5-2.91-.56C15.67.01 15.26 0 12 0m0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8m7.85-10.41a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.08 0 12 0 12s0 3.92.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.81M9.55 15.57V8.43L15.82 12l-6.27 3.57"/></svg>',
    behance: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7.44 4.5c.7 0 1.34.06 1.92.19.58.12 1.07.32 1.48.6.41.28.73.65.95 1.11.23.46.34 1.04.34 1.72 0 .74-.17 1.35-.5 1.84-.34.49-.84.89-1.5 1.2.9.26 1.58.72 2.02 1.37.44.66.67 1.45.67 2.37 0 .75-.15 1.4-.44 1.94-.29.55-.68 1-1.17 1.34-.49.35-1.06.6-1.69.77-.63.16-1.28.25-1.95.25H0V4.5h7.44m-.45 5.64c.58 0 1.05-.14 1.42-.41.37-.28.55-.72.55-1.34 0-.34-.06-.63-.18-.85a1.32 1.32 0 0 0-.5-.52 2.1 2.1 0 0 0-.71-.26 4.6 4.6 0 0 0-.84-.07H3.3v3.45h3.69m.2 5.92c.32 0 .63-.03.92-.1.29-.06.55-.17.77-.32.22-.15.4-.36.53-.62.13-.26.2-.6.2-1 0-.79-.22-1.35-.66-1.69-.44-.34-1.03-.5-1.75-.5H3.3v4.23h3.89M16.9 15.9c.44.43 1.08.65 1.91.65.6 0 1.11-.15 1.54-.45.43-.3.7-.62.79-.95h2.4c-.38 1.2-.97 2.05-1.77 2.56-.79.51-1.75.77-2.88.77-.78 0-1.49-.13-2.12-.38a4.45 4.45 0 0 1-1.6-1.08 4.8 4.8 0 0 1-1.02-1.68 6.15 6.15 0 0 1-.35-2.13c0-.76.12-1.46.36-2.11a4.9 4.9 0 0 1 2.65-2.8 5.3 5.3 0 0 1 2.08-.4c.85 0 1.6.17 2.23.5.64.32 1.16.77 1.57 1.32.41.56.7 1.19.88 1.9.18.71.24 1.45.19 2.22h-7.24c0 .85.28 1.63.72 2.06m3.36-5.6c-.35-.38-.92-.59-1.66-.59-.48 0-.89.08-1.21.25a2.4 2.4 0 0 0-.76.6c-.19.24-.32.5-.4.77-.07.27-.11.51-.13.72h4.48c-.13-.7-.35-1.19-.7-1.57M15.2 5.4h5.6v1.36h-5.6z"/></svg>',
    portfolio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M2 13h20"/></svg>',
    site: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
    cerebro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.6 6.5a3 3 0 0 0 .4-1.375"/><path d="M6 5.125A3 3 0 0 0 6.4 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/></svg>',
    /* Ícones dos tipos de site. Inline e em currentColor: acompanham a cor
       da marca sozinhos, sem o filtro que achatava os SVGs antigos. */
    servicoLanding: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3.5" width="18" height="17" rx="2.5"/><path d="M3 8h18"/><circle cx="6" cy="5.75" r=".5" fill="currentColor"/><path d="M7 11.5h10M7 14.5h6"/><path d="M14.5 16.5h3.2a1.6 1.6 0 0 1 0 3.2h-3.2a1.6 1.6 0 0 1 0-3.2z"/></svg>',
    servicoInstitucional: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21V5.5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2V21"/><path d="M15 10.5h3a2 2 0 0 1 2 2V21"/><path d="M2.5 21h19"/><path d="M8 7.5h3M8 11h3M8 14.5h3"/><path d="M17.5 14.5v3"/></svg>',
    servicoEcommerce: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 7.5h15l-1.1 11.6a2 2 0 0 1-2 1.9H7.6a2 2 0 0 1-2-1.9z"/><path d="M8.5 10.5V6.2a3.5 3.5 0 0 1 7 0v4.3"/></svg>',
    servicoBio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2.8"/><path d="M10.5 4.6h3"/><rect x="8.5" y="8" width="7" height="2.6" rx="1.3"/><rect x="8.5" y="12" width="7" height="2.6" rx="1.3"/><rect x="8.5" y="16" width="7" height="2.6" rx="1.3"/></svg>',

    seta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    setaExterna: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/></svg>',
    estrela: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 2.9 6.26 6.6.78-4.9 4.6 1.3 6.6L12 17.1 6.1 20.24l1.3-6.6-4.9-4.6 6.6-.78z"/></svg>',
    lupa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/></svg>',
    fechar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>'
  };

  /* ---- HELPERS ----------------------------------------------------------- */
  const escapar = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));

  const linkZap = (numero, mensagem) =>
    `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

  /* ---- HEADER: fundo ao rolar -------------------------------------------- */
  function iniciarHeader() {
    const header = $(".cabecalho");
    if (!header) return;

    const aoRolar = () => header.classList.toggle("rolado", window.scrollY > 24);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
  }

  /* ---- MENU MOBILE ------------------------------------------------------- */
  function iniciarMenuMobile() {
    const botao = $(".botao-menu");
    const menu  = $(".menu-mobile");
    if (!botao || !menu) return;

    const alternar = (abrir) => {
      botao.setAttribute("aria-expanded", String(abrir));
      menu.classList.toggle("aberto", abrir);
      document.body.classList.toggle("travado", abrir);
    };

    botao.addEventListener("click", () => {
      alternar(botao.getAttribute("aria-expanded") !== "true");
    });

    // Fecha ao clicar em qualquer link do menu
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) alternar(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("aberto")) {
        alternar(false);
        botao.focus();
      }
    });
  }

  /* ---- NAV ATIVA CONFORME A SEÇÃO VISÍVEL -------------------------------- */
  function iniciarNavAtiva() {
    const links = $$(".nav-desktop .nav-link[href^='#']");
    if (!links.length) return;

    const porId = new Map(
      links.map((l) => [l.getAttribute("href").slice(1), l])
    );

    const secoes = Array.from(porId.keys())
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!secoes.length) return;

    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        const link = porId.get(entrada.target.id);
        if (!link) return;
        if (entrada.isIntersecting) {
          links.forEach((l) => l.removeAttribute("aria-current"));
          link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    secoes.forEach((s) => obs.observe(s));
  }

  /* ---- BARRA DE PROGRESSO DA ROLAGEM ------------------------------------- */
  function iniciarProgresso() {
    // Só faz sentido em páginas longas
    if (document.body.classList.contains("pagina-bio")) return;

    const barra = document.createElement("div");
    barra.className = "progresso";
    document.body.appendChild(barra);

    let agendado = false;
    const atualizar = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const p = total > 0 ? window.scrollY / total : 0;
      barra.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
    };

    window.addEventListener("scroll", () => {
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(() => { atualizar(); agendado = false; });
    }, { passive: true });

    window.addEventListener("resize", atualizar);
    atualizar();
  }

  /* ---- CAMADA DE GRÃO ---------------------------------------------------- */
  function iniciarGrao() {
    const g = document.createElement("div");
    g.className = "grao";
    g.setAttribute("aria-hidden", "true");
    document.body.appendChild(g);
  }

  /* ---- REVELAR AO ROLAR -------------------------------------------------- */
  function iniciarRevelar() {
    const alvos = $$(".revelar");
    if (!alvos.length) return;

    if (semMovimento) {
      alvos.forEach((a) => a.classList.add("visivel"));
      return;
    }

    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add("visivel");
        obs.unobserve(entrada.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

    alvos.forEach((a) => obs.observe(a));
  }

  /* ---- CONTADORES ANIMADOS ----------------------------------------------- */
  function iniciarContadores() {
    const alvos = $$("[data-contador]");
    if (!alvos.length) return;

    const animar = (el) => {
      const destino = Number(el.dataset.contador) || 0;
      if (semMovimento) { el.textContent = destino; return; }

      const duracao = 1400;
      const inicio  = performance.now();

      const passo = (agora) => {
        const p = Math.min((agora - inicio) / duracao, 1);
        // easeOutExpo
        const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = Math.round(destino * e);
        if (p < 1) requestAnimationFrame(passo);
      };

      requestAnimationFrame(passo);
    };

    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        animar(entrada.target);
        obs.unobserve(entrada.target);
      });
    }, { threshold: 0.5 });

    alvos.forEach((a) => obs.observe(a));
  }

  /* ---- BRILHO QUE SEGUE O CURSOR (cards de serviço) ---------------------- */
  function iniciarBrilho() {
    if (semMovimento || !window.matchMedia("(hover: hover)").matches) return;

    $$(".servico").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---- BOTÃO FLUTUANTE DO WHATSAPP --------------------------------------- */
  function iniciarZapFlutuante() {
    const zap = $(".zap-flutuante");
    if (!zap) return;

    const aoRolar = () => zap.classList.toggle("visivel", window.scrollY > 600);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
  }

  /* ========================================================================
     MONTAGEM DO CONTEÚDO A PARTIR DE dados.js
     ===================================================================== */

  function montarServicos() {
    const alvo = $("#lista-servicos");
    if (!alvo || !window.DADOS) return;

    alvo.innerHTML = DADOS.servicos.map((s) => `
      <article class="cartao servico revelar">
        <div class="servico-icone">${ICONES[s.icone] || ICONES.site}</div>
        <h3>${escapar(s.titulo)}</h3>
        <p>${escapar(s.descricao)}</p>
        <a class="btn btn-contorno" href="${escapar(linkZap(DADOS.contato.whatsapp, s.zap))}"
           target="_blank" rel="noopener">
          Tenho interesse ${ICONES.seta}
        </a>
      </article>
    `).join("");
  }

  function montarNumeros() {
    const alvo = $("#lista-numeros");
    if (!alvo || !window.DADOS) return;

    alvo.innerHTML = DADOS.numeros.map((n) => `
      <div class="prova">
        <span class="prova-valor">
          ${escapar(n.prefixo || "")}<span data-contador="${escapar(n.valor)}">0</span>${escapar(n.sufixo || "")}
        </span>
        <span class="prova-rotulo">${escapar(n.rotulo)}</span>
      </div>
    `).join("");
  }

  function montarProjetos() {
    const alvo = $("#trilho-projetos");
    if (!alvo || !window.DADOS) return;

    alvo.innerHTML = DADOS.projetos.map((p, i) => {
      const temSite = p.link && p.link !== "#";

      // O mockup é um botão: clicar abre o print da página inteira.
      // Se além disso houver site no ar, ganha um segundo link.
      return `
        <article class="cartao projeto revelar">
          <button class="projeto-midia" type="button" data-lightbox="${i}"
                  aria-label="Ver a página completa do projeto ${escapar(p.titulo)} para ${escapar(p.cliente)}">
            <span class="projeto-tag">${escapar(p.categoria)}</span>
            <img src="${escapar(p.imagem)}" alt="Mockup do site da ${escapar(p.cliente)} em um notebook" loading="lazy">
            <span class="projeto-lupa">${ICONES.lupa}<span>Ver página completa</span></span>
          </button>
          <div class="projeto-corpo">
            <span class="projeto-cliente">${escapar(p.cliente)}</span>
            <h3>${escapar(p.titulo)}</h3>
            <p>${escapar(p.descricao)}</p>
            <div class="projeto-acoes">
              <button class="projeto-link" type="button" data-lightbox="${i}">
                Ver página completa ${ICONES.lupa}
              </button>
              ${temSite ? `
                <a class="projeto-link projeto-link-site" href="${escapar(p.link)}" target="_blank" rel="noopener">
                  Visitar site ${ICONES.setaExterna}
                </a>` : ""}
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  function montarDepoimentos() {
    const secao = $("#depoimentos");
    const alvo  = $("#lista-depoimentos");
    if (!alvo || !window.DADOS) return;

    // Sem depoimentos cadastrados, a seção inteira some — junto com os links
    // que apontavam para ela (no menu desktop o link não está dentro de <li>)
    if (!DADOS.depoimentos.length) {
      if (secao) secao.remove();
      $$('a[href="#depoimentos"]').forEach((l) => (l.closest("li") || l).remove());
      return;
    }

    alvo.innerHTML = DADOS.depoimentos.map((d) => `
      <article class="cartao depoimento revelar">
        <div class="estrelas" role="img" aria-label="${escapar(d.nota)} de 5 estrelas">
          ${ICONES.estrela.repeat(Math.max(0, Math.min(5, d.nota || 5)))}
        </div>
        <p>${escapar(d.texto)}</p>
        <footer class="depoimento-autor">
          <img src="${escapar(d.foto)}" alt="" loading="lazy" width="46" height="46">
          <div>
            <strong>${escapar(d.nome)}</strong>
            <span>${escapar(d.cargo)}</span>
          </div>
        </footer>
      </article>
    `).join("");
  }

  function montarContatos() {
    if (!window.DADOS) return;
    const c = DADOS.contato;

    // Links de WhatsApp genéricos (header, hero, CTA final, botão flutuante)
    $$("[data-zap]").forEach((el) => {
      const msg = el.dataset.zap || "Olá! Vim do seu site e gostaria de fazer um orçamento.";
      el.href = linkZap(c.whatsapp, msg);
      el.target = "_blank";
      el.rel = "noopener";
    });

    // E-mail
    $$("[data-email]").forEach((el) => {
      el.href = `mailto:${c.email}`;
      if (el.dataset.email === "texto") el.textContent = c.email;
    });

    // Redes sociais
    const redes = {
      instagram: c.instagramSites,          // padrão no portfólio: a conta de trabalho
      instagramSites: c.instagramSites,
      instagramPessoal: c.instagramPessoal,
      youtube: c.youtube,
      behance: c.behance
    };
    $$("[data-rede]").forEach((el) => {
      const url = redes[el.dataset.rede];
      if (url) el.href = url;
    });

    // Ano corrente no rodapé
    $$("[data-ano]").forEach((el) => { el.textContent = new Date().getFullYear(); });
  }

  /* ---- LIGHTBOX DA PÁGINA COMPLETA --------------------------------------- *
   * Os prints são muito verticais (ex.: 837x2560), então o visualizador
   * mostra a imagem em largura de página e deixa rolar por dentro.
   * ---------------------------------------------------------------------- */
  function iniciarLightbox() {
    const gatilhos = $$("[data-lightbox]");
    if (!gatilhos.length || !window.DADOS) return;

    let aberto = false;
    let indice = 0;
    let focoAnterior = null;

    // Monta a caixa uma única vez
    const caixa = document.createElement("div");
    caixa.className = "lightbox";
    caixa.setAttribute("role", "dialog");
    caixa.setAttribute("aria-modal", "true");
    caixa.setAttribute("aria-label", "Visualização da página completa");
    caixa.hidden = true;
    caixa.innerHTML = `
      <div class="lightbox-fundo" data-fechar></div>
      <div class="lightbox-painel">
        <header class="lightbox-topo">
          <div>
            <span class="lightbox-cliente"></span>
            <strong class="lightbox-titulo"></strong>
          </div>
          <div class="lightbox-acoes">
            <button class="lightbox-btn" type="button" data-navegar="-1" aria-label="Projeto anterior">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
            </button>
            <button class="lightbox-btn" type="button" data-navegar="1" aria-label="Próximo projeto">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
            <button class="lightbox-btn lightbox-fechar" type="button" data-fechar aria-label="Fechar">
              ${ICONES.fechar}
            </button>
          </div>
        </header>
        <div class="lightbox-rolagem">
          <img class="lightbox-img" src="" alt="">
        </div>
        <footer class="lightbox-rodape">
          <span class="lightbox-dica">Role para ver a página inteira</span>
          <a class="btn btn-primario lightbox-cta" href="#">Quero um site assim</a>
        </footer>
      </div>
    `;
    document.body.appendChild(caixa);

    const elCliente  = $(".lightbox-cliente", caixa);
    const elTitulo   = $(".lightbox-titulo", caixa);
    const elImg      = $(".lightbox-img", caixa);
    const elRolagem  = $(".lightbox-rolagem", caixa);
    const elCta      = $(".lightbox-cta", caixa);
    const btnFechar  = $(".lightbox-fechar", caixa);

    function mostrar(i) {
      const total = DADOS.projetos.length;
      indice = (i + total) % total;               // volta ao início ao passar do fim
      const p = DADOS.projetos[indice];

      elCliente.textContent = p.cliente;
      elTitulo.textContent  = p.titulo;
      elImg.src = p.completa || p.imagem;
      elImg.alt = `Página completa do projeto ${p.titulo} para ${p.cliente}`;
      elRolagem.scrollTop = 0;

      elCta.href = linkZap(
        DADOS.contato.whatsapp,
        `Olá! Vi o projeto da ${p.cliente} no seu portfólio e gostaria de algo parecido.`
      );
      elCta.target = "_blank";
      elCta.rel = "noopener";
    }

    function abrir(i) {
      focoAnterior = document.activeElement;
      mostrar(i);
      caixa.hidden = false;
      // Força um frame antes da classe, para a transição acontecer
      requestAnimationFrame(() => caixa.classList.add("aberto"));
      document.body.classList.add("travado");
      aberto = true;
      btnFechar.focus();
    }

    function fechar() {
      caixa.classList.remove("aberto");
      document.body.classList.remove("travado");
      aberto = false;
      // Só esconde de fato depois da transição
      setTimeout(() => { if (!aberto) caixa.hidden = true; }, semMovimento ? 0 : 280);
      focoAnterior?.focus();
    }

    gatilhos.forEach((g) => {
      g.addEventListener("click", () => abrir(Number(g.dataset.lightbox)));
    });

    caixa.addEventListener("click", (e) => {
      if (e.target.closest("[data-fechar]")) { fechar(); return; }
      const nav = e.target.closest("[data-navegar]");
      if (nav) mostrar(indice + Number(nav.dataset.navegar));
    });

    document.addEventListener("keydown", (e) => {
      if (!aberto) return;
      if (e.key === "Escape")     { e.preventDefault(); fechar(); }
      if (e.key === "ArrowLeft")  { e.preventDefault(); mostrar(indice - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); mostrar(indice + 1); }

      // Prende o foco dentro da caixa enquanto ela estiver aberta
      if (e.key === "Tab") {
        const focaveis = $$("button, a[href]", caixa).filter((el) => el.offsetParent !== null);
        if (!focaveis.length) return;
        const primeiro = focaveis[0];
        const ultimo   = focaveis[focaveis.length - 1];
        if (e.shiftKey && document.activeElement === primeiro) {
          e.preventDefault(); ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault(); primeiro.focus();
        }
      }
    });
  }

  /* ---- LINK BIO ---------------------------------------------------------- */
  function montarBio() {
    const alvo = $("#bio-menu");
    if (!alvo || !window.DADOS) return;

    alvo.innerHTML = DADOS.bioLinks.map((l, i) => {
      const externo = /^https?:/i.test(l.url);
      const atrib   = externo ? 'target="_blank" rel="noopener"' : "";

      // Item com arte própria: o banner é o card inteiro.
      // As 3 primeiras artes são as que carregam a dobra — sem lazy nelas.
      if (l.banner) {
        return `
          <li style="--i:${i}">
            <a class="bio-banner" href="${escapar(l.url)}" ${atrib}>
              <img src="${escapar(l.banner)}" alt="${escapar(l.titulo)}"
                   width="773" height="246"
                   ${i < 3 ? 'fetchpriority="high"' : 'loading="lazy"'}>
            </a>
          </li>
        `;
      }

      // Item de texto: ícone + título + descrição
      return `
        <li style="--i:${i}">
          <a class="bio-item${l.destaque ? " destaque" : ""}"
             href="${escapar(l.url)}" ${atrib}>
            <span class="bio-item-icone">${ICONES[l.icone] || ICONES.site}</span>
            <span class="bio-item-texto">
              <span class="bio-item-titulo">
                ${escapar(l.titulo)}${l.etiqueta ? `<span class="bio-etiqueta">${escapar(l.etiqueta)}</span>` : ""}
              </span>
              <span class="bio-item-desc">${escapar(l.descricao)}</span>
            </span>
            <span class="bio-item-seta">${ICONES.seta}</span>
          </a>
        </li>
      `;
    }).join("");
  }

  /* ---- INICIALIZAÇÃO ----------------------------------------------------- */
  function iniciar() {
    // 1) Conteúdo primeiro — os observers precisam dos elementos no DOM
    montarNumeros();
    montarServicos();
    montarProjetos();
    montarDepoimentos();
    montarBio();
    montarContatos();

    // 2) Interações
    iniciarHeader();
    iniciarMenuMobile();
    iniciarNavAtiva();
    iniciarRevelar();
    iniciarContadores();
    iniciarBrilho();
    iniciarZapFlutuante();
    iniciarLightbox();
    iniciarProgresso();
    iniciarGrao();

    // 3) Carrossel de projetos (carousel.js)
    if (typeof window.iniciarCarrossel === "function") {
      window.iniciarCarrossel(".carrossel");
    }
  }

  // Expõe os ícones para o carousel.js
  window.ICONES_21M = ICONES;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
