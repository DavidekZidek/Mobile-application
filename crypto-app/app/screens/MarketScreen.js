import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { fetchPortfolioData } from "../database/portfolioService";

const screenWidth = Dimensions.get("window").width;

export default function PortfolioScreen() {
  const [portfolio, setPortfolio] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const portfolioData = await fetchPortfolioData();

        if (!portfolioData || !Array.isArray(portfolioData.portfolio)) {
          console.warn("Portfolio is empty or failed to load. Using empty data.");
          setPortfolio([]);
          setTotalValue(0);
        } else {
          const combinedPortfolio = portfolioData.portfolio.reduce((acc, item) => {
            const existing = acc.find((i) => i.currency === item.currency);
            if (existing) {
              existing.amount += item.amount;
              existing.value += item.value;
            } else {
              acc.push({
                ...item,
                value: item.value,
              });
            }
            return acc;
          }, []);

          combinedPortfolio.sort((a, b) => b.value - a.value);
          setPortfolio(combinedPortfolio);
          setTotalValue(combinedPortfolio.reduce((sum, item) => sum + item.value, 0));
        }
      } catch (error) {
        setError(error.message || "Failed to load portfolio data.");
        console.error("Portfolio loading error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolioData();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading portfolio...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const chartData = portfolio.map((item) => ({
    name: item.currency,
    population: parseFloat(item.value.toFixed(2)),
    color: item.color,
    legendFontColor: "#7F7F7F",
    legendFontSize: 15,
  }));

  const renderPortfolioItem = ({ item }) => (
    <View style={styles.row}>
      <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
      <View style={styles.rowTextContainer}>
        <Text style={styles.currencyText}>{item.currency}</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.amountText}>{item.amount.toFixed(4)}</Text>
          <Text style={styles.valueText}>{item.value.toFixed(2)} USD</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crypto Portfolio</Text>
      <Text style={styles.totalValueText}>
        Total Value: {totalValue.toFixed(2)} USD
      </Text>

      <PieChart
        data={chartData}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          decimalPlaces: 2,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />

      <FlatList
        data={portfolio}
        keyExtractor={(item, index) => `${item.currency}-${index}`}
        renderItem={renderPortfolioItem}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.infoText}>Portfolio is empty.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9fafe" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  totalValueText: { fontSize: 18, fontWeight: "600", textAlign: "center", marginBottom: 20, color: "#333" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
  errorText: { fontSize: 16, color: "#ff0000", textAlign: "center" },
  infoText: { fontSize: 16, color: "#333", textAlign: "center" },
  list: { marginTop: 20 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  colorIndicator: { width: 20, height: 20, borderRadius: 10, marginRight: 10 },
  rowTextContainer: { flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  currencyText: { fontSize: 16, fontWeight: "600", color: "#333" },
  valueContainer: { alignItems: "flex-end" },
  amountText: { fontSize: 14, color: "#999" },
  valueText: { fontSize: 16, fontWeight: "600", color: "#333" },
});
