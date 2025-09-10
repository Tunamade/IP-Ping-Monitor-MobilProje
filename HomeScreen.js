import * as React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, Button, Title, Paragraph } from "react-native-paper";
import * as Animatable from "react-native-animatable";

export default function HomeScreen({ navigation, onLogout }) {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Başlık */}
            <Animatable.View animation="fadeInDown" duration={800}>
                <Title style={styles.title}>Ana Sayfa</Title>
            </Animatable.View>

            <View style={styles.cardsContainer}>
                {/* Monitor Kartı */}
                <Animatable.View animation="fadeInUp" delay={200} duration={800}>
                    <Card
                        style={styles.card}
                        onPress={() => navigation.navigate("Monitor")}
                    >
                        <Card.Content>
                            <Title style={styles.cardTitle}>📡 Monitor</Title>
                            <Paragraph style={styles.cardDesc}>IP adreslerini izle</Paragraph>
                        </Card.Content>
                    </Card>
                </Animatable.View>

                {/* Profil Kartı */}
                <Animatable.View animation="fadeInUp" delay={400} duration={800}>
                    <Card
                        style={styles.card}
                        onPress={() => navigation.navigate("Profile")}
                    >
                        <Card.Content>
                            <Title style={styles.cardTitle}>👤 Profil</Title>
                            <Paragraph style={styles.cardDesc}>
                                Kullanıcı bilgilerini gör
                            </Paragraph>
                        </Card.Content>
                    </Card>
                </Animatable.View>
            </View>

            {/* Çıkış Butonu */}
            <Animatable.View animation="fadeInUp" delay={600} duration={800}>
                <Button
                    mode="contained"
                    style={styles.logoutBtn}
                    onPress={onLogout}
                    buttonColor="#C62828"
                >
                    Çıkış Yap
                </Button>
            </Animatable.View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: "center",
        backgroundColor: "#E0E0E0", // Daha koyu gri arka plan
        flexGrow: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#333333", // Koyu gri başlık
    },
    cardsContainer: {
        width: "100%",
    },
    card: {
        marginVertical: 10,
        borderRadius: 14,
        elevation: 3,
        backgroundColor: "#FFFFFF", // Beyaz kart
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#222222", // Daha koyu yazı
    },
    cardDesc: {
        fontSize: 14,
        color: "#666666", // Orta gri açıklama
        marginTop: 5,
    },
    logoutBtn: {
        marginTop: 30,
        width: "100%",
        padding: 10,
        borderRadius: 10,
    },
});
