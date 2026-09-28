/* AXION PROEDUQ · interações do site. JavaScript puro, sem dependências. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mouseFino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var limitar = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ── Abertura ── */
  var intro = $("#intro");
  function liberar() { doc.classList.add("pronto"); document.body.classList.add("pronto"); }
  function fecharIntro() {
    if (!intro) { liberar(); return; }
    intro.classList.add("sai");
    setTimeout(liberar, 180);
    setTimeout(function () { intro.classList.add("fora"); }, 800);
  }
  var jaViu = false;
  try { jaViu = sessionStorage.getItem("ax-intro") === "1"; sessionStorage.setItem("ax-intro", "1"); } catch (e) {}
  if (calmo || jaViu) { if (intro) intro.classList.add("fora"); liberar(); }
  else {
    var t0 = performance.now();
    var aoCarregar = function () { setTimeout(fecharIntro, Math.max(0, 1500 - (performance.now() - t0))); };
    if (document.readyState === "complete") aoCarregar(); else window.addEventListener("load", aoCarregar);
    setTimeout(function () { if (!doc.classList.contains("pronto")) fecharIntro(); }, 3500);
  }

  /* ── Ano ── */
  var ano = $("#ano");
  if (ano) ano.textContent = String(Math.max(2026, new Date().getFullYear()));

  /* ── Palavra que troca ── */
  var troca = $("#troca");
  var palavras = ["move", "conecta", "organiza", "inspira", "transforma"];
  function escrever(p) {
    troca.innerHTML = "";
    p.split("").forEach(function (c, i) {
      var s = document.createElement("span");
      s.className = "l"; s.textContent = c; s.style.animationDelay = (i * 0.04) + "s";
      troca.appendChild(s);
    });
  }
  if (troca && !calmo) {
    var ip = 0;
    escrever(palavras[0]);
    setInterval(function () {
      if (document.hidden) return;
      $$(".l", troca).forEach(function (l, i) { l.style.animationDelay = (i * 0.025) + "s"; l.classList.add("sai"); });
      setTimeout(function () { ip = (ip + 1) % palavras.length; escrever(palavras[ip]); }, 420);
    }, 2800);
  }

  /* ── Rede de conexões no hero (canvas) ── */
  var cv = $("#rede"), hero = $("#inicio");
  if (cv && cv.getContext) {
    var ctx = cv.getContext("2d"), W = 0, H = 0, dpr = 1, nos = [], ondas = [];
    var mouse = { x: -9999, y: -9999, ativo: false }, visivel = true, raf = 0;
    var ALCANCE = 130;
    function montar() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var qtd = Math.round(limitar(W * H / 14000, 30, 110));
      nos = [];
      for (var i = 0; i < qtd; i++) {
        nos.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.6 + .8, c: Math.random() < .25 });
      }
    }
    function quadro() {
      raf = 0;
      if (!visivel) return;
      ctx.clearRect(0, 0, W, H);
      var vel = calmo ? .35 : 1;
      for (var i = 0; i < nos.length; i++) {
        var n = nos[i];
        if (mouse.ativo) {
          var dx = mouse.x - n.x, dy = mouse.y - n.y, d2 = dx * dx + dy * dy;
          if (d2 < 40000 && d2 > 100) { var f = .012 / Math.sqrt(d2) * 60; n.vx += dx * f * .01; n.vy += dy * f * .01; }
        }
        for (var o = 0; o < ondas.length; o++) {
          var w = ondas[o], ex = n.x - w.x, ey = n.y - w.y, dd = Math.sqrt(ex * ex + ey * ey);
          if (Math.abs(dd - w.r) < 26 && dd > 0) { n.vx += ex / dd * .35; n.vy += ey / dd * .35; }
        }
        n.vx *= .985; n.vy *= .985;
        var sp = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (sp < .12) { n.vx += (Math.random() - .5) * .05; n.vy += (Math.random() - .5) * .05; }
        n.x += n.vx * vel; n.y += n.vy * vel;
        if (n.x < -20) n.x = W + 20; else if (n.x > W + 20) n.x = -20;
        if (n.y < -20) n.y = H + 20; else if (n.y > H + 20) n.y = -20;
      }
      ctx.lineWidth = 1;
      for (var a = 0; a < nos.length; a++) {
        for (var b = a + 1; b < nos.length; b++) {
          var p = nos[a], q = nos[b], lx = p.x - q.x, ly = p.y - q.y, dist = lx * lx + ly * ly;
          if (dist < ALCANCE * ALCANCE) {
            var al = 1 - Math.sqrt(dist) / ALCANCE;
            ctx.strokeStyle = "rgba(90,160,255," + (al * .35).toFixed(3) + ")";
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        if (mouse.ativo) {
          var m = nos[a], mx = m.x - mouse.x, my = m.y - mouse.y, md = Math.sqrt(mx * mx + my * my);
          if (md < 190) {
            ctx.strokeStyle = "rgba(0,220,255," + ((1 - md / 190) * .6).toFixed(3) + ")";
            ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          }
        }
      }
      for (var k = 0; k < nos.length; k++) {
        var z = nos[k];
        ctx.fillStyle = z.c ? "rgba(0,220,255,.95)" : "rgba(200,220,255,.8)";
        ctx.beginPath(); ctx.arc(z.x, z.y, z.r, 0, 6.2832); ctx.fill();
      }
      for (var j = ondas.length - 1; j >= 0; j--) {
        var on = ondas[j];
        on.r += 6; on.a -= .018;
        if (on.a <= 0) { ondas.splice(j, 1); continue; }
        ctx.strokeStyle = "rgba(0,212,255," + on.a.toFixed(3) + ")"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(on.x, on.y, on.r, 0, 6.2832); ctx.stroke(); ctx.lineWidth = 1;
      }
      raf = requestAnimationFrame(quadro);
    }
    function pedir() { if (!raf && visivel) raf = requestAnimationFrame(quadro); }
    montar(); pedir();
    var tm;
    window.addEventListener("resize", function () { clearTimeout(tm); tm = setTimeout(montar, 150); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { visivel = e[0].isIntersecting; pedir(); }).observe(hero);
    }
    document.addEventListener("visibilitychange", function () { visivel = !document.hidden; pedir(); });

    var brilho = $(".hero-brilho"), marca = $("#heroMarca"), ax = $("#ax");
    hero.addEventListener("pointermove", function (ev) {
      var r = hero.getBoundingClientRect();
      mouse.x = ev.clientX - r.left; mouse.y = ev.clientY - r.top; mouse.ativo = ev.pointerType === "mouse";
      if (brilho) { brilho.style.setProperty("--mx", mouse.x + "px"); brilho.style.setProperty("--my", mouse.y + "px"); }
      if (ax && !calmo) {
        var nx = (ev.clientX / window.innerWidth - .5), ny = (ev.clientY / window.innerHeight - .5);
        ax.style.setProperty("--ry", (nx * 22).toFixed(2) + "deg");
        ax.style.setProperty("--rx", (-ny * 18).toFixed(2) + "deg");
      }
    });
    hero.addEventListener("pointerleave", function () { mouse.ativo = false; if (ax) { ax.style.setProperty("--rx", "0deg"); ax.style.setProperty("--ry", "0deg"); } });
    hero.addEventListener("click", function (ev) {
      if (ev.target.closest("a,button")) return;
      var r = hero.getBoundingClientRect();
      ondas.push({ x: ev.clientX - r.left, y: ev.clientY - r.top, r: 0, a: .8 });
      pedir();
    });
    if (marca) {
      marca.addEventListener("pointerenter", function () { marca.classList.add("abre"); });
      marca.addEventListener("pointerleave", function () { marca.classList.remove("abre"); });
      marca.addEventListener("click", function () { marca.classList.toggle("abre"); });
    }
  }

  /* ── Cursor próprio (só mouse) ── */
  var cursor = $("#cursor");
  if (cursor && mouseFino && !calmo) {
    var ponto = cursor.querySelector("i"), anel = cursor.querySelector("span");
    var cx = -100, cy = -100, ax2 = -100, ay2 = -100, ligado = false;
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      if (!ligado) { ligado = true; doc.classList.add("cursor-on"); ax2 = e.clientX; ay2 = e.clientY; loopCursor(); }
      cx = e.clientX; cy = e.clientY;
      ponto.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
      var alvo = e.target.closest && e.target.closest("a,button,[tabindex],.inclina,input,label");
      cursor.classList.toggle("sobre", !!alvo);
    });
    window.addEventListener("pointerdown", function () { cursor.classList.add("clique"); });
    window.addEventListener("pointerup", function () { cursor.classList.remove("clique"); });
    document.addEventListener("mouseleave", function () { cursor.style.opacity = "0"; });
    document.addEventListener("mouseenter", function () { cursor.style.opacity = "1"; });
    function loopCursor() {
      ax2 += (cx - ax2) * .18; ay2 += (cy - ay2) * .18;
      anel.style.transform = "translate(" + ax2 + "px," + ay2 + "px) translate(-50%,-50%)";
      requestAnimationFrame(loopCursor);
    }
  }

  /* ── Topo, progresso, voltar ao topo ── */
  var topo = $("#topo"), barra = $("#progresso"), topoBtn = $("#topoBtn"), ultimoY = 0, menuAberto = false;
  function aoRolar() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    if (barra) barra.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    topo.classList.toggle("solido", y > 20);
    topo.classList.toggle("escondido", !menuAberto && y > 700 && y > ultimoY + 4);
    if (y < ultimoY - 4) topo.classList.remove("escondido");
    ultimoY = y;
    if (topoBtn) topoBtn.classList.toggle("ve", y > 900);
    trilha();
  }
  window.addEventListener("scroll", aoRolar, { passive: true });
  if (topoBtn) topoBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: calmo ? "auto" : "smooth" }); });

  /* Menu no celular */
  var burger = $("#burger"), menu = $("#menu");
  function abrirMenu(abrir) {
    menuAberto = abrir;
    burger.setAttribute("aria-expanded", String(abrir));
    burger.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
    menu.classList.toggle("aberto", abrir);
    if (abrir) topo.classList.add("solido");
  }
  if (burger) {
    burger.addEventListener("click", function () { abrirMenu(!menuAberto); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { abrirMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menuAberto) { abrirMenu(false); burger.focus(); } });
  }

  /* Link ativo no menu */
  var links = $$(".menu a[href^='#']");
  if ("IntersectionObserver" in window) {
    var mapa = {};
    links.forEach(function (a) { mapa[a.getAttribute("href").slice(1)] = a; });
    var obsSec = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("ativo"); });
        var id = e.target.id;
        if (id === "proposito") id = "quem-somos";
        if (id === "valores") id = "principios";
        if (mapa[id]) mapa[id].classList.add("ativo");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach(function (s) { obsSec.observe(s); });
  }

  /* ── Revelação ao rolar + contadores ── */
  function contar(el) {
    var alvo = +el.getAttribute("data-conta"), semMilhar = el.hasAttribute("data-sem-milhar");
    var fmt = function (v) { return semMilhar ? String(v) : v.toLocaleString("pt-BR"); };
    if (calmo) { el.textContent = fmt(alvo); return; }
    var ini = performance.now(), dur = alvo > 500 ? 1600 : 1200, base = alvo > 500 ? alvo - 60 : 0;
    (function passo(t) {
      var p = Math.min(1, (t - ini) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(base + (alvo - base) * e));
      if (p < 1) requestAnimationFrame(passo);
    })(ini);
  }
  var revelar = $$(".revela, .revela-grupo");
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("visivel");
        $$("[data-conta]", e.target).forEach(contar);
        obs.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: .08 });
    revelar.forEach(function (el) { obs.observe(el); });
  } else {
    revelar.forEach(function (el) { el.classList.add("visivel"); });
    $$("[data-conta]").forEach(contar);
  }

  /* ── Inclinação 3D e luz que segue o mouse ── */
  if (mouseFino && !calmo) {
    $$(".inclina").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty("--iy", ((x - .5) * 10).toFixed(2) + "deg");
        el.style.setProperty("--ix", ((.5 - y) * 10).toFixed(2) + "deg");
        el.style.setProperty("--lx", (x * 100) + "%");
        el.style.setProperty("--ly", (y * 100) + "%");
      });
      el.addEventListener("pointerleave", function () { el.style.setProperty("--ix", "0deg"); el.style.setProperty("--iy", "0deg"); });
    });
    /* Botões magnéticos */
    $$(".magnetico").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        b.style.transform = "translate(" + (x * .22).toFixed(1) + "px," + (y * .3).toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* ── Cartões que viram (toque) ── */
  $$(".virar").forEach(function (v) {
    v.addEventListener("click", function () {
      v.setAttribute("aria-pressed", v.getAttribute("aria-pressed") === "true" ? "false" : "true");
    });
  });

  /* ── Plataformas ── */
  var plats = $("#plats"), palco = $("#palco"), abas = $$(".plat-aba");
  function escolher(aba, focar) {
    abas.forEach(function (a) {
      var on = a === aba;
      a.classList.toggle("on", on);
      a.setAttribute("aria-selected", String(on));
      a.tabIndex = on ? 0 : -1;
      var painel = document.getElementById(a.getAttribute("aria-controls"));
      painel.hidden = !on;
      painel.classList.toggle("on", on);
    });
    plats.style.setProperty("--cor", aba.getAttribute("data-cor"));
    plats.style.setProperty("--cor2", aba.getAttribute("data-cor2"));
    abas.forEach(function (a) { a.style.setProperty("--cor", a.getAttribute("data-cor")); });
    if (focar) aba.focus({ preventScroll: true });
    /* no celular a lista rola de lado; só ela se move, nunca a página */
    var lista = aba.parentNode;
    if (lista.scrollWidth > lista.clientWidth) {
      lista.scrollTo({ left: aba.offsetLeft - (lista.clientWidth - aba.offsetWidth) / 2, behavior: calmo ? "auto" : "smooth" });
    }
  }
  if (plats && abas.length) {
    escolher(abas[0]);
    abas.forEach(function (a, i) {
      a.addEventListener("click", function () {
        escolher(a);
        if (window.innerWidth < 960) {
          var topoPalco = palco.getBoundingClientRect().top + window.scrollY - 150;
          if (window.scrollY < topoPalco - 200 || window.scrollY > topoPalco + 200) window.scrollTo({ top: topoPalco, behavior: calmo ? "auto" : "smooth" });
        }
      });
      a.addEventListener("keydown", function (e) {
        var d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (!d) return;
        e.preventDefault();
        escolher(abas[(i + d + abas.length) % abas.length], true);
      });
    });
    palco.addEventListener("pointermove", function (e) {
      var r = palco.getBoundingClientRect();
      palco.style.setProperty("--px", (e.clientX - r.left) + "px");
      palco.style.setProperty("--py", (e.clientY - r.top) + "px");
    });
  }

  /* ── Ecossistema: destacar fluxos ── */
  var eco = $(".eco");
  if (eco) {
    if (calmo) $$("animateMotion", eco).forEach(function (m) { m.remove(); });
    var acender = function (n) {
      eco.classList.toggle("focando", !!n);
      $$("[data-fluxo]", eco).forEach(function (el) { el.classList.toggle("acesa", !!n && el.getAttribute("data-fluxo") === n); });
    };
    $$(".eco-fluxos li, .via", eco).forEach(function (el) {
      var n = el.getAttribute("data-fluxo");
      el.addEventListener("pointerenter", function () { acender(n); });
      el.addEventListener("pointerleave", function () { acender(null); });
      el.addEventListener("focus", function () { acender(n); });
      el.addEventListener("blur", function () { acender(null); });
      el.addEventListener("click", function () { acender(n); });
    });
  }

  /* ── Valores em órbita ── */
  var orbe = $("#orbe"), planetas = $$(".planeta"), caixa = $("#valorCaixa");
  if (orbe && planetas.length) {
    var giro = 0, pausa = false, alvoGiro = null, rodando = false;
    function posicionar() {
      var meio = orbe.clientWidth / 2, r = meio * .84;
      var maiorMetade = planetas.reduce(function (m, p) { return Math.max(m, p.offsetWidth / 2); }, 0);
      var rx = Math.min(r, meio - maiorMetade - 4);
      planetas.forEach(function (p, i) {
        var ang = giro + i / planetas.length * Math.PI * 2 - Math.PI / 2;
        var x = Math.cos(ang) * rx, y = Math.sin(ang) * r * .92;
        p.style.transform = "translate(calc(-50% + " + x.toFixed(1) + "px), calc(-50% + " + y.toFixed(1) + "px))";
        p.style.zIndex = y > 0 ? 3 : 2;
      });
    }
    function girar() {
      if (alvoGiro !== null) {
        var dif = alvoGiro - giro;
        giro += dif * .08;
        if (Math.abs(dif) < .002) { giro = alvoGiro; alvoGiro = null; }
      } else if (!pausa && !calmo) giro += .0022;
      posicionar();
      if (rodando) requestAnimationFrame(girar);
    }
    posicionar();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) {
        var antes = rodando; rodando = e[0].isIntersecting;
        if (rodando && !antes) requestAnimationFrame(girar);
      }).observe(orbe);
    }
    orbe.addEventListener("pointerenter", function () { pausa = true; });
    orbe.addEventListener("pointerleave", function () { pausa = false; });
    window.addEventListener("resize", posicionar);
    planetas.forEach(function (p, i) {
      p.addEventListener("click", function () {
        planetas.forEach(function (o) { o.classList.toggle("on", o === p); });
        $("#valorNome").textContent = p.textContent;
        $("#valorTexto").textContent = p.getAttribute("data-txt");
        caixa.classList.remove("troca-anim"); void caixa.offsetWidth; caixa.classList.add("troca-anim");
        /* traz o valor escolhido para o topo da órbita */
        var alvo = -i / planetas.length * Math.PI * 2;
        var volta = Math.PI * 2;
        while (alvo - giro > Math.PI) alvo -= volta;
        while (giro - alvo > Math.PI) alvo += volta;
        alvoGiro = alvo;
        if (!rodando) { giro = alvo; alvoGiro = null; posicionar(); }
      });
    });
  }

  /* ── Trilha do rumo ── */
  var trilhaEl = $("#trilha"), fill = $("#trilhaFill"), marcos = $$(".marco");
  function trilha() {
    if (!trilhaEl) return;
    var r = trilhaEl.getBoundingClientRect(), ref = window.innerHeight * .62;
    var p = limitar((ref - r.top) / r.height, 0, 1);
    fill.style.height = (p * 100) + "%";
    marcos.forEach(function (m) {
      var mr = m.getBoundingClientRect();
      m.classList.toggle("ativo", mr.top + mr.height / 2 < ref);
    });
  }

  /* ── Símbolo X (toque) ── */
  var xEx = $("#xExplica");
  if (xEx) xEx.addEventListener("click", function () { xEx.classList.toggle("abre"); });

  /* ── Copiar cores e e-mail ── */
  var aviso = $("#aviso"), tAviso;
  function mostrar(msg) {
    aviso.textContent = msg; aviso.classList.add("ve");
    clearTimeout(tAviso); tAviso = setTimeout(function () { aviso.classList.remove("ve"); }, 2200);
  }
  function copiar(txt, msg) {
    var ok = function () { mostrar(msg); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(ok, function () { mostrar(txt); });
    else {
      var ta = document.createElement("textarea"); ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); ok(); } catch (e) { mostrar(txt); }
      ta.remove();
    }
  }
  $$(".cor").forEach(function (c) { c.addEventListener("click", function () { copiar(c.getAttribute("data-hex"), "Cor " + c.getAttribute("data-hex") + " copiada"); }); });
  $$(".copiar").forEach(function (b) { b.addEventListener("click", function () { copiar(b.getAttribute("data-copia"), "E-mail copiado"); }); });

  aoRolar();
})();
