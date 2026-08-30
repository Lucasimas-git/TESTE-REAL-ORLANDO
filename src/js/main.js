import { initNavigation, initWhatsappLinks } from './navigation.js';
import { initMenuFilter, initHeroVideo } from './menu.js';

// Hook de progressive enhancement: só liga comportamento condicionado a JS
// depois que o script carrega, para o CSS poder tratar o caso "sem JS" à parte.
document.documentElement.classList.add('js');

initNavigation();
initWhatsappLinks();
// Ambos são no-op nas páginas que não têm cardápio/vídeo (Home).
initMenuFilter();
initHeroVideo();
