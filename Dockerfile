# usage: docker run --rm -v $PWD:/rad rad TASK
# build: docker build --progress=plain -t rad -t cdaringe/rad -t cdaringe/rad:6-latest -t cdaringe/rad:latest .
FROM denoland/deno:alpine-1.20.1
WORKDIR /app
COPY . .
# RUN deno vendor --import-map=import_map.json /app/src/bin.ts
# EXPOSE 7777
# CMD deno run --import-map=/app/vendor/import_map.json --unstable --allow-env --allow-net /app/src/bin.ts
RUN deno vendor --import-map=import_map.json /app/src/bin.ts
EXPOSE 7777
CMD deno run --import-map=import_map.json --unstable --allow-env --allow-net /app/src/bin.ts
