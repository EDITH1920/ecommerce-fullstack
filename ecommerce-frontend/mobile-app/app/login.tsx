import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  useColorScheme,
  Alert,
} from "react-native";
import { useState } from "react";
import { saveToken } from "@/utils/authStorage";
import { router } from "expo-router";

const API_URL = "http://localhost:5000"; // web
// use IP when testing on phone

export default function LoginScreen() {
  const isDark = useColorScheme() === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Login failed", data.message || "Invalid credentials");
        return;
      }

      await saveToken(data.token);
      router.replace("/"); // 🔥 THIS IS THE KEY

    } catch (error) {
      Alert.alert("Error", "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#ffffff" },
      ]}
    >
      <Text style={[styles.title, { color: isDark ? "#ffffff" : "#000000" }]}>
        Login
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor={isDark ? "#aaaaaa" : "#666666"}
        style={[
          styles.input,
          {
            color: isDark ? "#ffffff" : "#000000",
            borderColor: isDark ? "#555555" : "#cccccc",
          },
        ]}
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={isDark ? "#aaaaaa" : "#666666"}
        style={[
          styles.input,
          {
            color: isDark ? "#ffffff" : "#000000",
            borderColor: isDark ? "#555555" : "#cccccc",
          },
        ]}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <View style={{ marginTop: 10 }}>
        <Button
          title={loading ? "Logging in..." : "Login"}
          onPress={handleLogin}
          disabled={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
  },
});
