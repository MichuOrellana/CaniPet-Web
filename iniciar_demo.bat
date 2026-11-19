@echo off
echo ==============================================
echo        CANIPET - DEMO COMERCIAL EN VIVO
echo ==============================================
echo Iniciando servidor local en http://localhost:3000 ...
start http://localhost:3000
python -m http.server 3000
pause
