import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import { fetchAccount } from "../database/accountService";

export default function HomeScreen() {
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAccount = async () => {
      try {
        setIsLoading(true);
        const AccId = "AccId1"; // Zde vložte existující AccId z Firestore
        const accountData = await fetchAccount(AccId);
        setAccount(accountData);
      } catch (error) {
        console.error("Chyba při načítání účtu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAccount();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Načítání...</Text>
      </View>
    );
  }

  if (!account) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Účet nebyl nalezen.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Účet: {account.name || "Uživateli"}</Text>
      <Text>Email: {account.email}</Text>
      <Text>Zůstatek: {account.balance?.toFixed(2)} CZK</Text>

      <Text style={styles.sectionTitle}>Transakce:</Text>
      {account.transactions.length > 0 ? (
        <FlatList
          data={account.transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.transactionCard}>
              <Text>Typ: {item.type}</Text>
              <Text>Měna: {item.currency}</Text>
              <Text>Částka: {item.amount}</Text>
              <Text>Hodnota v CZK: {item.valueCZK}</Text>
              <Text>Datum: {new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          )}
        />
      ) : (
        <Text>Žádné transakce.</Text>
      )}

      <Text style={styles.sectionTitle}>Portfolio:</Text>
      {account.portfolio.length > 0 ? (
        <FlatList
          data={account.portfolio}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.portfolioCard}>
              <Text>Měna: {item.currency}</Text>
              <Text>Částka: {item.amount}</Text>
            </View>
          )}
        />
      ) : (
        <Text>Žádné portfolio.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  transactionCard: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  portfolioCard: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
