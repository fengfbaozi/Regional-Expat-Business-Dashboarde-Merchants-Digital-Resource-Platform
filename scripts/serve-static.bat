@echo off
chcp 65001 >nul
cd /d "%~dp0.."
echo.
echo 玉林侨务数字平台 — 本地静态服务
echo 解压包后请在本脚本所在项目根的上级执行，或先 cd 到解压目录再运行本文件。
echo 浏览器访问: http://127.0.0.1:8765/
echo 按 Ctrl+C 停止服务
echo.
py -3 -m http.server 8765 2>nul
if errorlevel 1 python -m http.server 8765
