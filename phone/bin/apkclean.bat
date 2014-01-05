@echo off

set COCOSPATH=%~dp0..\cocos2d-x
set buildexternalsfromsource=

pushd %~dp0..\project.android
del /S /F /Q assets
mkdir assets
xcopy /s /e %~dp0..\..\game\*.* assets
copy %COCOSPATH%\scripting\javascript\bindings\js\*.* assets
copy local.properties %~dp0..\cocos2d-x\cocos2dx\platform\android\java
call ndk-build -j7 -C . NDK_MODULE_PATH="%COCOSPATH%;%COCOSPATH%\cocos2dx\platform\third_party\android\prebuilt" NDK_LOG=1 V=1 clean && call ant clean
popd
