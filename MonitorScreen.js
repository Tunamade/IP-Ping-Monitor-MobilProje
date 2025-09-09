import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, StyleSheet, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

export default function MonitorScreen({ onLogout }) {
    const [ips, setIps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchIPs();
    }, []);

    // Monitor IP listesini çek
    const fetchIPs = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await api.get("/monitor/ips", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setIps(response.data);
        } catch (err) {
            console.log("Monitor IP listesi alınamadı:", err.response?.data || err.message);
            Alert.alert("Hata", "Monitor IP listesi alınamadı");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Yenile butonu
    const handleRefresh = () => {
        setRefreshing(true);
        fetchIPs();
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.buttons}>
                <Button title="Çıkış Yap" onPress={onLogout} color="#d9534f" />
                <Button title="Yenile" onPress={handleRefresh} />
            </View>

            <Text style={styles.title}>Monitor IP Listesi</Text>

            <FlatList
                data={ips}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text>IP: {item.ip}</Text>
                        <Text>Durum: {item.status ?? "N/A"}</Text>
                        <Text>Gecikme: {item.latency ?? "-"}</Text>
                    </View>
                )}
                refreshing={refreshing}
                onRefresh={handleRefresh}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, marginTop: 40 },
    title: { fontSize: 20, fontWeight: "bold", marginVertical: 15, textAlign: "center" },
    item: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },
    buttons: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
