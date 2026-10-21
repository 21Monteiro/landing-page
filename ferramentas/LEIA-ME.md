# Ferramentas — prints dos projetos

Dois scripts geram todas as imagens do carrossel a partir do site do cliente
no ar. Nenhum deles instala nada: usam o Chrome que já está na máquina e a
biblioteca Pillow do Python.

## 1. Capturar os prints

```
node ferramentas/capture.mjs "C:\caminho\para\prints" "[{\"slug\":\"dompet\",\"url\":\"https://dompetresort.com.br/\"}]"
```

Para cada site saem quatro arquivos na pasta de prints:

| Arquivo | O que é |
|---|---|
| `<slug>-hero.png` | primeira dobra no desktop |
| `<slug>-full.jpg` | página inteira no desktop |
| `<slug>-mhero.png` | primeira dobra no celular |
| `<slug>-mfull.jpg` | página inteira no celular |

O script abre o Chrome sem janela, rola a página toda para acordar as
animações e as imagens preguiçosas, volta ao topo e só então fotografa.

Três coisas que ele resolve sozinho, e que custaram caro para descobrir:

1. **Blocos invisíveis.** Site que revela conteúdo conforme você rola deixa
   tudo em `opacity: 0` até a hora certa. Como a foto pega a página inteira
   de uma vez, metade sairia em branco. O script força esses blocos ao
   estado final antes de fotografar.
2. **Página que não acaba.** Em sites que carregam mais conteúdo conforme
   você desce, o laço de rolagem nunca terminava. Agora tem teto de passos.
3. **Vídeo do YouTube.** Um `iframe` de vídeo trava o Chrome sem janela e a
   foto fica pendurada para sempre, sem erro e sem acabar. Todo `iframe` é
   trocado por um retângulo do mesmo tamanho antes da foto.

Avisos de cookie que flutuam sobre a página são escondidos, porque tapavam
justamente o hero. Eles são apenas escondidos, nunca aceitos: clicar em
"aceitar" daria consentimento no site do cliente.

## 2. Montar os mockups

```
python ferramentas/mockups.py "C:\caminho\para\prints" dompet=dompet vaccaroco=vaccaroco
```

Cada argumento é `slug-do-projeto=nome-do-print`. Saem direto em
`assets/img`, com os nomes que o `js/dados.js` espera:

| Arquivo | Onde aparece |
|---|---|
| `proj-<slug>.webp` | mockup de notebook no cartão |
| `proj-<slug>-completo.webp` ou `.jpg` | print inteiro do visualizador |
| `proj-<slug>-mobile.webp` | mockup de celular no cartão |
| `proj-<slug>-mobile-completo.webp` ou `.jpg` | print inteiro, versão de celular |

Os mockups saem com 1200x825, a mesma proporção da caixa do cartão (16/11),
e a tela do aparelho é colada no tamanho final. Antes a lona era 450x450 e o
print inteiro era reduzido para 380 ou 700px de largura: era dali que vinha
a qualidade ruim.

O print inteiro mantém a largura nativa (1440 no desktop, 780 no celular) e
só encolhe quando passa de 14 megapixels, porque o iPhone para de decodificar
imagem muito grande e a tela ficaria em branco. Página de celular costuma
passar dos 16383px de altura, que é o limite do WEBP; nesse caso o arquivo
sai em JPEG. **O script imprime o nome final de cada arquivo**, então confira
a extensão ao atualizar o `js/dados.js`.

O notebook é a moldura `assets/img/mockup-notebook-base.png`, a mesma dos
mockups antigos: a área de tela foi medida comparando os quatro PNGs
originais entre si, já que só a tela mudava de um para o outro. **Não apague
esse arquivo**, senão não dá para gerar mockup novo. O celular é desenhado
pelo próprio script.

## Depois de gerar

Abra `js/dados.js` e confira se o projeto aponta para os quatro arquivos.
Projeto sem site no ar fica sem os dois campos `*Mobile` e cai no print de
desktop também no celular.
