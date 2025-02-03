import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import BottomTabNavigator from "./BottomTabNavigator"; // Spodní menu
import RenameScreen from "../screens/RenameScreen"; // Obrazovky nastavení
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import DeleteScreen from "../screens/DeleteScreen";
import DepositScreen from "../screens/DepositScreen"; // Obrazovky pro akce
import WithdrawalScreen from "../screens/WithdrawalScreen";
import BuyScreen from "../screens/BuyScreen";
import SellScreen from "../screens/SellScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Přihlašovací obrazovka */}
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* Registrační obrazovka */}
      <Stack.Screen name="Register" component={RegisterScreen} />

      {/* Hlavní navigátor se spodním menu */}
      <Stack.Screen name="Main" component={BottomTabNavigator} />

      {/* Obrazovky nastavení */}
      <Stack.Screen name="Rename" component={RenameScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteScreen} />

      {/* Akční obrazovky */}
      <Stack.Screen name="Deposit" component={DepositScreen} />
      <Stack.Screen name="Withdrawal" component={WithdrawalScreen} />
      <Stack.Screen name="Buy" component={BuyScreen} />
      <Stack.Screen name="Sell" component={SellScreen} />
    </Stack.Navigator>
  );
}
