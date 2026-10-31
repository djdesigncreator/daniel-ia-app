/*
  Daniel IA - escrever por voz (1.77.0)
  -------------------------------------
  <script src="/suporte/voz.js?v=1" defer></script>
  Põe um botão "Falar" por baixo das caixas de pedido à IA. Grava até 3
  minutos, manda o áudio para /voz-transcrever e acrescenta o texto à caixa.
  Caixas: as que têm data-voz, e as dos pedidos à IA (lista ALVOS em baixo).
  Também apanha caixas criadas depois (janelas do editor e do dashboard).
*/
(function(){
  'use strict';
  if (window.__diaVoz) return;
  window.__diaVoz = true;
  var API = 'https://mc-8oxfde5o71.bunny.run';
  var ALVOS = 'textarea[data-voz],#f-prompt,#f-quiz-desc,#f-video-ideia,#editar-prompt,#ed-ia-pagina,#ed-ia-bloco,#vh-ideia';
  var MAX_S = 180;
  var podeGravar = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  function lang(){ var l = (document.documentElement.lang || 'pt').slice(0, 2).toLowerCase(); return /^(pt|en|fr|es)$/.test(l) ? l : 'pt'; }
  var TX = {
    pt: ['Falar em vez de escrever', 'A ouvir...', 'Parar e escrever', 'Cancelar', 'A passar a texto...', 'Texto acrescentado. Podes corrigir o que quiseres.', 'Não deu acesso ao microfone. Permite o microfone no navegador (no cadeado ao lado do endereço) e tenta outra vez.', 'Este navegador não deixa gravar. Usa o Chrome ou escreve o texto.', 'Sem ligação. Tenta outra vez.', 'Ver planos', 'Gasta poucos tokens do teu plano'],
    en: ['Speak instead of typing', 'Listening...', 'Stop and write', 'Cancel', 'Turning it into text...', 'Text added. You can edit anything you like.', "Couldn't access the microphone. Allow the microphone in your browser (padlock next to the address) and try again.", "This browser can't record. Use Chrome or type the text.", 'No connection. Try again.', 'See plans', 'Uses a few tokens from your plan'],
    fr: ['Parler au lieu d’écrire', 'À l’écoute...', 'Arrêter et écrire', 'Annuler', 'Transcription...', 'Texte ajouté. Vous pouvez le corriger.', 'Impossible d’accéder au micro. Autorisez le micro dans le navigateur (cadenas à côté de l’adresse) et réessayez.', 'Ce navigateur ne peut pas enregistrer. Utilisez Chrome ou tapez le texte.', 'Pas de connexion. Réessayez.', 'Voir les forfaits', 'Utilise quelques jetons de votre forfait'],
    es: ['Hablar en vez de escribir', 'Escuchando...', 'Parar y escribir', 'Cancelar', 'Pasando a texto...', 'Texto añadido. Puedes corregir lo que quieras.', 'No hay acceso al micrófono. Permite el micrófono en el navegador (candado junto a la dirección) e inténtalo otra vez.', 'Este navegador no puede grabar. Usa Chrome o escribe el texto.', 'Sin conexión. Inténtalo otra vez.', 'Ver planes', 'Gasta pocos tokens de tu plan']
  };
  function t(i){ return (TX[lang()] || TX.pt)[i]; }
  var CSS = ''
    + '.dvz{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:8px 0 2px;font-family:inherit}'
    + '.dvz-btn{display:inline-flex;align-items:center;gap:8px;min-height:36px;padding:0 13px 0 6px;border-radius:999px;border:1px solid var(--border,#d9cfe6);background:var(--card,#fff);color:var(--text,#1a0a27);font:700 12.5px/1 inherit;cursor:pointer;transition:border-color .15s,transform .15s}'
    + '.dvz-btn:hover{border-color:var(--accent-2,#430960);transform:translateY(-1px)}'
    + '.dvz-btn:focus-visible,.dvz-acc button:focus-visible{outline:2px solid var(--lime,#89C804);outline-offset:2px}'
    + '.dvz-mic{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:var(--grad-accent,linear-gradient(135deg,#C8F84A,#89C804));color:var(--on-accent,#140620)}'
    + '.dvz-mic svg{width:14px;height:14px}'
    + '.dvz-dica{font-size:11.5px;color:var(--text-dim,#6f5e81)}'
    + '.dvz-gravar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;width:100%;padding:8px 10px 8px 12px;border-radius:14px;border:1px solid rgba(255,92,122,.4);background:rgba(255,92,122,.07)}'
    + '.dvz-ponto{width:10px;height:10px;border-radius:50%;background:#FF5C7A;box-shadow:0 0 0 0 rgba(255,92,122,.6);animation:dvzP 1.2s infinite}'
    + '@keyframes dvzP{70%{box-shadow:0 0 0 9px rgba(255,92,122,0)}100%{box-shadow:0 0 0 0 rgba(255,92,122,0)}}'
    + '.dvz-tempo{font:700 12.5px/1 var(--font-mono,ui-monospace,monospace);color:var(--text,#1a0a27);min-width:38px}'
    + '.dvz-onda{display:flex;align-items:center;gap:2px;height:24px;flex:1;min-width:60px;max-width:220px}'
    + '.dvz-onda i{flex:1;max-width:4px;min-height:3px;border-radius:2px;background:#FF5C7A;opacity:.85;transition:height .08s}'
    + '.dvz-acc{display:flex;gap:6px;margin-left:auto}'
    + '.dvz-acc button{min-height:34px;padding:0 12px;border-radius:10px;font:800 12.5px/1 inherit;cursor:pointer;border:1px solid var(--border,#d9cfe6);background:var(--card,#fff);color:var(--text,#1a0a27)}'
    + '.dvz-acc .dvz-parar{background:var(--grad-accent,linear-gradient(135deg,#C8F84A,#89C804));color:var(--on-accent,#140620);border-color:transparent}'
    + '.dvz-msg{font-size:12px;line-height:1.45;color:var(--text-dim,#6f5e81);display:flex;align-items:center;gap:7px}'
    + '.dvz-msg.ok{color:var(--success,#5E9100)}.dvz-msg.erro{color:var(--error,#C0392B)}'
    + '.dvz-msg a{color:inherit;font-weight:800}'
    + '.dvz-giro{width:14px;height:14px;border-radius:50%;border:2px solid var(--border,#d9cfe6);border-top-color:var(--accent-2,#430960);animation:dvzG .8s linear infinite}'
    + '@keyframes dvzG{to{transform:rotate(360deg)}}'
    + '@media (max-width:520px){.dvz-acc{width:100%;margin-left:0}.dvz-acc button{flex:1}.dvz-dica{display:none}}'
    + '@media (prefers-reduced-motion:reduce){.dvz-ponto,.dvz-giro{animation:none}}';
  var MIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="21"/></svg>';
  var activo = null; // uma gravação de cada vez

  function preparar(ta){
    if (ta.__dvz || !podeGravar) return;
    ta.__dvz = true;
    if (!document.querySelector('style[data-dia="voz"]')) { var st = document.createElement('style'); st.setAttribute('data-dia', 'voz'); st.textContent = CSS; document.head.appendChild(st); }
    var barra = document.createElement('div');
    barra.className = 'dvz';
    ta.parentNode.insertBefore(barra, ta.nextSibling);
    function inicial(msg, tipo){
      barra.innerHTML = '<button type="button" class="dvz-btn" aria-label="' + t(0) + '"><span class="dvz-mic">' + MIC + '</span>' + t(0) + '</button>'
        + (msg ? '<span class="dvz-msg ' + (tipo || '') + '">' + msg + '</span>' : '<span class="dvz-dica">' + t(10) + '</span>');
      barra.querySelector('.dvz-btn').addEventListener('click', function(){ gravar(ta, barra, inicial); });
    }
    inicial();
  }

  function gravar(ta, barra, inicial){
    if (activo) activo.cancelar();
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }).then(function(stream){
      var tipos = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
      var mime = ''; for (var i = 0; i < tipos.length; i++) { if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(tipos[i])) { mime = tipos[i]; break; } }
      var rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      var partes = [], t0 = Date.now(), cancelado = false, raf = 0, ctx = null, an = null;
      barra.innerHTML = '<div class="dvz-gravar" role="status"><span class="dvz-ponto"></span><span class="dvz-tempo">0:00</span><span class="dvz-onda" aria-hidden="true">' + new Array(24).join('<i></i>') + '</span>'
        + '<span class="dvz-dica">' + t(1) + '</span><span class="dvz-acc"><button type="button" class="dvz-cancelar">' + t(3) + '</button><button type="button" class="dvz-parar">' + t(2) + '</button></span></div>';
      var tempo = barra.querySelector('.dvz-tempo'), barras = barra.querySelectorAll('.dvz-onda i');
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        an = ctx.createAnalyser(); an.fftSize = 64;
        ctx.createMediaStreamSource(stream).connect(an);
      } catch (e) { an = null; }
      var dados = an ? new Uint8Array(an.frequencyBinCount) : null;
      function animar(){
        var s = Math.floor((Date.now() - t0) / 1000);
        tempo.textContent = Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
        if (an) { an.getByteFrequencyData(dados); for (var k = 0; k < barras.length; k++) barras[k].style.height = Math.max(3, (dados[k % dados.length] || 0) / 255 * 24) + 'px'; }
        if (s >= MAX_S) return parar();
        raf = requestAnimationFrame(animar);
      }
      function fechar(){ cancelAnimationFrame(raf); stream.getTracks().forEach(function(x){ x.stop(); }); if (ctx && ctx.close) ctx.close().catch(function(){}); activo = null; }
      function parar(){ if (rec.state !== 'inactive') rec.stop(); }
      rec.ondataavailable = function(e){ if (e.data && e.data.size) partes.push(e.data); };
      rec.onstop = function(){
        var segundos = Math.round((Date.now() - t0) / 1000);
        fechar();
        if (cancelado) return inicial();
        var blob = new Blob(partes, { type: (rec.mimeType || mime || 'audio/webm').split(';')[0] });
        barra.innerHTML = '<span class="dvz-msg"><span class="dvz-giro"></span>' + t(4) + '</span>';
        var fr = new FileReader();
        fr.onload = function(){ enviar(String(fr.result).replace(/^data:([^;,]+)[^,]*,/, 'data:$1;base64,'), segundos, ta, inicial); };
        fr.readAsDataURL(blob);
      };
      barra.querySelector('.dvz-parar').addEventListener('click', parar);
      barra.querySelector('.dvz-cancelar').addEventListener('click', function(){ cancelado = true; parar(); });
      activo = { cancelar: function(){ cancelado = true; parar(); } };
      rec.start(250);
      animar();
    }).catch(function(){ inicial(t(6), 'erro'); });
  }

  function enviar(audio, segundos, ta, inicial){
    var owner = '', token = '';
    try { owner = localStorage.getItem('daniel_owner') || ''; token = localStorage.getItem('daniel_token') || ''; } catch (e) {}
    fetch(API + '/voz-transcrever', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ owner: owner, token: token, audio: audio, segundos: segundos, idioma: lang() }) })
      .then(function(r){ return r.json(); })
      .then(function(r){
        if (!r || r.status !== 'success') {
          return inicial(esc((r && r.message) || t(8)) + (r && r.codigo === 'tokens' ? ' <a href="/planos/">' + t(9) + ' →</a>' : ''), 'erro');
        }
        var txt = r.response.texto, actual = ta.value;
        var novo = actual ? actual.replace(/\s+$/, '') + (/[.!?]$/.test(actual.trim()) ? ' ' : (actual.trim() ? '. ' : '')) + txt : txt;
        var max = Number(ta.getAttribute('maxlength')) || 0;
        ta.value = max ? novo.slice(0, max) : novo;
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        ta.dispatchEvent(new Event('change', { bubbles: true }));
        ta.focus();
        try { ta.setSelectionRange(ta.value.length, ta.value.length); } catch (e) {}
        inicial('✓ ' + t(5), 'ok');
      })
      .catch(function(){ inicial(t(8), 'erro'); });
  }
  function esc(x){ return String(x == null ? '' : x).replace(/[&<>"']/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function procurar(raiz){
    if (!podeGravar) return;
    var l = (raiz || document).querySelectorAll ? (raiz || document).querySelectorAll(ALVOS) : [];
    for (var i = 0; i < l.length; i++) preparar(l[i]);
    if (raiz && raiz.matches && raiz.matches(ALVOS)) preparar(raiz);
  }
  function arrancar(){
    procurar(document);
    new MutationObserver(function(ms){
      ms.forEach(function(m){ Array.prototype.forEach.call(m.addedNodes, function(n){ if (n.nodeType === 1) procurar(n); }); });
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
