@echo off
echo Limpiando puertos ocupados...

REM Matar procesos en puerto 3000
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Matando proceso en puerto 3000 (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

REM Matar procesos en puerto 3003
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3003" ^| find "LISTENING"') do (
    echo Matando proceso en puerto 3003 (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

REM Matar procesos en puerto 3007
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3007" ^| find "LISTENING"') do (
    echo Matando proceso en puerto 3007 (PID: %%a)
    taskkill /F /PID %%a 2>nul
)

echo.
echo Puertos limpiados. Iniciando servidor en puerto 3000...
echo.

npm run dev
