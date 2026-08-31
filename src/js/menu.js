/**
 * Filtro de categorias do cardápio das páginas internas.
 *
 * Progressive enhancement: sem JS, TODOS os cards ficam visíveis (nenhum
 * nasce com `hidden` no HTML) e a faixa de filtros vira apenas decoração.
 * Só depois que este módulo roda é que o estado inicial é aplicado.
 */
export function initMenuFilter() {
  document.querySelectorAll('[data-menu]').forEach(setupMenu);
}

function setupMenu(root) {
  const chips = [...root.querySelectorAll('[data-filter]')];
  const cards = [...root.querySelectorAll('[data-cat]')];
  const empty = root.querySelector('[data-menu-empty]');
  const status = root.querySelector('[data-menu-status]');

  if (chips.length === 0 || cards.length === 0) return;

  function apply(filter) {
    let visible = 0;

    cards.forEach((card) => {
      // data-cat guarda uma lista de tokens ("smashs destaque"), então um
      // mesmo produto pode aparecer em mais de uma aba sem ser duplicado.
      const match = filter === 'todos' || card.dataset.cat.split(/\s+/).includes(filter);
      card.hidden = !match;

      // O índice da animação em cascata conta só os VISÍVEIS. Usando a
      // posição original, um filtro que mostrasse os cards 4 e 6 começaria
      // com 280ms de espera parada antes do primeiro aparecer.
      if (match) card.style.setProperty('--i', String(visible));
      if (match) visible += 1;
    });

    if (empty) empty.hidden = visible > 0;

    chips.forEach((chip) => {
      chip.setAttribute('aria-pressed', String(chip.dataset.filter === filter));
    });

    // Sem isso, para quem usa leitor de tela o toque no filtro não produz
    // retorno nenhum: os cards trocam em silêncio, fora do foco.
    if (status) {
      status.textContent =
        visible > 0 ? `${visible} ${visible === 1 ? 'item' : 'itens'} no cardápio.` : 'Nenhum item nesta categoria.';
    }

    // Mantém a URL compartilhável sem criar entrada no histórico — o botão
    // "voltar" deve sair da página, não desfazer cliques em filtro.
    const url = new URL(window.location.href);
    url.searchParams.set('cat', filter);
    window.history.replaceState(null, '', url);
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => apply(chip.dataset.filter));
  });

  // Atalhos vindos de fora da seção (menu "Combos", card de categoria...).
  // Não dá para linkar direto num card via #id: sob outro filtro ele está
  // `hidden`, e o browser não rola até elemento oculto. Então o link rola
  // até o cardápio e troca o filtro no caminho.
  document.querySelectorAll('[data-filter-link]').forEach((link) => {
    link.addEventListener('click', () => {
      const target = link.dataset.filterLink;
      if (chips.some((chip) => chip.dataset.filter === target)) apply(target);
    });
  });

  apply(initialFilter(chips));
}

/**
 * De onde sai o filtro inicial, em ordem de prioridade:
 *
 * 1. `?cat=` na URL — é o que faz um link vindo da Home cair direto em
 *    "Combos", já que `#id` não alcança card escondido, e o que torna o
 *    estado filtrado compartilhável.
 * 2. O chip marcado no HTML.
 * 3. O primeiro chip.
 */
function initialFilter(chips) {
  const wanted = new URLSearchParams(window.location.search).get('cat');
  if (wanted && chips.some((chip) => chip.dataset.filter === wanted)) return wanted;

  const marked = chips.find((chip) => chip.getAttribute('aria-pressed') === 'true');
  return (marked || chips[0]).dataset.filter;
}

/**
 * Vídeo do hero: entra mudo (exigência dos navegadores para autoplay) e o
 * botão devolve o controle de áudio ao usuário.
 */
export function initHeroVideo() {
  document.querySelectorAll('[data-video-sound]').forEach((button) => {
    const video = document.getElementById(button.dataset.videoSound);
    if (!video) return;

    button.hidden = false;
    button.addEventListener('click', () => {
      video.muted = !video.muted;
      button.setAttribute('aria-pressed', String(!video.muted));
      button.setAttribute('aria-label', video.muted ? 'Ativar som do vídeo' : 'Desativar som do vídeo');
      if (!video.muted) video.play().catch(() => {});
    });

    pauseWhenOffscreen(video);
  });
}

/**
 * Vídeo em loop que continua rodando fora da tela é consumo puro de
 * bateria e de dados móveis — e o usuário está lendo o cardápio, não
 * assistindo. Pausa ao sair de vista e retoma ao voltar.
 *
 * Só retoma o que estava tocando: se a pessoa pausou pelos controles
 * nativos, rolar a página não pode ligar o vídeo de novo por conta própria.
 */
function pauseWhenOffscreen(video) {
  if (!('IntersectionObserver' in window)) return;

  let wasPlaying = true;

  new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (wasPlaying) video.play().catch(() => {});
      } else {
        wasPlaying = !video.paused;
        video.pause();
      }
    },
    { threshold: 0.1 },
  ).observe(video);
}
