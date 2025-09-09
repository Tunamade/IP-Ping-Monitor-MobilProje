import 'react-native-gesture-handler';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";
import MonitorScreen from "./MonitorScreen";

const Stack = createNativeStackNavigator();

export default function App() {
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (token) setIsLoggedIn(true);
        } catch (error) {
            console.log("Login kontrol hatası:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: true }}>
                {!isLoggedIn ? (
                    <>
                        <Stack.Screen name="Login">
                            {props => (
                                <LoginScreen
                                    {...props}
                                    onLoginSuccess={() => setIsLoggedIn(true)}
                                    goToRegister={() => props.navigation.navigate("Register")}
                                />
                            )}
                        </Stack.Screen>
                        <Stack.Screen name="Register">
                            {props => (
                                <RegisterScreen
                                    {...props}
                                    onRegisterSuccess={() => setIsLoggedIn(true)}
                                    goToLogin={() => props.navigation.navigate("Login")}
                                />
                            )}
                        </Stack.Screen>
                    </>
                ) : (
                    <Stack.Screen name="Monitor">
                        {props => (
                            <MonitorScreen
                                {...props}
                                onLogout={async () => {
                                    await AsyncStorage.removeItem("token");
                                    setIsLoggedIn(false); // Login ekranına otomatik geçiş
                                    // props.navigation.replace("Login"); artık gerek yok
                                }}
                            />
                        )}
                    </Stack.Screen>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
