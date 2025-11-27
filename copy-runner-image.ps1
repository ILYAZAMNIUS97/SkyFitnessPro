# Скрипт для копирования изображения бегуна
# Измените путь к исходному файлу на актуальный

$sourcePath = "$env:USERPROFILE\Downloads\runner.png"
$destPath = "public\img\runner.png"

if (Test-Path $sourcePath) {
    Copy-Item $sourcePath $destPath -Force
    Write-Host "✅ Изображение успешно скопировано!" -ForegroundColor Green
    Write-Host "Файл находится: $destPath" -ForegroundColor Cyan
} else {
    Write-Host "❌ Файл не найден: $sourcePath" -ForegroundColor Red
    Write-Host "Пожалуйста, укажите правильный путь к изображению" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Или просто перетащите изображение в папку:" -ForegroundColor White
    Write-Host "$(Get-Location)\public\img\" -ForegroundColor Cyan
}

