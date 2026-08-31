import { initNavigation, initWhatsappLinks } from './navigation.js';
import { initMenuFilter, initHeroVideo } from './menu.js';
import { initMotion } from './motion.js';

// Hook de progressive enhancement: só liga comportamento condicionado a JS
// depois que o script carrega, para o CSS poder tratar o caso "sem JS" à parte.
document.documentElement.classList.add('js');

// A ordem importa: os botões de WhatsApp precisam receber o href real antes
// de initNavigation varrer a página atrás de links mortos.
initWhatsappLinks();
initNavigation();

// Ambos são no-op nas páginas que não têm cardápio/vídeo (Home).
initMenuFilter();
initHeroVideo();

// Por último: o movimento assume um DOM já em seu estado final (filtro
// aplicado, links resolvidos) para medir posições e observar os elementos.
initMotion();
