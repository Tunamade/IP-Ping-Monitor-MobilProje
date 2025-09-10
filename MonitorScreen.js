import React, { useEffect, useState, useRef } from "react";
import {
    View,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Alert,
    RefreshControl,
    TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";
import { Button, TextInput, Text } from "react-native-paper";
import { Table, Row } from "react-native-table-component";

export default function MonitorScreen({ navigation }) {
    const [ips, setIps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [newIp, setNewIp] = useState("");
    const [newName, setNewName] = useState("");
    const [isContinuousPing, setIsContinuousPing] = useState(false);
    const [search, setSearch] = useState("");
    const [sortColumn, setSortColumn] = useState("ip");
    const [sortAsc, setSortAsc] = useState(true);
    const [page, setPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(8); // 🔹 default 10 satır
    const intervalRef = useRef(null);

    useEffect(() => {
        fetchIPs();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const fetchIPs = async () => {
        setRefreshing(true);
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

    const handleAddIP = async () => {
        if (!newIp.trim()) return Alert.alert("Hata", "IP adresi girin");
        try {
            const token = await AsyncStorage.getItem("token");
            await api.post(
                "/monitor/ips",
                { ip: newIp, name: newName },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewIp("");
            setNewName("");
            fetchIPs();
        } catch {
            Alert.alert("Hata", "IP eklenemedi");
        }
    };

    const handleDeleteIP = async (ip) => {
        try {
            const token = await AsyncStorage.getItem("token");
            await api.delete(`/monitor/ips/${ip}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchIPs();
        } catch {
            Alert.alert("Hata", "Silinemedi");
        }
    };

    const handleFailedIPs = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await api.get("/monitor/failed-ips", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const failedIps = response.data;
            if (failedIps.length > 0) {
                Alert.alert(
                    "Başarısız IP'ler",
                    failedIps.map((ip) => `${ip.ip} (${ip.name ?? "-"})`).join("\n")
                );
            } else {
                Alert.alert("Başarısız IP'ler", "Yok");
            }
        } catch {
            Alert.alert("Hata", "Başarısız IP listesi alınamadı");
        }
    };

    const handlePing = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            await api.post("/ping/queue", {}, { headers: { Authorization: `Bearer ${token}` } });
            fetchIPs();
        } catch {
            Alert.alert("Hata", "Ping gönderilemedi");
        }
    };

    const toggleContinuousPing = () => {
        if (!isContinuousPing) {
            intervalRef.current = setInterval(handlePing, 10000);
            setIsContinuousPing(true);
            Alert.alert("Bilgi", "Sürekli ping başlatıldı (her 10 saniye)");
        } else {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setIsContinuousPing(false);
            Alert.alert("Bilgi", "Sürekli ping durduruldu");
        }
    };

    // 🔹 Arama + sıralama
    const filteredData = ips.filter(
        (row) =>
            row.ip.includes(search) ||
            (row.name && row.name.toLowerCase().includes(search.toLowerCase()))
    );

    const sortedData = [...filteredData].sort((a, b) => {
        if (a[sortColumn] < b[sortColumn]) return sortAsc ? -1 : 1;
        if (a[sortColumn] > b[sortColumn]) return sortAsc ? 1 : -1;
        return 0;
    });

    const paginatedData = sortedData.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortAsc(!sortAsc);
        } else {
            setSortColumn(column);
            setSortAsc(true);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#000" />
                <Text>Yükleniyor...</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={[{}]} // dummy data
            renderItem={() => (
                <View style={styles.screen}>
                    {/* Üst Menü */}
                    <View style={styles.topMenu}>
                        <Button
                            mode="contained"
                            buttonColor="#333333"
                            onPress={() => navigation.navigate("Home")}
                        >
                            Ana Sayfa
                        </Button>
                        <Button mode="contained" buttonColor="#d9534f" onPress={handleFailedIPs}>
                            Başarısız IP'ler
                        </Button>
                    </View>

                    {/* IP Ekleme */}
                    <View style={styles.addRow}>
                        <TextInput
                            mode="outlined"
                            label="IP adresi"
                            value={newIp}
                            onChangeText={setNewIp}
                            style={styles.input}
                        />
                        <TextInput
                            mode="outlined"
                            label="İsim"
                            value={newName}
                            onChangeText={setNewName}
                            style={styles.input}
                        />
                        <Button
                            mode="contained"
                            buttonColor="#388E3C"
                            onPress={handleAddIP}
                            style={styles.addButton}
                        >
                            Ekle
                        </Button>
                    </View>

                    {/* Kontrol Butonları */}
                    <View style={styles.buttons}>
                        <Button mode="contained" buttonColor="#1976D2" onPress={handlePing}>
                            Ping Gönder
                        </Button>
                        <Button
                            mode="contained-tonal"
                            buttonColor="#f0ad4e"
                            onPress={toggleContinuousPing}
                        >
                            {isContinuousPing ? "Durdur" : "Sürekli Ping"}
                        </Button>
                    </View>

                    {/* Arama Kutusu */}
                    <TextInput
                        mode="outlined"
                        label="Ara (IP / İsim)"
                        value={search}
                        onChangeText={setSearch}
                        style={{ marginVertical: 10 }}
                    />

                    {/* Tablo */}
                    <View style={styles.tableContainer}>
                        <Row
                            data={[
                                <TouchableOpacity onPress={() => handleSort("ip")}>
                                    <Text style={styles.headerText}>
                                        IP {sortColumn === "ip" ? (sortAsc ? "↑" : "↓") : ""}
                                    </Text>
                                </TouchableOpacity>,
                                <TouchableOpacity onPress={() => handleSort("name")}>
                                    <Text style={styles.headerText}>
                                        İsim {sortColumn === "name" ? (sortAsc ? "↑" : "↓") : ""}
                                    </Text>
                                </TouchableOpacity>,
                                <TouchableOpacity onPress={() => handleSort("status")}>
                                    <Text style={styles.headerText}>
                                        Durum {sortColumn === "status" ? (sortAsc ? "↑" : "↓") : ""}
                                    </Text>
                                </TouchableOpacity>,
                                <TouchableOpacity onPress={() => handleSort("latency")}>
                                    <Text style={styles.headerText}>
                                        Gecikme {sortColumn === "latency" ? (sortAsc ? "↑" : "↓") : ""}
                                    </Text>
                                </TouchableOpacity>,
                                "Sil",
                            ]}
                            style={styles.header}
                            textStyle={styles.headerText}
                        />

                        {paginatedData.map((item, index) => (
                            <Row
                                key={item.id}
                                data={[
                                    item.ip,
                                    item.name ?? "-",
                                    <Text style={{ color: item.status === "success" ? "green" : "red" }}>
                                        {item.status ?? "-"}
                                    </Text>,
                                    item.latency ?? "-",
                                    <Button
                                        mode="contained"
                                        buttonColor="#d9534f"
                                        compact
                                        onPress={() => handleDeleteIP(item.ip)}
                                    >
                                        Sil
                                    </Button>,
                                ]}
                                style={[styles.row, index % 2 && { backgroundColor: "#f9f9f9" }]}
                                textStyle={styles.cellText}
                            />
                        ))}
                    </View>

                    {/* Pagination */}
                    <View style={styles.pagination}>
                        <Button
                            mode="contained"
                            buttonColor="#000000"
                            disabled={page === 0}
                            onPress={() => setPage(page - 1)}
                        >
                            Önceki
                        </Button>
                        <Text style={{ marginHorizontal: 10, alignSelf: "center" }}>
                            {page + 1} / {Math.ceil(sortedData.length / itemsPerPage)}
                        </Text>
                        <Button
                            mode="contained"
                            buttonColor="#000000"
                            disabled={(page + 1) * itemsPerPage >= sortedData.length}
                            onPress={() => setPage(page + 1)}
                        >
                            Sonraki
                        </Button>
                    </View>
                </View>
            )}
            keyExtractor={() => "tableScreen"}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={fetchIPs} />
            }
        />
    );
}

const styles = StyleSheet.create({
    screen: { flexGrow: 1, padding: 10, backgroundColor: "#E0E0E0" },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    topMenu: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
    addRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    input: { flex: 1, marginRight: 5 },
    addButton: { justifyContent: "center" },
    buttons: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
    tableContainer: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        overflow: "hidden",
        marginBottom: 20,
    },
    header: { height: 50, backgroundColor: "#000000" },
    headerText: { margin: 6, color: "white", fontWeight: "bold", textAlign: "center" },
    row: { height: 45, backgroundColor: "#fff", alignItems: "center" },
    cellText: { margin: 6, textAlign: "center" },
    pagination: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
});
