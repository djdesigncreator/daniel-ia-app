/* Daniel IA - 1.66.1: no plano Free o site não se edita (fica como foi criado).
   Dashboard: os botões "Editar com IA" e "Editar no site" ficam com cadeado e
   mostram o aviso. Editor (data-modo="editor"): o editor fica bloqueado. */
(function(){
  var CONTAINER = 'https://mc-8oxfde5o71.bunny.run';
  var eu = document.currentScript;
  var modo = (eu && eu.getAttribute('data-modo')) || 'dashboard';
  var owner = '';
  try { owner = localStorage.getItem('daniel_owner') || ''; } catch (e) {}
  if (!owner) return;
  var T = function(s){ try { return window.danielTraduzir ? window.danielTraduzir(s) : s; } catch (e) { return s; } };
  var free = false;
  var CADEADO = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:5px" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

  function estilos(){
    if (document.getElementById('dia-free-css')) return;
    var st = document.createElement('style');
    st.id = 'dia-free-css';
    st.textContent = ''
      + '.dia-free-fundo{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(10,4,18,.62);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:diaFreeEntra .25s ease-out;}'
      + '.dia-free-caixa{position:relative;width:100%;max-width:440px;padding:30px 26px 24px;border-radius:24px;background:var(--card,#fff);color:var(--text,#1A0A27);border:1px solid var(--border,#EAE2F2);box-shadow:0 40px 90px -30px rgba(0,0,0,.6);text-align:center;font-family:var(--font-body,inherit);}'
      + '.dia-free-ic{width:58px;height:58px;margin:0 auto 16px;border-radius:18px;display:flex;align-items:center;justify-content:center;background:var(--grad-accent,#89C804);color:var(--on-accent,#1A0A27);box-shadow:0 14px 30px -10px rgba(137,200,4,.6);}'
      + '.dia-free-ic svg{width:26px;height:26px;}'
      + '.dia-free-caixa h3{margin:0 0 8px;font-family:var(--font-display,inherit);font-size:21px;letter-spacing:-.02em;line-height:1.25;}'
      + '.dia-free-caixa p{margin:0 0 20px;color:var(--text-dim,#6F5E81);font-size:14px;line-height:1.55;}'
      + '.dia-free-lista{display:grid;gap:8px;margin:0 0 22px;padding:0;list-style:none;text-align:left;}'
      + '.dia-free-lista li{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;line-height:1.45;}'
      + '.dia-free-lista li::before{content:"";flex-shrink:0;width:18px;height:18px;margin-top:1px;border-radius:6px;background:var(--grad-accent,#89C804);-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M20 6L9 17l-5-5%27 fill=%27none%27 stroke=%27black%27 stroke-width=%273%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E") center/14px no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27%3E%3Cpath d=%27M20 6L9 17l-5-5%27 fill=%27none%27 stroke=%27black%27 stroke-width=%273%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27/%3E%3C/svg%3E") center/14px no-repeat;}'
      + '.dia-free-accoes{display:flex;flex-direction:column;gap:10px;}'
      + '.dia-free-accoes a,.dia-free-accoes button{display:block;width:100%;padding:13px 18px;border-radius:14px;font:inherit;font-weight:800;font-size:14.5px;text-decoration:none;cursor:pointer;box-sizing:border-box;}'
      + '.dia-free-sim{background:var(--grad-accent,#89C804);color:var(--on-accent,#1A0A27);border:0;}'
      + '.dia-free-nao{background:transparent;color:var(--text,#1A0A27);border:1px solid var(--border,#EAE2F2);}'
      + '.dia-free-bloq{opacity:.78;}'
      + '@keyframes diaFreeEntra{from{opacity:0}to{opacity:1}}';
    document.head.appendChild(st);
  }

  function aviso(){
    estilos();
    if (document.querySelector('.dia-free-fundo')) return;
    var editor = modo === 'editor';
    var f = document.createElement('div');
    f.className = 'dia-free-fundo';
    f.setAttribute('role', 'dialog');
    f.setAttribute('aria-modal', 'true');
    f.innerHTML = '<div class="dia-free-caixa">'
      + '<div class="dia-free-ic">' + CADEADO.replace('width="13" height="13"', '').replace('style="vertical-align:-2px;margin-right:5px"', '') + '</div>'
      + '<h3>' + T('Editar o site faz parte dos planos pagos') + '</h3>'
      + '<p>' + T('No plano Free o teu site fica como foi criado. Sobe de plano e continua a melhorá-lo quando quiseres.') + '</p>'
      + '<ul class="dia-free-lista"><li>' + T('Editar com IA: pede e a IA muda o site') + '</li><li>' + T('Editor visual: clica em qualquer texto ou imagem e muda') + '</li><li>' + T('Mudar de layout e aplicar templates profissionais') + '</li></ul>'
      + '<div class="dia-free-accoes"><a class="dia-free-sim" href="/planos/">' + T('Ver planos') + '</a>'
      + (editor ? '<a class="dia-free-nao" href="/dashboard/">' + T('Voltar ao dashboard') + '</a>' : '<button type="button" class="dia-free-nao">' + T('Agora não') + '</button>')
      + '</div></div>';
    document.body.appendChild(f);
    if (!editor) {
      var fechar = function(){ f.remove(); };
      f.querySelector('.dia-free-nao').addEventListener('click', fechar);
      f.addEventListener('click', function(ev){ if (ev.target === f) fechar(); });
      document.addEventListener('keydown', function esc(ev){ if (ev.key === 'Escape') { fechar(); document.removeEventListener('keydown', esc); } });
    }
    var sim = f.querySelector('.dia-free-sim'); if (sim) sim.focus();
  }

  function marcar(){
    if (!free) return;
    var bs = document.querySelectorAll('.btn-editar-site, .btn-editor-site');
    for (var i = 0; i < bs.length; i++) {
      var b = bs[i];
      if (b.getAttribute('data-free')) continue;
      b.setAttribute('data-free', '1');
      b.title = T('Editar faz parte dos planos pagos');
      b.innerHTML = CADEADO + T(b.classList.contains('btn-editor-site') ? 'Editar no site' : 'Editar com IA');
      b.classList.add('dia-free-bloq');
    }
  }

  // Os cliques nos botões de editar são apanhados antes dos da própria página.
  document.addEventListener('click', function(ev){
    if (!free || modo === 'editor') return;
    var b = ev.target && ev.target.closest && ev.target.closest('.btn-editar-site, .btn-editor-site');
    if (!b) return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    aviso();
  }, true);

  fetch(CONTAINER + '/account', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ owner: owner }) })
    .then(function(r){ return r.json(); })
    .then(function(r){
      if (!r || r.status !== 'success' || !r.response || r.response.plano_pago !== false) return;
      free = true;
      window.DANIEL_FREE = true;
      if (modo === 'editor') { aviso(); return; }
      marcar();
      if ('MutationObserver' in window) new MutationObserver(marcar).observe(document.body, { childList: true, subtree: true });
    }).catch(function(){});
})();
