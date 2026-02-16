import Product from "../models/Product.model.js";
import Category from "../models/Category.model.js";


// =============================
// ✅ CREATE PRODUCT (ADMIN)
// =============================
export const createProduct = async (req, res) => {
  try {
    const { name, price, stock, category, description } = req.body;

    if (!name || !price || !stock || !category || !description) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Validate category
    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const product = await Product.create({
      name,
      price: Number(price),
      stock: Number(stock),
      category,
      description,
      images: req.file ? [`/uploads/${req.file.filename}`] : [],
    });

    res.status(201).json(product);

  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};



// =============================
// ✅ GET ALL PRODUCTS (PUBLIC)
// =============================
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    res.json(products);

  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// =============================
// ✅ GET ALL PRODUCTS (ADMIN)
// =============================
export const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    res.json(products);

  } catch (error) {
    console.error("Admin Get Products Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// =============================
// ✅ GET PRODUCTS BY CATEGORY
// =============================
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const products = await Product.find({
      category: categoryId,
      isActive: true,
    }).populate("category", "name slug");

    res.json(products);

  } catch (error) {
    console.error("Category Products Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// =============================
// ✅ UPDATE PRODUCT (ADMIN)
// =============================
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, category, description } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Validate category if changed
    if (category) {
      const existingCategory = await Category.findById(category);
      if (!existingCategory) {
        return res.status(400).json({ message: "Invalid category" });
      }
      product.category = category;
    }

    product.name = name || product.name;
    product.price = price ? Number(price) : product.price;
    product.stock = stock ? Number(stock) : product.stock;
    product.description = description || product.description;

    // ✅ FIXED IMAGE UPDATE
    if (req.file) {
      product.images = [`/uploads/${req.file.filename}`];
    }

    await product.save();

    res.json(product);

  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// =============================
// ✅ DELETE PRODUCT (ADMIN)
// =============================
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();

    res.json({ message: "Product deleted successfully" });

  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// =============================
// 🚨 LOW STOCK PRODUCTS
// =============================
export const getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      stock: { $lt: 5 },
    }).select("name stock images");

    res.json(lowStockProducts);

  } catch (error) {
    console.error("Low Stock Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
