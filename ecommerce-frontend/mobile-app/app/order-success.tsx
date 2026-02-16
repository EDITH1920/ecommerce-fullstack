import { View, Text, Button, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function OrderSuccess() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>✅</Text>
      <Text style={styles.title}>Order Placed Successfully</Text>
      <Text>Your order has been confirmed</Text>

      <View style={{ marginTop: 20 }}>
        <Button
          title="View My Orders"
          onPress={() => router.replace("/(tabs)/orders")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  icon: { fontSize: 60 },
  title: { fontSize: 22, fontWeight: "bold", marginTop: 10 },
});
