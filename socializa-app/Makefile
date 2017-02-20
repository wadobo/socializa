frontend:
	cd ../frontend/; make app

android: frontend
	phonegap build android
	cp -rf res/* platforms/android/res/

run: android
