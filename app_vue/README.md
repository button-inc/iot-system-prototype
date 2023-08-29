# iot-system-prototype

This template should help get you started developing with Vue 3 in Vite.

## Libraries Used
### Vuetify - Material UI Library
- it is recommended to use inline styles with vuetify components instead of v-deep where necessary
- typography: https://vuetifyjs.com/en/styles/text-and-typography/
  - we have added the same typography as mixins under /assets/stylesheets/mixins, feel free to use them if choosing to not use the vuetify class

### Vue3 Leaflet - Map Library
- this library allows us to generate a map and place relevant markers


## Recommended Coding Strategy

### CSS
- we are using the BEM approach where possible
- if a single vuetify class fulfills your need, go ahead and use that
- don't combine a vuetify class with a custom class, instead, nest the vuetify css attributes in your custom class
- we have also added vuetify typography in our own mixins located in /assets/stylesheets/mixins
  - you can feel free to use `@include <mixinName>` in your custom class to avoid rewriting repetitive code

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
