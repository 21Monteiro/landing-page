/* ============================================================================
   21MONTEIRO — PRÉ-QUALIFICAÇÃO DE LEAD
   ----------------------------------------------------------------------------
   Todo clique em um botão de WhatsApp abre este formulário. Ao enviar:
     1. os dados vão para a planilha (Apps Script), via sendBeacon
     2. o visitante é levado ao WhatsApp com a mensagem já qualificada

   Princípio que guia o arquivo: NUNCA perder o lead. Se a planilha estiver
   fora do ar, sem internet ou mal configurada, o visitante chega ao WhatsApp
   do mesmo jeito — e a mensagem leva os dados junto, então a qualificação
   não se perde nem assim.
   ========================================================================== */

(function () {
  "use strict";

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const CHAVE_MEMORIA = "21m_lead";

  let caixa = null;      // o <dialog> do formulário
  let contexto = {};     // de qual botão veio o clique
  let enviando = false;

  /* ---- HELPERS ----------------------------------------------------------- */

  const cfg = () => (window.DADOS && DADOS.formulario) || {};

  const escapar = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));

  /* Só os dígitos, do jeito que a validação e a planilha querem */
  const digitos = (s) => String(s).replace(/\D/g, "");

  /* (11) 91234-5678 — formata enquanto a pessoa digita */
  function mascararTelefone(v) {
    const d = digitos(v).slice(0, 11);
    if (d.length <= 2)  return d.length ? `(${d}` : "";
    if (d.length <= 6)  return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  /* Celular brasileiro: 11 dígitos, DDD válido e 9 na frente do número */
  function telefoneValido(v) {
    const d = digitos(v);
    if (d.length !== 11) return false;
    if (Number(d.slice(0, 2)) < 11) return false;
    return d[2] === "9";
  }

  /* Parâmetros de campanha, para saber de qual anúncio veio o lead */
  function pegarUTMs() {
    const p = new URLSearchParams(location.search);
    const out = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]
      .forEach((k) => { if (p.get(k)) out[k] = p.get(k); });
    return out;
  }

  /* ---- MEMÓRIA DE QUEM JÁ PREENCHEU -------------------------------------- */

  function leadSalvo() {
    const dias = Number(cfg().lembrarPorDias || 0);
    if (!dias) return null;
    try {
      const bruto = localStorage.getItem(CHAVE_MEMORIA);
      if (!bruto) return null;
      const d = JSON.parse(bruto);
      const idade = (Date.now() - (d.quando || 0)) / 86400000;
      return idade <= dias ? d : null;
    } catch { return null; }   // modo privado, storage bloqueado, JSON corrompido
  }

  function salvarLead(d) {
    try {
      localStorage.setItem(CHAVE_MEMORIA, JSON.stringify({ ...d, quando: Date.now() }));
    } catch { /* sem storage: só não lembra na próxima, nada quebra */ }
  }

  /* ---- MONTAGEM DA MENSAGEM DO WHATSAPP ---------------------------------- *
     A mensagem carrega a qualificação. Assim, mesmo que a planilha falhe,
     os dados chegam até você pelo próprio WhatsApp.
     ---------------------------------------------------------------------- */
  function montarMensagem(d) {
    const linhas = [
      d.mensagemBase || "Olá! Vim pelo seu site.",
      "",
      `*Nome:* ${d.nome}`,
      `*Projeto:* ${d.servico}`,
      `*Investimento:* ${d.investimento}`,
      `*Início:* ${d.prazo}`
    ];
    if (d.detalhe) linhas.push("", `*Sobre o projeto:* ${d.detalhe}`);
    return linhas.join("\n");
  }

  function linkWhatsApp(d) {
    const numero = (window.DADOS && DADOS.contato.whatsapp) || "";
    return `https://wa.me/${numero}?text=${encodeURIComponent(montarMensagem(d))}`;
  }

  /* ---- ENVIO PARA A PLANILHA --------------------------------------------- *
     sendBeacon é feito exatamente para isto: entrega a requisição mesmo que
     a página seja abandonada no instante seguinte. Sem ele, o redirecionamento
     para o WhatsApp cancelaria o envio no meio.
     ---------------------------------------------------------------------- */
  function enviarParaPlanilha(dados) {
    const url = (cfg().endpoint || "").trim();
    if (!url) {
      console.warn("[21M] Endpoint da planilha não configurado em dados.js — " +
                   "o lead segue para o WhatsApp, mas não será gravado.");
      return false;
    }

    const corpo = JSON.stringify(dados);

    // text/plain evita o preflight CORS, que o Apps Script não responde bem
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([corpo], { type: "text/plain;charset=UTF-8" });
        if (navigator.sendBeacon(url, blob)) return true;
      }
    } catch { /* cai no fetch abaixo */ }

    try {
      fetch(url, {
        method: "POST",
        mode: "no-cors",
        keepalive: true,                       // sobrevive à navegação
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: corpo
      }).catch(() => {});
      return true;
    } catch {
      return false;
    }
  }

  /* ---- CONSTRUÇÃO DO FORMULÁRIO ------------------------------------------ */

  function servicosDisponiveis() {
    const lista = (window.DADOS && DADOS.servicos) ? DADOS.servicos.map((s) => s.titulo) : [];
    return lista.length ? lista.concat("Outro") : ["Landing Page", "Site Institucional", "E-commerce", "Página Bio", "Outro"];
  }

  function opcoes(lista, selecionado) {
    return lista.map((o) =>
      `<option value="${escapar(o)}"${o === selecionado ? " selected" : ""}>${escapar(o)}</option>`
    ).join("");
  }

  function construir() {
    if (caixa) return caixa;

    const c = cfg();
    caixa = document.createElement("div");
    caixa.className = "lead";
    caixa.setAttribute("role", "dialog");
    caixa.setAttribute("aria-modal", "true");
    caixa.setAttribute("aria-labelledby", "lead-titulo");
    caixa.hidden = true;

    caixa.innerHTML = `
      <div class="lead-fundo" data-fechar></div>
      <div class="lead-painel">
        <button class="lead-x" type="button" data-fechar aria-label="Fechar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>

        <header class="lead-topo">
          <p class="sobretitulo">Quase lá</p>
          <h2 id="lead-titulo">Me conta rapidinho sobre o seu projeto</h2>
          <p class="lead-sub">
            São 30 segundos. Assim eu já chego na conversa sabendo o que
            você precisa, em vez de ficar perguntando o básico.
          </p>
        </header>

        <form class="lead-form" novalidate>
          <div class="lead-campo">
            <label for="lead-nome">Seu nome</label>
            <input id="lead-nome" name="nome" type="text" autocomplete="name"
                   placeholder="Como posso te chamar?" required>
            <span class="lead-erro" data-erro="nome"></span>
          </div>

          <div class="lead-campo">
            <label for="lead-fone">Seu WhatsApp</label>
            <input id="lead-fone" name="telefone" type="tel" inputmode="numeric"
                   autocomplete="tel" placeholder="(11) 91234-5678" required>
            <span class="lead-erro" data-erro="telefone"></span>
          </div>

          <div class="lead-campo">
            <label for="lead-servico">O que você precisa?</label>
            <select id="lead-servico" name="servico"></select>
          </div>

          <div class="lead-campo">
            <label for="lead-investimento">Quanto pretende investir?</label>
            <select id="lead-investimento" name="investimento">
              ${opcoes(c.investimento || [])}
            </select>
          </div>

          <div class="lead-campo">
            <label for="lead-prazo">Quando quer começar?</label>
            <select id="lead-prazo" name="prazo">
              ${opcoes(c.prazo || [])}
            </select>
          </div>

          <div class="lead-campo">
            <label for="lead-detalhe">Algo mais que eu deva saber? <span>(opcional)</span></label>
            <textarea id="lead-detalhe" name="detalhe" rows="2"
                      placeholder="Ex.: já tenho logo, preciso de loja com Pix..."></textarea>
          </div>

          <button class="btn btn-primario btn-bloco lead-enviar" type="submit">
            <span class="lead-enviar-texto">Continuar no WhatsApp</span>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.8h-.02a9.8 9.8 0 0 1-4.99-1.37l-.36-.21-3.71.97.99-3.62-.23-.37a9.77 9.77 0 0 1-1.5-5.22c0-5.4 4.4-9.8 9.81-9.8 2.62 0 5.08 1.03 6.93 2.88a9.74 9.74 0 0 1 2.87 6.93c0 5.4-4.4 9.8-9.79 9.8m8.34-18.14A11.71 11.71 0 0 0 12.05 0C5.55 0 .26 5.29.26 11.79c0 2.08.54 4.1 1.57 5.89L.16 24l6.46-1.69a11.74 11.74 0 0 0 5.42 1.38h.01c6.5 0 11.79-5.29 11.79-11.79 0-3.15-1.23-6.11-3.45-8.34"/></svg>
          </button>

          <p class="lead-aviso">
            Seus dados são usados só para este contato.
            Veja a <a href="politica-de-privacidade.html" target="_blank" rel="noopener">Política de Privacidade</a>.
          </p>
        </form>
      </div>
    `;

    document.body.appendChild(caixa);
    ligarEventos();
    return caixa;
  }

  /* ---- EVENTOS ------------------------------------------------------------ */

  function ligarEventos() {
    const form  = $(".lead-form", caixa);
    const fone  = $("#lead-fone", caixa);
    const nome  = $("#lead-nome", caixa);

    fone.addEventListener("input", (e) => {
      const pos = e.target.selectionStart === e.target.value.length;
      e.target.value = mascararTelefone(e.target.value);
      if (pos) e.target.setSelectionRange(e.target.value.length, e.target.value.length);
    });

    // Limpa o erro assim que a pessoa começa a corrigir
    [nome, fone].forEach((campo) => {
      campo.addEventListener("input", () => mostrarErro(campo.name, ""));
    });

    caixa.addEventListener("click", (e) => {
      if (e.target.closest("[data-fechar]")) fechar();
    });

    document.addEventListener("keydown", (e) => {
      if (caixa.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); fechar(); }
      if (e.key === "Tab") prenderFoco(e);
    });

    form.addEventListener("submit", enviar);
  }

  function prenderFoco(e) {
    const focaveis = $$("button, input, select, textarea, a[href]", caixa)
      .filter((el) => !el.disabled && el.offsetParent !== null);
    if (!focaveis.length) return;
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault(); ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault(); primeiro.focus();
    }
  }

  function mostrarErro(campo, msg) {
    const el = $(`[data-erro="${campo}"]`, caixa);
    if (el) el.textContent = msg;
    const input = $(`[name="${campo}"]`, caixa);
    if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  /* ---- ABRIR / FECHAR ----------------------------------------------------- */

  let focoAnterior = null;

  function abrir(ctx) {
    contexto = ctx || {};
    construir();

    // Pré-seleciona o serviço conforme o botão clicado
    const sel = $("#lead-servico", caixa);
    sel.innerHTML = opcoes(servicosDisponiveis(), contexto.servico);

    // Reaproveita o que a pessoa já informou antes
    const salvo = leadSalvo();
    if (salvo) {
      $("#lead-nome", caixa).value = salvo.nome || "";
      $("#lead-fone", caixa).value = salvo.telefone || "";
    }

    caixa.hidden = false;
    requestAnimationFrame(() => caixa.classList.add("aberto"));
    document.body.classList.add("travado");
    focoAnterior = document.activeElement;

    // Em telas de toque, focar direto abriria o teclado por cima do formulário
    if (window.matchMedia("(min-width: 900px)").matches) {
      setTimeout(() => $("#lead-nome", caixa).focus(), 120);
    }
  }

  function fechar() {
    if (!caixa) return;
    caixa.classList.remove("aberto");
    document.body.classList.remove("travado");
    setTimeout(() => { if (!caixa.classList.contains("aberto")) caixa.hidden = true; }, 260);
    focoAnterior?.focus();
  }

  /* ---- ENVIO -------------------------------------------------------------- */

  function enviar(e) {
    e.preventDefault();
    if (enviando) return;

    const nome  = $("#lead-nome", caixa).value.trim();
    const fone  = $("#lead-fone", caixa).value.trim();

    let ok = true;
    if (nome.length < 2) { mostrarErro("nome", "Me diz seu nome, por favor."); ok = false; }
    if (!telefoneValido(fone)) {
      mostrarErro("telefone", "Confira o número: DDD + 9 dígitos.");
      ok = false;
    }
    if (!ok) {
      $(`[aria-invalid="true"]`, caixa)?.focus();
      return;
    }

    enviando = true;
    const botao = $(".lead-enviar", caixa);
    botao.disabled = true;
    $(".lead-enviar-texto", caixa).textContent = "Abrindo o WhatsApp...";

    const dados = {
      nome,
      telefone: mascararTelefone(fone),
      telefoneDigitos: digitos(fone),
      servico: $("#lead-servico", caixa).value,
      investimento: $("#lead-investimento", caixa).value,
      prazo: $("#lead-prazo", caixa).value,
      detalhe: $("#lead-detalhe", caixa).value.trim(),
      mensagemBase: contexto.mensagem || "",
      origem: contexto.origem || "",
      pagina: location.pathname.split("/").pop() || "index.html",
      referencia: document.referrer || "direto",
      enviadoEm: new Date().toISOString(),
      ...pegarUTMs()
    };

    salvarLead(dados);

    const url = linkWhatsApp(dados);

    /* A aba precisa ser aberta DENTRO do gesto do clique, senão o navegador
       bloqueia como pop-up. sendBeacon retorna na hora, sem await, então
       ainda estamos dentro do gesto aqui. */
    let janela = null;
    try { janela = window.open("", "_blank"); } catch { /* bloqueado */ }

    enviarParaPlanilha(dados);

    if (janela && !janela.closed) {
      janela.location.href = url;
    } else {
      location.href = url;   // pop-up bloqueado: segue na mesma aba
    }

    // Devolve o formulário ao estado normal, caso a pessoa volte para o site
    setTimeout(() => {
      enviando = false;
      botao.disabled = false;
      $(".lead-enviar-texto", caixa).textContent = "Continuar no WhatsApp";
      fechar();
    }, 1200);
  }

  /* ---- INTERCEPTAÇÃO DOS BOTÕES DE WHATSAPP ------------------------------- */

  /* Extrai a mensagem de um link wa.me já pronto (?text=...) */
  function mensagemDoLink(href) {
    try {
      return new URL(href, location.href).searchParams.get("text") || "";
    } catch { return ""; }
  }

  function iniciar() {
    if (!window.DADOS) return;

    /* Delegação no documento, por dois motivos:
       1. pega os botões que o main.js monta depois deste script rodar
       2. pega QUALQUER caminho até o WhatsApp — [data-zap], os banners da
          página bio e o CTA do lightbox — não só um tipo de botão */
    document.addEventListener("click", (e) => {
      const gatilho = e.target.closest('[data-zap], a[href*="wa.me"]');
      if (!gatilho) return;

      e.preventDefault();

      // Botões com data-zap trazem a mensagem no atributo;
      // links diretos trazem dentro do próprio href.
      const mensagem = gatilho.dataset.zap
        || mensagemDoLink(gatilho.getAttribute("href") || "");

      // Em banner, o texto vem do alt da imagem (o link não tem texto)
      const rotulo = (gatilho.textContent || "").replace(/\s+/g, " ").trim()
        || ($("img", gatilho)?.alt || "");

      const ctx = {
        mensagem,
        origem: rotulo.slice(0, 60),
        servico: gatilho.dataset.servico || ""
      };

      // Já preencheu há pouco? Não faz passar pelo formulário de novo.
      const salvo = leadSalvo();
      if (salvo) {
        const dados = { ...salvo, mensagemBase: ctx.mensagem, origem: ctx.origem };
        window.open(linkWhatsApp(dados), "_blank", "noopener");
        return;
      }

      abrir(ctx);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }

  // Exposto para os testes
  window.LEAD_21M = { mascararTelefone, telefoneValido, montarMensagem, linkWhatsApp };
})();
