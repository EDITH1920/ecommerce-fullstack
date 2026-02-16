import { View, Text, StyleSheet } from "react-native";

export default function CartBadge({ count }: any) {
  if (!count) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 6,
  },
  text: {
    color: "#fff",
    fontSize: 12,
  },
});
