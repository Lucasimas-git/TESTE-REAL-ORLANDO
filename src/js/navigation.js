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
