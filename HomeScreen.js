// HomeScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUser, logout } from "./api";

export default function HomeScreen({ navigation }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await getUser();
            setUser(res);
        } catch (err) {
            console.log(err);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            await AsyncStorage.removeItem("token");
            navigation.replace("Login");
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome, {user?.name || "User"}</Text>
            <Button title="Logout" onPress={handleLogout} color="red" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 24, marginBottom: 20 },
});
