FROM node:26

ADD . /app

WORKDIR /app

RUN npm ci
RUN npm run build

# A Windows checkout does not carry the executable bit.
RUN chmod +x /app/docker-entrypoint.sh

ENV NODE_ENV=production
# Nitro reads HOST/PORT; the Nuxt 2 era NUXT_HOST/NUXT_PORT no longer bind.
ENV HOST=0.0.0.0
ENV PORT=80

EXPOSE 80

ENTRYPOINT ["/app/docker-entrypoint.sh"]
