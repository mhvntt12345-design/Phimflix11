# Hướng dẫn cài đặt Tự Động Cập Nhật PhimFlix trên Vercel.com

## Tổng quan
Render.com đã bắt đầu tính phí Cron Job ($1/tháng), nên chúng ta sẽ chuyển sang dùng **Vercel.com** hoàn toàn **MIỄN PHÍ**.
Vercel Hobby plan cho phép chạy 2 Cron Jobs mỗi ngày (vừa đủ 7h sáng & 7h tối). Script sẽ chạy tự động mà **không cần bật máy tính**.

---

## Bước 1 — Tạo GitHub Personal Access Token

1. Vào: https://github.com/settings/tokens/new
2. Điền **Note**: `PhimFlix Auto Update`
3. Chọn **Expiration**: `No expiration`
4. Tick vào **`repo`** (toàn bộ quyền repo)
5. Bấm **"Generate token"**
6. **SAO CHÉP TOKEN** (chỉ hiển thị 1 lần!) → dán vào Notepad

---

## Bước 2 — Đăng ký & Triển khai trên Vercel

1. Vào: https://vercel.com/signup
2. Đăng ký bằng tài khoản GitHub của bạn.
3. Trong Dashboard của Vercel, bấm nút **"Add New..."** → chọn **"Project"**.
4. Tìm đến repo `Phimflix11` của bạn và bấm **"Import"**.
5. Trong màn hình cấu hình project, mở phần **"Environment Variables"** và thêm các thông số sau:
   - Name: `GITHUB_TOKEN` → Value: *dán token từ Bước 1*
   - Name: `GITHUB_OWNER` → Value: `mhvntt12345-design`
   - Name: `GITHUB_REPO` → Value: `Phimflix11`
   - Name: `GITHUB_BRANCH` → Value: `master`
   - Name: `START_PAGE` → Value: `1`
   - Name: `END_PAGE` → Value: `5`
6. Bấm nút **"Deploy"**. Đợi khoảng 1 phút để Vercel cài đặt xong.

---

## Bước 3 — Kiểm tra tự động

1. Sau khi Deploy thành công, Vercel sẽ cấp cho bạn một domain (ví dụ: `phimflix11.vercel.app`).
2. Script của bạn giờ đây đã sẵn sàng ở đường dẫn: `https://[domain-cua-ban]/api/cron`.
3. Nhờ file `vercel.json` đã có sẵn trong mã nguồn, Vercel sẽ tự động hiểu và chạy đường dẫn trên 2 lần mỗi ngày (00:00 và 12:00 giờ UTC - tức là 7h sáng và 7h tối giờ VN).
4. Bạn có thể theo dõi tiến trình chạy trong tab **"Logs"** của Vercel.

---

## Thay đổi số trang quét

Nếu muốn quét nhiều trang hơn (tìm thêm phim cũ), đổi `END_PAGE` trong Vercel Dashboard (Settings → Environment Variables):
- `END_PAGE = 5` → Quét 50 phim mới nhất (nhanh, ~30 giây)
- `END_PAGE = 20` → Quét 200 phim (trung bình, ~2 phút)
- `END_PAGE = 50` → Quét 500 phim (chậm hơn, ~5 phút)

Lưu ý: Vercel serverless function có giới hạn thời gian chạy tối đa là **10 giây** cho tài khoản miễn phí. Tuy nhiên, Vercel Cron có thể hỗ trợ chạy dài hơn, hoặc nếu bị timeout, bạn nên giảm số lượng trang (`END_PAGE`) xuống còn `2` hoặc `3` để đảm bảo không bị quá giờ. (2 trang là đủ lấy 20 phim cập nhật mới nhất mỗi lần).
