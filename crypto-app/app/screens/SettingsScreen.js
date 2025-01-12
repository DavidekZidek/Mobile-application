import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { LineChart } from "react-native-chart-kit";

export default function SimulatedPortfolioScreen() {
  const [portfolioData, setPortfolioData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const simulateData = async () => {
      try {
        setIsLoading(true);

        // Simulovaná data o transakcích
        const transactions = [
          { createdAt: "2024-01-01", type: "buy", cryptoSymbol: "ETH", amount: 0.3 },
          { createdAt: "2024-01-01", type: "buy", cryptoSymbol: "SOL", amount: 0.5 },
          { createdAt: "2024-06-07", type: "buy", cryptoSymbol: "BTC", amount: 0.007 },
          { createdAt: "2024-12-20", type: "buy", cryptoSymbol: "SOL", amount: 5 },
        ];

        // Generování simulovaných historických cen s volatilitou
        const historicalPrices = generateVolatilePrices(["ETH", "SOL", "BTC"]);

        const processedData = processPortfolioValue(transactions, historicalPrices);
        setPortfolioData(processedData);
      } catch (error) {
        console.error("Chyba při simulaci dat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    simulateData();
  }, []);

  const generateVolatilePrices = (cryptoSymbols) => {
    const historicalPrices = {};
    const startDate = new Date("2024-01-01");
    const endDate = new Date("2024-12-31");

    cryptoSymbols.forEach((symbol) => {
      let currentPrice = 1000 + Math.random() * 50000; // Počáteční cena

      historicalPrices[symbol] = {};

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const date = d.toISOString().split("T")[0];
        const dailyChange = Math.random() * 0.1 - 0.05; // Denní změna: -5% až +5%
        currentPrice = currentPrice * (1 + dailyChange);
        historicalPrices[symbol][date] = Math.max(currentPrice, 0); // Cena musí být kladná
      }
    });

    return historicalPrices;
  };

  const processPortfolioValue = (transactions, historicalPrices) => {
    let portfolioValue = 0;
    let portfolioTimeline = [];

    transactions
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // Seřazení transakcí podle času
      .forEach((transaction) => {
        const transactionDate = new Date(transaction.createdAt).toISOString().split("T")[0];
        const cryptoPriceOnDate = historicalPrices[transaction.cryptoSymbol]?.[transactionDate];

        if (cryptoPriceOnDate) {
          if (transaction.type === "buy") {
            portfolioValue += transaction.amount * cryptoPriceOnDate; // Přičíst hodnotu koupeného krypta
          } else if (transaction.type === "sell") {
            portfolioValue -= transaction.amount * cryptoPriceOnDate; // Odečíst hodnotu prodaného krypta
          }
        }

        // Uložit hodnotu portfolia do timeline
        portfolioTimeline.push({
          date: transactionDate,
          value: portfolioValue,
        });
      });

    // Přidání volatility do každodenní hodnoty portfolia
    Object.keys(historicalPrices["ETH"]).forEach((date) => {
      const dailyValue = transactions.reduce((total, transaction) => {
        if (new Date(transaction.createdAt).toISOString().split("T")[0] <= date) {
          const cryptoPrice = historicalPrices[transaction.cryptoSymbol]?.[date];
          return total + transaction.amount * cryptoPrice;
        }
        return total;
      }, 0);

      portfolioTimeline.push({
        date,
        value: dailyValue,
      });
    });

    // Seřazení výsledného timeline podle dat
    return portfolioTimeline
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .filter((entry, index, self) => self.findIndex((e) => e.date === entry.date) === index); // Odstranit duplicity
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Načítání...</Text>
      </View>
    );
  }

  // Najít minimální a maximální hodnoty
  const minValue = Math.min(...portfolioData.map((entry) => entry.value));
  const maxValue = Math.max(...portfolioData.map((entry) => entry.value));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Portfolio balance</Text>
      {portfolioData.length > 0 ? (
        <View>
          <Text style={styles.valueText}>CZK {minValue.toFixed(2)}</Text>
          <LineChart
            data={{
              labels: [], // Odstranění dolních popisků
              datasets: [
                {
                  data: portfolioData.map((entry) => entry.value),
                  color: () => "#2563eb", // Modrá čára
                  strokeWidth: 2,
                },
              ],
            }}
            width={Dimensions.get("window").width - 40}
            height={250}
            yAxisLabel=""
            yAxisSuffix=" CZK"
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 2,
              color: () => "#2563eb",
              labelColor: () => "#000000",
              style: {
                borderRadius: 16,
              },
              propsForBackgroundLines: {
                stroke: "#e3e3e3",
                strokeDasharray: "5 5",
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
          <Text style={styles.valueTextRight}>CZK {maxValue.toFixed(2)}</Text>
        </View>
      ) : (
        <Text>Žádná data k zobrazení.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#2563eb",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  valueText: {
    fontSize: 14,
    color: "#2563eb",
    position: "absolute",
    top: 220,
    left: 0,
  },
  valueTextRight: {
    fontSize: 14,
    color: "#2563eb",
    position: "absolute",
    top: 220,
    right: 0,
  },
});
