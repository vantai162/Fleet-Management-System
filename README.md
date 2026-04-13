# 🚛 Fleet Management System - Enterprise Vehicle Management Platform

Fleet Management System là một nền tảng web dành riêng cho doanh nghiệp giúp quản lý đội xe, tài xế và hoạt động vận chuyển một cách hiệu quả. Hệ thống hỗ trợ tối ưu hóa việc phân công, theo dõi và vận hành phương tiện dựa trên nhiều tiêu chí như loại xe, bằng lái, tuyến đường và điều kiện địa hình.

Link youtube về project: https://www.youtube.com/watch?v=kk-JpheXv9E&t=235s

---

## 🚀 Features

### 🚗 Vehicle Management

* Quản lý danh sách xe:

  * Phân loại theo loại xe
  * Loại nhiên liệu (xăng, dầu, điện,...)
  * Kích thước / tải trọng
* Theo dõi tình trạng xe
* Quản lý bảo trì và lịch sử sử dụng

### 👨‍✈️ Driver Management

* Quản lý thông tin tài xế
* Phân loại theo bằng lái (B1, B2, C,...)
* Theo dõi thời gian rảnh
* Gán tài xế phù hợp với từng chuyến đi

### 🗺️ Route Management

* Quản lý tuyến đường vận chuyển
* Lưu thông tin khoảng cách, thời gian dự kiến
* Phân tích tuyến đường theo địa hình

### ⛽ Fuel Management

* Theo dõi mức tiêu thụ nhiên liệu
* Quản lý lịch sử đổ xăng/dầu
* Phân tích chi phí nhiên liệu theo xe/chuyến

### 🚚 Trip Management

* Quản lý chuyến đi:

  * Quãng đường
  * Thời gian
  * Trạng thái chuyến
* Theo dõi vi phạm (phạt nguội)
* Lịch sử hoạt động của từng chuyến

### 📅 Transport Scheduling

* Đặt lịch vận chuyển
* Tự động đề xuất xe phù hợp:

  * Dựa trên địa hình
  * Loại hàng hóa
  * Tình trạng xe
* Phân công tài xế dựa trên:

  * Bằng lái phù hợp
  * Thời gian rảnh

---

## 🔐 Role-Based Access Control

Hệ thống hỗ trợ phân quyền theo 3 role chính, mỗi role có giao diện và chức năng riêng:

### 👑 Admin

* Quản lý toàn bộ hệ thống:

  * Vehicles, Drivers, Routes, Trips
* Quản lý user & phân quyền
* Xem báo cáo tổng quan
* Truy cập dashboard thống kê:

  * Tổng số chuyến đi
  * Chi phí nhiên liệu
  * Hiệu suất xe

### 🧭 Dispatcher

* Lập kế hoạch và điều phối:

  * Tạo và quản lý lịch vận chuyển
  * Phân công tài xế & xe
* Theo dõi trạng thái chuyến đi
* Dashboard thống kê:

  * Số chuyến theo ngày/tháng
  * Tỷ lệ hoàn thành
  * Hiệu suất vận hành

### 🚚 Driver

* Xem danh sách chuyến được phân công
* Cập nhật trạng thái chuyến:

  * Bắt đầu / Hoàn thành
* Xem thông tin tuyến đường và xe
* Báo cáo sự cố / vi phạm

---

## 📊 Analytics & Dashboard

* Biểu đồ thống kê (charts) cho Admin & Dispatcher:

  * Số chuyến theo thời gian
  * Chi phí nhiên liệu
  * Quãng đường trung bình
  * Hiệu suất tài xế / xe
* Trực quan hóa dữ liệu bằng chart (bar, line, pie)
* Hỗ trợ phân tích và ra quyết định

---

## 🛠️ Tech Stack

### Frontend

* ReactJS
* JavaScript (ES6+)

### Backend

* ASP.NET (C#)
* RESTful API

### Database

* Microsoft SQL Server (MSSQL)

---

## 📦 Project Structure

```
FleetManagementSystem/
│── client/        # React frontend
│── server/        # ASP.NET backend
│── database/      # SQL scripts, migrations
│── docs/          # Documentation
│── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone project

```bash
git clone https://github.com/your-username/fleet-management-system.git
cd fleet-management-system
```

---

### 2. Backend (ASP.NET)

```bash
cd server
dotnet restore
dotnet build
dotnet run
```

---

### 3. Frontend (React)

```bash
cd client
npm install
npm start
```

---

## 🔥 Environment Variables

Tạo file `appsettings.json` trong thư mục `server`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=FleetDB;User Id=sa;Password=your_password;"
  },
  "Jwt": {
    "Key": "your_secret_key",
    "Issuer": "FleetManagementSystem"
  }
}
```

---

## 📡 API Overview

### Vehicles

* `GET /api/vehicles`
* `POST /api/vehicles`
* `PUT /api/vehicles/{id}`

### Drivers

* `GET /api/drivers`
* `POST /api/drivers`

### Trips

* `GET /api/trips`
* `POST /api/trips`

### Routes

* `GET /api/routes`
* `POST /api/routes`

### Scheduling

* `POST /api/schedule`

---

## 🧠 Future Improvements

* Tối ưu route bằng thuật toán (Shortest Path, AI)
* Real-time tracking (GPS integration)
* Dashboard analytics nâng cao
* Mobile App cho tài xế

---

## 👨‍💻 Author

* Tèo Hoàng

---

## 📄 License

This project is licensed under the MIT License.
