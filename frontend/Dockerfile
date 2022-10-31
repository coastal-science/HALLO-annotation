FROM node:18

WORKDIR /frontend

# copy manifests
ADD package.json ./
ADD pnpm-lock.yaml ./

# enable pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# pnpm environment
ENV PNPM_HOME "/root/.local/share/pnpm"
ENV PATH "$PNPM_HOME:$PATH"

# install packages
RUN pnpm fetch
RUN pnpm i --offline
