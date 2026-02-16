import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Dimensions,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { getToken } from "@/utils/authStorage";
import { useCart } from "../context/CartContext";

const API_URL = "http://127.0.0.1:5000";
const { width } = Dimensions.get("window");

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const isDark = useColorScheme() === "dark";
  const { refreshCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState(false);

  // 🎯 Animation
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`);
      const data = await res.json();
      setProduct(data);
    } catch (error) {
      console.log("Product fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    try {
      const token = await getToken();

      await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: id, quantity: 1 }),
      });

      refreshCart();

      // 🔥 Button animation
      scale.value = withSpring(0.92);
      setTimeout(() => {
        scale.value = withSpring(1);
      }, 120);

      Alert.alert("Success", "Added to cart");
    } catch (error) {
      console.log("Cart error:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loader}>
        <Text>Product not found</Text>
      </View>
    );
  }

  const imageSource =
    product.images?.length
      ? `${API_URL}${product.images[0]}`
      : product.image
      ? `${API_URL}/${product.image}`
      : "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg";

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000" : "#f5f5f5" },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* 🔙 BACK BUTTON */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} />
      </TouchableOpacity>

      {/* ❤️ Wishlist */}
      <TouchableOpacity
        style={styles.heartBtn}
        onPress={() => setWishlisted(!wishlisted)}
      >
        <Ionicons
          name={wishlisted ? "heart" : "heart-outline"}
          size={22}
          color="red"
        />
      </TouchableOpacity>

      {/* 🖼 Product Image */}
      <Image
        source={{ uri: imageSource }}
        style={styles.image}
      />

      {/* 📦 Stock Badge */}
      <View style={styles.stockBadge}>
        <Text style={styles.stockText}>
          {product.stock > 0 ? "In Stock" : "Out of Stock"}
        </Text>
      </View>

      {/* 📄 Product Info */}
      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>

        <Text style={styles.price}>₹ {product.price}</Text>

        <Text style={styles.description}>
          {product.description || "No description available."}
        </Text>

        {/* 🛒 Animated Button */}
        <Animated.View style={animatedStyle}>
          <LinearGradient
            colors={["#1e90ff", "#0066ff"]}
            style={styles.cartBtn}
          >
            <TouchableOpacity
              onPress={addToCart}
              disabled={product.stock === 0}
            >
              <Text style={styles.cartText}>
                {product.stock > 0
                  ? "Add To Cart"
                  : "Out of Stock"}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 20,
  },

  heartBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 20,
  },

  image: {
    width: width,
    height: width * 0.9,
    resizeMode: "cover",
  },

  stockBadge: {
    position: "absolute",
    top: width * 0.8,
    left: 20,
    backgroundColor: "#1e90ff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },

  stockText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },

  content: {
    padding: 20,
  },

  name: {
    fontSize: 24,
    fontWeight: "bold",
  },

  price: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#1e90ff",
  },

  description: {
    fontSize: 15,
    color: "#666",
    marginBottom: 20,
    lineHeight: 22,
  },

  cartBtn: {
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
  },

  cartText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
