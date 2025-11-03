@echo off
echo Killing all Node.js processes...
taskkill /F /IM node.exe
echo Done!
timeout /t 2
