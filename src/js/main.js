import { initNavigation } from './navigation.js';

// Hook de progressive enhancement: só liga comportamento condicionado a JS
// depois que o script carrega, para o CSS poder tratar o caso "sem JS" à parte.
document.documentElement.classList.add('js');

initNavigation();
