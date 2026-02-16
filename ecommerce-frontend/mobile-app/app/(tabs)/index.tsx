import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Image,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useEffect, useState } from "react";
import { getToken } from "@/utils/authStorage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import SearchBar from "@/components/ui/SearchBar";
import HeroCarousel from "@/components/ui/HeroCarousel";
import { useCart } from "../context/CartContext";
import { router } from "expo-router";

const API_URL = "http://127.0.0.1:5000";

export default function ProductsScreen() {
  const isDark = useColorScheme() === "dark";

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { refreshCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.log("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const addToCart = async (productId: string) => {
    try {
      const token = await getToken();

      const res = await fetch(`${API_URL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (res.ok) {
        await refreshCart(); // 🔥 Sync badge with backend
      }
    } catch (error) {
      console.log("Add to cart error:", error);
    }
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  const categories = [
    "All",
    ...new Set(
      products.map((p) => p.category?.name).filter(Boolean)
    ),
  ];

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (p) => p.category?.name === selectedCategory
        );

  const searchedProducts = filteredProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1e90ff" />
        <Text style={{ marginTop: 10 }}>
          Loading Products...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000" : "#f5f5f5" },
      ]}
    >
      <HeroCarousel />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
      />

      {/* CATEGORY FILTER */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item}
        style={{ paddingVertical: 12, paddingHorizontal: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedCategory(item)}
            style={[
              styles.chip,
              selectedCategory === item &&
                styles.chipActive,
            ]}
          >
            <Text
              style={{
                color:
                  selectedCategory === item
                    ? "#fff"
                    : "#333",
                fontWeight: "500",
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* PRODUCTS LIST */}
      <FlatList
        data={searchedProducts}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Navigate when image clicked */}
            <TouchableOpacity
              onPress={() =>
                router.push(`/product/${item._id}`)
              }
            >
              <Image
                source={{
                  uri: item.images?.length
                    ? `${API_URL}${item.images[0]}`
                    : "https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg",
                }}
                style={styles.image}
              />
            </TouchableOpacity>

            {/* Wishlist */}
            <TouchableOpacity
              style={styles.heart}
              onPress={() =>
                toggleWishlist(item._id)
              }
            >
              <Ionicons
                name={
                  wishlist.includes(item._id)
                    ? "heart"
                    : "heart-outline"
                }
                size={20}
                color="red"
              />
            </TouchableOpacity>

            <Text style={styles.name}>
              {item.name}
            </Text>

            <Text style={styles.price}>
              ₹ {item.price}
            </Text>

            <LinearGradient
              colors={["#1e90ff", "#0066ff"]}
              style={styles.gradientBtn}
            >
              <TouchableOpacity
                onPress={() =>
                  addToCart(item._id)
                }
              >
                <Text style={styles.btnText}>
                  Add to Cart
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    ...(Platform.OS === "web"
      ? {
          boxShadow:
            "0px 4px 12px rgba(0,0,0,0.1)",
        }
      : {
          elevation: 5,
        }),
  },

  image: {
    width: "100%",
    height: 180,
    borderRadius: 20,
  },

  heart: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 20,
    elevation: 4,
  },

  name: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 12,
  },

  price: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
    color: "#1e90ff",
  },

  gradientBtn: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
  },

  chip: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },

  chipActive: {
    backgroundColor: "#1e90ff",
  },
});
