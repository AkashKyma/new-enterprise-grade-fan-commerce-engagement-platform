FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* .npmrc* ./
RUN npm install || true
COPY . .
RUN npm run build || true
EXPOSE 3000
CMD ["npm","run","start:dev"]
