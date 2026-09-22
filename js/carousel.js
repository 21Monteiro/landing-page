/* ============================================================================
   21MONTEIRO — CARROSSEL
   Substitui o Swiper do site antigo. Zero dependências, ~2KB.
   Usa scroll nativo + scroll-snap: arrasto no touch funciona de graça.
   ========================================================================== */

(function () {
  "use strict";

  function iniciarCarrossel(seletor) {
    document.querySelectorAll(seletor).forEach(montar);
  }

  function montar(carrossel) {
    const trilho = carrossel.querySelector(".carrossel-trilho");
    if (!trilho) return;

    // Os controles podem ficar fora do .carrossel (ex.: no cabeçalho da seção),
    // então procuramos primeiro dentro e depois na seção que envolve os dois.
    const escopo = carrossel.closest("section") || document;
    const achar = (sel) => carrossel.querySelector(sel) || escopo.querySelector(sel);

    const btnAnt  = achar("[data-carrossel='anterior']");
    const btnProx = achar("[data-carrossel='proximo']");
    const pontos  = achar(".carrossel-pontos");

    const itens = Array.from(trilho.children);
    if (!itens.length) return;

    /* ---- Pontos de navegação --------------------------------------------- */
    if (pontos) {
      pontos.innerHTML = itens.map((_, i) => `
        <button class="carrossel-ponto" type="button"
                data-indice="${i}"
                aria-label="Ir para o item ${i + 1} de ${itens.length}"></button>
      `).join("");

      pontos.addEventListener("click", (e) => {
        const btn = e.target.closest(".carrossel-ponto");
        if (btn) irPara(Number(btn.dataset.indice));
      });
    }

    /* ---- Navegação -------------------------------------------------------- */
    /* Posição do item dentro da área rolável do trilho.
       Usamos rects porque offsetLeft ignora o padding-inline do trilho
       e depende de qual ancestral é o offsetParent. */
    function deslocamento(item) {
      return trilho.scrollLeft +
             (item.getBoundingClientRect().left - trilho.getBoundingClientRect().left);
    }

    function irPara(indice) {
      const item = itens[Math.max(0, Math.min(indice, itens.length - 1))];
      if (!item) return;
      // Centraliza o item; scrollIntoView arrastaria a página junto
      const alvo = deslocamento(item) - (trilho.clientWidth - item.offsetWidth) / 2;
      trilho.scrollTo({ left: Math.max(0, alvo), behavior: "smooth" });
    }

    function indiceAtual() {
      // O item cujo centro está mais próximo do centro visível do trilho
      const centroTrilho = trilho.scrollLeft + trilho.clientWidth / 2;
      let melhor = 0;
      let menorDist = Infinity;

      itens.forEach((item, i) => {
        const centroItem = deslocamento(item) + item.offsetWidth / 2;
        const dist = Math.abs(centroItem - centroTrilho);
        if (dist < menorDist) { menorDist = dist; melhor = i; }
      });

      return melhor;
    }

    function passo() {
      // Rola por "página" visível, respeitando o gap
      const gap = parseFloat(getComputedStyle(trilho).columnGap || "0") || 0;
      return itens[0].offsetWidth + gap;
    }

    btnAnt?.addEventListener("click", () => {
      trilho.scrollBy({ left: -passo(), behavior: "smooth" });
    });

    btnProx?.addEventListener("click", () => {
      trilho.scrollBy({ left: passo(), behavior: "smooth" });
    });

    /* ---- Teclado ---------------------------------------------------------- */
    trilho.setAttribute("tabindex", "0");
    trilho.setAttribute("role", "region");
    trilho.setAttribute("aria-label", "Galeria de projetos");

    trilho.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft")  { e.preventDefault(); btnAnt?.click(); }
      if (e.key === "ArrowRight") { e.preventDefault(); btnProx?.click(); }
    });

    /* ---- Sincroniza estado ao rolar --------------------------------------- */
    function atualizar() {
      const atual = indiceAtual();

      if (pontos) {
        Array.from(pontos.children).forEach((p, i) => {
          if (i === atual) p.setAttribute("aria-current", "true");
          else p.removeAttribute("aria-current");
        });
      }

      // Desabilita as setas nos extremos (tolerância de 2px)
      const noInicio = trilho.scrollLeft <= 2;
      const noFim = trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 2;

      if (btnAnt)  btnAnt.disabled = noInicio;
      if (btnProx) btnProx.disabled = noFim;
    }

    let agendado = false;
    trilho.addEventListener("scroll", () => {
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(() => { atualizar(); agendado = false; });
    }, { passive: true });

    window.addEventListener("resize", atualizar);

    // Imagens em lazy-load mudam o layout ao carregar
    trilho.querySelectorAll("img").forEach((img) => {
      if (!img.complete) img.addEventListener("load", atualizar, { once: true });
    });

    atualizar();
  }

  window.iniciarCarrossel = iniciarCarrossel;
})();
