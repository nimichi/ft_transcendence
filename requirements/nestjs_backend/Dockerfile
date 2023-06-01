FROM node:20

RUN npm install -g @nestjs/cli && npm install -g @prisma/client

WORKDIR /ft_transcendence
COPY ./files/package*.json ./
COPY ./files/prisma ./prisma/
RUN npm install
RUN npx prisma generate

ENTRYPOINT npx prisma migrate dev --name "init" && nest start --watch