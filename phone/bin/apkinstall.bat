@echo off

set COCOSPATH=%~dp0..\cocos2d-x
set buildexternalsfromsource=

pushd %~dp0..\project.android\bin
echo Uninstalling previous version (ignore "Failure" if it wasn't installed) ...
adb uninstall org.jdrago.down
echo Installing new version ...
adb install Down-debug.apk
popd
