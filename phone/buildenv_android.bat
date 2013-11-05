@echo off
title buildenv_android (down)
set ANDROID_SDK_ROOT=%~dp0tools\android\sdk
set ANDROID_NDK_PATH=%~dp0tools\android\ndk
set NDK_ROOT=%~dp0tools\android\ndk
set JAVA_HOME=C:\Program Files\Java\jdk1.7.0_45
path %PATH%;%~dp0bin;%~dp0tools\ant\bin;%~dp0tools\android\sdk\platform-tools;%~dp0tools\android\sdk\tools;%~dp0tools\android\sdk\build-tools\17.0.0;C:\Program Files\Java\jdk1.7.0_45\bin;%~dp0tools\android\ndk
cmd
