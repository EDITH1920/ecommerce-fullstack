import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { useEffect, useState } from "react";
import { getToken } from "@/utils/authStorage";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";

const API_URL = "http://localhost:5000";

export default function OrdersScreen() {
  const theme = useColorScheme();
  const isDark = theme === "dark";
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/orders/myorders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setOrders(data || []);
  };

  const cancelOrder = async (id: string) => {
    const token = await getToken();

    await fetch(`${API_URL}/api/orders/${id}/cancel`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchOrders();
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [])
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}>
      <FlatList
        data={orders}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={{ color: isDark ? "#aaa" : "#555", textAlign: "center" }}>
            No orders found
          </Text>
        }
        renderItem={({ item }: any) => (
          <View style={[styles.card, { backgroundColor: isDark ? "#121212" : "#f9f9f9" }]}>
            <Text style={{ color: isDark ? "#fff" : "#000" }}>
              Total: ₹ {item.totalAmount}
            </Text>

            <Text style={{ color: item.orderStatus === "CANCELLED" ? "red" : "orange" }}>
              {item.orderStatus}
            </Text>

            {item.orderStatus === "PENDING" && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => cancelOrder(item._id)}
              >
                <Text style={{ color: "#fff" }}>Cancel Order</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cancelBtn: {
    marginTop: 10,
    backgroundColor: "red",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
});
