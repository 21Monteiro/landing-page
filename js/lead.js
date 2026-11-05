/* ============================================================================
   APNS SITES — PRÉ-QUALIFICAÇÃO DE LEAD
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

  const CHAVE_MEMORIA = "apns_lead";

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

  /* Nome legível da página para a planilha.
     Com URLs limpas o pathname vira "/" ou "/bio/", então tirar o
     último pedaço da barra devolveria vazio. */
  function nomeDaPagina() {
    const p = location.pathname.replace(/index\.html$/, "").replace(/^\/|\/$/g, "");
    // Os dois sites gravam na mesma planilha: o domínio diz de qual veio
    const site = location.hostname.replace(/^www\./, "") || "local";
    return `${site} · ${p || "home"}`;
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

  /* Nem toda faixa de investimento vale para todo serviço: R$ 900 é piso de
     landing page, e não existe site institucional, e-commerce ou página Bio
     por esse valor. A regra mora em dados.js (investimentoRestrito), para
     mudar sem mexer aqui. Faixa sem restrição aparece sempre. */
  function faixasPara(servico) {
    const c = cfg();
    const restritas = c.investimentoRestrito || {};
    return (c.investimento || []).filter((faixa) => {
      const permitidos = restritas[faixa];
      return !permitidos || permitidos.includes(servico);
    });
  }

  function construir() {
    if (caixa) return caixa;

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
            Seis perguntas rápidas, uma de cada vez. Assim eu já chego na
            conversa sabendo o que você precisa.
          </p>
          <div class="lead-progresso">
            <div class="lead-barra" role="presentation"><span class="lead-barra-cheia"></span></div>
            <span class="lead-contador" aria-live="polite"></span>
          </div>
        </header>

        <form class="lead-form" novalidate>
          <div class="lead-corpo">
            <fieldset class="lead-passo" data-passo="1">
              <legend class="lead-pergunta">Como posso te chamar?</legend>
              <input id="lead-nome" name="nome" type="text" autocomplete="name"
                     placeholder="Seu nome" required>
              <span class="lead-erro" data-erro="nome"></span>
            </fieldset>

            <fieldset class="lead-passo" data-passo="2" hidden>
              <legend class="lead-pergunta">Qual o seu WhatsApp?</legend>
              <input id="lead-fone" name="telefone" type="tel" inputmode="numeric"
                     autocomplete="tel" placeholder="(11) 91234-5678" required>
              <span class="lead-erro" data-erro="telefone"></span>
            </fieldset>

            <fieldset class="lead-passo" data-passo="3" hidden>
              <legend class="lead-pergunta">O que você precisa?</legend>
              <div class="lead-opcoes" data-grupo="servico"></div>
              <span class="lead-erro" data-erro="servico"></span>
            </fieldset>

            <fieldset class="lead-passo" data-passo="4" hidden>
              <legend class="lead-pergunta">Quanto pretende investir?</legend>
              <div class="lead-opcoes" data-grupo="investimento"></div>
              <span class="lead-erro" data-erro="investimento"></span>
            </fieldset>

            <fieldset class="lead-passo" data-passo="5" hidden>
              <legend class="lead-pergunta">Quando quer começar?</legend>
              <div class="lead-opcoes" data-grupo="prazo"></div>
              <span class="lead-erro" data-erro="prazo"></span>
            </fieldset>

            <fieldset class="lead-passo" data-passo="6" hidden>
              <legend class="lead-pergunta">
                Algo mais que eu deva saber? <span>(opcional)</span>
              </legend>
              <textarea id="lead-detalhe" name="detalhe" rows="3"
                        placeholder="Ex.: já tenho logo, preciso de loja com Pix..."></textarea>
            </fieldset>
          </div>

          <div class="lead-navegacao">
            <button class="lead-voltar" type="button" hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
              Voltar
            </button>
            <button class="btn btn-primario lead-continuar" type="button">
              Continuar
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
            <button class="btn btn-primario lead-enviar" type="submit" hidden>
              <span class="lead-enviar-texto">Continuar no WhatsApp</span>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.8h-.02a9.8 9.8 0 0 1-4.99-1.37l-.36-.21-3.71.97.99-3.62-.23-.37a9.77 9.77 0 0 1-1.5-5.22c0-5.4 4.4-9.8 9.81-9.8 2.62 0 5.08 1.03 6.93 2.88a9.74 9.74 0 0 1 2.87 6.93c0 5.4-4.4 9.8-9.79 9.8m8.34-18.14A11.71 11.71 0 0 0 12.05 0C5.55 0 .26 5.29.26 11.79c0 2.08.54 4.1 1.57 5.89L.16 24l6.46-1.69a11.74 11.74 0 0 0 5.42 1.38h.01c6.5 0 11.79-5.29 11.79-11.79 0-3.15-1.23-6.11-3.45-8.34"/></svg>
            </button>
          </div>

          <p class="lead-aviso">
            Seus dados são usados só para este contato.
            Veja a <a href="/politica-de-privacidade/" target="_blank" rel="noopener">Política de Privacidade</a>.
          </p>
        </form>
      </div>
    `;

    document.body.appendChild(caixa);
    ligarEventos();
    return caixa;
  }

  /* ---- ETAPAS -------------------------------------------------------------- *
     O formulário inteiro de uma vez assusta: são seis campos, bem mais do que
     o "nome e e-mail" que a pessoa espera. Uma pergunta por tela dá a mesma
     informação sem parecer trabalho.
     -------------------------------------------------------------------------- */

  const TOTAL_PASSOS = 6;
  let passo = 1;

  const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* As três perguntas de escolha viram botões em vez de <select>: no celular
     é um toque só, e dá para ler todas as respostas sem abrir nada. São
     <input type="radio"> de verdade, então seta do teclado e leitor de tela
     continuam funcionando sozinhos. */
  function montarGrupo(nome, lista, escolhido) {
    const caixaGrupo = $(`[data-grupo="${nome}"]`, caixa);
    if (!caixaGrupo) return;
    caixaGrupo.innerHTML = lista.map((o, i) => `
      <label class="lead-opcao">
        <input type="radio" name="${nome}" value="${escapar(o)}"
               id="lead-${nome}-${i}"${o === escolhido ? " checked" : ""}>
        <span>${escapar(o)}</span>
      </label>
    `).join("");
  }

  const escolha = (nome) => $(`input[name="${nome}"]:checked`, caixa)?.value || "";

  /* Mantém a escolha da pessoa quando ela continua válida; se a faixa que
     estava selecionada sumiu com a troca de serviço, não fica nada marcado
     e a etapa volta a pedir uma resposta. */
  function atualizarFaixas() {
    const antes = escolha("investimento");
    const lista = faixasPara(escolha("servico"));
    montarGrupo("investimento", lista, lista.includes(antes) ? antes : "");
  }

  function validarPasso(n) {
    if (n === 1) {
      const nome = $("#lead-nome", caixa).value.trim();
      if (nome.length < 2) { mostrarErro("nome", "Me diz seu nome, por favor."); return false; }
      return true;
    }
    if (n === 2) {
      if (!telefoneValido($("#lead-fone", caixa).value.trim())) {
        mostrarErro("telefone", "Confira o número: DDD + 9 dígitos.");
        return false;
      }
      return true;
    }
    const grupos = { 3: "servico", 4: "investimento", 5: "prazo" };
    if (grupos[n] && !escolha(grupos[n])) {
      mostrarErro(grupos[n], "Escolha uma opção para seguir.");
      return false;
    }
    return true;
  }

  function irPara(n) {
    passo = Math.min(Math.max(n, 1), TOTAL_PASSOS);

    $$(".lead-passo", caixa).forEach((f) => {
      f.hidden = Number(f.dataset.passo) !== passo;
    });

    const ultimo = passo === TOTAL_PASSOS;
    $(".lead-voltar", caixa).hidden = passo === 1;
    $(".lead-continuar", caixa).hidden = ultimo;
    $(".lead-enviar", caixa).hidden = !ultimo;

    $(".lead-barra-cheia", caixa).style.width = `${(passo / TOTAL_PASSOS) * 100}%`;
    $(".lead-contador", caixa).textContent = `${passo} de ${TOTAL_PASSOS}`;

    // O primeiro campo da etapa recebe o foco, menos em tela de toque: ali
    // o teclado subiria por cima da própria pergunta.
    if (window.matchMedia("(min-width: 900px)").matches) {
      const alvo = $(".lead-passo:not([hidden]) input:not([type=radio]), .lead-passo:not([hidden]) textarea", caixa);
      alvo?.focus({ preventScroll: true });
    }
  }

  function avancar() {
    if (!validarPasso(passo)) {
      $('[aria-invalid="true"]', caixa)?.focus();
      return;
    }
    if (passo < TOTAL_PASSOS) irPara(passo + 1);
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

    /* Escolher com o dedo ou com o mouse já é a resposta inteira, então a
       etapa passa sozinha. Com o teclado não: a seta percorre as opções
       disparando "change" em cada uma, e a pessoa seria empurrada para frente
       sem querer. O que separa os dois casos é o ponteiro ter encostado ali
       agora: seta de teclado não dispara pointerdown. */
    let ponteiroEm = 0;
    form.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".lead-opcao")) ponteiroEm = Date.now();
    });

    form.addEventListener("change", (e) => {
      const opcao = e.target.closest('input[type="radio"]');
      if (!opcao) return;
      mostrarErro(opcao.name, "");
      // Trocar o serviço pode derrubar a faixa escolhida, por causa da regra
      // de investimento mínimo.
      if (opcao.name === "servico") atualizarFaixas();

      // Zera na hora: um toque vale um avanço só. Sem isso, uma escolha feita
      // pelo teclado logo depois de um toque pegaria carona e pularia a etapa.
      const veioDoDedo = Date.now() - ponteiroEm < 700;
      ponteiroEm = 0;
      if (veioDoDedo) {
        setTimeout(() => { if (passo < TOTAL_PASSOS) avancar(); }, semMovimento ? 0 : 180);
      }
    });

    $(".lead-continuar", caixa).addEventListener("click", avancar);
    $(".lead-voltar", caixa).addEventListener("click", () => irPara(passo - 1));

    caixa.addEventListener("click", (e) => {
      if (e.target.closest("[data-fechar]")) fechar();
    });

    document.addEventListener("keydown", (e) => {
      if (caixa.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); fechar(); }
      if (e.key === "Tab") prenderFoco(e);
    });

    form.addEventListener("submit", (e) => {
      // Enter dentro de um campo envia o formulário. Antes da última etapa
      // isso é "quero continuar", não "quero enviar".
      if (passo < TOTAL_PASSOS) { e.preventDefault(); avancar(); return; }
      enviar(e);
    });
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
    montarGrupo("servico", servicosDisponiveis(), contexto.servico);
    montarGrupo("prazo", cfg().prazo || [], "");
    atualizarFaixas();

    // Reaproveita o que a pessoa já informou antes
    const salvo = leadSalvo();
    if (salvo) {
      $("#lead-nome", caixa).value = salvo.nome || "";
      $("#lead-fone", caixa).value = salvo.telefone || "";
    }

    // Reabriu depois de desistir no meio: volta à primeira pergunta limpa
    $$(".lead-erro", caixa).forEach((el) => { el.textContent = ""; });
    $$("[aria-invalid]", caixa).forEach((el) => el.setAttribute("aria-invalid", "false"));
    irPara(1);

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

    /* As etapas já barram campo inválido, mas a conferência final fica aqui
       de qualquer jeito: é o único ponto por onde o lead sai. Dá erro, volta
       para a etapa do campo. */
    const passoDoErro = [1, 2, 3, 4, 5].find((n) => !validarPasso(n));
    if (passoDoErro) {
      irPara(passoDoErro);
      $('[aria-invalid="true"]', caixa)?.focus();
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
      servico: escolha("servico"),
      investimento: escolha("investimento"),
      prazo: escolha("prazo"),
      detalhe: $("#lead-detalhe", caixa).value.trim(),
      mensagemBase: contexto.mensagem || "",
      origem: contexto.origem || "",
      pagina: nomeDaPagina(),
      referencia: document.referrer || "direto",
      enviadoEm: new Date().toISOString(),
      // Mesmo ID no Pixel (navegador) e na API de Conversões (Apps Script):
      // a Meta junta os dois e conta o lead uma vez só.
      eventId: "lead-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10),
      // A API de Conversões só é chamada se o visitante aceitou marketing
      consentimentoMarketing: !!(window.CONSENTIMENTO && window.CONSENTIMENTO.marketing),
      fbp: (document.cookie.match(/(?:^|; )_fbp=([^;]+)/) || [])[1] || "",
      fbc: (document.cookie.match(/(?:^|; )_fbc=([^;]+)/) || [])[1] || "",
      urlPagina: location.href.split("#")[0],
      navegador: navigator.userAgent,
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

    // Conversão para o Pixel/GTM (consentimento.js decide se pode registrar)
    window.dispatchEvent(new CustomEvent("lead:enviado", { detail: dados }));

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
