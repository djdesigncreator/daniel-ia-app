/*
  Daniel IA - aviso e preferências de cookies (1.70.0)
  ----------------------------------------------------
  Usa-se em todas as páginas da Daniel IA (app e landing):
    <script src="https://app.daniel-ia.pro/suporte/cookies.js" defer></script>
  Atributos opcionais:
    data-rodape="1"  acrescenta, no fim da página, os links legais
  Qualquer elemento com data-dia-cookies abre as preferências.
  Hoje a Daniel IA só usa armazenamento essencial; as categorias
  "estatísticas" e "marketing" ficam desligadas até serem precisas.
  Outros scripts podem perguntar: window.danielCookies.permite('estatisticas').
*/
(function(){
  'use strict';
  if (window.danielCookies) return;
  var eu = document.currentScript;
  var BASE = 'https://app.daniel-ia.pro';
  try { if (eu && eu.src) BASE = new URL(eu.src).origin; } catch (e) {}
  var LEGAL = BASE + '/legal/';
  var ALVO = '';
  try { if (window.top !== window) ALVO = ' target="_blank" rel="noopener"'; } catch (e) { ALVO = ' target="_blank" rel="noopener"'; }
  var CHAVE = 'dia_consent', VERSAO = 1, VALIDADE = 365 * 864e5;
  function ler(){ try { var c = JSON.parse(localStorage.getItem(CHAVE) || 'null'); if (c && c.v === VERSAO && Date.now() - (c.t || 0) < VALIDADE) return c; } catch (e) {} return null; }
  function gravar(c){ c.v = VERSAO; c.t = Date.now(); try { localStorage.setItem(CHAVE, JSON.stringify(c)); } catch (e) {} try { window.dispatchEvent(new CustomEvent('dia-consentimento', { detail: c })); } catch (e) {} }
  var IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.5 12.5A9.5 9.5 0 1 1 11.5 2.5a3 3 0 0 0 4 4 3 3 0 0 0 4 4 3 3 0 0 0 2 2z"/><circle cx="8.5" cy="9.5" r="1"/><circle cx="14.5" cy="15.5" r="1"/><circle cx="8.5" cy="15.5" r="1"/></svg>';
  var CSS = ''
    + '.dck{--dck-f:var(--card,#fff);--dck-t:var(--text,#1A0A27);--dck-s:var(--text-dim,#5F5070);--dck-b:var(--border,#E2D8EC);--dck-a:var(--accent-2,#430960);font-family:var(--font-body,"Manrope",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif);}'
    + '.dck-aviso{position:fixed;left:16px;bottom:16px;z-index:2147482000;width:min(420px,calc(100vw - 32px));padding:18px 18px 16px;border-radius:20px;background:var(--dck-f);color:var(--dck-t);border:1px solid var(--dck-b);box-shadow:0 24px 60px -20px rgba(20,6,34,.45);animation:dckEntra .35s ease-out;}'
    + '@keyframes dckEntra{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}'
    + '.dck-cab{display:flex;align-items:center;gap:10px;margin-bottom:8px;}.dck-cab b{font-size:15.5px;}'
    + '.dck-ic{width:34px;height:34px;border-radius:11px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#C8F84A,#89C804);color:#140620;flex-shrink:0;}.dck-ic svg{width:19px;height:19px;}'
    + '.dck p{margin:0 0 14px;font-size:13.5px;line-height:1.55;color:var(--dck-s);}.dck p a{color:var(--dck-a);font-weight:700;}'
    + '.dck-btns{display:flex;gap:8px;flex-wrap:wrap;}'
    + '.dck-btn{flex:1;min-width:120px;padding:11px 14px;border-radius:12px;font-family:inherit;font-weight:800;font-size:13.5px;line-height:1;cursor:pointer;border:1px solid var(--dck-b);background:transparent;color:var(--dck-t);}'
    + '.dck-btn.pri{background:linear-gradient(135deg,#C8F84A,#89C804);border-color:transparent;color:#140620;}'
    + '.dck-btn:focus-visible{outline:3px solid var(--dck-a);outline-offset:2px;}'
    + '.dck-fundo{position:fixed;inset:0;z-index:2147482500;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(10,4,18,.55);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);}'
    + '.dck-modal{width:100%;max-width:520px;max-height:92vh;overflow:auto;padding:22px;border-radius:22px;background:var(--dck-f);color:var(--dck-t);border:1px solid var(--dck-b);box-shadow:0 40px 90px -30px rgba(0,0,0,.55);}'
    + '.dck-modal h3{margin:0 0 6px;font-size:19px;}'
    + '.dck-cat{display:flex;gap:14px;align-items:flex-start;justify-content:space-between;padding:14px 0;border-top:1px solid var(--dck-b);}'
    + '.dck-cat b{display:block;font-size:14.5px;margin-bottom:3px;}.dck-cat small{display:block;font-size:12.5px;line-height:1.5;color:var(--dck-s);}'
    + '.dck-sw{position:relative;flex-shrink:0;width:44px;height:25px;}.dck-sw input{position:absolute;opacity:0;inset:0;margin:0;cursor:pointer;z-index:1;}.dck-sw i{position:absolute;inset:0;border-radius:99px;background:var(--dck-b);transition:background .2s;}'
    + '.dck-sw i::after{content:"";position:absolute;top:3px;left:3px;width:19px;height:19px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .2s;}'
    + '.dck-sw input:checked+i{background:#89C804;}.dck-sw input:checked+i::after{transform:translateX(19px);}.dck-sw input:disabled{cursor:default;}.dck-sw input:disabled+i{opacity:.7;}'
    + '.dck-sw input:focus-visible+i{outline:3px solid var(--dck-a);outline-offset:2px;}'
    + '.dck-rodape{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 16px;padding:22px 16px 28px;font-size:12.5px;}'
    + '.dck-rodape a,.dck-rodape button{color:var(--dck-s);text-decoration:none;font-family:inherit;font-weight:600;font-size:12.5px;background:none;border:none;padding:0;cursor:pointer;}'
    + '.dck-rodape a:hover,.dck-rodape button:hover{color:var(--dck-a);text-decoration:underline;}'
    + '.dck-rodape span{color:var(--dck-s);opacity:.8;}'
    + '@media (max-width:480px){.dck-aviso{left:10px;right:10px;bottom:10px;width:auto;}}';
  function estilos(){ if (document.getElementById('dck-css')) return; var s = document.createElement('style'); s.id = 'dck-css'; s.textContent = CSS; document.head.appendChild(s); }
  var aviso = null;
  function fecharAviso(){ if (aviso) { aviso.remove(); aviso = null; } }
  function mostrarAviso(){
    estilos();
    if (aviso) return;
    aviso = document.createElement('div');
    aviso.className = 'dck dck-aviso';
    aviso.setAttribute('role', 'region');
    aviso.setAttribute('aria-label', 'Cookies');
    aviso.innerHTML = '<div class="dck-cab"><span class="dck-ic">' + IC + '</span><b>Cookies na Daniel IA</b></div>'
      + '<p>Usamos só o essencial para manter a tua sessão e lembrar as tuas preferências. <b>Sem publicidade nem seguimento.</b> Sabe mais na <a' + ALVO + ' href="' + LEGAL + 'cookies/">Política de Cookies</a>.</p>'
      + '<div class="dck-btns"><button type="button" class="dck-btn" data-dck="pref">Preferências</button><button type="button" class="dck-btn pri" data-dck="ok">Entendi</button></div>';
    document.body.appendChild(aviso);
    aviso.querySelector('[data-dck="ok"]').addEventListener('click', function(){ gravar({ essenciais: true, estatisticas: false, marketing: false }); fecharAviso(); });
    aviso.querySelector('[data-dck="pref"]').addEventListener('click', abrir);
  }
  function abrir(){
    estilos();
    fecharAviso();
    var c = ler() || { estatisticas: false, marketing: false };
    var f = document.createElement('div');
    f.className = 'dck dck-fundo';
    f.innerHTML = '<div class="dck-modal" role="dialog" aria-modal="true" aria-labelledby="dck-tit"><h3 id="dck-tit">Preferências de cookies</h3>'
      + '<p>Escolhe o que a Daniel IA pode guardar no teu navegador. Podes mudar quando quiseres no link "Preferências de cookies", no fundo das páginas.</p>'
      + linha('essenciais', 'Essenciais', 'Sessão, segurança, tema e idioma. Sem eles a Daniel IA não funciona.', true, true)
      + linha('estatisticas', 'Estatísticas', 'Contar visitas para melhorar o serviço. Neste momento não usamos.', !!c.estatisticas, false)
      + linha('marketing', 'Marketing', 'Publicidade e redes sociais. Neste momento não usamos.', !!c.marketing, false)
      + '<div class="dck-btns" style="margin-top:6px"><button type="button" class="dck-btn" data-dck="rec">Só essenciais</button><button type="button" class="dck-btn pri" data-dck="guardar">Guardar escolhas</button></div>'
      + '<p style="margin:14px 0 0;text-align:center"><a' + ALVO + ' href="' + LEGAL + 'cookies/">Política de Cookies</a> · <a' + ALVO + ' href="' + LEGAL + 'privacidade/">Privacidade</a></p></div>';
    document.body.appendChild(f);
    var fechar = function(){ f.remove(); document.removeEventListener('keydown', esc); };
    var esc = function(e){ if (e.key === 'Escape') { if (!ler()) gravar({ essenciais: true, estatisticas: false, marketing: false }); fechar(); } };
    document.addEventListener('keydown', esc);
    f.querySelector('[data-dck="rec"]').addEventListener('click', function(){ gravar({ essenciais: true, estatisticas: false, marketing: false }); fechar(); });
    f.querySelector('[data-dck="guardar"]').addEventListener('click', function(){
      gravar({ essenciais: true, estatisticas: f.querySelector('[name="estatisticas"]').checked, marketing: f.querySelector('[name="marketing"]').checked });
      fechar();
    });
    var g = f.querySelector('[data-dck="guardar"]'); if (g) g.focus();
  }
  function linha(nome, titulo, texto, on, fixo){
    return '<div class="dck-cat"><div><b>' + titulo + (fixo ? ' <small style="display:inline;font-weight:700">· sempre activos</small>' : '') + '</b><small>' + texto + '</small></div>'
      + '<label class="dck-sw"><input type="checkbox" name="' + nome + '"' + (on ? ' checked' : '') + (fixo ? ' disabled' : '') + ' aria-label="' + titulo + '"><i></i></label></div>';
  }
  function rodape(){
    estilos();
    if (document.querySelector('.dck-rodape')) return;
    var r = document.createElement('nav');
    r.className = 'dck dck-rodape';
    r.setAttribute('aria-label', 'Informação legal');
    r.innerHTML = '<span>© ' + new Date().getFullYear() + ' Daniel IA</span>'
      + '<a' + ALVO + ' href="' + LEGAL + 'privacidade/">Privacidade</a><a' + ALVO + ' href="' + LEGAL + 'termos/">Termos</a><a' + ALVO + ' href="' + LEGAL + 'pagamentos/">Pagamentos e reembolsos</a>'
      + '<a' + ALVO + ' href="' + LEGAL + 'uso-aceitavel/">Uso aceitável</a><a' + ALVO + ' href="' + LEGAL + 'cookies/">Cookies</a><button type="button" data-dia-cookies>Preferências de cookies</button>';
    var alvo = eu && eu.getAttribute('data-rodape');
    var pai = (alvo && alvo !== '1' && document.querySelector(alvo)) || document.body;
    pai.appendChild(r);
  }
  document.addEventListener('click', function(e){
    var b = e.target && e.target.closest && e.target.closest('[data-dia-cookies]');
    if (!b) return;
    e.preventDefault();
    abrir();
  });
  window.danielCookies = {
    abrir: abrir,
    consentimento: ler,
    permite: function(cat){ if (cat === 'essenciais') return true; var c = ler(); return !!(c && c[cat]); }
  };
  function iniciar(){
    if (eu && eu.getAttribute('data-rodape')) rodape();
    if (!(eu && eu.getAttribute('data-aviso') === '0') && !ler()) setTimeout(mostrarAviso, 600);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
