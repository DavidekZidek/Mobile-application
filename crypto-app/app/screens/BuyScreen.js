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
import { buyCrypto } from "../database/transactionService";
import { fetchAccount } from "../database/accountService";
import { getCryptoPrices } from "../api/cryptoAPI";

export default function BuyScreen({ navigation }) {
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [amount, setAmount] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [balance, setBalance] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log("Fetching account data...");
        const accountData = await fetchAccount();
        console.log("Account data received:", accountData);

        if (!accountData || typeof accountData.balance !== "number") {
          console.error("Account data is missing or incorrect:", accountData);
          Alert.alert("Error", "Failed to load account data.");
          return;
        }
        setBalance(accountData.balance);

        console.log("Fetching crypto prices...");
        const prices = await getCryptoPrices();
        console.log("Crypto prices received:", prices);

        if (!prices || Object.keys(prices).length === 0) {
          console.error("Crypto prices are empty or undefined:", prices);
          Alert.alert("Error", "Failed to load crypto prices.");
          return;
        }
        setCryptoPrices(prices);

        const availableCryptos = Object.keys(prices);
        console.log("Available cryptocurrencies:", availableCryptos);

        if (availableCryptos.length > 0) {
          setSelectedCrypto(availableCryptos[0]);
        } else {
          console.error("No cryptocurrencies available.");
          Alert.alert("Error", "No cryptocurrencies available.");
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        Alert.alert("Error", "Failed to load data.");
      }
    };

    loadInitialData();
  }, []);

  const handleBuy = async () => {
    const amountValue = parseFloat(amount);
    const totalValue = parseFloat(totalPrice);

    console.log("Attempting purchase:", { selectedCrypto, amountValue, totalValue, balance });
    if (!selectedCrypto || isNaN(amountValue) || isNaN(totalValue) || totalValue <= 0) {
      Alert.alert("Error", "Please enter valid values.");
      return;
    }

    if (totalValue > balance) {
      Alert.alert("Error", "Insufficient funds for this purchase.");
      return;
    }

    try {
      console.log(`Buying ${amountValue} units of ${selectedCrypto} at ${cryptoPrices[selectedCrypto].usd} USD/unit`);
      const updatedAccount = await buyCrypto(selectedCrypto, amountValue, cryptoPrices[selectedCrypto].usd);
      console.log("Updated account after purchase:", updatedAccount);
      setBalance(updatedAccount.balance);
      Alert.alert("Success", `You have bought ${amountValue} units of ${selectedCrypto}.`);
    } catch (error) {
      console.error("Error buying crypto:", error.message);
      Alert.alert("Error", error.message);
    }
  };

  const updateValues = (value, type) => {
    if (!selectedCrypto || !cryptoPrices[selectedCrypto]) {
      console.error("No selected crypto or crypto prices missing.");
      return;
    }

    const pricePerUnit = cryptoPrices[selectedCrypto].usd;
    if (type === "amount") {
      const newAmount = parseFloat(value);
      if (isNaN(newAmount) || newAmount <= 0) {
        setAmount("");
        setTotalPrice("");
        return;
      }
      const newTotalPrice = newAmount * pricePerUnit;
      setAmount(newAmount.toString());
      setTotalPrice(newTotalPrice.toFixed(2));
      console.log("Updated values (amount):", { newAmount, newTotalPrice });
    } else if (type === "price") {
      const newTotalPrice = parseFloat(value);
      if (isNaN(newTotalPrice) || newTotalPrice <= 0) {
        setAmount("");
        setTotalPrice("");
        return;
      }
      const calculatedAmount = newTotalPrice / pricePerUnit;
      setTotalPrice(newTotalPrice.toString());
      setAmount(calculatedAmount.toFixed(6));
      console.log("Updated values (price):", { calculatedAmount, newTotalPrice });
    }
  };

  if (Object.keys(cryptoPrices).length === 0 || !selectedCrypto) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading cryptocurrencies...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Buy Cryptocurrency</Text>
        <Text style={styles.label}>Balance: {balance.toFixed(2)} USD</Text>

        <TouchableOpacity style={styles.selectButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.selectButtonText}>
            {selectedCrypto || "Select cryptocurrency"}
          </Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Cryptocurrency</Text>
              <FlatList
                data={Object.keys(cryptoPrices)}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedCrypto(item);
                      setModalVisible(false);
                    }}>
                    <Text style={styles.modalItemText}>
                      {item} - {cryptoPrices[item].usd.toFixed(2)} USD
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        <Text style={styles.label}>Amount:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          placeholderTextColor="#555"
          keyboardType="numeric"
          value={amount}
          onChangeText={(value) => updateValues(value, "amount")}
        />

        <Text style={styles.label}>Total Price (USD):</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter price"
          placeholderTextColor="#555"
          keyboardType="numeric"
          value={totalPrice}
          onChangeText={(value) => updateValues(value, "price")}
        />

        <TouchableOpacity style={styles.button} onPress={handleBuy}>
          <Text style={styles.buttonText}>Confirm Purchase</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9fafe" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#000" },
  label: { fontSize: 16, marginBottom: 10, color: "#000" },
  input: { 
    borderWidth: 1, 
    borderColor: "#d1d5db", 
    borderRadius: 8, 
    padding: 10, 
    marginBottom: 20, 
    color: "#000", 
    backgroundColor: "#fff", 
    fontSize: 16 
  },
  selectButton: { borderWidth: 1, borderColor: "#d1d5db", padding: 10, borderRadius: 8, marginBottom: 20, backgroundColor: "#fff" },
  selectButtonText: { textAlign: "center", color: "#000" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: "80%", backgroundColor: "#fff", padding: 20, borderRadius: 8 },
  modalItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#d1d5db" },
  modalItemText: { color: "#000" },
  button: { backgroundColor: "#2563eb", padding: 15, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});

