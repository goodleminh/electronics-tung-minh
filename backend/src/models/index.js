import User from "./auth.model.js";
import Order from "./order.model.js";
import OrderItem from "./order_item.model.js";
import { Product } from "./product.model.js";

const models = { User, Order, OrderItem, Product };

//Associate

models.Order.hasMany(models.OrderItem, { foreignKey: "order_id" });
models.Order.belongsTo(models.User, { foreignKey: "buyer_id" });

models.OrderItem.belongsTo(models.Product, { foreignKey: "product_id" });
models.OrderItem.belongsTo(models.Order, { foreignKey: "order_id" });

models.Product.hasMany(models.OrderItem, { foreignKey: "product_id" });

models.User.hasMany(models.Order, { foreignKey: "buyer_id" });

export default models;
