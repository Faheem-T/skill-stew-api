FROM oven/bun:alpine

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install
COPY . .

CMD ["sh", "-c", "bun run start"]
