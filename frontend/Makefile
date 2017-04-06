all: web

dev: package.json
	npm install

web: clean css webpack indexweb files

app: clean css webpack indexapp files

css:
	node_modules/less/bin/lessc styles/app.less > dist/app/main.css
	cp -rf node_modules/font-awesome/fonts/ dist/app/

webpack:
	./node_modules/webpack/bin/webpack.js

files:
	cp -rf js dist/app/
	cp -rf images dist/app/
	cp manifest.json dist/app/
	cp -rf locales dist/app/

indexapp: index.html
	cat index.html | tr '\n', '\r' | perl -pe 's|<!--<web>-->.*?<!--</web>-->|\1|g' | tr '\r' '\n' > dist/index.html
indexweb: index.html
	cat index.html | tr '\n', '\r' | perl -pe 's|<!--<app>-->.*?<!--</app>-->|\1|g' | tr '\r' '\n' > dist/index.html

extract:
	cd src
	../node_modules/i18next-parser/bin/cli.js -r -s "::" -k ":::" -f "t" "i18n.t" -l es src/*.js -o ../locales/
	cd ..

clean:
	rm -rf build dist
	mkdir -p build/app dist/app
