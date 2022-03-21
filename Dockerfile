# usage: docker run --rm -v $PWD:/rad rad TASK
# build: docker build --progress=plain -t rad -t cdaringe/rad -t cdaringe/rad:6-latest -t cdaringe/rad:latest .
FROM denoland/deno:alpine-1.20.1
WORKDIR /app
COPY . .
# test, hydrate the deno cache, clear excess files
RUN deno vendor /app/bin.ts
CMD deno run --import-map=/app/vendor/import_map.json --unstable --allow-net /app/bin.ts

