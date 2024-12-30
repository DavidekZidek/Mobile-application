import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Image } from "react-native";
import { fetchAccount } from "../database/accountService";
import { fetchTransactions } from "../database/transactionService";
import { getCryptoPrices } from "../api/cryptoAPI";

export default function HomeScreen() {
  const [account, setAccount] = useState(null);
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [accountData, cryptoData, transactionsData] = await Promise.all([
          fetchAccount(),
          getCryptoPrices(),
          fetchTransactions(),
        ]);
        setAccount(accountData);
        setCryptoPrices(cryptoData);
        setTransactions(transactionsData);
      } catch (error) {
        console.error("Chyba při načítání dat:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Načítání...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Dobrý den,</Text>
          <Text style={styles.nameText}>{account?.name || "Uživateli"}!</Text>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Váš zůstatek</Text>
            <Text style={styles.balanceAmount}>
              ${account?.balance?.toFixed(2) || "0.00"}
            </Text>
          </View>

          <View style={styles.cryptoContainer}>
            <Text style={styles.sectionTitle}>Kryptoměny</Text>
            <View style={styles.cryptoGrid}>
              {Object.entries(cryptoPrices || {}).map(([id, data]) => (
                <View key={id} style={styles.cryptoCard}>
                  <Image source={{ uri: data.icon }} style={styles.cryptoIcon} />
                  <Text style={styles.cryptoName}>
                    {id.charAt(0).toUpperCase() + id.slice(1)}
                  </Text>
                  <Text style={styles.cryptoPrice}>
                    ${data.usd?.toFixed(2) || "0.00"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.transactionCard}>
          <Text style={styles.transactionType}>
            {item.type.toUpperCase()}
          </Text>
          <Text style={styles.transactionAmount}>
            {item.amount} {item.currency}
          </Text>
          <Text style={styles.transactionDate}>
            {item.date ? new Date(item.date).toLocaleDateString() : "Neplatné datum"}
          </Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.noTransactions}>Žádné transakce k dispozici.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    color: "#64748b",
  },
  nameText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 4,
  },
  balanceCard: {
    backgroundColor: "#2563eb",
    padding: 20,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#2563eb",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: "#e0e7ff",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
  },
  cryptoContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  cryptoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cryptoCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    width: "48%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: "center",
  },
  cryptoIcon: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  cryptoName: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 4,
  },
  cryptoPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  transactionCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  transactionType: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  transactionAmount: {
    fontSize: 16,
    color: "#64748b",
  },
  transactionDate: {
    fontSize: 14,
    color: "#94a3b8",
  },
  noTransactions: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },
});
