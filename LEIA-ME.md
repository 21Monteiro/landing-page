# APNS Sites — apenasites.com.br

Refação do site WordPress/Elementor em HTML, CSS e JavaScript puros.
Sem plugins, sem banco de dados, sem dependências externas.

---

## Como abrir

Clique duas vezes em `index.html`. É só isso.

Para testar como ficará no servidor de verdade (recomendado, porque alguns
navegadores bloqueiam scripts em arquivos abertos direto do disco):

```
cd "apenasites-site"
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

---

## Estrutura

```
apenasites-site/
├── index.html                      → Portfólio (página principal)
├── politica-de-privacidade/        → Política de Privacidade (APNS)
├── politica-de-cookies/            → Política de Cookies (APNS)
├── CNAME                           → apenasites.com.br (GitHub Pages)
├── css/
│   ├── base.css                    → Cores, fontes, header, rodapé, botões
│   ├── portfolio.css               → Hero, serviços, projetos, depoimentos
│   ├── consentimento.css           → Banner de cookies
│   └── legal.css                   → Páginas de política
├── js/
│   ├── dados.js                    → ★ TODO O CONTEÚDO DO SITE ESTÁ AQUI
│   ├── main.js                     → Monta as páginas e cuida das interações
│   ├── consentimento.js            → Banner de cookies + GTM/Pixel
│   └── carousel.js                 → Carrossel de projetos
└── assets/
    ├── img/                        → Fotos, logos, mockups
    ├── icons/                      → Ícones SVG dos serviços
    └── fonts/                      → Fonte "Meditative" da marca
```

---

## Para atualizar o site

**Você só precisa mexer em `js/dados.js`.** Tudo o mais se monta sozinho.

### O que ainda dá para melhorar

| Onde | O que fazer |
|---|---|
| `numeros` | Está "+50 Sites". Ajuste se o número real for outro |
| `projetos` | São 13. Para acrescentar outro cliente, veja abaixo |
| `depoimentos` | A lista está vazia, então a seção some do site. Preencha quando tiver os reais |

### Como funciona um projeto

Igual ao site antigo: **clicar no notebook abre o print da página inteira**
em um visualizador, com rolagem por dentro e setas para passar de um projeto
a outro.

```js
{
  imagem:   "assets/img/proj-dompet.webp",          // mockup no notebook (cartão)
  completa: "assets/img/proj-dompet-completo.webp", // print inteiro (abre ao clicar)
  imagemMobile:   "assets/img/proj-dompet-mobile.webp",
  completaMobile: "assets/img/proj-dompet-mobile-completo.jpg",
  cliente:  "Dom Pet Resort",
  titulo:   "Site Institucional",
  categoria:"Institucional",                        // tarja sobre a imagem
  descricao:"Apresentação completa da estrutura do resort.",
  link:     "https://dompetresort.com.br/",         // site no ar, se houver
  credito:  "Via agência Realiize"                  // selo de intermediação
}
```

O cartão do carrossel é um só por projeto. No celular ele mostra o mockup
do aparelho; no computador, o do notebook. Dentro do visualizador há um
botão **Desktop / Celular** ao lado de "Quero um site assim": clicando nele
a pessoa troca entre os dois prints sem sair do projeto. Quem chega pelo
celular já abre na versão de celular.

Projeto sem os campos `*Mobile` não ganha esse botão e fica só no print de
desktop.

O print inteiro pode terminar em `.webp` ou em `.jpg`. Páginas de celular
muito longas passam do limite de altura do WEBP e saem em JPEG; o gerador
avisa o nome final de cada arquivo.

- `link: ""` → o cartão mostra só **"Ver página completa"**.
- `link: "https://cliente.com.br"` → ganha também **"Visitar site"**.
- `credito: ""` → nenhum selo. Preencha só nos projetos entregues por
  intermédio de uma agência, por exemplo `"Via agência Realiize"`.

Dentro do visualizador, o botão "Quero um site assim" abre o WhatsApp já
citando o nome daquele cliente na mensagem.

### Adicionar um projeto novo

1. Coloque o mockup e o print completo em `assets/img/`.
2. Copie um bloco de `projetos` em `dados.js` e troque os valores.

O carrossel, os pontinhos de navegação e o visualizador se ajustam sozinhos
à quantidade de projetos.

### Trocar um depoimento

```js
{
  foto: "assets/img/cliente-ana.webp",  // coloque a foto em assets/img/
  nome: "Ana Ribeiro",
  cargo: "Proprietária · Studio Bella",
  texto: "Em duas semanas o site estava no ar e já trouxe cliente.",
  nota: 5
}
```

**Para esconder a seção de depoimentos por enquanto**, deixe a lista vazia:

```js
depoimentos: [],
```

A seção inteira e o link dela no menu somem sozinhos.

### Link Bio

A página de links agora fica no site do 21Monteiro (21monteiro.com.br).

---

## Formulário de pré-qualificação

Todo botão que leva ao WhatsApp, no portfólio, na bio, nas políticas e no
visualizador de projetos, abre antes um formulário. Ao enviar, o lead vai
para a planilha **e** para o seu WhatsApp, com a mensagem já qualificada.

O formulário é **uma pergunta por tela**, seis no total: nome, WhatsApp, o
que a pessoa precisa, quanto pretende investir, quando quer começar e uma
observação opcional. Só na última tela aparece o botão de WhatsApp. São os
mesmos campos de antes; mostrados de uma vez só, eles pareciam muito mais
trabalho do que são, e o visitante desistia antes de começar.

Nas três perguntas de escolha, tocar na resposta já passa para a próxima.
Com o teclado não passa sozinho, porque a seta percorre as opções e a pessoa
seria empurrada para frente sem querer; ali é o botão Continuar que leva.
O botão Voltar refaz o caminho sem perder nada do que já foi respondido.

**Falta um passo:** conectar a planilha. Siga o
[apps-script/COMO-INSTALAR.md](apps-script/COMO-INSTALAR.md) (uns 3 minutos) e
cole a URL em `formulario.endpoint`, no `js/dados.js`.

Enquanto o endpoint estiver vazio, o site funciona normalmente: o formulário
aparece e os dados seguem dentro da mensagem do WhatsApp, só não são gravados.

**Ajustes rápidos** (todos em `js/dados.js`, bloco `formulario`):

| Campo | O que faz |
|---|---|
| `endpoint` | URL do Apps Script |
| `lembrarPorDias` | Dias até perguntar de novo a quem já preencheu. `0` = sempre |
| `investimento` | As faixas de orçamento |
| `investimentoRestrito` | Faixa que só vale para alguns serviços |
| `prazo` | As opções de urgência |

`investimentoRestrito` é a regra que esconde a faixa de entrada: a chave é o
texto exato da faixa e o valor é a lista de serviços que a liberam.

```js
investimentoRestrito: {
  "A partir de R$ 900": ["Landing Page"]
}
```

Com isso, quem escolhe site institucional, e-commerce ou página Bio não vê
"A partir de R$ 900", porque esse valor é piso de landing page. Faixa que
não aparecer aí continua valendo para todo mundo.

As opções de "o que você precisa" saem sozinhas da lista `servicos` — não
precisa manter as duas em dia.

---

## Separação dos sites (2 de novembro de 2026)

| Site | Domínio | Repositório no GitHub | Conteúdo |
|---|---|---|---|
| **APNS Sites** (este) | apenasites.com.br | `21Monteiro/landing-page` | Portfólio + políticas |
| 21Monteiro | 21monteiro.com.br | `21Monteiro/site` | Só a página de links (bio) + políticas |

- E-mail deste site: **apnssites@gmail.com** (`contato.email` em `dados.js`).
- CNPJ e cidade ficam em `empresa`, no `dados.js`, e aparecem no rodapé.
- O formulário grava na **mesma planilha** do 21Monteiro. A coluna "Página"
  começa pelo domínio (`apenasites.com.br · home`), então dá para filtrar.
- O arquivo `CNAME` diz ao GitHub Pages qual domínio é este. Não apague.

### Banner de cookies e rastreamento

`js/consentimento.js` + `css/consentimento.css`. Nada de Google Tag Manager
ou Pixel da Meta carrega antes do visitante aceitar no banner.

Os IDs ficam em `dados.js`, bloco `rastreamento`:

```js
rastreamento: {
  gtm: "GTM-XXXXXXX",        // Google Tag Manager DA APNS
  pixel: "123456789012345",  // Pixel da Meta DA APNS
  politicaCookies: "/politica-de-cookies/"
}
```

Vazio = não carrega. Quando um lead é enviado, o site dispara `Lead` no
Pixel e o evento `gerar_lead` no dataLayer do GTM (só com consentimento).
Qualquer link com `data-cookies` reabre as preferências.

**Não coloque o Pixel direto no GTM e também aqui**, senão cada visita conta
duas vezes. Escolha um dos dois caminhos.

### Identidade visual

`base.css` traz os tokens de base; a identidade APNS vive no fim do
`portfolio.css`, dentro de `body.marca-apns`. Todas as páginas deste site
(index, políticas, 404) usam essa classe.

### Tipografia da APNS

A **Augustus** (`assets/fonts/augustus.ttf`) é a fonte da marca, usada nos
títulos. Ela **não tem caixa baixa**: minúsculas viram versalete. Por isso
todo display está em caixa alta — que é como o próprio manual apresenta os
títulos. Não tente escrever um `<h1>` em caixa mista com ela.

O corpo do texto segue na **Inter**, como no restante do site.

> A Augustus veio do cdnfonts. Antes de usar comercialmente em escala,
> vale conferir se a licença dela permite incorporação em site.

### Logos da APNS

| Arquivo | Onde |
|---|---|
| `logo-apns-laranja.webp` | cabeçalho |
| `logo-apns-creme.webp` | rodapé |
| `icone-apns.png` | favicon e atalho no celular |

Foram gerados a partir de `D:\Apenas Sites\MIV\logo branca.png`, recortados
e pintados nas cores oficiais.

---

## O que mudou em relação ao site antigo

**Conteúdo recuperado do WordPress** — os textos, serviços, mensagens de
WhatsApp por serviço, política de privacidade (LGPD), redes sociais
e todas as imagens foram extraídos do banco e trazidos para cá.

**Peso e velocidade**
- Saiu: WordPress, Elementor, Elementor Pro, jQuery, Swiper e mais 7 plugins.
- Entrou: 3 arquivos JS somando ~20 KB, sem nenhuma biblioteca externa.
- O carrossel do Swiper virou scroll nativo com `scroll-snap` — arrastar
  com o dedo funciona de graça, e sem 140 KB de biblioteca.

**Correções do que estava desconfigurado**
- `contato@localhost` e os links `http://localhost/...` que tinham vazado
  para o CSS do carrossel foram eliminados.
- O e-mail agora vem de um lugar só (`dados.js`) e aparece em todas as páginas.
- A descrição duplicada nas duas caixas do hero virou uma lista real de benefícios.
- Os contadores estavam sem número ("+  Sites"); agora têm valor e animam ao entrar na tela.
- A política de privacidade, que era um bloco único de texto corrido,
  virou 8 seções com índice lateral.

**Acessibilidade e SEO**
- Navegação por teclado no carrossel (setas ← →) e no menu (Esc fecha).
- Link "pular para o conteúdo", foco visível, textos alternativos descritivos.
- `prefers-reduced-motion` respeitado: quem desativa animações no sistema vê o site estático.
- Títulos, descrições, Open Graph e dados estruturados (Schema.org) em cada página.

---

## Publicar

É um site estático: sobe em qualquer lugar. Basta enviar a pasta inteira
para o `public_html` da Hostinger (ou Netlify, Vercel, GitHub Pages).

Suba o conteúdo desta pasta (não a pasta em si) na raiz do repositório
`21Monteiro/landing-page`. Canonical, `og:`, `robots.txt` e `sitemap.xml`
já apontam para `https://apenasites.com.br/`.
