"""Gera as imagens de projeto do portfolio a partir dos prints capturados.

Para cada projeto produz ate quatro arquivos em assets/img:
  proj-<slug>.webp                  mockup do hero no notebook (cartao)
  proj-<slug>-completo.<ext>        print da pagina inteira no desktop
  proj-<slug>-mobile.webp           mockup do hero no celular (cartao)
  proj-<slug>-mobile-completo.<ext> print da pagina inteira no celular

A lona do cartao tem a mesma proporcao da caixa de midia do cartao (16/11),
entao o mockup ocupa a caixa inteira em vez de sobrar espaco nas laterais.
A tela e colada no tamanho final, nunca num intermediario menor: e ela que a
pessoa olha de perto.

O notebook reaproveita a moldura dos mockups antigos, recortada no aparelho e
ampliada. O celular e desenhado aqui, com antisserrilhado por superamostragem.

A extensao do print completo depende da altura: WEBP nao aceita lado maior que
16383px, e print de pagina de celular passa disso com facilidade. Nesses casos
sai JPEG. O script imprime o nome final de cada arquivo.
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

Image.MAX_IMAGE_PIXELS = None

IMG = Path(r"D:\21Monteiro - 21m\00 - Empresa\00 - Site\04 - Site atualizado\assets\img")
SHOTS = Path(sys.argv[1])

# Lona do cartao: 16/11 e a proporcao de .projeto-midia no portfolio.css.
LONA_W, LONA_H = 1200, 825

# Moldura do notebook. RECORTE e a caixa do aparelho dentro do PNG original
# de 450x450 (medida pelo canal alfa, ja incluindo a sombra). TELA_ORIG e a
# area de tela no mesmo sistema de coordenadas.
RECORTE = (7, 74, 442, 371)
TELA_ORIG = (53, 86, 397, 301)

# Teto de pixels do print completo. O iOS para de decodificar imagens muito
# grandes por volta de 16 megapixels, e print de celular com 30000px de altura
# passa disso. Encolher um pouco e melhor do que a imagem nao aparecer.
MAX_PIXELS = 14_000_000
MAX_LADO_WEBP = 16383


def _moldura_notebook():
    """Devolve (moldura ja na lona final, retangulo da tela na lona)."""
    base = Image.open(IMG / "mockup-notebook-base.png").convert("RGBA")
    corte = base.crop(RECORTE)
    sx = LONA_W / corte.width
    sy = LONA_H / corte.height
    moldura = corte.resize((LONA_W, LONA_H), Image.LANCZOS)
    tela = (
        round((TELA_ORIG[0] - RECORTE[0]) * sx),
        round((TELA_ORIG[1] - RECORTE[1]) * sy),
        round((TELA_ORIG[2] - RECORTE[0]) * sx),
        round((TELA_ORIG[3] - RECORTE[1]) * sy),
    )
    return moldura, tela


MOLDURA, TELA = _moldura_notebook()


def recortar_para(imagem: Image.Image, alvo: float) -> Image.Image:
    """Corta a imagem na proporcao pedida, sem esticar.

    Mais larga que o alvo: tira das laterais. Mais alta: fica com o topo, que
    e justamente a parte do hero que interessa.
    """
    w, h = imagem.size
    if w / h > alvo:
        novo_w = int(h * alvo)
        esquerda = (w - novo_w) // 2
        return imagem.crop((esquerda, 0, esquerda + novo_w, h))
    novo_h = int(w / alvo)
    return imagem.crop((0, 0, w, novo_h))


def encaixar(hero: Image.Image, largura: int, altura: int) -> Image.Image:
    """Recorta na proporcao da tela e reduz ate o tamanho exato dela."""
    tela = recortar_para(hero, largura / altura)
    return tela.resize((largura, altura), Image.LANCZOS).convert("RGBA")


def salvar_cartao(imagem: Image.Image, destino: Path) -> None:
    """WEBP com alfa: um PNG desse tamanho passaria de 1MB por cartao."""
    imagem.save(destino, "WEBP", quality=90, method=6)


def mockup_notebook(hero: Image.Image, destino: Path) -> None:
    out = MOLDURA.copy()
    out.paste(encaixar(hero, TELA[2] - TELA[0], TELA[3] - TELA[1]), (TELA[0], TELA[1]))
    salvar_cartao(out, destino)


def mockup_celular(hero: Image.Image, destino: Path) -> None:
    """Desenha um aparelho com a mesma pegada do notebook: cinza, fundo livre.

    O corpo e desenhado tres vezes maior e reduzido no fim, porque o PIL nao
    suaviza as bordas de retangulo arredondado. A tela entra depois, ja no
    tamanho final, para nao passar por reducao duas vezes.
    """
    SS = 3  # superamostragem

    # Proporcoes herdadas do mockup antigo (corpo 198x424 numa lona de 450).
    corpo_h = round(LONA_H * 0.95)
    s = corpo_h / 424.0
    corpo_w = round(198 * s)
    bisel = round(9 * s)
    raio_fora = round(32 * s)
    raio_dentro = round(30 * s)

    x0 = (LONA_W - corpo_w) // 2
    y0 = (LONA_H - corpo_h) // 2
    tela_cx = (x0 + bisel, y0 + bisel, x0 + corpo_w - bisel, y0 + corpo_h - bisel)
    tela_w = tela_cx[2] - tela_cx[0]
    tela_h = tela_cx[3] - tela_cx[1]

    g = Image.new("RGBA", (LONA_W * SS, LONA_H * SS), (0, 0, 0, 0))

    def e(v):
        return round(v * SS)

    # Sombra: camada propria e borrada, como no mockup antigo.
    sombra = Image.new("RGBA", g.size, (0, 0, 0, 0))
    ImageDraw.Draw(sombra).rounded_rectangle(
        (e(x0 + 8), e(y0 + 22), e(x0 + corpo_w + 8), e(y0 + corpo_h + 26)),
        radius=e(raio_fora), fill=(0, 0, 0, 70))
    g.alpha_composite(sombra.filter(ImageFilter.GaussianBlur(e(11 * s / 2))))

    corpo = ImageDraw.Draw(g)
    corpo.rounded_rectangle((e(x0), e(y0), e(x0 + corpo_w), e(y0 + corpo_h)),
                            radius=e(raio_fora), fill=(138, 142, 148, 255))
    corpo.rounded_rectangle((e(x0 + 4), e(y0 + 4), e(x0 + corpo_w - 4), e(y0 + corpo_h - 4)),
                            radius=e(raio_dentro), fill=(58, 60, 64, 255))

    base = g.resize((LONA_W, LONA_H), Image.LANCZOS)

    # Mascara da tela: tambem superamostrada, senao os cantos ficam serrilhados.
    raio_tela = round(23 * s)
    m = Image.new("L", (tela_w * SS, tela_h * SS), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, tela_w * SS - 1, tela_h * SS - 1),
                                        radius=raio_tela * SS, fill=255)
    mascara = m.resize((tela_w, tela_h), Image.LANCZOS)

    base.paste(encaixar(hero, tela_w, tela_h), (tela_cx[0], tela_cx[1]), mascara)

    # Sem ilha nem entalhe de proposito: o print comeca no topo da pagina, e
    # qualquer enfeite ali cairia em cima do logo do cliente.

    salvar_cartao(base, destino)


def completa(full: Image.Image, destino_sem_ext: Path) -> Path:
    """Salva o print inteiro na resolucao nativa, so respeitando os limites.

    Antes a imagem era reduzida para uma faixa de 380 a 1100px de largura, e
    era dai que vinha a qualidade ruim. Agora so encolhe quando passa do teto
    de pixels que o celular consegue decodificar.
    """
    full = full.convert("RGB")
    w, h = full.size
    if w * h > MAX_PIXELS:
        esc = (MAX_PIXELS / (w * h)) ** 0.5
        w, h = max(1, round(w * esc)), max(1, round(h * esc))
        full = full.resize((w, h), Image.LANCZOS)

    if max(w, h) <= MAX_LADO_WEBP:
        destino = destino_sem_ext.with_suffix(".webp")
        full.save(destino, "WEBP", quality=82, method=6)
    else:
        destino = destino_sem_ext.with_suffix(".jpg")
        full.save(destino, "JPEG", quality=80, optimize=True, progressive=True)
    return destino


def abrir(nome: str) -> Image.Image | None:
    for ext in (".jpg", ".png"):
        caminho = SHOTS / (nome + ext)
        if caminho.exists():
            return Image.open(caminho).convert("RGB")
    return None


def limpar_antigos(slug: str) -> None:
    """Some com a versao anterior do mesmo arquivo em outra extensao."""
    for nome in (f"proj-{slug}", f"proj-{slug}-mobile"):
        for ext in (".png", ".jpg", ".webp"):
            alvo = IMG / (nome + ext)
            if alvo.exists():
                alvo.unlink()
    for nome in (f"proj-{slug}-completo", f"proj-{slug}-mobile-completo"):
        for ext in (".webp", ".jpg"):
            alvo = IMG / (nome + ext)
            if alvo.exists():
                alvo.unlink()


def main() -> None:
    for arg in sys.argv[2:]:
        slug, origem = arg.split("=", 1)

        hero = abrir(f"{origem}-hero")
        full = abrir(f"{origem}-full")
        if hero is None or full is None:
            print(f"faltando {slug}: sem print de desktop")
            continue

        limpar_antigos(slug)

        mockup_notebook(hero, IMG / f"proj-{slug}.webp")
        d1 = completa(full, IMG / f"proj-{slug}-completo")

        mhero = abrir(f"{origem}-mhero")
        mfull = abrir(f"{origem}-mfull")
        if mhero is not None and mfull is not None:
            mockup_celular(mhero, IMG / f"proj-{slug}-mobile.webp")
            d2 = completa(mfull, IMG / f"proj-{slug}-mobile-completo")
            print(f"ok {slug}: {d1.name} + {d2.name}")
        else:
            print(f"ok {slug}: {d1.name} (sem celular)")


main()
