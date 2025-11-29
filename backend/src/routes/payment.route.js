import { Router } from "express";
import crypto from "crypto";
import axios from "axios";
import { Order } from "../models/order.model.js";

const router = Router();

const ZALO_CONFIG = {
  APP_ID: 2554,
  KEY1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
  ENDPOINT: "https://sb-openapi.zalopay.vn/v2/create",
};

// FE track page
const FRONTEND_TRACK_URL = "http://localhost:5173/track-order";
// BE redirect endpoint
const REDIRECT_URL = "http://localhost:3000/payment/zalopay-result";

// helper
const parseOrderIdFromAppTransId = (app_trans_id) => {
  const parts = String(app_trans_id || "").split("_");
  const orderId = parts.length >= 2 ? Number(parts[1]) : NaN;
  return Number.isNaN(orderId) ? null : orderId;
};

router.post("/zalopay", async (req, res) => {
  try {
    const amount = Number(req.body?.amount);
    const orderId = Number(req.body?.orderId);

    console.log("👉 [Backend] Nhận yêu cầu thanh toán:", { amount, orderId });

    if (Number.isNaN(amount) || Number.isNaN(orderId)) {
      return res.status(400).json({ message: "amount hoặc orderId không hợp lệ" });
    }

    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Nếu đơn đã cancelled/completed thì không tạo payment nữa
    if (["cancelled", "completed"].includes(order.status)) {
      return res.status(400).json({ message: `Order đang ở trạng thái ${order.status}, không thể thanh toán` });
    }

    // Đơn miễn phí -> coi như thanh toán xong luôn
    if (amount === 0) {
      await order.update({ status: "processing", payment_method: "zalopay" });
      return res.status(200).json({
        order_url: null,
        app_trans_id: null,
        result: "success",
        message: "Đơn miễn phí, không cần thanh toán",
      });
    }

    // ✅ QUAN TRỌNG: KHÔNG update processing ở đây
    // service đã set pending khi createOrder() rồi.

    const app_time = Date.now();
    const dateString = new Date().toISOString().slice(2, 10).replace(/-/g, ""); // yymmdd
    const app_trans_id = `${dateString}_${orderId}_${app_time}`;

    const embed_data = JSON.stringify({
      redirecturl: REDIRECT_URL, // sau khi user thanh toán/hủy, ZaloPay redirect về đây
    });

    const item = JSON.stringify([
      { itemid: String(orderId), itemname: "Thanh toan don hang", itemprice: Math.round(amount) },
    ]);

    const orderParams = {
      app_id: ZALO_CONFIG.APP_ID,
      app_trans_id,
      app_user: "user_test",
      app_time,
      amount: Math.round(amount),
      embed_data,
      item,
      description: `Thanh toan don hang #${orderId}`,
      bank_code: "",
    };

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

    console.log("👉 [Backend] Gửi ZaloPay create...", { ...orderParams, mac: "***" });

    const result = await axios.post(ZALO_CONFIG.ENDPOINT, null, { params: orderParams });
    const data = result.data;

    console.log("👈 [Backend] ZaloPay phản hồi:", data);

    if (data.return_code === 1) {
      // ✅ chỉ trả link, đơn vẫn pending
      return res.status(200).json({
        order_url: data.order_url,
        app_trans_id,
        message: "Tạo giao dịch thành công, chờ thanh toán",
      });
    }

    return res.status(400).json({
      message: "ZaloPay từ chối: " + data.return_message,
      details: data,
    });
  } catch (error) {
    console.error("❌ [Backend] Lỗi hệ thống:", error.message);
    return res.status(500).json({ message: "Lỗi server: " + error.message });
  }
});

// ✅ Chỉ xử lý 2 kết quả cuối: success hoặc cancelled
router.get("/zalopay-result", async (req, res) => {
  const { apptransid, status } = req.query;

  const orderId = parseOrderIdFromAppTransId(apptransid);

  let paymentResult = "cancelled"; // default
  try {
    if (orderId && status) {
      if (Number(status) === 1) {
        // thanh toán thành công -> chuyển processing
        await Order.update(
          { status: "processing" },
          { where: { order_id: orderId, status: "pending" } } // chỉ đổi nếu đang pending
        );
        paymentResult = "success";
        console.log(`[ZaloPay] Đơn ${orderId} => processing (payment success)`);
      } else {
        // user hủy / fail -> cancelled
        await Order.update(
          { status: "cancelled" },
          { where: { order_id: orderId, status: "pending" } }
        );
        paymentResult = "cancelled";
        console.log(`[ZaloPay] Đơn ${orderId} => cancelled (payment cancel/fail)`);
      }
    }
  } catch (err) {
    console.error("[ZaloPay] Lỗi cập nhật trạng thái:", err.message);
  }

  // redirect về FE (chỉ 2 trạng thái cuối)
  let redirectUrl = FRONTEND_TRACK_URL;
  const qp = new URLSearchParams();
  if (orderId) qp.set("orderId", String(orderId));
  qp.set("payment", paymentResult); // success | cancelled
  redirectUrl += `?${qp.toString()}`;

  return res.redirect(redirectUrl);
});

export default router;
