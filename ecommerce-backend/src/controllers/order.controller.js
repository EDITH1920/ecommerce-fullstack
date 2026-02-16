import Order from "../models/Order.model.js";
import Cart from "../models/Cart.model.js";
import Product from "../models/Product.model.js";
import User from "../models/User.model.js";


// =============================
// 📦 PLACE ORDER
// =============================
export const placeOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    let totalAmount = 0;

    const orderItems = cart.items.map((item) => {
      totalAmount += item.price * item.quantity;

      return {
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      };
    });

    // 🔻 Reduce Stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is out of stock`,
        });
      }

      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalAmount,
      orderStatus: "PENDING",
      statusHistory: [{ status: "PENDING" }],
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });

  } catch (error) {
    console.error("Place Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =============================
// 👤 GET MY ORDERS (USER)
// =============================
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("items.product", "name");

    res.json({
      success: true,
      orders,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =============================
// 👑 GET ALL ORDERS (ADMIN)
// =============================
export const getAllOrders = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const sort = req.query.sort || "newest";

    const skip = (page - 1) * limit;

    let filter = {};

    // ✅ Status filter
    if (status) {
      filter.orderStatus = status;
    }

    // ✅ Search by user name or email (PROPER METHOD)
    if (search) {
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      const userIds = matchingUsers.map((user) => user._id);

      filter.user = { $in: userIds };
    }

    // ✅ Sorting
    const sortOption =
      sort === "oldest"
        ? { createdAt: 1 }
        : { createdAt: -1 };

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("items.product", "name")
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(filter);

    res.json({
      success: true,
      orders,
      totalOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
    });

  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



// =============================
// 🔄 UPDATE ORDER STATUS (ADMIN)
// =============================
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const validStatuses = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const transitions = {
      PENDING: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: [],
    };

    if (!transitions[order.orderStatus].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${order.orderStatus} to ${status}`,
      });
    }

    order.orderStatus = status;

    if (status === "DELIVERED") {
      order.deliveredAt = new Date();
    }

    order.statusHistory.push({
      status,
      changedAt: new Date(),
    });

    await order.save();

    res.json({
      success: true,
      message: "Order status updated successfully",
      order,
    });

  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating order status",
    });
  }
};


// =============================
// ❌ DELETE ORDER (ADMIN)
// =============================
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await order.deleteOne();

    res.json({
      success: true,
      message: "Order deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =============================
// 📊 ADMIN DASHBOARD STATS
// =============================
export const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await Order.distinct("user");

    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: "DELIVERED" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    res.json({
      success: true,
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers: totalUsers.length,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =============================
// 📈 MONTHLY REVENUE (DELIVERED ONLY)
// =============================
export const getMonthlyRevenue = async (req, res) => {
  try {
    const revenue = await Order.aggregate([
      {
        $match: { orderStatus: "DELIVERED" },
      },
      {
        $group: {
          _id: { $month: "$deliveredAt" },
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      revenue,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
