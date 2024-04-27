FROM node:lts-alpine as base
RUN npm i npm -g
WORKDIR /app
COPY prisma ./prisma

FROM base as builder
COPY package*.json ./
RUN npm i
RUN npm run prisma:generate
COPY . .
RUN npm run build

FROM base
COPY package*.json ./
RUN npm i --omit=dev
RUN npm run prisma:generate
COPY --from=builder /app/.next ./.next
CMD ["npm", "start"]
