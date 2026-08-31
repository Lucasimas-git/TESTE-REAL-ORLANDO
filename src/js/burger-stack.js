/**
 * Montagem do lanche na Home — a animação do storyboard.
 *
 * O storyboard pede o lanche desmontado no ar, camada por camada, e depois
 * fechando. Isso normalmente exige um PNG por ingrediente. Não temos: temos
 * UMA foto recortada de cada lanche, com fundo transparente.
 *
 * A saída é fatiar a própria foto. Cada camada é uma cópia da mesma imagem
 * com um `clip-path: inset()` diferente, então a cópia "pão de cima" só
 * pinta a faixa do pão, a "salada" só a faixa da salada, e assim por
 * diante. Empilhadas na mesma célula de grid e sem deslocamento, as fatias
 * recompõem a foto original pixel a pixel. Deslocadas no eixo Y, viram o
 * lanche aberto.
 *
 * Dois detalhes fazem a ilusão fechar:
 *
 * - As faixas se sobrepõem em SOBREPOSICAO%. Fatias exatamente adjacentes
 *   deixariam uma linha de meio pixel entre elas no arredondamento do
 *   layout — uma costura visível atravessando o lanche montado. Com
 *   sobreposição, a fatia de baixo continua pintando sob a de cima e os
 *   pixels são idênticos, então a emenda desaparece.
 *
 * - Só `transform` e `opacity` animam. Os recortes são estáticos, definidos
 *   uma vez na criação; nada de `clip-path` animado, que forçaria repaint a
 *   cada frame.
 *
 * Sem JS, sem IntersectionObserver ou com "menos movimento" ligado, nada
 * disso é construído: a foto inteira continua na página, como sempre esteve.
 */

/**
 * Onde cada ingrediente termina, em % da altura da foto (medido nos
 * recortes reais em public/assets/products/hero/).
 *
 * `sobe` é o deslocamento no estado aberto, em % da altura — negativo sobe.
 * O pão de baixo fica em 0: ele é o chão da composição, tudo flutua acima
 * dele. Isso mantém o lanche ancorado onde já estava e evita que a base
 * escape para fora da tela no celular, onde o produto encosta no rodapé.
 */
const CAMADAS = {
  franguinn: [
    { nome: 'pão brioche tostado', fim: 28, sobe: -24, gira: -2.4 },
    { nome: 'salada da casa', fim: 50, sobe: -16, gira: 1.8 },
    { nome: 'cheddar derretido', fim: 70, sobe: -9.5, gira: -1.2 },
    { nome: 'frango frito crocante', fim: 84, sobe: -4.2, gira: 0.8 },
    { nome: 'pão inferior', fim: 100, sobe: 0, gira: 0 },
  ],
  hamburguinn: [
    { nome: 'pão brioche', fim: 30, sobe: -24, gira: 2.4 },
    { nome: 'molho da casa e empanados', fim: 48, sobe: -16, gira: -1.8 },
    { nome: 'costela desfiada', fim: 68, sobe: -9.5, gira: 1.2 },
    { nome: 'barbecue e cheddar', fim: 84, sobe: -4.2, gira: -0.8 },
    { nome: 'pão inferior', fim: 100, sobe: 0, gira: 0 },
  ],
};

/** Em % da altura. Ver comentário do topo: é o que apaga a costura. */
const SOBREPOSICAO = 1.2;

export function initBurgerStack() {
  const stacks = [...document.querySelectorAll('[data-burger-stack]')];
  if (stacks.length === 0) return;

  // Sem observer não há como saber quando cada lanche entra na tela — e no
  // celular a montagem SÓ faz sentido no momento em que ele aparece.
  if (!('IntersectionObserver' in window)) return;

  // Quem pediu menos movimento recebe a foto inteira e pronta. Montar as
  // camadas e revelá-las instantaneamente daria o mesmo resultado com mais
  // DOM e mais risco.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-montando');
        // Montar é evento único; o lanche não desmonta ao sair da tela.
        observer.unobserve(entry.target);
      });
    },
    // Um quarto visível: no desktop os dois lanches já estão na tela e
    // disparam de saída; no celular cada um espera a sua vez de subir.
    { threshold: 0.25 },
  );

  stacks.forEach((stack) => {
    const camadas = CAMADAS[stack.dataset.burgerStack];
    const base = stack.querySelector('.side__product-img');
    if (!camadas || !base) return;

    montarCamadas(stack, base, camadas);
    aguardarFim(stack, camadas.length);
    observer.observe(stack);
  });
}

/**
 * Clona a foto uma vez por ingrediente e recorta cada cópia na sua faixa.
 *
 * As cópias entram em ordem inversa (pão de baixo primeiro no DOM) para que
 * as camadas superiores pintem por cima — o que importa no meio da abertura,
 * quando duas fatias vizinhas ainda se cruzam.
 */
function montarCamadas(stack, base, camadas) {
  const fragmento = document.createDocumentFragment();

  for (let i = camadas.length - 1; i >= 0; i -= 1) {
    const camada = camadas[i];
    const inicio = i === 0 ? 0 : camadas[i - 1].fim - SOBREPOSICAO;

    // cloneNode(false) copia atributos e classes, e é por isso que a fatia
    // herda de graça todo o dimensionamento responsivo de .side__product-img,
    // inclusive os overrides por breakpoint. A caixa é idêntica à da base,
    // então as % do recorte caem exatamente onde foram medidas.
    const fatia = base.cloneNode(false);
    fatia.classList.add('burger-stack__layer');
    // Só o pão de baixo mantém a sombra de contato — ver motion.css seção 9.
    if (i === camadas.length - 1) fatia.classList.add('burger-stack__layer--chao');
    fatia.removeAttribute('id');
    fatia.removeAttribute('fetchpriority');
    // A foto já foi descrita uma vez pela imagem base. Repetir a descrição
    // cinco vezes transformaria o lanche num parágrafo no leitor de tela.
    fatia.alt = '';
    fatia.setAttribute('aria-hidden', 'true');
    fatia.dataset.camada = camada.nome;

    fatia.style.setProperty('--recorte', `inset(${inicio}% 0 ${100 - camada.fim}% 0)`);
    fatia.style.setProperty('--sobe', `${camada.sobe}%`);
    fatia.style.setProperty('--gira', `${camada.gira}deg`);
    // Ordem de entrada: 0 é o pão de baixo, que aparece primeiro.
    fatia.style.setProperty('--nivel', String(camadas.length - 1 - i));

    fragmento.appendChild(fatia);
  }

  stack.appendChild(fragmento);
  // Só agora o CSS pode contar com as fatias — antes disso esconder a base
  // deixaria um buraco no lugar do lanche.
  stack.classList.add('has-stack');
}

/**
 * `animation-fill-mode: both` congela a última keyframe, e uma declaração
 * de animação vence uma regra normal na cascata: enquanto ela existir, o
 * `transform` do hover/toque é ignorado. Por isso a animação é retirada
 * quando termina, e não antes.
 *
 * Conta os `animationend` em vez de usar setTimeout: em aba de fundo as
 * animações pausam mas os timers continuam, e o lanche destravaria no meio
 * da montagem.
 */
function aguardarFim(stack, total) {
  let restantes = total;

  stack.addEventListener('animationend', (evento) => {
    if (!evento.target.classList.contains('burger-stack__layer')) return;
    restantes -= 1;
    if (restantes > 0) return;

    stack.classList.add('is-montado');
    ligarEspiada(stack);
  });
}

/**
 * Depois de montado, o lanche abre de leve para mostrar o recheio. No
 * desktop é hover puro em CSS; aqui só entra o equivalente para o toque,
 * onde hover não existe.
 */
function ligarEspiada(stack) {
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  stack.addEventListener('click', () => {
    stack.classList.toggle('is-aberto');
  });
}
