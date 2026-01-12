@echo off
echo Створення ZIP архіву...
powershell Compress-Archive -Path *.mjs,handlers -DestinationPath pizza-api.zip -Force

echo Деплой Lambda функції...
aws lambda update-function-code --function-name pizza-api --zip-file fileb://pizza-api.zip

echo Готово!
pause