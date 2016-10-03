all: serve

dev: package.json bower.json
	npm install
	bower install

serve: clean
	./node_modules/.bin/gulp

build: clean
	./node_modules/.bin/gulp deploy

clean:
	rm -rf build dist
