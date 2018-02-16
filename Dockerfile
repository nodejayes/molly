FROM node:carbon

WORKDIR /usr/src/app

COPY package.json ./
COPY dist ./

RUN npm install

CMD ["npm" "start"]