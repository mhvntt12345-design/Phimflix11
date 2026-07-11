# Hướng dẫn cài đặt Tự Động Cập Nhật PhimFlix trên Render.com

## Tổng quan
Render.com là dịch vụ đám mây **miễn phí** sẽ chạy script cập nhật phim tự động **mỗi ngày 2 lần** (7h sáng và 7h tối giờ Việt Nam) mà **không cần bật máy tính**.

---

## Bước 1 — Tạo GitHub Personal Access Token

1. Vào: https://github.com/settings/tokens/new
2. Điền **Note**: `PhimFlix Auto Update`
3. Chọn **Expiration**: `No expiration`
4. Tick vào **`repo`** (toàn bộ quyền repo)
5. Bấm **"Generate token"**
6. **SAO CHÉP TOKEN** (chỉ hiển thị 1 lần!) → dán vào Notepad

---

## Bước 2 — Đăng ký Render.com

1. Vào: https://render.com
2. Bấm **"Get Started for Free"**
3. Chọn **"Continue with GitHub"** → Đăng nhập bằng tài khoản GitHub

---

## Bước 3 — Tạo Cron Job

1. Sau khi đăng nhập, bấm **"New +"** → chọn **"Cron Job"**
2. Chọn **"Connect a repository"** → chọn repo `Phimflix11`
3. Điền thông tin:
   - **Name**: `phimflix-auto-update`
   - **Region**: `Singapore` (gần Việt Nam nhất)
   - **Branch**: `master`
   - **Runtime**: `Node`
   - **Build Command**: để trống hoặc `echo done`
   - **Command**: `node cloud-update.js`
   - **Schedule**: `0 0,12 * * *` (7h sáng & 7h tối giờ VN)
4. Bấm **"Advanced"** → phần **Environment Variables** → thêm:
   - Key: `GITHUB_TOKEN` → Value: *dán token từ Bước 1*
   - Key: `GITHUB_OWNER` → Value: `mhvntt12345-design`
   - Key: `GITHUB_REPO` → Value: `Phimflix11`
   - Key: `GITHUB_BRANCH` → Value: `master`
   - Key: `START_PAGE` → Value: `1`
   - Key: `END_PAGE` → Value: `5`
5. Bấm **"Create Cron Job"**

---

## Bước 4 — Kiểm tra

- Sau khi tạo, bấm **"Trigger Run"** để chạy thử ngay
- Xem log trong tab **"Logs"** — sẽ thấy thông báo phim được cập nhật
- Nếu thấy `✅ HOÀN THÀNH!` là thành công

---

## Lịch chạy tự động

| Giờ UTC | Giờ Việt Nam | Hành động |
|---------|-------------|-----------|
| 00:00   | 07:00 sáng  | Cập nhật 5 trang phim mới nhất |
| 12:00   | 19:00 tối   | Cập nhật 5 trang phim mới nhất |

---

## Thay đổi số trang quét

Nếu muốn quét nhiều trang hơn (tìm thêm phim cũ), đổi `END_PAGE` trong Environment Variables:
- `END_PAGE = 5` → Quét 50 phim mới nhất (nhanh, ~30 giây)
- `END_PAGE = 20` → Quét 200 phim (trung bình, ~2 phút)
- `END_PAGE = 50` → Quét 500 phim (chậm hơn, ~5 phút)

---

## Ghi chú
- Render.com miễn phí cho **cron job** không giới hạn số lần chạy
- Nếu cần cào toàn bộ kho phim (3000+ trang), chạy thủ công trên máy tính bằng `bulk-import-local.bat`
