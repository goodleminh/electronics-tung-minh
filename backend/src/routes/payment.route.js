import { Router } from "express";
import crypto from "crypto";
import axios from "axios";

const router = Router();

router.post("/zalopay", async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    // Log xem frontend gửi gì lên
    console.log("👉 [Backend] Nhận yêu cầu thanh toán:", { amount, orderId });

    if (amount === undefined || amount === null || orderId === undefined || orderId === null) {
      return res.status(400).json({ message: "Thiếu amount hoặc orderId từ Frontend" });
    }
    if (Number(amount) === 0) {
      // Đơn hàng miễn phí, không cần gọi ZaloPay, trả về luôn trạng thái thành công
      return res.status(200).json({
        order_url: null,
        app_trans_id: null,
        message: "Đơn hàng miễn phí, không cần thanh toán qua ZaloPay"
      });
    }

    // Cấu hình Sandbox
    const ZALO_CONFIG = {
      APP_ID: 2554,
      KEY1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
      ENDPOINT: "https://sb-openapi.zalopay.vn/v2/create",
    };

    const app_time = Date.now();
    const dateString = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    // Tạo mã giao dịch duy nhất: ngày_mãđơn_thờigian
    // Thêm timestamp để tránh lỗi "Duplicate app_trans_id" khi bạn test lại đơn cũ
    const app_trans_id = `${dateString}_${orderId}_${app_time}`;

    const embed_data = JSON.stringify({
      // Đổi redirecturl về đúng endpoint backend để xử lý trạng thái đơn hàng
      redirecturl: "http://localhost:3000/payment/zalopay-result",
      ipn_url: "https://url-ngrok-cua-ban.com/payment/zalopay-ipn",
    });

    const item = JSON.stringify([
      { itemid: "SP_TEST", itemname: "Thanh toan don hang", itemprice: amount }
    ]);

    const orderParams = {
      app_id: ZALO_CONFIG.APP_ID,
      app_trans_id: app_trans_id,
      app_user: "user_test",
      app_time: app_time,
      amount: amount,
      embed_data: embed_data,
      item: item,
      description: `Thanh toan don hang #${orderId}`,
      bank_code: "",
    };

    // Tính toán MAC
    const dataToHash = [
      orderParams.app_id,
      orderParams.app_trans_id,
      orderParams.app_user,
      orderParams.amount,
      orderParams.app_time,
      orderParams.embed_data,
      orderParams.item,
    ].join("|");

    orderParams.mac = crypto
      .createHmac("sha256", ZALO_CONFIG.KEY1)
      .update(dataToHash)
      .digest("hex");

    console.log("👉 [Backend] Đang gửi tới ZaloPay...", orderParams);

    // Gọi ZaloPay bằng Axios
    // Lưu ý: ZaloPay Sandbox thường nhận data qua params (query string) hoặc body form-urlencoded
    const result = await axios.post(ZALO_CONFIG.ENDPOINT, null, {
      params: orderParams,
    });

    const data = result.data;
    console.log("👈 [Backend] ZaloPay phản hồi:", data);

    if (data.return_code === 1) {
      return res.status(200).json({
        order_url: data.order_url,
        app_trans_id: app_trans_id,
        message: "Tạo đơn thành công",
      });
    } else {
      // Trả về lỗi chi tiết từ ZaloPay để bạn dễ debug
      return res.status(400).json({
        message: "ZaloPay từ chối: " + data.return_message,
        details: data
      });
    }
  } catch (error) {
    console.error("❌ [Backend] Lỗi hệ thống:", error.message);
    return res.status(500).json({ message: "Lỗi server: " + error.message });
  }
});

// Xử lý callback khi user hủy giao dịch hoặc thanh toán thất bại từ ZaloPay (status khác 1)
router.get("/zalopay-result", async (req, res) => {
  const { apptransid, status } = req.query;
  // status: -49 (user hủy), các giá trị khác 1 đều là lỗi/hủy
  if (apptransid && status && Number(status) !== 1) {
    // Tìm order_id từ apptransid (ví dụ: apptransid = 251119_54_1763571997320, số 54 là order_id)
    const parts = String(apptransid).split("_");
    const orderId = parts.length >= 2 ? Number(parts[1]) : null;
    if (orderId) {
      try {
        const Order = (await import('../models/order.model.js')).Order;
        await Order.update(
          { status: 'cancelled' },
          { where: { order_id: orderId } }
        );
        console.log(`[ZaloPay] Đã cập nhật đơn ${orderId} thành cancelled do user hủy/thanh toán lỗi.`);
      } catch (err) {
        console.error('[ZaloPay] Lỗi khi cập nhật trạng thái đơn:', err);
      }
    }
  }
  // Trả về JSON hoặc redirect về frontend
  res.json({ success: true });
});

export default router;