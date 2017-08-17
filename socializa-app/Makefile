dev:
	cd ../frontend/; make app

pro:
	cd ../frontend/; make app-pro

android: frontend
	phonegap build android
	cp -rf res/* platforms/android/res/

run: android
