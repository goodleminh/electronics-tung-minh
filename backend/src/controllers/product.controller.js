import * as productService from "../services/product.service.js";

// Lấy tất cả sản phẩm
export const getAllProducts = async (req, res) => {
  const products = await productService.getAllProducts();
  res.status(200).send(products);
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    if (!product)
      return res.status(400).send({ message: "Không tìm thấy sản phẩm" });
    res.status(200).send(product);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

export const getRelatedProducts = async (req, res) => {
  try {
    const { category_id, product_id } = req.params;
    const related = await productService.getRelatedProducts(
      category_id,
      product_id
    );
    return res.status(200).json(related);
  } catch (err) {
    res.status(500).json({ message: "Không tìm thấy sản phẩm liên quan" });
  }
};
