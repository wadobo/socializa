all: serve

dev: package.json
	npm install

serve: clean
	./node_modules/.bin/gulp

build: clean
	NODE_ENV=production ./node_modules/.bin/gulp deploy

clean:
	rm -rf build dist
