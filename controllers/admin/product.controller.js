const ProductService = require("../../services/admin/product.service");

const getAllProductsAdmin = async (_, res, next) => {
  try {
    const data = await ProductService.handleGetProducts();

    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

const getProductDetailsAdmin = async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await ProductService.handleGetProductDetails(id);

    res.status(200).json({ product });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  const { description, name, slug } = req.body;

  try {
    const savedProduct = await ProductService.handleCreateProduct(
      description,
      name,
      slug
    );
    res.status(201).json({
      message: "Product created successfully!",
      product: savedProduct,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedProduct = await ProductService.handleUpdateProduct(
      id,
      req.body
    );
    res
      .status(200)
      .json({ message: "Updated successfully", product: updatedProduct });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await ProductService.handleDeleteProduct(id);

    res.status(200).json({ message: "Product deleted successfully", product });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProductsAdmin,
  getProductDetailsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
};
