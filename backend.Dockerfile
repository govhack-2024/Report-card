FROM rust:1.80.1-alpine3.20 AS builder
RUN apk add musl-dev openssl-dev
WORKDIR /app
COPY backend/dummy.rs .
COPY backend/Cargo.lock .
COPY backend/Cargo.toml .
RUN sed -i 's#src/main.rs#dummy.rs#' Cargo.toml
RUN cargo build --release
RUN sed -i 's#dummy.rs#src/main.rs#' Cargo.toml
COPY backend/src/ src/
RUN cargo build --release


FROM node:20.17.0-alpine3.20 AS frontend
WORKDIR /app
RUN npm i -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm i
COPY . .
ARG VITE_ELEVATION_URL=https://water.haxx.nz
ARG VITE_MAPBOX_API_KEY
RUN VITE_ELEVATION_URL=${VITE_ELEVATION_URL} VITE_MAPBOX_API_KEY=${VITE_MAPBOX_API_KEY} pnpm build

FROM alpine:3.20
WORKDIR /app
EXPOSE 8080
COPY --from=builder /app/target/release/backend /app
COPY --from=frontend /app/dist /app/frontend
COPY backend/data data
CMD ["/app/backend"]
