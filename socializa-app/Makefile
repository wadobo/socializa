frontend:
	cd ../frontend/; make app

android: frontend
	phonegap build android
	cp -rf res/* platforms/android/res/

run: android

release: frontend
	rm -rf www/app
	rm -rf www/index.html
	cp -rf ../frontend/dist/app/ www/app
	cp -rf ../frontend/dist/index.html www/index.html
	phonegap build android
	cp -rf res/* platforms/android/res/
