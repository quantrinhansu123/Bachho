# Script deploy lên Vercel cho Windows PowerShell

Write-Host "🚀 Bắt đầu deploy lên Vercel..." -ForegroundColor Green

# Kiểm tra Vercel CLI
Write-Host "`n📦 Kiểm tra Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "⚠️  Vercel CLI chưa được cài đặt!" -ForegroundColor Red
    Write-Host "Đang cài đặt Vercel CLI..." -ForegroundColor Yellow
    npm i -g vercel
} else {
    Write-Host "✅ Vercel CLI đã được cài đặt" -ForegroundColor Green
}

# Build project
Write-Host "`n🔨 Đang build project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build thất bại!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build thành công!" -ForegroundColor Green

# Deploy
Write-Host "`n🚀 Đang deploy lên Vercel..." -ForegroundColor Yellow
Write-Host "Lần đầu tiên sẽ yêu cầu đăng nhập và cấu hình." -ForegroundColor Cyan

vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Deploy thành công!" -ForegroundColor Green
    Write-Host "🌐 Ứng dụng của bạn đã được deploy lên Vercel!" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Deploy thất bại!" -ForegroundColor Red
    exit 1
}

