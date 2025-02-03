import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  FlatList,
} from "react-native";
import { sellCrypto } from "../database/transactionService";
import { fetchAccount } from "../database/accountService";

export default function SellScreen({ navigation }) {
  const [portfolio, setPortfolio] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [amount, setAmount] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const accountData = await fetchAccount();
        if (accountData && accountData.portfolio) {
          const aggregatedPortfolio = accountData.portfolio.reduce((acc, item) => {
            const existingCrypto = acc.find((crypto) => crypto.currency === item.currency);
            if (existingCrypto) {
              existingCrypto.amount += item.amount;
            } else {
              acc.push({ ...item });
            }
            return acc;
          }, []);

          setPortfolio(aggregatedPortfolio);

          if (aggregatedPortfolio.length > 0) {
            setSelectedCrypto(aggregatedPortfolio[0]);
          }
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load portfolio.");
      }
    };

    loadPortfolio();
  }, []);

  const handleSell = async () => {
    const amountValue = parseFloat(amount);
    const totalValue = parseFloat(totalPrice);

    if (!selectedCrypto || isNaN(amountValue) || isNaN(totalValue) || amountValue <= 0 || totalValue <= 0) {
      Alert.alert("Error", "Enter a valid amount and price.");
      return;
    }

    if (amountValue > selectedCrypto.amount) {
      Alert.alert("Error", `You cannot sell more than you own (${selectedCrypto.amount} units).`);
      return;
    }

    try {
      const updatedAccount = await sellCrypto(selectedCrypto.currency, amountValue, totalValue / amountValue);
      setPortfolio(updatedAccount.portfolio);
      Alert.alert("Success", `You sold ${amountValue} units of ${selectedCrypto.currency}.`);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const updateValues = (value, type) => {
    if (!selectedCrypto) return;

    const pricePerUnit = selectedCrypto.price;

    if (type === "amount") {
      const newAmount = parseFloat(value);
      if (isNaN(newAmount) || newAmount <= 0) {
        setAmount("");
        setTotalPrice("");
        return;
      }
      setAmount(newAmount.toString());
      setTotalPrice((newAmount * pricePerUnit).toFixed(2));
    } else if (type === "price") {
      const newTotalPrice = parseFloat(value);
      if (isNaN(newTotalPrice) || newTotalPrice <= 0) {
        setAmount("");
        setTotalPrice("");
        return;
      }
      setTotalPrice(newTotalPrice.toString());
      setAmount((newTotalPrice / pricePerUnit).toFixed(6));
    }
  };

  if (portfolio.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No cryptocurrencies available for sale.</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Sell Cryptocurrency</Text>

        <TouchableOpacity style={styles.selectButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.selectButtonText}>
            {selectedCrypto ? `${selectedCrypto.currency} - ${selectedCrypto.amount.toFixed(6)} units` : "Select cryptocurrency"}
          </Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Cryptocurrency</Text>
              <FlatList
                data={portfolio}
                keyExtractor={(item) => item.currency}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.modalItem} 
                    onPress={() => {
                      setSelectedCrypto(item);
                      setModalVisible(false);
                    }}>
                    <Text style={styles.modalItemText}>
                      {item.currency} - {item.amount.toFixed(6)} units
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        <Text style={styles.label}>Amount to sell:</Text>
        <TextInput
          style={styles.input}
          placeholder={`Max: ${selectedCrypto?.amount.toFixed(6) || 0}`}
          keyboardType="numeric"
          value={amount}
          onChangeText={(value) => updateValues(value, "amount")}
        />

        <Text style={styles.label}>Total price (USD):</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter price"
          keyboardType="numeric"
          value={totalPrice}
          onChangeText={(value) => updateValues(value, "price")}
        />

        <TouchableOpacity style={styles.button} onPress={handleSell}>
          <Text style={styles.buttonText}>Confirm Sale</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9fafe" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#000" },
  label: { fontSize: 16, marginBottom: 10, color: "#000" },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 10, marginBottom: 20, color: "#000", backgroundColor: "#fff" },
  selectButton: { borderWidth: 1, borderColor: "#d1d5db", padding: 10, borderRadius: 8, marginBottom: 20, backgroundColor: "#fff" },
  selectButtonText: { textAlign: "center", color: "#000" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: "80%", backgroundColor: "#fff", padding: 20, borderRadius: 8 },
  modalItemText: { color: "#000" },
  button: { backgroundColor: "#ef4444", padding: 15, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});
