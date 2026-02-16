import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
} from "react-native";
import { useState, useCallback } from "react";
import { getToken } from "@/utils/authStorage";
import { useRouter, useFocusEffect } from "expo-router";

const API_URL = "http://127.0.0.1:5000";

export default function CartScreen() {
  const theme = useColorScheme();
  const isDark = theme === "dark";
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    try {
      const token = await getToken();

      const res = await fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        console.log("Unauthorized — token invalid");
        return;
      }

      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.log("Cart fetch error:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [])
  );

  const updateQty = async (productId: string, qty: number) => {
    if (qty < 1) return;

    const token = await getToken();

    await fetch(`${API_URL}/api/cart`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity: qty }),
    });

    fetchCart();
  };

  const placeOrder = async () => {
    if (items.length === 0) {
      Alert.alert("Cart is empty");
      return;
    }

    try {
      setLoading(true);

      const token = await getToken();

      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress: {
            fullName: "Aman",
            phone: "9999999999",
            addressLine: "Test Street",
            city: "Delhi",
            state: "Delhi",
            pincode: "110001",
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message);
        return;
      }

      setItems([]);
      router.replace("/orders");

    } catch (error) {
      Alert.alert("Error placing order");
    } finally {
      setLoading(false);
    }
  };

  const total = items.reduce(
    (sum: number, i: any) => sum + i.price * i.quantity,
    0
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0f0f0f" : "#f4f4f4" },
      ]}
    >
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 18, color: isDark ? "#fff" : "#000" }}>
            🛒 Your cart is empty
          </Text>
          <Text style={{ color: "gray", marginTop: 8 }}>
            Add some products to continue
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item: any) => item.product._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                { backgroundColor: isDark ? "#1a1a1a" : "#ffffff" },
              ]}
            >
              <Text
                style={{
                  color: isDark ? "#fff" : "#000",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                {item.product.name}
              </Text>

              <Text style={{ color: "#1e90ff", marginTop: 4 }}>
                ₹ {item.price}
              </Text>

              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() =>
                    updateQty(item.product._id, item.quantity - 1)
                  }
                >
                  <Text style={styles.qtyText}>−</Text>
                </TouchableOpacity>

                <Text
                  style={{
                    color: isDark ? "#fff" : "#000",
                    fontSize: 16,
                  }}
                >
                  {item.quantity}
                </Text>

                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() =>
                    updateQty(item.product._id, item.quantity + 1)
                  }
                >
                  <Text style={styles.qtyText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {items.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.totalText}>Total: ₹ {total}</Text>

          <TouchableOpacity
            style={[
              styles.placeBtn,
              loading && { opacity: 0.6 },
            ]}
            onPress={placeOrder}
            disabled={loading}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              {loading ? "Placing..." : "Place Order"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    justifyContent: "space-between",
    width: 120,
  },
  qtyBtn: {
    backgroundColor: "#1e90ff",
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#121212",
    padding: 20,
  },
  totalText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
  },
  placeBtn: {
    backgroundColor: "#1e90ff",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
});
