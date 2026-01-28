FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:1
WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/package.json .
RUN bun install --production
EXPOSE 5173
ENV PORT=5173
CMD ["bun", "./build/index.js"]
