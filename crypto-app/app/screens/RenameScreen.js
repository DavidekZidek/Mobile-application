// RenameScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { updateAccountName } from "../database/nameService";

export default function RenameScreen({ navigation }) {
  const [newName, setNewName] = useState("");

  const handleRename = async () => {
    if (!newName.trim()) {
      Alert.alert("Error", "Please enter a new name.");
      return;
    }

    try {
      await updateAccountName(newName);
      Alert.alert("Success", "Your name has been successfully updated!");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Name</Text>
      <TextInput
        style={styles.input}
        placeholder="New name"
        value={newName}
        onChangeText={setNewName}
      />
      <TouchableOpacity style={styles.button} onPress={handleRename}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f9fafe",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1e293b",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#ffffff",
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
