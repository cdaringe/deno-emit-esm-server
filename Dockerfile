# usage: docker run --rm -v $PWD:/rad rad TASK
# build: docker build --progress=plain -t rad -t cdaringe/rad -t cdaringe/rad:6-latest -t cdaringe/rad:latest .
FROM denoland/deno:alpine-1.20.3
WORKDIR /app
ENV DENO_ENV=production
COPY . .
# RUN deno vendor --import-map=import_map.json /app/src/bin.ts
# EXPOSE 7777
# CMD deno run --import-map=/app/vendor/import_map.json --unstable --allow-env --allow-net /app/src/bin.ts
RUN deno vendor --import-map=import_map.json /app/src/bin.ts
EXPOSE 7777
CMD deno run --import-map=import_map.json --unstable --allow-env --allow-net /app/src/bin.ts
