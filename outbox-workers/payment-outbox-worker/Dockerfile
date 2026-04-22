FROM oven/bun:alpine

WORKDIR /app

RUN apk add --no-cache bash

COPY package.json bun.lock ./
RUN bun install

RUN bun install --trust -g @infisical/cli \
  && bun update -g @infisical/cli

COPY . .

COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh

CMD ["/bin/bash", "/docker-entrypoint.sh"]
