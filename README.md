# Franguinn & Hamburguinn — Site institucional

Site institucional de delivery com duas marcas irmãs: **Franguinn** (frango frito)
e **Hamburguinn** (smashburger). Vite + HTML/CSS/JS vanilla, sem framework.

## Status

- [x] Fase 2 — scaffold técnico
- [x] Fase 3 — Home (`/`) com split Franguinn x Hamburguinn
- [ ] Fase 4 — página `/franguinn/` (hero, vídeo, cards, cardápio institucional)
- [ ] Fase 5 — página `/hamburguinn/` (hero, vídeo, cards, cardápio institucional)
- [ ] Fase 6 — revisão final (responsividade, acessibilidade, links)

## Rodando localmente

Requer [Node.js](https://nodejs.org) (LTS 18+) instalado.

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Build de produção

```bash
npm run build
npm run preview
```

O build sai em `dist/`.

## Estrutura

```
/
  index.html            Home (split Franguinn x Hamburguinn)
  franguinn/index.html  Placeholder — implementação na Fase 4
  hamburguinn/index.html Placeholder — implementação na Fase 5
  src/
    styles/              tokens, base, components, home, responsive
    js/                  main.js, navigation.js, config.js (links centralizados)
  public/assets/         brand, products, video (assets reais de produção)
```

## Links e dados pendentes

Nenhum WhatsApp, endereço, horário, preço ou link de cardápio externo foi
confirmado ainda. Todos os pontos de integração estão centralizados em
`src/js/config.js`, marcados com `TODO`, e resolvem para `#` até serem
preenchidos com dados reais — evite espalhar links soltos pelos HTMLs.

## Deploy no GitHub Pages

Se o site for publicado como *project page* (`usuario.github.io/repo/`),
ajuste `base` em `vite.config.js` para `/repo/` antes do build.
