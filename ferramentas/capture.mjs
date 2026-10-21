// Captura os prints do portfolio: headless Chrome via CDP, sem dependencia de
// npm (Node >=22 tem WebSocket global).
//
// Cada site rende quatro arquivos:
//   <slug>-hero.png        primeira dobra no desktop (vira o mockup do notebook)
//   <slug>-full.jpg        pagina inteira no desktop (vira o print do lightbox)
//   <slug>-mhero.png       primeira dobra no celular
//   <slug>-mfull.jpg       pagina inteira no celular
//
// Tres armadilhas ja encontradas e tratadas aqui:
//   1. reveal-on-scroll deixa blocos em opacity 0, e captureBeyondViewport
//      renderiza exatamente o que esta la;
//   2. paginas que crescem conforme a rolagem faziam o laco nunca terminar;
//   3. iframe de video (YouTube) trava o compositor do headless, e a captura
//      fica pendurada para sempre.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9333;
const OUT = process.argv[2];
const JOBS = JSON.parse(process.argv[3]); // [{slug, url}]

const UA_CELULAR =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/155.0.0.0 Mobile Safari/537.36";

mkdirSync(OUT, { recursive: true });

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--mute-audio",
  "--no-first-run",
  "--autoplay-policy=user-gesture-required",
  "--disable-features=Translate,BackForwardCache",
  `--remote-debugging-port=${PORT}`,
  "--user-data-dir=" + OUT + "\\chrome-profile",
  "about:blank",
], { stdio: "ignore" });

function comLimite(promessa, ms, rotulo = "cdp") {
  return Promise.race([
    promessa,
    sleep(ms).then(() => { throw new Error(`${rotulo}: timeout apos ${ms}ms`); }),
  ]);
}

async function esperarChrome() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return (await r.json()).webSocketDebuggerUrl;
    } catch {}
    await sleep(500);
  }
  throw new Error("Chrome nao subiu na porta " + PORT);
}

class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pendentes = new Map();
    ws.addEventListener("message", (e) => {
      const m = JSON.parse(e.data);
      if (m.id && this.pendentes.has(m.id)) {
        const { resolve, reject } = this.pendentes.get(m.id);
        this.pendentes.delete(m.id);
        m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
      }
    });
  }
  bruto(method, params = {}, sessionId) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pendentes.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }
  // Nenhum comando CDP tem teto de tempo proprio: um browser travado deixaria
  // o processo pendurado sem nunca falhar.
  send(method, params = {}, sessionId, ms = 30000) {
    return comLimite(this.bruto(method, params, sessionId), ms, method);
  }
}

function conectar(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.addEventListener("open", () => resolve(ws));
    ws.addEventListener("error", reject);
  });
}

// Roda dentro da pagina: congela animacao, revela os blocos que esperam
// rolagem e troca iframes por um retangulo da mesma altura.
const PREPARAR_PAGINA = `(() => {
  const s = document.createElement("style");
  s.textContent = "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}";
  document.head.appendChild(s);

  // Varrer "body *" com getComputedStyle trava paginas grandes, entao olhamos
  // so os candidatos tipicos de reveal, com teto de elementos.
  const alvos = document.querySelectorAll(
    "[data-aos],[class*=aos-],[class*=reveal],[class*=revelar],[class*=fade],[class*=animate],[class*=wow],[class*=elementor-invisible]");
  let n = 0;
  for (const el of alvos) {
    if (n++ > 1500) break;
    el.style.setProperty("opacity", "1", "important");
    el.style.setProperty("transform", "none", "important");
    el.style.setProperty("filter", "none", "important");
    el.style.setProperty("visibility", "visible", "important");
    el.classList.add("aos-animate", "animated", "revelado", "visivel");
    el.classList.remove("elementor-invisible");
  }
  for (const img of document.querySelectorAll("img[loading]")) img.loading = "eager";

  // Avisos de cookie tapam justamente o hero. Eles sao apenas escondidos:
  // nada de clicar em "aceitar", porque isso daria consentimento no site do
  // cliente. So somem os que flutuam sobre a pagina.
  let avisos = 0;
  const suspeitos = document.querySelectorAll(
    "[class*=cookie],[id*=cookie],[class*=Cookie],[id*=Cookie]," +
    "[class*=consent],[id*=consent],[class*=lgpd],[id*=lgpd]," +
    "[class*=gdpr],[id*=gdpr],[aria-label*=cookie],[aria-label*=Cookie]");
  for (const el of suspeitos) {
    const pos = getComputedStyle(el).position;
    if (pos === "fixed" || pos === "sticky") {
      el.style.setProperty("display", "none", "important");
      avisos++;
    }
  }

  // Iframes de video penduram o compositor do headless. Trocamos por um bloco
  // do mesmo tamanho para o layout nao desmontar.
  let iframes = 0;
  for (const f of document.querySelectorAll("iframe")) {
    const r = f.getBoundingClientRect();
    const caixa = document.createElement("div");
    caixa.style.cssText = "background:#101010;border-radius:8px;width:" +
      (r.width || 0) + "px;height:" + (r.height || 0) + "px";
    f.replaceWith(caixa);
    iframes++;
  }
  return { alvos: alvos.length, iframes: iframes, avisos: avisos };
})()`;

const wsUrl = await esperarChrome();
const ws = await conectar(wsUrl);
const cdp = new CDP(ws);

for (const job of JOBS) {
  const t0 = Date.now();
  let targetId;
  try {
    ({ targetId } = await cdp.send("Target.createTarget", { url: "about:blank" }, undefined, 20000));
    const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true }, undefined, 20000);

    const ev = (expression, ms = 20000) =>
      cdp.send("Runtime.evaluate", { expression, returnByValue: true }, sessionId, ms);

    const altura = async () => {
      try {
        const r = await ev("Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)", 10000);
        return r.result.value || 0;
      } catch { return 0; }
    };

    // Percorre a pagina inteira para disparar reveal e lazy-load, volta ao
    // topo, prepara o DOM e devolve a altura final ja limitada.
    const assentar = async () => {
      let h = await altura();
      for (let passo = 0; passo < 40; passo++) {
        const y = passo * 700;
        if (y > h + 1440) break;
        try { await ev(`window.scrollTo(0, ${y})`, 10000); } catch {}
        await sleep(260);
        h = Math.min(await altura(), 15000);
      }
      try { await ev("window.scrollTo(0, 0)", 10000); } catch {}
      await sleep(1800);
      try { await ev(PREPARAR_PAGINA, 25000); }
      catch (e) { console.log(`  aviso ${job.slug}: preparo falhou (${e.message})`); }
      await sleep(1500);
      return Math.min(await altura(), 15000);
    };

    const metricas = (width, height, mobile, dsf) =>
      cdp.send("Emulation.setDeviceMetricsOverride",
        { width, height, deviceScaleFactor: dsf, mobile,
          screenOrientation: { angle: 0, type: "portraitPrimary" } }, sessionId, 15000);

    const print = async (arquivo, clip, ms) => {
      const r = await cdp.send("Page.captureScreenshot",
        { format: "jpeg", quality: 92, captureBeyondViewport: clip.height > clip.janela, clip:
          { x: clip.x, y: clip.y, width: clip.width, height: clip.height, scale: clip.scale } },
        sessionId, ms);
      writeFileSync(`${OUT}\\${arquivo}`, Buffer.from(r.data, "base64"));
    };

    await cdp.send("Page.enable", {}, sessionId, 15000);

    /* ---------- passagem desktop ---------- */
    await metricas(1440, 900, false, 1);
    await cdp.send("Page.navigate", { url: job.url }, sessionId, 45000);
    await sleep(6000);
    const h = await assentar();

    await metricas(1440, 900, false, 2);
    await sleep(800);
    await print(`${job.slug}-hero.png`,
      { x: 0, y: 0, width: 1440, height: 900, scale: 1, janela: 900 }, 45000);

    await metricas(1440, 900, false, 1);
    await sleep(600);
    await print(`${job.slug}-full.jpg`,
      { x: 0, y: 0, width: 1440, height: h, scale: 1, janela: 900 }, 90000);

    /* ---------- passagem celular ---------- */
    // A recarga importa: muitos sites decidem o layout mobile no carregamento.
    await cdp.send("Emulation.setUserAgentOverride",
      { userAgent: UA_CELULAR, platform: "Android" }, sessionId, 10000).catch(() => {});
    await cdp.send("Emulation.setTouchEmulationEnabled",
      { enabled: true, maxTouchPoints: 5 }, sessionId, 10000).catch(() => {});
    await metricas(390, 844, true, 2);
    await cdp.send("Page.navigate", { url: job.url }, sessionId, 45000);
    await sleep(6000);
    const hm = await assentar();

    await print(`${job.slug}-mhero.png`,
      { x: 0, y: 0, width: 390, height: 844, scale: 1, janela: 844 }, 45000);
    await print(`${job.slug}-mfull.jpg`,
      { x: 0, y: 0, width: 390, height: hm, scale: 1, janela: 844 }, 90000);

    console.log(`OK   ${job.slug}  desktop=${h}  mobile=${hm}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  } catch (err) {
    console.log(`FALHA ${job.slug}  ${err.message}`);
  } finally {
    if (targetId) await cdp.send("Target.closeTarget", { targetId }, undefined, 10000).catch(() => {});
  }
}

ws.close();
chrome.kill();
