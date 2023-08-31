FROM node:lts-alpine

# install simple http server for serving static content
RUN npm install -g http-server

WORKDIR /app_vue

# copy both 'package.json' and 'package-lock.json' (if available)
COPY app_vue/package*.json ./

# install project dependencies
RUN npm install

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY ./app_vue .

# build app for production with minification
RUN npm run build

EXPOSE 5173
CMD [ "npm", "run", "dev" ]
