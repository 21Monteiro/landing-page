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
    investimento: [
      "A partir de R$ 900",
      "R$ 1.500 a R$ 3.000",
      "R$ 3.000 a R$ 6.000",
      "Acima de R$ 6.000",
      "Ainda não sei"
    ],

    // Faixa que só existe para certos serviços. R$ 900 é o piso de landing
    // page: site institucional, e-commerce e página Bio não saem por esse
    // valor, então a opção some quando a pessoa escolhe outro serviço.
    // Chave = texto exato da faixa, valor = lista de serviços que a liberam.
    investimentoRestrito: {
      "A partir de R$ 900": ["Landing Page"]
    },

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
    // São duas contas com propósitos diferentes:
    // "sites" fala de trabalho, "pessoal" fala de vida.
    instagramSites:   "https://www.instagram.com/apenasites/",
    instagramPessoal: "https://www.instagram.com/21monteiro_/",
    youtube: "https://www.youtube.com/@21Monteiro",
    behance: "https://www.behance.net/21monteiro"
  },

  /* ---- NÚMEROS DO HERO -------------------------------------------------- */
  numeros: [
    { valor: 7,  prefixo: "+", sufixo: " Anos",  rotulo: "de experiência" },
    { valor: 50, prefixo: "+", sufixo: " Sites", rotulo: "criados" }
  ],

  /* ---- SERVIÇOS --------------------------------------------------------- */
  servicos: [
    {
      icone: "servicoLanding",
      titulo: "Landing Page",
      descricao: "Uma página só, feita para transformar quem chega em contato no WhatsApp.",
      zap: "Olá! Vim direto do seu portfólio. Gostaria de fazer uma landing page com você."
    },
    {
      icone: "servicoInstitucional",
      titulo: "Site Institucional",
      descricao: "O site que mostra o tamanho real da sua empresa para quem pesquisa antes de ligar.",
      zap: "Olá! Vim direto do seu portfólio. Gostaria de fazer um site institucional com você."
    },
    {
      icone: "servicoEcommerce",
      titulo: "E-commerce",
      descricao: "Sua loja vendendo online, com catálogo organizado e compra sem atrito.",
      zap: "Olá! Vim direto do seu portfólio. Gostaria de fazer um e-commerce com você."
    },
    {
      icone: "servicoBio",
      titulo: "Página Bio",
      descricao: "Um link só na bio, levando o cliente direto para onde você quer que ele vá.",
      zap: "Olá! Vim direto do seu portfólio. Gostaria de fazer uma página Bio com você."
    }
  ],

  /* ---- PROJETOS --------------------------------------------------------- *
   * "imagem"   = o mockup do notebook que aparece no cartão.
   * "completa" = o print da página inteira, que abre ao clicar (lightbox).
   * "link"     = site do cliente no ar. Se preencher, aparece um botão
   *              extra "Visitar site" além do print. Deixe "" se não houver.
   * "imagemMobile" / "completaMobile" = as mesmas duas imagens, mas com o
   *              print da versão de celular. Quem abre o site no telefone vê
   *              o mockup do aparelho e o print do celular, não o do desktop.
   * "credito"  = selo discreto abaixo da descrição, para o projeto entregue
   *              por intermédio de uma agência. Deixe "" quando o trabalho
   *              foi contratado direto pelo cliente.
   * -------------------------------------------------------------------- */
  projetos: [
    {
      imagem: "/assets/img/proj-editoracoerencia.webp",
      completa: "/assets/img/proj-editoracoerencia-completo.webp",
      imagemMobile: "/assets/img/proj-editoracoerencia-mobile.webp",
      completaMobile: "/assets/img/proj-editoracoerencia-mobile-completo.webp",
      cliente: "Editora Coerência",
      titulo: "Site Institucional",
      categoria: "Institucional",
      descricao: "Vitrine dos lançamentos da editora, com leitura fluida do catálogo e caminho curto até a compra.",
      link: "https://editoracoerencia.com.br/",
      credito: "Via agência Realiize"
    },
    {
      imagem: "/assets/img/proj-conveniocerto.webp",
      completa: "/assets/img/proj-conveniocerto-completo.webp",
      imagemMobile: "/assets/img/proj-conveniocerto-mobile.webp",
      completaMobile: "/assets/img/proj-conveniocerto-mobile-completo.webp",
      cliente: "Convênio Certo",
      titulo: "Site Institucional",
      categoria: "Institucional",
      descricao: "Site institucional que organiza os planos e facilita o contato de quem procura convênio.",
      link: "https://conveniocerto.com.br/",
      credito: "Via agência Realiize"
    },
    {
      imagem: "/assets/img/proj-ift.webp",
      completa: "/assets/img/proj-ift-completo.webp",
      imagemMobile: "/assets/img/proj-ift-mobile.webp",
      completaMobile: "/assets/img/proj-ift-mobile-completo.jpg",
      cliente: "IFT Escola de Pregadores",
      titulo: "Landing Page",
      categoria: "Landing Page",
      descricao: "Página de inscrição da turma 2026, com grade, professores e matrícula em um fluxo só.",
      link: "https://iftescoladepregadores.com.br/",
      credito: ""
    },
    {
      imagem: "/assets/img/proj-realiize.webp",
      completa: "/assets/img/proj-realiize-completo.webp",
      imagemMobile: "/assets/img/proj-realiize-mobile.webp",
      completaMobile: "/assets/img/proj-realiize-mobile-completo.jpg",
      cliente: "Realiize",
      titulo: "Site Institucional",
      categoria: "Institucional",
      descricao: "Site da agência: diagnóstico, método e prova organizados para gerar reunião com empresas.",
      link: "https://realiize.com.br/",
      credito: ""
    },
    {
      imagem: "/assets/img/proj-fivon.webp",
      completa: "/assets/img/proj-fivon-completo.webp",
      imagemMobile: "/assets/img/proj-fivon-mobile.webp",
      completaMobile: "/assets/img/proj-fivon-mobile-completo.webp",
      cliente: "Fivon Marketing",
      titulo: "Site Institucional",
      categoria: "Institucional",
      descricao: "Site da agência, posicionando marketing como construção de ativo e não como verba queimada.",
      link: "https://fivonmarketing.com.br/",
      credito: ""
    },
    {
      imagem: "/assets/img/proj-vaccaroco.webp",
      completa: "/assets/img/proj-vaccaroco-completo.webp",
      imagemMobile: "/assets/img/proj-vaccaroco-mobile.webp",
      completaMobile: "/assets/img/proj-vaccaroco-mobile-completo.webp",
      cliente: "Vaccaro Company",
      titulo: "Site Institucional",
      categoria: "Institucional",
      descricao: "Site do grupo de energia, organizando operação, ativos e autoridade para clientes de grande porte.",
      link: "https://vaccarocompany.com.br/",
      credito: "Via agência Realiize"
    },
    {
      imagem: "/assets/img/proj-nkrtintas.webp",
      completa: "/assets/img/proj-nkrtintas-completo.webp",
      imagemMobile: "/assets/img/proj-nkrtintas-mobile.webp",
      completaMobile: "/assets/img/proj-nkrtintas-mobile-completo.webp",
      cliente: "NKR Tintas",
      titulo: "E-commerce",
      categoria: "E-commerce",
      descricao: "Loja online de tintas com catálogo por categoria e compra direta, para a operação de Campinas.",
      link: "https://nkrtintasloja.com.br/",
      credito: "Via agência Realiize"
    },
    {
      imagem: "/assets/img/proj-camisetas.webp",
      completa: "/assets/img/proj-camisetas-completo.webp",
      imagemMobile: "/assets/img/proj-camisetas-mobile.webp",
      completaMobile: "/assets/img/proj-camisetas-mobile-completo.jpg",
      cliente: "Camisetas para Corrida",
      titulo: "Landing Page",
      categoria: "Landing Page",
      descricao: "Página de camisetas esportivas personalizadas, construída para puxar o pedido direto no WhatsApp.",
      link: "https://camisetasparacorrida.com.br/",
      credito: "Via agência First/Fivon"
    },
    {
      imagem: "/assets/img/proj-dompet.webp",
      completa: "/assets/img/proj-dompet-completo.webp",
      imagemMobile: "/assets/img/proj-dompet-mobile.webp",
      completaMobile: "/assets/img/proj-dompet-mobile-completo.jpg",
      cliente: "Dom Pet Resort",
      titulo: "Site Institucional",
      categoria: "Institucional",
      descricao: "Apresentação completa da estrutura do resort, com foco em gerar reservas pelo WhatsApp.",
      link: "https://dompetresort.com.br/",
      credito: "Via agência Realiize"
    },
    {
      imagem: "/assets/img/proj-vaccaroconsulting.webp",
      completa: "/assets/img/proj-vaccaroconsulting-completo.webp",
      imagemMobile: "/assets/img/proj-vaccaroconsulting-mobile.webp",
      completaMobile: "/assets/img/proj-vaccaroconsulting-mobile-completo.jpg",
      cliente: "Vaccaro Consulting",
      titulo: "Landing Page",
      categoria: "Landing Page",
      descricao: "Página de análise da conta de energia, feita para captar empresas que querem reduzir custo fixo.",
      link: "https://vaccaroconsulting.com.br/",
      credito: "Via agência Realiize"
    },
    {
      imagem: "/assets/img/proj-dominicci.webp",
      completa: "/assets/img/proj-dominicci-completo.webp",
      imagemMobile: "/assets/img/proj-dominicci-mobile.webp",
      completaMobile: "/assets/img/proj-dominicci-mobile-completo.webp",
      cliente: "Dominicci Contabilidade",
      titulo: "Site Institucional",
      categoria: "Institucional",
      descricao: "Site que apresenta os serviços contábeis e encurta o caminho entre a dúvida e o contato.",
      link: "https://dominiccicontabilidade.com.br/",
      credito: ""
    },
    {
      imagem: "/assets/img/proj-essencia.webp",
      completa: "/assets/img/proj-essencia-completo.webp",
      imagemMobile: "/assets/img/proj-essencia-mobile.webp",
      completaMobile: "/assets/img/proj-essencia-mobile-completo.webp",
      cliente: "Essência Audiovisual",
      titulo: "Landing Page",
      categoria: "Landing Page",
      descricao: "Página da produtora, feita para transformar visitante em conversa sobre projeto de vídeo.",
      link: "https://essenciaudiovisual.com.br/",
      credito: ""
    },
    {
      imagem: "/assets/img/proj-equilibrium.png",
      completa: "/assets/img/proj-equilibrium-completo.webp",
      cliente: "Equilibrium",
      titulo: "Página Bio",
      categoria: "Página Bio",
      descricao: "Todos os canais da marca reunidos em uma página só, pensada para o link da bio do Instagram.",
      link: "",
      credito: ""
    }
  ],

  /* ---- DEPOIMENTOS ------------------------------------------------------ *
   * LISTA VAZIA = a seção inteira some do site, junto com o link dela no
   * menu (desktop e mobile). Nada mais precisa ser mexido.
   *
   * Para reativar: apague os [] e cole os blocos de volta, no formato:
   *   {
   *     foto: "/assets/img/cliente-ana.webp",
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
      banner: "/assets/img/banner-whatsapp.webp",
      titulo: "Entre em contato via WhatsApp",
      url: "https://wa.me/5511950218840?text=" + encodeURIComponent("Olá! Vim direto da sua página BIO. Gostaria de saber mais sobre seus serviços.")
    },
    {
      banner: "/assets/img/banner-portfolio.webp",
      titulo: "Ver meu portfólio de sites",
      url: "/"
    },
    {
      icone: "instagram",
      titulo: "@apenasites",
      descricao: "Os sites que eu crio, e os bastidores deles",
      url: "https://www.instagram.com/apenasites/"
    },
    {
      icone: "behance",
      titulo: "Behance",
      descricao: "Meus projetos de design em detalhe",
      url: "https://www.behance.net/21monteiro"
    },

    /* Daqui para baixo o assunto muda: não é mais trabalho, é vida. */
    {
      icone: "cerebro",
      etiqueta: "Curso",
      titulo: "Reset Mental",
      descricao: "Para quem está exausto de cabeça e quer voltar a pensar com clareza",
      url: "https://pay.cakto.com.br/yobiobw_1014216",
      destaque: true
    },
    {
      icone: "instagram",
      titulo: "@21monteiro_",
      descricao: "Desenvolvimento pessoal e outras coisas da vida",
      url: "https://www.instagram.com/21monteiro_/"
    },
    {
      icone: "youtube",
      titulo: "YouTube",
      descricao: "Vídeos sobre cansaço mental e outros nós do dia a dia",
      url: "https://www.youtube.com/@21Monteiro"
    }
  ]
};

/* Um `const` no topo de um script clássico NÃO vira propriedade de window
   (só `var` e funções fazem isso). Expomos explicitamente para o main.js. */
window.DADOS = DADOS;
