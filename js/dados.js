/* ============================================================================
   21MONTEIRO — ARQUIVO DE CONTEÚDO
   ----------------------------------------------------------------------------
   Este é o ÚNICO arquivo que você precisa editar para atualizar o site.
   Troque textos, links e imagens aqui. O site se monta sozinho.
   ========================================================================== */

const DADOS = {

  /* ---- FORMULÁRIO DE PRÉ-QUALIFICAÇÃO ----------------------------------- *
   * Todo botão de WhatsApp abre este formulário antes de redirecionar.
   *
   * COLE AQUI a URL do Apps Script depois de implantar (passo a passo no
   * arquivo apps-script/COMO-INSTALAR.md). Ela termina em /exec.
   *
   * Enquanto estiver vazio o site continua funcionando: o formulário aparece
   * normal e os dados vão dentro da mensagem do WhatsApp — só não são
   * gravados na planilha.
   * -------------------------------------------------------------------- */
  formulario: {
    endpoint: "https://script.google.com/macros/s/AKfycbyd_pS_hHSAF8D6Pxer5TQKcj0DuR9zxq7BEk6mYtfepjY-1Z4o4gGOKi8dgjRI5tB65Q/exec",

    // Dias antes de perguntar de novo a quem já preencheu. 0 = sempre perguntar.
    lembrarPorDias: 7,

    // Faixas de investimento (o filtro que separa curioso de cliente).
    // A primeira deixa claro o piso: R$ 900 é o ponto de entrada, e é
    // landing page — evita que alguém peça e-commerce por esse valor.
    investimento: [
      "A partir de R$ 900 · Landing page",
      "R$ 1.500 a R$ 3.000",
      "R$ 3.000 a R$ 6.000",
      "Acima de R$ 6.000",
      "Ainda não sei"
    ],

    // Urgência
    prazo: [
      "O quanto antes",
      "Nas próximas semanas",
      "Daqui a 1 ou 2 meses",
      "Só pesquisando por enquanto"
    ]
  },

  /* ---- CONTATO E REDES -------------------------------------------------- */
  contato: {
    whatsapp: "5511950218840",
    email: "contato21monteiro@gmail.com",
    instagram: "https://www.instagram.com/21monteiro_/",
    youtube: "https://www.youtube.com/@21Monteiro",
    behance: "https://www.behance.net/lildzn"
  },

  /* ---- NÚMEROS DO HERO -------------------------------------------------- */
  numeros: [
    { valor: 3,  prefixo: "+", sufixo: " Anos",  rotulo: "de experiência" },
    { valor: 12, prefixo: "+", sufixo: " Sites", rotulo: "criados" }
  ],

  /* ---- SERVIÇOS --------------------------------------------------------- */
  servicos: [
    {
      icone: "assets/icons/landing-page.svg",
      titulo: "Landing Page",
      descricao: "Uma página rápida, bonita e com foco total em gerar conversão.",
      zap: "Olá! Vim direto do seu portfólio. Gostaria de fazer uma landing page com você."
    },
    {
      icone: "assets/icons/site-institucional.svg",
      titulo: "Site Institucional",
      descricao: "Facilite as informações para seu cliente e dê um rosto profissional à sua marca.",
      zap: "Olá! Vim direto do seu portfólio. Gostaria de fazer um site institucional com você."
    },
    {
      icone: "assets/icons/ecommerce.svg",
      titulo: "E-commerce",
      descricao: "Perfeito para quem deseja vender produtos através de uma loja online.",
      zap: "Olá! Vim direto do seu portfólio. Gostaria de fazer um e-commerce com você."
    },
    {
      icone: "assets/icons/pagina-bio.svg",
      titulo: "Página Bio",
      descricao: "Uma página única reunindo os principais links da sua empresa.",
      zap: "Olá! Vim direto do seu portfólio. Gostaria de fazer uma página Bio com você."
    }
  ],

  /* ---- PROJETOS --------------------------------------------------------- *
   * "imagem"   = o mockup do notebook que aparece no cartão.
   * "completa" = o print da página inteira, que abre ao clicar (lightbox).
   * "link"     = site do cliente no ar. Se preencher, aparece um botão
   *              extra "Visitar site" além do print. Deixe "" se não houver.
   * -------------------------------------------------------------------- */
  projetos: [
    {
      imagem: "assets/img/projeto-01.png",
      completa: "assets/img/projeto-01-completo.webp",
      cliente: "Equilibrium",
      titulo: "Página Bio",
      categoria: "Página Bio",
      descricao: "Todos os canais da marca reunidos em uma página só, pensada para o link da bio do Instagram.",
      link: ""
    },
    {
      imagem: "assets/img/projeto-02.png",
      completa: "assets/img/projeto-02-completo.webp",
      cliente: "Convênio Certo",
      titulo: "Site Institucional",
      categoria: "Institucional",
      descricao: "Site institucional que organiza os planos e facilita o contato de quem procura convênio.",
      link: ""
    },
    {
      imagem: "assets/img/projeto-03.png",
      completa: "assets/img/projeto-03-completo.webp",
      cliente: "Dom Pet Resort",
      titulo: "Site Institucional",
      categoria: "Institucional",
      descricao: "Apresentação completa da estrutura do resort, com foco em gerar reservas pelo WhatsApp.",
      link: ""
    },
    {
      imagem: "assets/img/projeto-04.png",
      completa: "assets/img/projeto-04-completo.webp",
      cliente: "Manual MIX",
      titulo: "Landing Page",
      categoria: "Landing Page",
      descricao: "Página única focada em conversão, com copy direta e um só caminho para a ação.",
      link: ""
    }
  ],

  /* ---- DEPOIMENTOS ------------------------------------------------------ *
   * LISTA VAZIA = a seção inteira some do site, junto com o link dela no
   * menu (desktop e mobile). Nada mais precisa ser mexido.
   *
   * Para reativar: apague os [] e cole os blocos de volta, no formato:
   *   {
   *     foto: "assets/img/cliente-ana.webp",
   *     nome: "Ana Ribeiro",
   *     cargo: "Proprietária · Studio Bella",
   *     texto: "Em duas semanas o site estava no ar e já trouxe cliente.",
   *     nota: 5
   *   }
   * -------------------------------------------------------------------- */
  depoimentos: [],

  /* ---- LINK BIO — MENU DE DESTINOS -------------------------------------- *
   * Ordem = prioridade (de cima para baixo na tela).
   *
   * Um item pode ser de dois tipos:
   *   a) COM BANNER  → use "banner". A arte ocupa o card inteiro.
   *                    O "titulo" vira o texto alternativo (leitores de tela).
   *   b) SEM BANNER  → usa "icone" + "titulo" + "descricao".
   *                    Ícones: whatsapp, portfolio, behance, instagram,
   *                            youtube, site, email
   *
   * Banners têm 773x246 (proporção 3,14:1). Mantenha essa proporção
   * ao criar novos, senão a arte corta.
   * -------------------------------------------------------------------- */
  bioLinks: [
    {
      banner: "assets/img/banner-whatsapp.webp",
      titulo: "Entre em contato via WhatsApp",
      url: "https://wa.me/5511950218840?text=" + encodeURIComponent("Olá! Vim direto da sua página BIO. Gostaria de saber mais sobre seus serviços.")
    },
    {
      banner: "assets/img/banner-portfolio.webp",
      titulo: "Ver meu portfólio de sites",
      url: "index.html"
    },
    {
      icone: "cerebro",
      etiqueta: "Curso",
      titulo: "Reset Mental",
      descricao: "Para quem está exausto de cabeça e quer voltar a pensar com clareza",
      url: "https://pay.cakto.com.br/yobiobw_1014216",
      destaque: true
    },
    {
      icone: "behance",
      titulo: "Behance",
      descricao: "Meus projetos de design em detalhe",
      url: "https://www.behance.net/lildzn"
    },
    {
      icone: "instagram",
      titulo: "Instagram pessoal",
      descricao: "Bastidores e conteúdo sobre web",
      url: "https://www.instagram.com/21monteiro_/"
    },
    {
      icone: "youtube",
      titulo: "YouTube",
      descricao: "Vídeos e tutoriais",
      url: "https://www.youtube.com/@21Monteiro"
    }
  ]
};

/* Um `const` no topo de um script clássico NÃO vira propriedade de window
   (só `var` e funções fazem isso). Expomos explicitamente para o main.js. */
window.DADOS = DADOS;
