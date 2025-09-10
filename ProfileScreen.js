import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, TextInput, Switch, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

// Profil ekranının ana bileşeni
export default function ProfileScreen({ navigation, onLogout }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    // 'profile', 'update', 'password', 'notifications'
    const [activeSection, setActiveSection] = useState("profile");

    // Profil Güncelleme Formu için state'ler
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [about, setAbout] = useState("");

    // Şifre Değiştirme Formu için state'ler
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Bildirim Ayarları için state
    const [emailNotifications, setEmailNotifications] = useState(false);

    // Backend'den profil verilerini çeker
    const fetchProfile = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                onLogout();
                return;
            }
            const response = await api.get("/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const userData = response.data;
            setUser(userData);
            // Form state'lerini mevcut verilerle doldur
            setName(userData.name);
            setEmail(userData.email);
            setAbout(userData.about);
            setEmailNotifications(userData.email_notifications || false);
        } catch (err) {
            console.error("Profil alınamadı:", err.response?.data || err.message);
            Alert.alert("Hata", "Profil bilgileri alınamadı. Lütfen tekrar deneyin.");
            onLogout();
        } finally {
            setLoading(false);
        }
    };

    // Bilgileri Güncelleme İşlemi
    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            await api.put("/profile", { name, email, about }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("Başarılı", "Profil bilgileri güncellendi.");
            // Güncellenen veriyi tekrar çekerek UI'ı yenile
            await fetchProfile();
            setActiveSection("profile");
        } catch (err) {
            console.error("Güncelleme hatası:", err.response?.data || err.message);
            Alert.alert("Hata", "Profil bilgileri güncellenemedi.");
        } finally {
            setLoading(false);
        }
    };

    // Şifre Değiştirme İşlemi
    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert("Hata", "Yeni şifreler eşleşmiyor.");
            return;
        }
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            await api.put("/profile/password", {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("Başarılı", "Şifreniz başarıyla değiştirildi.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setActiveSection("profile");
        } catch (err) {
            console.error("Şifre değiştirme hatası:", err.response?.data || err.message);
            Alert.alert("Hata", "Şifre değiştirilirken bir sorun oluştu.");
        } finally {
            setLoading(false);
        }
    };

    // Bildirim Ayarı İşlemi
    const toggleNotifications = async () => {
        const newState = !emailNotifications;
        setEmailNotifications(newState);
        try {
            const token = await AsyncStorage.getItem("token");
            await api.put("/profile/notifications", { email_notifications: newState }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert("Başarılı", "Bildirim ayarı güncellendi.");
        } catch (err) {
            console.error("Bildirim hatası:", err.response?.data || err.message);
            Alert.alert("Hata", "Bildirim ayarı güncellenemedi.");
            // Hata durumunda eski duruma geri dön
            setEmailNotifications(!newState);
        }
    };

    // Bileşen yüklendiğinde profili çek
    useEffect(() => {
        fetchProfile();
    }, []);

    // Yükleniyor ekranı
    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={{ marginTop: 10 }}>Yükleniyor...</Text>
            </View>
        );
    }

    // `activeSection` state'ine göre gösterilecek içeriği belirler
    const renderContent = () => {
        switch (activeSection) {
            case "update":
                return (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>📝 Bilgileri Güncelle</Text>
                        <TextInput style={styles.input} placeholder="Ad Soyad" value={name} onChangeText={setName} />
                        <TextInput style={styles.input} placeholder="E-posta" value={email} onChangeText={setEmail} keyboardType="email-address" />
                        <TextInput style={styles.input} placeholder="Hakkımda" value={about} onChangeText={setAbout} multiline />
                        <TouchableOpacity style={styles.submitBtn} onPress={handleUpdateProfile}>
                            <Text style={styles.submitText}>Kaydet</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.backBtn} onPress={() => setActiveSection("profile")}>
                            <Text style={styles.backText}>Geri Dön</Text>
                        </TouchableOpacity>
                    </View>
                );
            case "password":
                return (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>🔒 Şifre Değiştir</Text>
                        <TextInput style={styles.input} placeholder="Mevcut Şifre" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
                        <TextInput style={styles.input} placeholder="Yeni Şifre" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
                        <TextInput style={styles.input} placeholder="Yeni Şifre (Tekrar)" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
                        <TouchableOpacity style={styles.submitBtn} onPress={handlePasswordChange}>
                            <Text style={styles.submitText}>Şifreyi Değiştir</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.backBtn} onPress={() => setActiveSection("profile")}>
                            <Text style={styles.backText}>Geri Dön</Text>
                        </TouchableOpacity>
                    </View>
                );
            case "notifications":
                return (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>🔔 Bildirim Ayarları</Text>
                        <View style={styles.settingRow}>
                            <Text style={styles.settingLabel}>E-posta Bildirimlerini Aç/Kapat</Text>
                            <Switch
                                trackColor={{ false: "#767577", true: "#81b0ff" }}
                                thumbColor={emailNotifications ? "#f5dd4b" : "#f4f3f4"}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={toggleNotifications}
                                value={emailNotifications}
                            />
                        </View>
                        <TouchableOpacity style={styles.backBtn} onPress={() => setActiveSection("profile")}>
                            <Text style={styles.backText}>Geri Dön</Text>
                        </TouchableOpacity>
                    </View>
                );
            default: // 'profile'
                return (
                    <View>
                        <View style={styles.card}>
                            <Text style={styles.label}>Ad Soyad:</Text>
                            <Text style={styles.value}>{user?.name}</Text>
                        </View>
                        <View style={styles.card}>
                            <Text style={styles.label}>E-posta:</Text>
                            <Text style={styles.value}>{user?.email}</Text>
                        </View>
                        <View style={styles.card}>
                            <Text style={styles.label}>Hakkımda:</Text>
                            <Text style={styles.value}>{user?.about || "Henüz bir bilgi eklenmemiş."}</Text>
                        </View>

                        <TouchableOpacity style={styles.featureBtn} onPress={() => setActiveSection("update")}>
                            <Text style={styles.featureText}>📝 Bilgileri Güncelle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.featureBtn} onPress={() => setActiveSection("password")}>
                            <Text style={styles.featureText}>🔒 Şifre Değiştir</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.featureBtn} onPress={() => setActiveSection("notifications")}>
                            <Text style={styles.featureText}>🔔 Bildirim Ayarları</Text>
                        </TouchableOpacity>
                    </View>
                );
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>👤 Profil</Text>
            {renderContent()}

            <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate("Home")}>
                <Text style={styles.homeText}>🏠 Ana Sayfaya Dön</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
                <Text style={styles.logoutText}>🚪 Çıkış Yap</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#333" },
    card: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    label: { fontSize: 16, fontWeight: "600", color: "#555" },
    value: { fontSize: 16, color: "#333", marginTop: 4 },
    featureBtn: {
        backgroundColor: "#2c3e50",
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
        alignItems: "center",
        elevation: 2,
    },
    featureText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    sectionContainer: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        elevation: 2,
    },
    sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
    input: {
        backgroundColor: "#f5f5f5",
        padding: 12,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    submitBtn: {
        backgroundColor: "#28a745",
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
        alignItems: "center",
    },
    submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    backBtn: {
        backgroundColor: "#6c757d",
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
        alignItems: "center",
    },
    backText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    settingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
    },
    settingLabel: { fontSize: 16, color: "#333" },
    homeBtn: {
        backgroundColor: "#0275d8",
        padding: 15,
        borderRadius: 8,
        marginTop: 30,
        alignItems: "center",
    },
    homeText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    logoutBtn: {
        backgroundColor: "#d9534f",
        padding: 15,
        borderRadius: 8,
        marginTop: 15,
        alignItems: "center",
    },
    logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});