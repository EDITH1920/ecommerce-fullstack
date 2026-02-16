import { View, Text, Button, StyleSheet } from "react-native";
import { removeToken } from "@/utils/authStorage";
import { router } from "expo-router";

export default function ProfileScreen() {
  const logout = async () => {
    await removeToken();
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <Text style={styles.text}>Logged in user</Text>

      <View style={{ marginTop: 20 }}>
        <Button title="Logout" onPress={logout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  text: {
    marginTop: 10,
  },
});
