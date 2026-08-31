import { LINKS, WHATSAPP_TESTE, WHATSAPP_MENSAGEM } from './config.js';

export function initNavigation() {
  // Links ainda sem destino (href="#") disparariam o scroll-behavior:smooth
  // do documento e arremessariam a página inteira para o topo — parece link
  // quebrado depois que o usuário já rolou. Neutraliza o salto.
  //
  // Os botões [data-wa] ficam de fora: eles nascem com href="#" no HTML mas
  // recebem o link do WhatsApp em initWhatsappLinks. Sem essa exceção, o
  // preventDefault continuaria grudado neles e mataria o clique depois de
  // o href já estar correto.
  document.querySelectorAll('a[href="#"]:not([data-wa])').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });

  suavizarAncoras();
}

/**
 * Rolagem até âncoras internas com o cabeçalho fixo descontado.
 *
 * `scroll-margin-top` no CSS resolveria, mas o cabeçalho encolhe conforme a
 * página rola: um valor fixo ora sobra, ora deixa o título por baixo da
 * barra. Medir a altura real no momento do clique acerta nos dois estados.
 */
function suavizarAncoras() {
  const nav = document.querySelector('.page-nav');
  if (!nav) return;

  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((link) => {
    link.addEventListener('click', (event) => {
      const alvo = document.getElementById(link.getAttribute('href').slice(1));
      if (!alvo) return;

      event.preventDefault();

      const topo = alvo.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 12;
      window.scrollTo({
        top: Math.max(0, topo),
        // Respeita quem pediu menos animação no sistema; para essas pessoas
        // o salto instantâneo é o comportamento correto, não uma falha.
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });

      // O scroll programático não mexe no hash. Repõe manualmente para o
      // link continuar copiável e o "voltar" continuar previsível.
      history.replaceState(null, '', link.getAttribute('href'));
    });
  });
}

/**
 * Liga todos os botões de WhatsApp de uma vez.
 *
 * São ~20 botões "Pedir no WhatsApp" entre as duas páginas internas. Em vez
 * de repetir o número no HTML (e alguém esquecer um na hora de trocar), cada
 * botão só declara a marca (`data-wa="franguinn"`) e o link é montado aqui a
 * partir de config.js — um lugar só para atualizar quando o número chegar.
 */
export function initWhatsappLinks() {
  const elementos = [...document.querySelectorAll('[data-wa]')];
  if (elementos.length === 0) return;

  let usouTeste = false;

  elementos.forEach((link) => {
    const marca = link.dataset.wa;
    const numero = LINKS[marca]?.whatsapp;

    if (!numero) usouTeste = true;

    const texto = encodeURIComponent(WHATSAPP_MENSAGEM[marca] || '');
    link.href = `https://wa.me/${numero || WHATSAPP_TESTE}?text=${texto}`;
    link.target = '_blank';
    // noopener fecha o acesso da aba nova a window.opener; noreferrer evita
    // vazar a URL da página no cabeçalho Referer.
    link.rel = 'noopener noreferrer';
  });

  if (usouTeste) {
    console.info(
      '[Franguinn/Hamburguinn] Botões de WhatsApp usando o número de TESTE (inválido). ' +
        'Preencha LINKS.<marca>.whatsapp em src/js/config.js para ativar o número real.',
    );
  }
}
