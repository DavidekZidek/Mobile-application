import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { listenToAccountChanges } from "../database/accountService";

export default function TransactionScreen() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // ✅ Automatická aktualizace transakcí v reálném čase
    const unsubscribe = listenToAccountChanges((updatedAccount) => {
      if (updatedAccount && updatedAccount.transactions) {
        setTransactions([...updatedAccount.transactions].reverse()); // ✅ Nejnovější transakce první
      }
    });

    return () => unsubscribe(); // ✅ Odpojíme posluchač při odchodu ze screenu
  }, []);

  const getTransactionIcon = (type) => {
    switch (type) {
      case "Deposit":
        return <Ionicons name="arrow-up" size={24} color="green" />;
      case "Withdrawal":
        return <Ionicons name="arrow-down" size={24} color="red" />;
      case "Buy":
        return <Ionicons name="add" size={24} color="green" />;
      case "Sell":
        return <Ionicons name="remove" size={24} color="red" />;
      default:
        return <Ionicons name="help-circle-outline" size={24} color="gray" />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Transaction History</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.transactionRow}>
            {getTransactionIcon(item.type)}
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionType}>{item.type}</Text>
              <Text style={styles.transactionDate}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                item.type === "Sell" || item.type === "Withdrawal"
                  ? styles.negativeAmount
                  : styles.positiveAmount,
              ]}
            >
              {item.type === "Sell" || item.type === "Withdrawal" ? "-" : "+"}{" "}
              {item.amount} {item.currency || "CZK"}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No transactions to display.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9fafe" },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  transactionInfo: { flex: 1, marginLeft: 12 },
  transactionType: { fontSize: 16, fontWeight: "bold", color: "#1e293b" },
  transactionDate: { fontSize: 12, color: "#64748b" },
  transactionAmount: { fontSize: 16, fontWeight: "bold" },
  positiveAmount: { color: "green" },
  negativeAmount: { color: "red" },
  emptyText: { textAlign: "center", color: "#64748b", marginTop: 20, fontSize: 16 },
});