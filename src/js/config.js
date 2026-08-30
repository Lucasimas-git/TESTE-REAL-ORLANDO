// Rotas internas do site. Use estas constantes em vez de escrever caminhos soltos no HTML.
export const ROUTES = {
  home: '/',
  franguinn: '/franguinn/',
  hamburguinn: '/hamburguinn/',
};

// Links externos por marca. NENHUM valor real foi confirmado ainda.
//
// >>> PARA LIGAR O WHATSAPP: basta preencher `whatsapp` abaixo com
//     'https://wa.me/55DDDNUMERO'. Todos os botões [data-wa] das páginas
//     internas passam a apontar para lá automaticamente (initWhatsappLinks
//     em navigation.js). Não é preciso editar HTML.
//
// TODO: substituir por URL real do cardápio externo (ex: iFood, cardápio digital próprio)
export const LINKS = {
  franguinn: {
    whatsapp: null,
    cardapioExterno: null,
  },
  hamburguinn: {
    whatsapp: null,
    cardapioExterno: null,
  },
};

/**
 * Retorna um href utilizável: o link real se existir, ou "#" como placeholder seguro.
 * Isso evita links quebrados enquanto os dados reais não são confirmados.
 */
export function resolveExternalLink(url) {
  return url || '#';
}
