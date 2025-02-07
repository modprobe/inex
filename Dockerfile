FROM node:23-alpine AS builder

WORKDIR /app
COPY . /app

RUN corepack enable \
    && pnpm install \
    && pnpm exec tsc

###

FROM node:23-alpine AS deps

WORKDIR /app
COPY --from=builder /app/dist /app/package.json /app/pnpm-lock.yaml /app/

RUN corepack enable \
    && pnpm install -P

###

FROM node:23-alpine

WORKDIR /app
COPY --from=deps /app /app/

EXPOSE 3000
CMD ["node", "/app/index.js"]