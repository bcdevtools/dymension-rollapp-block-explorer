FROM node:lts-alpine as base
RUN npm i npm -g
WORKDIR /app
COPY next.config.mjs ./
COPY package*.json ./
COPY prisma ./prisma

FROM base as builder
RUN npm i
RUN npm run prisma:generate
COPY . .
RUN npm run build

FROM base
RUN npm i --omit=dev
RUN npm run prisma:generate
COPY --from=builder /app/.next ./.next
CMD ["npm", "start"]
