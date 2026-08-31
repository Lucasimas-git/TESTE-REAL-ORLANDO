/**
 * Movimento das páginas internas.
 *
 * Duas decisões guiam o arquivo inteiro:
 *
 * 1. `.motion` no <html> é adicionada como PRIMEIRA linha, e é ela que
 *    autoriza o CSS a esconder os elementos que vão entrar animados. Se
 *    este módulo não rodar (JS desligado, erro de rede, navegador antigo
 *    sem IntersectionObserver), a classe nunca entra e a página aparece
 *    inteira. Conteúdo nunca fica refém de animação.
 *
 * 2. Existe UM ÚNICO listener de scroll na página, e ele só marca uma
 *    flag; a leitura do DOM acontece dentro de requestAnimationFrame. Todo
 *    o resto (entrada de elementos, spy do menu, barra de pedido) usa
 *    IntersectionObserver, que roda fora da thread principal. É o que
 *    mantém a rolagem fluida em celular intermediário.
 */

export function initMotion() {
  // Sem IntersectionObserver não há como saber o que entrou na tela. Em vez
  // de improvisar com scroll, desiste do movimento e deixa tudo visível.
  if (!('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('motion');

  initReveal();
  initMenuGridReveal();
  initScrollHeader();
  initScrollSpy();
  initOrderBar();
}

/* ==========================================================================
   Entrada por rolagem
   ========================================================================== */

function initReveal() {
  const items = [...document.querySelectorAll('.reveal')];
  if (items.length === 0) return;

  // O atraso em cascata é calculado uma vez, aqui, e não a cada frame.
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    const step = Number(group.dataset.stagger) || 80;
    [...group.querySelectorAll('.reveal')].forEach((child, i) => {
      child.style.setProperty('--reveal-delay', `${i * step}ms`);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        // Entrada é evento único: parar de observar evita trabalho inútil
        // no resto da rolagem e libera o elemento para o coletor.
        observer.unobserve(entry.target);
      });
    },
    // Dispara um pouco antes do elemento encostar na borda: a animação
    // termina quando ele já está confortavelmente na tela, em vez de
    // começar só quando o usuário já está olhando para ele.
    { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
  );

  items.forEach((item) => observer.observe(item));
}

/**
 * A grade do cardápio é observada como bloco, não card a card: card
 * escondido pelo filtro está em `display:none` e o observer o ignoraria.
 * O CSS cuida da animação individual — ver motion.css, seção 2.
 */
function initMenuGridReveal() {
  const grids = [...document.querySelectorAll('.menu-grid')];
  if (grids.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.05 },
  );

  grids.forEach((grid) => observer.observe(grid));
}

/* ==========================================================================
   Cabeçalho: recolhe e mostra progresso
   ========================================================================== */

function initScrollHeader() {
  const nav = document.querySelector('.page-nav');
  if (!nav) return;

  // Criada em JS de propósito: uma barra de progresso sem script seria um
  // traço morto no topo da página.
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  nav.appendChild(progress);

  // Abaixo de 1024px o cabeçalho tem duas linhas (marca + links) e ocupa
  // ~120px, 15% de uma tela de celular, o tempo todo. Descendo a página ele
  // sai; ao primeiro gesto para cima ele volta — o menu continua a um
  // movimento de distância sem cobrar essa faixa durante a leitura. No
  // desktop o cabeçalho tem uma linha só e não justifica o efeito.
  const telaEstreita = window.matchMedia('(max-width: 1023px)');

  let ticking = false;
  let anterior = window.scrollY;

  function update() {
    ticking = false;

    const y = window.scrollY;
    nav.classList.toggle('is-stuck', y > 40);

    // O limiar de 6px filtra o tremor do dedo parado na tela, que senão
    // faria o cabeçalho piscar entre os dois estados.
    const delta = y - anterior;
    if (telaEstreita.matches && Math.abs(delta) > 6) {
      // Perto do topo o cabeçalho sempre reaparece: é onde a marca importa
      // e onde o gesto de "voltar ao início" termina.
      nav.classList.toggle('is-hidden', delta > 0 && y > nav.offsetHeight * 2);
    } else if (!telaEstreita.matches) {
      nav.classList.remove('is-hidden');
    }
    anterior = y;

    // scrollHeight - innerHeight é o total rolável; o guarda de 1 evita
    // divisão por zero em páginas que cabem na tela.
    const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.setProperty('--progress', String(Math.min(1, y / total)));
  }

  // Um link de âncora clicado com o cabeçalho escondido rolaria para um
  // ponto calculado com a altura dele — e o título acabaria coberto quando
  // ele voltasse. Trazer de volta antes do salto mantém a conta certa.
  nav.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => nav.classList.remove('is-hidden'));
  });

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );

  update();
}

/* ==========================================================================
   Menu acompanha a seção lida
   ========================================================================== */

function initScrollSpy() {
  const links = [...document.querySelectorAll('.page-nav__link[href^="#"]')];
  if (links.length === 0) return;

  // O estado estático do HTML existe para o caso sem JS. A partir daqui
  // quem manda é o spy — deixar os dois ativos desenharia dois traços.
  links.forEach((link) => link.classList.remove('is-active'));

  const byId = new Map();
  links.forEach((link) => {
    const id = link.getAttribute('href').slice(1);
    const section = document.getElementById(id);
    // Vários links podem apontar para a mesma âncora (Cardápio e Combos):
    // o Map guarda a lista para acender os dois juntos.
    if (section) byId.set(section, [...(byId.get(section) || []), link]);
  });

  if (byId.size === 0) return;

  const visible = new Set();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });

      links.forEach((link) => link.classList.remove('is-current'));

      const atual = secaoAtual([...visible], [...byId.keys()]);
      if (atual) (byId.get(atual) || []).forEach((link) => link.classList.add('is-current'));
    },
    // A faixa central da tela é o "ponto de leitura": uma seção só conta
    // como atual quando ocupa o meio, não quando espia pela borda.
    { rootMargin: '-45% 0px -45% 0px' },
  );

  byId.forEach((_, section) => observer.observe(section));
}

/**
 * Qual seção o menu deve marcar, entre as que estão na faixa de leitura.
 *
 * O link "Início" aponta para #main, que É a página inteira — ele cruza a
 * faixa central o tempo todo e, por estar antes no documento, vencia
 * qualquer critério de "a mais acima": o menu ficava preso em Início
 * mesmo com o cardápio na tela.
 *
 * A regra que resolve: uma seção que CONTÉM outra seção observada é um
 * envelope, não um destino. Só vale quando nenhuma seção interna está
 * visível — assim o topo da página ainda acende "Início".
 */
function secaoAtual(visiveis, todas) {
  if (visiveis.length === 0) return null;

  const envelope = (secao) => todas.some((outra) => outra !== secao && secao.contains(outra));
  const internas = visiveis.filter((secao) => !envelope(secao));
  const candidatas = internas.length > 0 ? internas : visiveis;

  // Entre seções do mesmo nível, a que está mais acima é a que o leitor
  // acabou de alcançar.
  return candidatas.sort(
    (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top,
  )[0];
}

/* ==========================================================================
   Barra fixa de pedido (celular)
   ========================================================================== */

function initOrderBar() {
  const bar = document.querySelector('[data-order-bar]');
  if (!bar) return;

  const hero = document.querySelector('.page-hero');
  const footer = document.querySelector('.page-footer');

  // Enquanto o herói está na tela o CTA já existe ali, e no rodapé a barra
  // cobriria justamente os links finais. A barra vive no meio do caminho.
  let heroVisible = true;
  let footerVisible = false;

  function sync() {
    bar.classList.toggle('is-visible', !heroVisible && !footerVisible);
  }

  if (hero) {
    new IntersectionObserver(
      ([entry]) => {
        heroVisible = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    ).observe(hero);
  } else {
    heroVisible = false;
  }

  if (footer) {
    new IntersectionObserver(
      ([entry]) => {
        footerVisible = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    ).observe(footer);
  }

  sync();
}
