@echo off
cd /D %~dp0..\game
start "ignored" %~dp0mongoose.exe -listening_ports 9000 -document_root .
start "ignored" http://localhost:9000/
