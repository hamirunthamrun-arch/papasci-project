@echo off
start "Backend" cmd /k "cd BACKEND && npm run dev"
start "Frontend" cmd /k "cd FRONTEND && npm run dev"