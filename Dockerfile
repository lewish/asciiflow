FROM java as build

WORKDIR /_
COPY . /_

RUN ["./compile.sh"]


FROM python

WORKDIR /srv
COPY . /srv
COPY --from=build /_/js-compiled.js /srv/js-compiled.js

EXPOSE 8000
ENTRYPOINT ["/srv/entrypoint"]
