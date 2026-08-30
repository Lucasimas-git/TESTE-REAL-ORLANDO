/**
 * Filtro de categorias do cardápio das páginas internas.
 *
 * Progressive enhancement: sem JS, TODOS os cards ficam visíveis (nenhum
 * nasce com `hidden` no HTML) e a faixa de filtros vira apenas decoração.
 * Só depois que este módulo roda é que o estado "Destaques" é aplicado.
 */
export function initMenuFilter() {
  document.querySelectorAll('[data-menu]').forEach(setupMenu);
}

function setupMenu(root) {
  const chips = [...root.querySelectorAll('[data-filter]')];
  const cards = [...root.querySelectorAll('[data-cat]')];
  const empty = root.querySelector('[data-menu-empty]');

  if (chips.length === 0 || cards.length === 0) return;

  function apply(filter) {
    let visible = 0;

    cards.forEach((card) => {
      // data-cat guarda uma lista de tokens ("smashs destaque"), então um
      // mesmo produto pode aparecer em mais de uma aba sem ser duplicado.
      const match = filter === 'todos' || card.dataset.cat.split(/\s+/).includes(filter);
      card.hidden = !match;
      if (match) visible += 1;
    });

    if (empty) empty.hidden = visible > 0;

    chips.forEach((chip) => {
      chip.setAttribute('aria-selected', String(chip.dataset.filter === filter));
    });
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

  const initial = chips.find((chip) => chip.getAttribute('aria-selected') === 'true') || chips[0];
  apply(initial.dataset.filter);
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
  });
}
