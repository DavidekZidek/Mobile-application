import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { listenToAccountChanges, fetchAccount } from "../database/accountService";
import { getCryptoPrices } from "../api/cryptoAPI";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../database/firebaseConfig";

export default function HomeScreen({ navigation }) {
  const [account, setAccount] = useState(null);
  const [cryptoTrends, setCryptoTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("🔄 Fetching account data...");

    const user = auth.currentUser;
    if (!user) {
      console.error("❌ No user logged in.");
      Alert.alert("Error", "No user is logged in.");
      setIsLoading(false);
      return;
    }

    const unsubscribe = listenToAccountChanges((updatedAccount) => {
      if (!updatedAccount) {
        console.warn("⚠️ No account data found.");
        Alert.alert("Error", "No account data found.");
      } else {
        console.log("✅ Account data received:", updatedAccount);
        setAccount(updatedAccount);
      }
      setIsLoading(false);
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  useEffect(() => {
    const loadCryptoData = async () => {
      try {
        console.log("🔄 Fetching crypto prices...");
        setIsLoading(true);
        setError(null);

        const cryptoData = await getCryptoPrices();

        if (!cryptoData || Object.keys(cryptoData).length === 0) {
          throw new Error("Failed to load crypto prices.");
        }

        console.log("✅ Crypto prices received:", cryptoData);
        setCryptoTrends(Object.entries(cryptoData));
      } catch (err) {
        console.error("❌ Error fetching crypto prices:", err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCryptoData();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome,</Text>
        <Text style={styles.nameText}>{account?.name || "User"}!</Text>
        <Text style={styles.balanceText}>
          Balance: ${account?.balance ? account.balance.toFixed(2) : "0.00"}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.roundButton}
            onPress={() => navigation.navigate("Deposit")}
          >
            <Ionicons name="arrow-up" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Deposit</Text>
        </View>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.roundButton}
            onPress={() => navigation.navigate("Buy")}
          >
            <Ionicons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Buy</Text>
        </View>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.roundButton}
            onPress={() => navigation.navigate("Sell")}
          >
            <Ionicons name="remove" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Sell</Text>
        </View>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.roundButton}
            onPress={() => navigation.navigate("Withdrawal")}
          >
            <Ionicons name="arrow-down" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Withdraw</Text>
        </View>
      </View>

      <View style={styles.cryptoContainer}>
        <Text style={styles.sectionTitle}>Trending Cryptos</Text>
        <FlatList
          data={cryptoTrends}
          keyExtractor={(item) => item[0]}
          renderItem={({ item }) => (
            <View style={styles.cryptoRow}>
              <Image source={{ uri: item[1].icon }} style={styles.cryptoIcon} />
              <Text style={styles.cryptoName}>{item[0]}</Text>
              <Text style={styles.cryptoPrice}>${item[1].usd.toFixed(2)}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9fafe" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#64748b" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  errorText: { fontSize: 18, fontWeight: "bold", color: "red", marginBottom: 10 },
  header: { marginBottom: 20 },
  welcomeText: { fontSize: 20, color: "#64748b" },
  nameText: { fontSize: 28, fontWeight: "bold", color: "#1e293b" },
  balanceText: { fontSize: 16, fontWeight: "600", color: "#64748b", marginTop: 5 },
  actionButtons: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  actionContainer: { alignItems: "center", flex: 1 },
  roundButton: {
    backgroundColor: "#2563eb",
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  buttonLabel: { fontSize: 12, color: "#64748b", fontWeight: "600" },
  cryptoContainer: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#1e293b", marginBottom: 16 },
  cryptoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  cryptoIcon: { width: 40, height: 40, marginRight: 16 },
  cryptoName: { flex: 1, fontSize: 16, color: "#1e293b" },
  cryptoPrice: { fontSize: 16, fontWeight: "bold", color: "#2563eb" },
});
