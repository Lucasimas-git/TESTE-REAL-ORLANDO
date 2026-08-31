// Rotas internas do site. Use estas constantes em vez de escrever caminhos soltos no HTML.
export const ROUTES = {
  home: '/',
  franguinn: '/franguinn/',
  hamburguinn: '/hamburguinn/',
};

/**
 * >>> PARA LIGAR O WHATSAPP DE VERDADE <<<
 *
 * Troque `null` pelo número real, no formato só-dígitos com país e DDD:
 *
 *     franguinn:  { whatsapp: '5511987654321' }
 *
 * Só isso. Os ~20 botões das duas páginas passam a apontar para o número
 * na hora, porque nenhum deles guarda o número no HTML — cada um só declara
 * a marca (`data-wa="franguinn"`) e o link é montado em navigation.js.
 */
export const LINKS = {
  franguinn: {
    whatsapp: null,
    cardapioExterno: null, // TODO: URL do cardápio externo, se houver (iFood etc.)
  },
  hamburguinn: {
    whatsapp: null,
    cardapioExterno: null,
  },
};

/**
 * Número usado enquanto o real não chega.
 *
 * É INVÁLIDO de propósito: o WhatsApp abre e responde "o número de telefone
 * compartilhado por link é inválido". Isso é melhor que um botão morto
 * (dá para conferir que o clique, a aba nova e a mensagem pré-escrita
 * funcionam) e melhor ainda que um número plausível, que poderia cair no
 * celular de um desconhecido.
 */
export const WHATSAPP_TESTE = '5500000000000';

// Mensagem que já vem escrita na conversa. Poupa o cliente de digitar e
// diz ao atendente de qual das duas marcas veio o pedido.
export const WHATSAPP_MENSAGEM = {
  franguinn: 'Olá! Vim pelo site e quero fazer um pedido no Franguinn.',
  hamburguinn: 'Olá! Vim pelo site e quero fazer um pedido no Hamburguinn.',
};

/**
 * Retorna um href utilizável: o link real se existir, ou "#" como placeholder seguro.
 * Isso evita links quebrados enquanto os dados reais não são confirmados.
 */
export function resolveExternalLink(url) {
  return url || '#';
}
