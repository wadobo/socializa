all: serve

dev: package.json
	npm install

serve: clean
	./node_modules/.bin/gulp

web: clean
	NODE_ENV=production ./node_modules/.bin/gulp deploy

app: clean
	NODE_ENV=production ./node_modules/.bin/gulp deploy --app

clean:
	rm -rf build dist
