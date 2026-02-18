FROM oven/bun:alpine

WORKDIR /app

# Install bash as it is not available in alpine
RUN apk add --no-cache bash


# Install dependencies
COPY package.json bun.lock ./
RUN bun install

# Install Infisical CLI
RUN bun install --trust -g @infisical/cli \
  && bun update -g @infisical/cli

# Copy source code
COPY . .

# Copy startup script that handles Infisical authentication
COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh

CMD ["/bin/bash", "/docker-entrypoint.sh"]
