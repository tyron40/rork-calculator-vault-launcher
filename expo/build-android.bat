@echo off
echo Building Android APK...
echo.
cd android
call gradlew.bat assembleDebug
echo.
if %ERRORLEVEL% EQU 0 (
    echo Build successful!
    echo APK location: android\app\build\outputs\apk\debug\app-debug.apk
) else (
    echo Build failed with error code %ERRORLEVEL%
)
cd ..
pause
