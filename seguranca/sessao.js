/*
  Daniel IA - sessão em todas as páginas (15/10/2026)
  ---------------------------------------------------
  O container passou a exigir, em todas as rotas da conta, o id da conta
  (owner) MAIS o token de sessão que recebeste ao entrar. Este ficheiro
  trata disso sozinho, sem mexer no código de cada página:
    - junta owner + token a todos os pedidos feitos ao container;
    - se o container responder que a sessão expirou, limpa este browser
      e volta ao ecrã de entrar;
    - ao sair da conta, avisa o container para o token deixar de valer.
*/
(function(){
  'use strict';
  if (window.__danielSessao) return;
  window.__danielSessao = true;

  var CONTAINER = 'https://mc-8oxfde5o71.bunny.run';
  var fetchOriginal = window.fetch;

  function ler(chave){ try { return localStorage.getItem(chave) || ''; } catch (e) { return ''; } }
  function eLogin(){ return /^\/(index\.html)?$/.test(location.pathname); }

  function sessaoExpirou(){
    if (eLogin()) return;
    try { localStorage.removeItem('daniel_owner'); localStorage.removeItem('daniel_token'); } catch (e) {}
    location.href = '/?sessao=expirou';
  }

  window.fetch = function(entrada, opcoes){
    var url = typeof entrada === 'string' ? entrada : (entrada && entrada.url) || '';
    var paraContainer = url.indexOf(CONTAINER) === 0;
    if (paraContainer && opcoes && typeof opcoes.body === 'string') {
      try {
        var owner = ler('daniel_owner'), token = ler('daniel_token');
        var corpo = JSON.parse(opcoes.body);
        if (owner && corpo && typeof corpo === 'object' && !Array.isArray(corpo)) {
          if (!corpo.owner) corpo.owner = owner;
          if (corpo.owner === owner && token && !corpo.token) corpo.token = token;
          opcoes = Object.assign({}, opcoes, { body: JSON.stringify(corpo) });
        }
      } catch (e) {}
    }
    var promessa = fetchOriginal.call(this, entrada, opcoes);
    if (paraContainer) {
      promessa.then(function(res){
        res.clone().json().then(function(j){
          if (j && j.codigo === 'sessao') sessaoExpirou();
        }).catch(function(){});
      }).catch(function(){});
    }
    return promessa;
  };

  // Sair: quando uma página apaga o token deste browser, o container
  // também o invalida (assim um token copiado deixa de servir).
  try {
    var removerOriginal = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function(chave){
      if (this === window.localStorage && chave === 'daniel_token') {
        var owner = ler('daniel_owner'), token = ler('daniel_token');
        if (owner && token) {
          try {
            fetchOriginal.call(window, CONTAINER + '/sair', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ owner: owner, token: token }),
              keepalive: true
            }).catch(function(){});
          } catch (e) {}
        }
      }
      return removerOriginal.apply(this, arguments);
    };
  } catch (e) {}

  // Conta guardada sem token (de antes desta versão): pede para entrar
  // outra vez, em vez de deixar a pessoa num dashboard que já não carrega.
  if (!eLogin() && ler('daniel_owner') && !ler('daniel_token')) {
    sessaoExpirou();
  }
})();
