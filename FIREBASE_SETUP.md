# Hướng dẫn tạo Database Firebase Realtime Database

## 🚀 Cách nhanh nhất (Khuyến nghị)

### Sử dụng file HTML helper:
1. Mở file `firebase-import-helper.html` trong trình duyệt
2. Click nút **"Copy JSON"** để copy dữ liệu
3. Mở [Firebase Console](https://console.firebase.google.com/project/bachho-2062a/database/bachho-2062a-default-rtdb/data/)
4. Click biểu tượng **"⋮"** (3 chấm) ở góc trên bên phải
5. Chọn **"Import JSON"**
6. Paste JSON đã copy và click **"Import"**

## Bước 1: Truy cập Firebase Console
1. Mở link: https://console.firebase.google.com/project/bachho-2062a/database/bachho-2062a-default-rtdb/data/
2. Đăng nhập bằng tài khoản Google của bạn

## Bước 2: Tạo cấu trúc Database

### Cách 1: Import JSON (Khuyến nghị)
1. Trong Firebase Console, click vào biểu tượng **"⋮"** (3 chấm) ở góc trên bên phải
2. Chọn **"Import JSON"**
3. Copy toàn bộ nội dung từ file `firebase-database-structure.json` hoặc dùng file `firebase-import-helper.html`
4. Paste vào và click **"Import"**

### Cách 2: Tạo thủ công
Tạo các node sau trong Firebase Realtime Database:

#### 1. Node `employees` (Danh sách nhân viên)
```
employees/
  ├── 1/
  │   ├── id: "1"
  │   ├── code: "314"
  │   ├── name: "Trần Hữu Liên Việt"
  │   ├── department: "Văn Phòng"
  │   ├── shift: "08h00 - 17h00"
  │   ├── password: "123"
  │   └── role: "admin"
  ├── 2/
  │   └── ... (tương tự)
  └── ...
```

#### 2. Node `targets` (Mục tiêu/Phòng ban)
```
targets/
  ├── t1/
  │   ├── id: "t1"
  │   ├── name: "Văn Phòng Chính"
  │   └── roster/
  │       ├── 0/
  │       │   ├── employeeId: "1"
  │       │   └── shift: "08h00 - 17h00"
  │       └── ...
  └── ...
```

#### 3. Node `timesheets` (Dữ liệu chấm công theo năm/tháng)
```
timesheets/
  └── 2025/
      └── 12/  (tháng 12)
          ├── 1/  (employeeId)
          │   ├── id: "1"
          │   ├── code: "314"
          │   ├── name: "Trần Hữu Liên Việt"
          │   ├── department: "Văn Phòng"
          │   ├── shift: "08h00 - 17h00"
          │   └── attendance/
          │       ├── 1: "1"
          │       ├── 2: "1"
          │       ├── 6: "CN"
          │       └── ... (các ngày khác)
          └── ...
```

#### 4. Node `workflows` (Quy trình sản xuất - nếu có)
```
workflows/
  └── workflow1/
      ├── id: "workflow1"
      ├── name: "Quy trình sản xuất 1"
      ├── steps/
      │   ├── step1/
      │   │   ├── id: "step1"
      │   │   ├── name: "Bước 1"
      │   │   ├── order: 1
      │   │   └── note: ""  (ghi chú cho bước này)
      │   └── ...
      ├── createdAt: "2025-01-01T00:00:00Z"
      └── updatedAt: "2025-01-01T00:00:00Z"
```

## Cấu trúc dữ liệu chi tiết

### Employee (Nhân viên)
- `id`: ID duy nhất
- `code`: Mã nhân viên
- `name`: Tên đầy đủ
- `department`: Phòng ban (Văn Phòng, Kho A, Kho B, Kế Toán)
- `shift`: Ca làm việc
- `password`: Mật khẩu đăng nhập
- `role`: Vai trò ("admin" hoặc "staff")

### Target (Mục tiêu)
- `id`: ID duy nhất
- `name`: Tên mục tiêu
- `roster`: Danh sách nhân viên trong mục tiêu
  - `employeeId`: ID nhân viên
  - `shift`: Ca làm việc

### Timesheet (Chấm công)
- Cấu trúc: `timesheets/{year}/{month}/{employeeId}`
- `attendance`: Object với key là số ngày (1-31), value là:
  - `"1"`: Làm đủ công
  - `"0.5"`: Nửa công
  - `"P"`: Nghỉ phép
  - `"CN"`: Chủ nhật

### Workflow (Quy trình)
- `id`: ID duy nhất
- `name`: Tên quy trình
- `steps`: Các bước trong quy trình
  - `id`: ID bước
  - `name`: Tên bước
  - `order`: Thứ tự
  - `note`: Ghi chú (để lại cho người làm bước tiếp theo)

## Lưu ý
- Đảm bảo Rules của Firebase cho phép đọc/ghi dữ liệu
- Có thể cần cấu hình Authentication nếu code yêu cầu
- Dữ liệu mẫu trong file JSON chỉ là ví dụ, bạn có thể thêm/sửa theo nhu cầu

