FROM node:19

RUN npm install -g @angular/cli

WORKDIR /ft_transcendence
COPY ./files/package*.json ./
RUN npm install

ENTRYPOINT ng serve --host 0.0.0.0 --poll 2000