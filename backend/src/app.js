import express from "express";
import bodyParser from "body-parser";
import productRouter from "./routes/product.router.js";
import categoryRouter from "./routes/category.router.js";
import cartRouter from "./routes/cart.router.js";
import storeRouter from "./routes/store.router.js";
import orderRouter from "./routes/order.router.js"; 
import orderItemRouter from "./routes/order_item.router.js"; 
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/auth.route.js";

const app = express();

app.use(cors());
// noi dung phan body-parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// Cấu hình __dirname trong ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cho phép truy cập tĩnh tới thư mục "public"
app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/products", productRouter);
app.use("/categories", categoryRouter);
app.use("/carts", cartRouter);
app.use("/stores", storeRouter);
app.use("/orders", orderRouter); 
app.use("/order-items", orderItemRouter); 
app.use("/api/auth", authRouter);

export default app;
