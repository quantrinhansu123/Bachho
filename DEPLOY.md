# 🚀 Hướng Dẫn Deploy Lên Vercel

## ✅ Đã chuẩn bị sẵn

- ✅ `vercel.json` đã được cấu hình đúng
- ✅ Build script hoạt động tốt
- ✅ Project đã sẵn sàng để deploy

## 📋 Cách Deploy

### Cách 1: Sử dụng Script PowerShell (Nhanh nhất - Windows)

```powershell
.\deploy-vercel.ps1
```

Script sẽ tự động:
1. Kiểm tra và cài đặt Vercel CLI (nếu chưa có)
2. Build project
3. Deploy lên Vercel

### Cách 2: Deploy thủ công qua Vercel CLI

#### Bước 1: Cài đặt Vercel CLI
```bash
npm i -g vercel
```

#### Bước 2: Đăng nhập Vercel
```bash
vercel login
```
Sẽ mở trình duyệt để đăng nhập. Nếu chưa có tài khoản, đăng ký tại [vercel.com](https://vercel.com)

#### Bước 3: Deploy
```bash
vercel
```

Lần đầu tiên, Vercel sẽ hỏi:
- **Set up and deploy?** → Nhấn `Y`
- **Which scope?** → Chọn tài khoản của bạn
- **Link to existing project?** → Nhấn `N` (tạo project mới)
- **Project name?** → Nhập tên (ví dụ: `timesheet-pro-vn`) hoặc Enter để dùng tên mặc định
- **Directory?** → Nhấn Enter (sử dụng thư mục hiện tại)
- **Override settings?** → Nhấn `N`

#### Bước 4: Deploy Production
```bash
vercel --prod
```

Sau khi deploy thành công, bạn sẽ nhận được URL như: `https://timesheet-pro-vn.vercel.app`

### Cách 3: Deploy qua GitHub (Khuyến nghị cho team)

#### Bước 1: Tạo repository trên GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/timesheet-pro-vn.git
git push -u origin main
```

#### Bước 2: Kết nối với Vercel
1. Truy cập [vercel.com](https://vercel.com)
2. Đăng nhập bằng GitHub
3. Click **Add New Project** hoặc **Import Project**
4. Chọn repository `timesheet-pro-vn`
5. Vercel sẽ tự động detect Vite và cấu hình:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click **Deploy**

Vercel sẽ tự động deploy mỗi khi bạn push code lên GitHub!

### Cách 4: Deploy qua Vercel Dashboard (Không cần CLI)

1. Truy cập [vercel.com](https://vercel.com)
2. Đăng nhập
3. Click **Add New Project**
4. Upload thư mục project (zip) hoặc kết nối Git repository
5. Vercel sẽ tự động detect và deploy

## ⚙️ Cấu hình

File `vercel.json` đã được cấu hình:
- ✅ Build command: `npm run build`
- ✅ Output directory: `dist`
- ✅ Framework: Vite
- ✅ SPA routing: Tất cả routes đều trỏ về `/index.html`

## 📝 Lưu ý quan trọng

1. **API Key**: API Key Gemini đã được hardcode trong code, không cần cấu hình environment variables

2. **Node Version**: Vercel sẽ tự động sử dụng Node.js 18+ (không cần cấu hình)

3. **Build**: Project đã được test build thành công ✅

4. **Custom Domain**: Sau khi deploy, bạn có thể thêm custom domain trong Vercel Dashboard

## 🔧 Troubleshooting

### Lỗi build
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Lỗi Vercel CLI
```bash
# Cài đặt lại Vercel CLI
npm i -g vercel@latest
```

### Kiểm tra build local
```bash
npm run build
npm run preview
```

## 📞 Hỗ trợ

- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord

---

**Chúc bạn deploy thành công! 🎉**
