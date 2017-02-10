all: serve

dev: package.json
	npm install

serve: clean
	./node_modules/.bin/gulp

web: clean
	NODE_ENV=production ./node_modules/.bin/gulp deploy

app: clean
	NODE_ENV=production ./node_modules/.bin/gulp deploy --app

extract:
	./node_modules/.bin/gulp i18next

clean:
	rm -rf build dist
