# iot-system-prototype

This template should help get you started developing with Vue 3 in Vite.

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

### Running vue alongside Docker

Terminal 1: (wait for this to complete)
```
// in repo root directory
docker-compose up --build
```

Terminal 2: (custom script)
```
// in repo root directory
bin/vueLocalDeploy.sh
```

## Libraries Used
### Vuetify - Material UI Library
- it is recommended to use inline styles with vuetify components instead of v-deep where necessary
- typography: https://vuetifyjs.com/en/styles/text-and-typography/
  - we have added the same typography as mixins under /assets/stylesheets/mixins, feel free to use them if choosing to not use the vuetify class

### Vue3 Leaflet - Map Library
- this library allows us to generate a map and place relevant markers

### Google Maps Routes API
- this is used to calculate the optimal order of bins to visit
- note that if it returns empty object {} it is likely that your request is passing incorrect lat/long or location data

## Folder structure

(Last Updated as of Sep 5,2023)
Note that all of these folders are under app_vue/:
- src/assets -> holds images, stylesheets, fonts
- components/shared -> holds components created for global use (ex. generalized button component)
- components -> holds components pertaining to features that would be placed on our pages
- data -> holds json mock data files
- pages -> holds components loaded once on a per-route basis
- router -> holds index.js which contains our configured routes (default is '/')
- stores -> holds Vuex aka Pinia stores for state management
- layout -> holds layout based components (ie. navbar/header/footer)

## Recommended Coding Strategy

### CSS
- we are using the BEM approach where possible
- if a single vuetify class fulfills your need, go ahead and use that (for ex. https://vuetifyjs.com/en/styles/spacing/ )
- if you can help it, opt for not combining a vuetify class with a custom class (ie. `class="text-subtitle-2 my-custom-class"`) , instead, nest the vuetify css attributes in your custom class (ie. `my-custom-class"`)
- we have also added some of the vuetify typography in our own mixins located in /assets/stylesheets/mixins
  - you can feel free to use `@include <mixinName>` in your custom class to avoid rewriting repetitive code

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).