FROM node:19

RUN npm install -g @nestjs/cli

WORKDIR /ft_transcendence
COPY ./files/package*.json ./
RUN npm install

ENTRYPOINT nest start --watch