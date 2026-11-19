/*
  Daniel IA - métodos de pagamento ligados (1.92.0)
  -------------------------------------------------
  Carregado nas páginas onde se paga (planos, domínios, recargas). Pergunta ao
  servidor que métodos estão ligados, tira da página os desligados, escolhe
  sozinho o único que sobra e mostra um aviso por cima dos botões.
  Quem liga e desliga é o painel de administração (Pagamentos).
*/
(function(){
  'use strict';
  var API = 'https://mc-8oxfde5o71.bunny.run';
  function aplicar(M){
    var tiles = document.querySelectorAll('.metodo-tile[data-metodo]');
    if (!tiles.length) return;
    var soCartao = M.length === 1 && M[0] === 'cartao', caixas = [];
    Array.prototype.forEach.call(tiles, function(t){
      var p = t.parentNode; if (!p) return;
      if (M.indexOf(t.getAttribute('data-metodo')) < 0) p.removeChild(t);
      if (caixas.indexOf(p) < 0) caixas.push(p);
    });
    caixas.forEach(function(p){
      if (!p.previousElementSibling || !p.previousElementSibling.classList.contains('pm-nota')) {
        var n = document.createElement('div'); n.className = 'pm-nota'; n.setAttribute('role', 'status');
        n.style.cssText = 'display:flex;gap:10px;align-items:flex-start;margin:0 0 10px;padding:11px 13px;border-radius:12px;border:1px solid rgba(208,135,0,.45);background:rgba(208,135,0,.10);font-size:13px;line-height:1.45;font-weight:600;color:inherit;';
        n.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#D08700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:0 0 18px;width:18px;height:18px;margin-top:1px"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg><span></span>';
        n.querySelector('span').textContent = soCartao ? 'De momento só aceitamos pagamentos por cartão Visa ou Mastercard. O M-Pesa e o e-Mola estão temporariamente indisponíveis.' : 'Alguns métodos de pagamento estão temporariamente indisponíveis.';
        p.parentNode.insertBefore(n, p);
      }
      var escolher = function(){ var r = p.querySelectorAll('.metodo-tile'); if (r.length === 1 && !r[0].classList.contains('seleccionado')) r[0].click(); };
      escolher();
      if (window.MutationObserver) new MutationObserver(escolher).observe(p, { attributes: true, subtree: true, attributeFilter: ['class'] });
    });
    if (soCartao) {
      var d = document.getElementById('telefone-dica');
      if (d) {
        // a página volta a escrever a dica antiga (fala em M-Pesa e e-Mola) sempre que o campo fica vazio
        var trocar = function(){ if (/M-Pesa \(84\/85\) ou e-Mola/.test(d.textContent)) d.textContent = 'Usamos o teu número só para te contactar sobre o pagamento.'; };
        trocar();
        if (window.MutationObserver) new MutationObserver(trocar).observe(d, { childList: true, characterData: true, subtree: true });
      }
    }
  }
  function ir(M){ if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ aplicar(M); }); else aplicar(M); }
  fetch(API + '/pagamentos-lojas').then(function(r){ return r.json(); }).then(function(r){
    var M = r && r.response && r.response.metodos;
    if (!M || !M.length || M.length >= 3) return;
    ir(M);
  }).catch(function(){});
})();
