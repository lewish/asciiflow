FROM gcr.io/bazel-public/bazel:latest as build
WORKDIR /build
COPY . .
RUN bazel build site/...

FROM nginx:alpine
COPY --from=build /build/bazel-bin/site /usr/share/nginx/html
EXPOSE 80
