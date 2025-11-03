# Product Service

Dịch vụ quản lý sản phẩm độc lập theo kiến trúc SOA (Service-Oriented Architecture).

## Thông tin dịch vụ

- **Port**: 3001
- **Database**: product_db (MySQL)
- **Base URL**: http://localhost:3001
- **Authentication**: Xác thực qua hello-app service (port 3000)

## Đặc điểm

- ✅ Hoạt động độc lập với port và database riêng
- ✅ RESTful API đầy đủ CRUD operations
- ✅ Xác thực tập trung qua hello-app service
- ✅ Sử dụng TypeORM với MySQL

## Cài đặt

```bash
npm install
```

## Cấu hình Database

Tạo database trong MySQL:

```sql
CREATE DATABASE product_db;
```

TypeORM sẽ tự động tạo bảng `products` khi khởi động ứng dụng.

## Chạy ứng dụng

### Development mode
```bash
npm run start:dev
```

### Production mode
```bash
npm run build
npm run start:prod
```

Service sẽ chạy trên port **3001**.

## API Endpoints

Tất cả endpoints yêu cầu JWT token trong header:
```
Authorization: Bearer <token>
```

### 1. GET /products
Lấy danh sách tất cả sản phẩm.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Product A",
    "description": "Description A",
    "price": 100.00,
    "stock": 50,
    "createdAt": "2025-11-03T10:00:00.000Z",
    "updatedAt": "2025-11-03T10:00:00.000Z"
  }
]
```

### 2. GET /products/:id
Lấy thông tin chi tiết một sản phẩm.

**Response:**
```json
{
  "id": 1,
  "name": "Product A",
  "description": "Description A",
  "price": 100.00,
  "stock": 50,
  "createdAt": "2025-11-03T10:00:00.000Z",
  "updatedAt": "2025-11-03T10:00:00.000Z"
}
```

### 3. POST /products
Thêm sản phẩm mới.

**Request Body:**
```json
{
  "name": "Product B",
  "description": "Description B",
  "price": 150.50,
  "stock": 30
}
```

**Response:**
```json
{
  "id": 2,
  "name": "Product B",
  "description": "Description B",
  "price": 150.50,
  "stock": 30,
  "createdAt": "2025-11-03T10:05:00.000Z",
  "updatedAt": "2025-11-03T10:05:00.000Z"
}
```

### 4. PUT /products/:id
Cập nhật thông tin sản phẩm.

**Request Body:**
```json
{
  "name": "Product A Updated",
  "price": 120.00,
  "stock": 45
}
```

### 5. DELETE /products/:id
Xóa sản phẩm.

**Response:** Status 200 OK

## Xác thực (Authentication)

Product-service sử dụng xác thực tập trung qua hello-app service.

### Cách lấy JWT Token:

1. **Đăng ký tài khoản** (nếu chưa có):
```bash
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

2. **Đăng nhập** để lấy token:
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "username": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

3. **Sử dụng token** trong header khi gọi API:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Cách hoạt động của Authentication

```
┌─────────┐           ┌────────────┐          ┌─────────────────┐
│ Client  │──login───>│ Hello-App  │          │ Product-Service │
│         │           │  (port     │          │   (port 3001)   │
│         │<──token───│   3000)    │          │                 │
└─────────┘           └────────────┘          └─────────────────┘
     │                                                  │
     │                                                  │
     └────────API request with token──────────────────>│
                                                        │
     ┌──────────────────────────────────────────────────┘
     │
     ▼
┌────────────┐
│ Hello-App  │  <── Product-Service gọi sang để validate token
│  validate  │
│   token    │
└────────────┘
```

### AuthGuard trong Product-Service

AuthGuard sẽ:
1. Lấy token từ header `Authorization`
2. Gọi API `POST http://localhost:3000/auth/validate` với token
3. Hello-app kiểm tra và trả về kết quả
4. Nếu token hợp lệ, cho phép request tiếp tục
5. Nếu không hợp lệ, trả về lỗi 401 Unauthorized

## Cấu trúc dự án

```
src/
├── entities/
│   └── Product.ts              # Entity định nghĩa bảng products
├── guards/
│   └── auth.guard.ts           # Guard xác thực qua hello-app
├── products/
│   ├── dto/
│   │   ├── create-product.dto.ts
│   │   └── update-product.dto.ts
│   ├── products.controller.ts  # Controller với 5 endpoints
│   ├── products.service.ts     # Service xử lý business logic
│   └── products.module.ts      # Products module
├── app.module.ts               # Root module
└── main.ts                     # Bootstrap (port 3001)
```

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Authorization header missing"
}
```

hoặc

```json
{
  "statusCode": 401,
  "message": "Token validation failed"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Product with id 999 not found"
}
```

## Testing

### Với Postman hoặc Thunder Client

1. Lấy JWT token từ hello-app
2. Tạo request đến product-service
3. Thêm header: `Authorization: Bearer YOUR_TOKEN`
4. Test các endpoints

### Ví dụ với curl

```bash
# Lấy token
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john@example.com","password":"password123"}' \
  | jq -r '.access_token')

# Lấy danh sách products
curl http://localhost:3001/products \
  -H "Authorization: Bearer $TOKEN"

# Tạo product mới
curl -X POST http://localhost:3001/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","description":"Dell XPS 15","price":1500,"stock":10}'
```

## Dependencies chính

- `@nestjs/common` & `@nestjs/core` - NestJS framework
- `@nestjs/typeorm` & `typeorm` - ORM cho database
- `mysql2` - MySQL driver
- `@nestjs/axios` & `axios` - HTTP client để gọi sang hello-app

## Lưu ý

1. **Hello-app phải chạy trước** (port 3000) để product-service có thể validate token
2. **Database** `product_db` phải được tạo trước khi chạy service
3. **Token expiration**: JWT token có thời hạn 1 giờ (cấu hình trong hello-app)
4. **CORS**: Nếu cần gọi từ frontend, có thể cấu hình CORS trong main.ts

## Kiến trúc SOA

Product-service tuân theo nguyên tắc SOA:

- ✅ **Độc lập**: Port và database riêng
- ✅ **Tách biệt nghiệp vụ**: Chỉ quản lý products
- ✅ **Giao tiếp qua API**: REST API chuẩn
- ✅ **Xác thực tập trung**: Sử dụng auth service của hello-app
- ✅ **Có thể scale riêng**: Deploy và scale độc lập với các service khác
