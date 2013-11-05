@echo off

set COCOSPATH=%~dp0..\cocos2d-x
set buildexternalsfromsource=

call ndk-build -j7 -C . NDK_MODULE_PATH="%COCOSPATH%;%COCOSPATH%\cocos2dx\platform\third_party\android\prebuilt" NDK_LOG=1 V=1
