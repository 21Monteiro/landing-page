/* ============================================================================
   BANNER DE CONSENTIMENTO (LGPD) + RASTREAMENTO
   ----------------------------------------------------------------------------
   Nada de rastreamento roda antes da escolha do visitante. Os IDs ficam em
   js/dados.js, bloco `rastreamento`:

     gtm:   Google Tag Manager  (ex.: "GTM-ABC1234")  → categoria "análise"
     pixel: Pixel da Meta       (ex.: "123456789012345") → categoria "marketing"

   Campo vazio = a ferramenta simplesmente não carrega. O banner aparece do
   mesmo jeito, porque o formulário já guarda dados no navegador.

   A escolha fica salva por 180 dias. Qualquer link com [data-cookies]
   reabre o painel (o rodapé tem um "Preferências de cookies").

   Quando um lead é enviado, o lead.js dispara o evento "lead:enviado".
   Aqui ele vira `Lead` no Pixel e `gerar_lead` no dataLayer do GTM, mas
   só se o visitante tiver aceitado a categoria correspondente.
   ========================================================================== */

(function () {
  "use strict";

  const CHAVE = "cookies_consentimento";
  const VALIDADE_DIAS = 180;

  const cfg = () => (window.DADOS && DADOS.rastreamento) || {};

  let escolha = null;        // { analise: bool, marketing: bool, quando: ms }
  let gtmCarregado = false;
  let pixelCarregado = false;
  let painel = null;

  /* ---- MEMÓRIA DA ESCOLHA ------------------------------------------------ */

  function lerEscolha() {
    try {
      const d = JSON.parse(localStorage.getItem(CHAVE) || "null");
      if (!d || !d.quando) return null;
      const idade = (Date.now() - d.quando) / 86400000;
      return idade <= VALIDADE_DIAS ? d : null;
    } catch { return null; }
  }

  function salvarEscolha(analise, marketing) {
    escolha = { analise: !!analise, marketing: !!marketing, quando: Date.now() };
    try { localStorage.setItem(CHAVE, JSON.stringify(escolha)); } catch { /* sem storage */ }
    aplicar();
  }

  /* ---- CARREGAMENTO DAS FERRAMENTAS -------------------------------------- */

  function gtag() { window.dataLayer.push(arguments); }

  function estadoConsentimento() {
    const s = (ok) => (ok ? "granted" : "denied");
    return {
      analytics_storage:  s(escolha && escolha.analise),
      ad_storage:         s(escolha && escolha.marketing),
      ad_user_data:       s(escolha && escolha.marketing),
      ad_personalization: s(escolha && escolha.marketing)
    };
  }

  function carregarGTM(id) {
    window.dataLayer = window.dataLayer || [];
    // Consent Mode v2: o GTM nasce sabendo o que foi autorizado
    gtag("consent", "default", estadoConsentimento());
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);
    gtmCarregado = true;
  }

  function carregarPixel(id) {
    /* Snippet oficial da Meta, só reescrito em forma legível */
    if (!window.fbq) {
      const fbq = function () {
        fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
      };
      fbq.push = fbq; fbq.loaded = true; fbq.version = "2.0"; fbq.queue = [];
      window.fbq = window._fbq = fbq;
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(s);
    }
    window.fbq("init", id);
    window.fbq("track", "PageView");
    pixelCarregado = true;
  }

  function aplicar() {
    if (!escolha) return;
    const { gtm, pixel } = cfg();

    if (gtm && (escolha.analise || escolha.marketing)) {
      if (!gtmCarregado) carregarGTM(gtm.trim());
      else gtag("consent", "update", estadoConsentimento());
    } else if (gtmCarregado) {
      gtag("consent", "update", estadoConsentimento());
    }

    if (pixel && escolha.marketing && !pixelCarregado) carregarPixel(pixel.trim());
    if (pixelCarregado && !escolha.marketing) window.fbq("consent", "revoke");
    if (pixelCarregado && escolha.marketing)  window.fbq("consent", "grant");
  }

  /* ---- EVENTO DE CONVERSÃO ----------------------------------------------- */

  window.addEventListener("lead:enviado", (e) => {
    const d = e.detail || {};
    if (gtmCarregado) {
      window.dataLayer.push({ event: "gerar_lead", servico: d.servico || "", pagina: d.pagina || "" });
    }
    if (pixelCarregado && escolha && escolha.marketing) {
      window.fbq("track", "Lead", { content_name: d.servico || "" });
    }
  });

  /* ---- PAINEL ------------------------------------------------------------ */

  function montarPainel() {
    const politica = cfg().politicaCookies || "/politica-de-cookies/";
    const el = document.createElement("section");
    el.className = "consentimento";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-labelledby", "consentimento-titulo");
    el.setAttribute("aria-describedby", "consentimento-texto");
    el.innerHTML = `
      <p class="consentimento-titulo" id="consentimento-titulo">Sua privacidade</p>
      <p class="consentimento-texto" id="consentimento-texto">
        Uso cookies para o site funcionar e, com a sua permissão, para medir
        visitas e melhorar anúncios. Você escolhe.
        <a href="${politica}">Política de Cookies</a>
      </p>

      <div class="consentimento-opcoes" hidden>
        <label class="consentimento-opcao">
          <input type="checkbox" checked disabled>
          <span><strong>Essenciais</strong> Formulário e esta escolha. Sempre ativos.</span>
        </label>
        <label class="consentimento-opcao">
          <input type="checkbox" data-categoria="analise">
          <span><strong>Análise</strong> Contagem de visitas e páginas mais vistas.</span>
        </label>
        <label class="consentimento-opcao">
          <input type="checkbox" data-categoria="marketing">
          <span><strong>Marketing</strong> Pixel da Meta, para anúncios mais relevantes.</span>
        </label>
      </div>

      <div class="consentimento-acoes">
        <button type="button" class="consentimento-btn principal" data-acao="aceitar">Aceitar todos</button>
        <button type="button" class="consentimento-btn" data-acao="recusar">Só essenciais</button>
        <button type="button" class="consentimento-btn link" data-acao="personalizar">Personalizar</button>
        <button type="button" class="consentimento-btn principal" data-acao="salvar" hidden>Salvar escolha</button>
      </div>
    `;

    el.addEventListener("click", (e) => {
      const acao = e.target.closest("[data-acao]")?.dataset.acao;
      if (!acao) return;
      if (acao === "aceitar") { salvarEscolha(true, true); fecharPainel(); }
      if (acao === "recusar") { salvarEscolha(false, false); fecharPainel(); }
      if (acao === "personalizar") mostrarOpcoes(true);
      if (acao === "salvar") {
        const marcado = (c) => el.querySelector(`[data-categoria="${c}"]`).checked;
        salvarEscolha(marcado("analise"), marcado("marketing"));
        fecharPainel();
      }
    });

    document.body.appendChild(el);
    return el;
  }

  function mostrarOpcoes(sim) {
    painel.querySelector(".consentimento-opcoes").hidden = !sim;
    painel.querySelector('[data-acao="salvar"]').hidden = !sim;
    painel.querySelector('[data-acao="personalizar"]').hidden = sim;
    painel.querySelector('[data-acao="aceitar"]').hidden = sim;
    if (sim) painel.querySelector('[data-categoria="analise"]').focus();
  }

  function abrirPainel(comOpcoes) {
    if (!painel) painel = montarPainel();
    painel.querySelector('[data-categoria="analise"]').checked   = !!(escolha && escolha.analise);
    painel.querySelector('[data-categoria="marketing"]').checked = !!(escolha && escolha.marketing);
    mostrarOpcoes(!!comOpcoes);
    painel.classList.add("aberto");
  }

  function fecharPainel() {
    if (painel) painel.classList.remove("aberto");
  }

  /* ---- INICIALIZAÇÃO ----------------------------------------------------- */

  function iniciar() {
    escolha = lerEscolha();
    if (escolha) aplicar();
    else abrirPainel(false);

    document.addEventListener("click", (e) => {
      const gatilho = e.target.closest("[data-cookies]");
      if (!gatilho) return;
      e.preventDefault();
      abrirPainel(true);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
