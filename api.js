import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔹 Ngrok URL (senin güncel adresinle değiştir)
const API_BASE_URL = "https://4f0a9ca698d2.ngrok-free.app/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Token ekleme
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ---------------- API Fonksiyonları ----------------

// Login
export const login = async (email, password) => {
    const response = await api.post("/login", { email, password });
    const token = response.data.token;

    await AsyncStorage.setItem("token", token);

    return response.data;
};

// Monitor IP listesi
export const getMonitorIPs = async () => {
    const response = await api.get("/monitor/ips");
    return response.data;
};

export default api;
