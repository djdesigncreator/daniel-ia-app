/*
  Daniel IA - idioma da aplicação (15/10/2026)
  --------------------------------------------
  A aplicação está escrita em português. Este ficheiro, carregado no <head>
  de todas as páginas (e da landing), traduz o que aparece no ecrã para
  inglês, francês ou espanhol quando a pessoa escolhe outro idioma:
    - textos, placeholders, títulos, aria-labels e alerts/confirms;
    - também o que as páginas desenham depois (respostas do servidor,
      listas, mensagens), através de um MutationObserver.
  O idioma fica guardado neste browser (localStorage) e também pode vir no
  endereço (?lang=en), que é como a landing passa a escolha para a app.
  Os dicionários estão em ficheiros à parte (lang-en.js, lang-fr.js,
  lang-es.js) e só são descarregados quando são precisos.
*/
(function(){
  'use strict';
  if (window.__danielI18n) return;
  window.__danielI18n = true;

  var LINGUAS = ['pt', 'en', 'fr', 'es'];
  var NOMES = { pt: 'Português', en: 'English', fr: 'Français', es: 'Español' };
  var CHAVE = 'daniel_idioma';
  var script = document.currentScript;
  var BASE = script && script.src ? script.src.replace(/[^\/]*$/, '') : 'https://app.daniel-ia.pro/i18n/';

  function lerGuardado(){ try { return localStorage.getItem(CHAVE) || ''; } catch (e) { return ''; } }
  function guardar(l){ try { localStorage.setItem(CHAVE, l); } catch (e) {} }
  var daUrl = (/[?&]lang=([a-zA-Z]{2})/.exec(location.search) || [])[1];
  daUrl = daUrl ? daUrl.toLowerCase() : '';
  var lang = LINGUAS.indexOf(daUrl) !== -1 ? daUrl : lerGuardado();
  if (LINGUAS.indexOf(lang) === -1) lang = 'pt';
  if (daUrl && daUrl === lang) guardar(lang);
  window.DANIEL_IDIOMA = lang;
  document.documentElement.setAttribute('lang', lang);

  var dicionarios = {};   // lang -> { textos: {...}, padroes: [...] }
  var pronto = false;

  // Esconde a página enquanto o dicionário chega, para não piscar em
  // português (no máximo 2,5 s - depois mostra de qualquer forma).
  var estiloEspera = document.createElement('style');
  estiloEspera.textContent = 'html.dia-i18n-espera body{opacity:0 !important;}';
  (document.head || document.documentElement).appendChild(estiloEspera);
  function esperar(sim){ document.documentElement.classList.toggle('dia-i18n-espera', !!sim); }
  if (lang !== 'pt') {
    esperar(true);
    setTimeout(function(){ esperar(false); }, 2500);
  }

  // ======================================================
  // Tradução de um texto
  // ======================================================
  function normal(t){ return String(t).replace(/\s+/g, ' ').trim(); }

  function traduzir(texto, l){
    l = l || lang;
    if (l === 'pt' || texto == null) return null;
    var d = dicionarios[l];
    if (!d) return null;
    var chave = normal(texto);
    if (!chave) return null;
    var r = d.textos[chave];
    if (r == null) {
      for (var i = 0; i < d.padroes.length; i++) {
        var p = d.padroes[i];
        var m = p.re.exec(chave);
        if (m) {
          r = p.t.replace(/\$(\d)/g, function(_, n){
            var v = m[Number(n)] || '';
            return d.textos[normal(v)] != null ? d.textos[normal(v)] : v;
          });
          break;
        }
      }
    }
    if (r == null || r === chave) return null;
    var antes = (/^\s*/.exec(texto) || [''])[0], depois = (/\s*$/.exec(texto) || [''])[0];
    return antes + r + depois;
  }
  window.danielTraduzir = function(t){ var r = traduzir(t); return r == null ? t : r; };

  // ======================================================
  // Aplicar à página (guardando sempre o original em português)
  // ======================================================
  var originalTexto = new WeakMap(), ultimoTexto = new WeakMap();
  var ATRIBUTOS = ['placeholder', 'title', 'aria-label', 'alt'];
  var IGNORAR = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, CODE: 1, PRE: 1, SVG: 1 };

  // paraAtributos: um <textarea> pode ter o placeholder traduzido, mas
  // nunca o texto que a pessoa lá escreveu.
  function ignorado(el, paraAtributos){
    var primeiro = true;
    while (el && el.nodeType === 1) {
      var tag = el.tagName.toUpperCase();
      var saltar = IGNORAR[tag] && !(paraAtributos && primeiro && tag === 'TEXTAREA');
      if (saltar || el.hasAttribute('data-no-i18n') || el.isContentEditable) return true;
      el = el.parentNode;
      primeiro = false;
    }
    return false;
  }

  function aplicarTexto(no){
    var actual = no.nodeValue;
    if (!actual || !/[A-Za-zÀ-ú]/.test(actual)) return;
    var orig = originalTexto.get(no);
    if (orig === undefined || actual !== ultimoTexto.get(no)) {
      orig = actual;
      originalTexto.set(no, orig);
    }
    var novo = lang === 'pt' ? orig : (traduzir(orig) || orig);
    ultimoTexto.set(no, novo);
    if (novo !== actual) no.nodeValue = novo;
  }

  function aplicarAtributos(el){
    if (!el.__diaOrig) el.__diaOrig = {};
    if (!el.__diaUlt) el.__diaUlt = {};
    var lista = ATRIBUTOS.slice();
    if (el.tagName === 'INPUT' && /^(button|submit)$/i.test(el.type)) lista.push('value');
    for (var i = 0; i < lista.length; i++) {
      var a = lista[i];
      if (!el.hasAttribute(a)) continue;
      var actual = el.getAttribute(a);
      var orig = el.__diaOrig[a];
      if (orig === undefined || actual !== el.__diaUlt[a]) { orig = actual; el.__diaOrig[a] = orig; }
      var novo = lang === 'pt' ? orig : (traduzir(orig) || orig);
      el.__diaUlt[a] = novo;
      if (novo !== actual) el.setAttribute(a, novo);
    }
  }

  function percorrer(raiz){
    if (!raiz) return;
    if (raiz.nodeType === 3) { if (!ignorado(raiz.parentNode)) aplicarTexto(raiz); return; }
    if (raiz.nodeType !== 1 && raiz.nodeType !== 9 && raiz.nodeType !== 11) return;
    if (raiz.nodeType === 1 && ignorado(raiz)) {
      if (!ignorado(raiz, true)) aplicarAtributos(raiz);
      return;
    }
    if (raiz.nodeType === 1) aplicarAtributos(raiz);
    var w = document.createTreeWalker(raiz, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: function(n){
        if (n.nodeType === 1) {
          if (n.hasAttribute('data-no-i18n') || n.isContentEditable) return NodeFilter.FILTER_REJECT;
          if (n.tagName.toUpperCase() === 'TEXTAREA') { aplicarAtributos(n); return NodeFilter.FILTER_REJECT; }
          return IGNORAR[n.tagName.toUpperCase()] ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) aplicarTexto(n); else aplicarAtributos(n);
    }
  }

  var tituloOriginal = null, tituloUltimo = null;
  function aplicarTitulo(){
    var actual = document.title;
    if (tituloOriginal === null || actual !== tituloUltimo) tituloOriginal = actual;
    var novo = lang === 'pt' ? tituloOriginal : (traduzir(tituloOriginal) || tituloOriginal);
    tituloUltimo = novo;
    if (novo !== actual) document.title = novo;
  }

  function aplicarTudo(){
    if (!document.body) return;
    percorrer(document.body);
    aplicarTitulo();
    document.documentElement.setAttribute('lang', lang);
    actualizarSeletor();
  }

  var observador = new MutationObserver(function(mutacoes){
    if (!pronto) return;
    for (var i = 0; i < mutacoes.length; i++) {
      var m = mutacoes[i];
      if (m.type === 'childList') {
        for (var j = 0; j < m.addedNodes.length; j++) percorrer(m.addedNodes[j]);
      } else if (m.type === 'characterData') {
        if (!ignorado(m.target.parentNode)) aplicarTexto(m.target);
      } else if (m.type === 'attributes' && m.target.nodeType === 1 && !ignorado(m.target, true)) {
        aplicarAtributos(m.target);
      }
    }
  });

  // alert/confirm/prompt também no idioma escolhido
  ['alert', 'confirm', 'prompt'].forEach(function(nome){
    var original = window[nome];
    if (typeof original !== 'function') return;
    window[nome] = function(msg){
      var args = Array.prototype.slice.call(arguments);
      if (typeof msg === 'string') args[0] = window.danielTraduzir(msg);
      return original.apply(window, args);
    };
  });

  // ======================================================
  // Dicionários (carregados só quando precisos)
  // ======================================================
  var aCarregar = {};
  window.__danielI18nRegistar = function(l, textos, padroes){
    dicionarios[l] = {
      textos: textos,
      padroes: (padroes || []).map(function(p){ return { re: new RegExp(p[0]), t: p[1] }; })
    };
    var cb = aCarregar[l] || [];
    delete aCarregar[l];
    cb.forEach(function(f){ f(); });
  };
  function carregar(l, feito){
    if (l === 'pt' || dicionarios[l]) { feito(); return; }
    if (aCarregar[l]) { aCarregar[l].push(feito); return; }
    aCarregar[l] = [feito];
    var s = document.createElement('script');
    s.src = BASE + 'lang-' + l + '.js?v=1';
    s.async = true;
    s.onerror = function(){ var cb = aCarregar[l] || []; delete aCarregar[l]; cb.forEach(function(f){ f(); }); };
    (document.head || document.documentElement).appendChild(s);
  }

  function mudarIdioma(l){
    if (LINGUAS.indexOf(l) === -1 || l === lang) { fecharMenu(); return; }
    guardar(l);
    carregar(l, function(){
      lang = l;
      window.DANIEL_IDIOMA = l;
      aplicarTudo();
      fecharMenu();
      try { window.dispatchEvent(new CustomEvent('daniel-idioma', { detail: { idioma: l } })); } catch (e) {}
    });
  }
  window.danielMudarIdioma = mudarIdioma;

  // ======================================================
  // Selector de idioma
  // ======================================================
  var seletor = null;
  var GLOBO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"></circle><path d="M2.5 12h19"></path><path d="M12 2.5c2.6 2.8 3.9 6 3.9 9.5s-1.3 6.7-3.9 9.5c-2.6-2.8-3.9-6-3.9-9.5s1.3-6.7 3.9-9.5z"></path></svg>';
  var SETA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>';
  var VISTO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>';

  function estilosSeletor(){
    var css = ''
      + '.dia-lang{position:relative;display:inline-flex;flex-shrink:0;font-family:inherit;}'
      + '.dia-lang-btn{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 10px 0 9px;border-radius:10px;border:1px solid var(--border,rgba(255,255,255,.12));background:var(--card,rgba(17,10,27,.7));color:var(--text,#F6F2FB);font:600 12px/1 var(--font-mono,ui-monospace,SFMono-Regular,Menlo,monospace);letter-spacing:.05em;cursor:pointer;transition:border-color .15s,box-shadow .15s;}'
      + '.dia-lang-btn:hover{border-color:var(--accent-2,#89C804);}'
      + '.dia-lang-btn:focus-visible{outline:none;box-shadow:0 0 0 3px var(--accent-glow,rgba(137,200,4,.3));}'
      + '.dia-lang-btn svg{width:15px;height:15px;flex-shrink:0;}'
      + '.dia-lang-btn .seta{width:12px;height:12px;opacity:.6;transition:transform .15s;}'
      + '.dia-lang.aberto .dia-lang-btn .seta{transform:rotate(180deg);}'
      + '.dia-lang-menu{position:absolute;top:calc(100% + 8px);right:0;min-width:196px;padding:6px;border-radius:14px;border:1px solid var(--border,rgba(255,255,255,.12));background:var(--card,#110A1B);box-shadow:0 22px 50px rgba(0,0,0,.38);opacity:0;transform:translateY(-6px) scale(.98);transform-origin:top right;pointer-events:none;transition:opacity .16s,transform .16s;z-index:100000;}'
      + '.dia-lang.aberto .dia-lang-menu{opacity:1;transform:none;pointer-events:auto;}'
      + '.dia-lang-op{display:flex;align-items:center;gap:10px;width:100%;padding:9px 10px;border-radius:9px;border:0;background:transparent;color:var(--text,#F6F2FB);font:500 14px/1.2 var(--font-body,inherit);cursor:pointer;text-align:left;}'
      + '.dia-lang-op:hover,.dia-lang-op:focus-visible{outline:none;background:var(--tint-a,rgba(255,255,255,.06));}'
      + '.dia-lang-op .c{font:600 10.5px/1 var(--font-mono,ui-monospace,monospace);letter-spacing:.05em;padding:4px 6px;border-radius:6px;background:var(--tint-a,rgba(255,255,255,.08));color:var(--text-dim,#A89BBA);}'
      + '.dia-lang-op .v{margin-left:auto;width:15px;height:15px;color:var(--accent-2,#89C804);opacity:0;}'
      + '.dia-lang-op.on{font-weight:700;}'
      + '.dia-lang-op.on .c{background:var(--grad-accent,#89C804);color:var(--on-accent,#140620);}'
      + '.dia-lang-op.on .v{opacity:1;}'
      + '.dia-lang-flutuante{position:fixed;top:14px;right:14px;z-index:99999;}'
      + '@media (max-width:600px){.dia-lang-btn{height:32px;padding:0 8px;gap:5px;}.dia-lang-btn .seta{display:none;}}'
      + '@media (prefers-reduced-motion:reduce){.dia-lang-menu,.dia-lang-btn .seta{transition:none;}}';
    var st = document.createElement('style');
    st.setAttribute('data-daniel-ia', 'idioma');
    st.textContent = css;
    document.head.appendChild(st);
  }

  function fecharMenu(){
    if (!seletor) return;
    seletor.classList.remove('aberto');
    seletor.querySelector('.dia-lang-btn').setAttribute('aria-expanded', 'false');
  }

  function actualizarSeletor(){
    if (!seletor) return;
    seletor.querySelector('.dia-lang-cod').textContent = lang.toUpperCase();
    Array.prototype.forEach.call(seletor.querySelectorAll('.dia-lang-op'), function(b){
      var on = b.getAttribute('data-l') === lang;
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
  }

  function montarSeletor(){
    if (seletor || document.querySelector('[data-sem-idioma]')) return;
    estilosSeletor();
    seletor = document.createElement('div');
    seletor.className = 'dia-lang';
    seletor.setAttribute('data-no-i18n', '');
    seletor.innerHTML = '<button type="button" class="dia-lang-btn" aria-haspopup="true" aria-expanded="false" aria-label="Idioma / Language" title="Idioma / Language">'
      + GLOBO + '<span class="dia-lang-cod">PT</span>' + SETA.replace('<svg ', '<svg class="seta" ') + '</button>'
      + '<div class="dia-lang-menu" role="radiogroup" aria-label="Idioma / Language">'
      + LINGUAS.map(function(l){
          return '<button type="button" class="dia-lang-op" role="radio" data-l="' + l + '"><span class="c">' + l.toUpperCase() + '</span>' + NOMES[l] + VISTO.replace('<svg ', '<svg class="v" ') + '</button>';
        }).join('')
      + '</div>';

    var lugar = document.querySelector('[data-lugar-idioma]') || document.querySelector('.top-actions');
    if (lugar) {
      lugar.insertBefore(seletor, lugar.firstChild);
    } else if ((lugar = document.querySelector('.topbar'))) {
      lugar.appendChild(seletor);
    } else {
      seletor.classList.add('dia-lang-flutuante');
      document.body.appendChild(seletor);
      // Login e password nova: o botão do tema já está fixo no canto -
      // o selector fica logo à esquerda dele, à mesma altura.
      var tema = document.querySelector('.theme-toggle');
      var encostar = function(){
        if (!tema || getComputedStyle(tema).position !== 'fixed') return;
        var r = tema.getBoundingClientRect();
        seletor.style.top = Math.round(r.top + (r.height - 36) / 2) + 'px';
        seletor.style.right = Math.round(window.innerWidth - r.left + 8) + 'px';
      };
      encostar();
      window.addEventListener('resize', encostar);
    }

    var botao = seletor.querySelector('.dia-lang-btn');
    botao.addEventListener('click', function(e){
      e.stopPropagation();
      var aberto = seletor.classList.toggle('aberto');
      botao.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });
    Array.prototype.forEach.call(seletor.querySelectorAll('.dia-lang-op'), function(b){
      b.addEventListener('click', function(e){ e.stopPropagation(); mudarIdioma(b.getAttribute('data-l')); });
    });
    document.addEventListener('click', function(e){ if (!seletor.contains(e.target)) fecharMenu(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') fecharMenu(); });
    actualizarSeletor();
  }

  // ======================================================
  // Arranque
  // ======================================================
  function arrancar(){
    montarSeletor();
    carregar(lang, function(){
      pronto = true;
      aplicarTudo();
      esperar(false);
      observador.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATRIBUTOS.concat(['value']) });
      new MutationObserver(aplicarTitulo).observe(document.querySelector('title') || document.head, { childList: true, characterData: true, subtree: true });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
