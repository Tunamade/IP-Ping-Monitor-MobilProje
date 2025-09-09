import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

export default function LoginScreen({ onLoginSuccess, goToRegister }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setError("");
        try {
            const response = await api.post("/login", { email, password });
            const token = response.data.token;
            await AsyncStorage.setItem("token", token);
            onLoginSuccess();
        } catch (err) {
            console.log("Login hatası:", err.response?.data || err.message);
            setError("Giriş başarısız!");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Giriş Yap</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TextInput
                style={styles.input}
                placeholder="E-posta"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Şifre"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <Button title="Giriş Yap" onPress={handleLogin} />

            <Text style={styles.toggleText} onPress={goToRegister}>
                Hesabın yok mu? Kayıt ol
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 20 },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 15, borderRadius: 5 },
    error: { color: "red", marginBottom: 15, textAlign: "center" },
    toggleText: { marginTop: 20, textAlign: "center", color: "blue" },
});
