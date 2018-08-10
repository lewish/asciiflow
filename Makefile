all: run

build:
	docker build -t asciiflow2 .

run: build
	docker rm -f asciiflow2 2> /dev/null || true
	docker run --detach --name asciiflow2 --read-only --publish-all asciiflow2
	@docker port asciiflow2 8000 | awk -F: '{print "http://localhost:"$$2}'
