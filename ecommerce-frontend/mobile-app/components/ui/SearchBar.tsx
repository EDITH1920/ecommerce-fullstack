import { View, TextInput, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";

interface Props {
  value: string;
  onChange: (text: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {/* Using 'search' instead of 'search1' to avoid TS error */}
      <AntDesign name={"search" as any} size={18} color="#888" />
      <TextInput
        placeholder="Search products..."
        value={value}
        onChangeText={onChange}
        style={styles.input}
        placeholderTextColor="#999"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 3,
  },
  input: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
});
