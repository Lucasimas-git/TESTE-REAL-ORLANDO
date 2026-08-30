import { LINKS } from './config.js';

// Reservado para o comportamento do header (ex.: menu mobile) quando as páginas
// internas ganharem navegação nas próximas fases.
export function initNavigation() {
  // Cardápio/Combos/Sobre/Contato ainda apontam para "#" (páginas não existem
  // nesta fase). Sem isso, o clique dispara o scroll-behavior:smooth do body
  // e arremessa a página inteira pro topo — parece um link quebrado quando o
  // usuário já rolou a página. Impede esse salto até as rotas existirem.
  document.querySelectorAll('a[href="#"]').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });
}

/**
 * Liga todos os botões de WhatsApp de uma vez.
 *
 * Existem ~8 botões "Pedir no WhatsApp" espalhados por cada página interna.
 * Em vez de deixar o número repetido no HTML (e alguém esquecer um), cada
 * botão só declara a marca (`data-wa="franguinn"`) e o número real vem de
 * LINKS em config.js — um lugar só para atualizar quando ele chegar.
 *
 * Enquanto LINKS.<marca>.whatsapp for null, os botões continuam como "#" e
 * inertes (initNavigation já bloqueia o salto), sem link quebrado na tela.
 */
export function initWhatsappLinks() {
  document.querySelectorAll('[data-wa]').forEach((link) => {
    const url = LINKS[link.dataset.wa]?.whatsapp;
    if (!url) return;

    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
  });
}
