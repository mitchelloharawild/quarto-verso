# verso-i18n PR service. See service/README.md.

# Match Quarto's bundled pandoc so units split identically.
ARG PANDOC_VERSION=3.10

FROM node:24-slim AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY scripts scripts
COPY src src
COPY service service
RUN node scripts/build.mjs --service

FROM node:24-slim AS pandoc
ARG PANDOC_VERSION
ARG TARGETARCH
ADD https://github.com/jgm/pandoc/releases/download/${PANDOC_VERSION}/pandoc-${PANDOC_VERSION}-linux-${TARGETARCH}.tar.gz /tmp/pandoc.tar.gz
RUN tar -xzf /tmp/pandoc.tar.gz --strip-components=2 -C /usr/local/bin "pandoc-${PANDOC_VERSION}/bin/pandoc"

FROM node:24-slim
LABEL org.opencontainers.image.source="https://github.com/mitchelloharawild/quarto-verso" \
      org.opencontainers.image.description="verso-i18n PR service: translation reviews from Quarto sites as GitHub pull requests" \
      org.opencontainers.image.licenses="MIT"
COPY --from=pandoc /usr/local/bin/pandoc /usr/local/bin/pandoc
COPY --from=build /src/service/dist/server.mjs /app/server.mjs
RUN mkdir -p /var/cache/verso && chown node:node /var/cache/verso
ENV NODE_ENV=production PORT=8787 VERSO_CACHE=/var/cache/verso
USER node
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/healthz').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "/app/server.mjs"]
