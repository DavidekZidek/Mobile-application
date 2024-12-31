import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableWithoutFeedback } from "react-native";
import Svg, { Path } from "react-native-svg";
import { fetchAccount } from "../database/accountService";

export default function MarketScreen() {
  const [portfolio, setPortfolio] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const cryptoColors = {
    BTC: "#f7931a",
    ETH: "#627eea",
    LTC: "#b8b8b8",
    ADA: "#0033ad",
    DOT: "#e6007a",
    XRP: "#346aa9",
    DOGE: "#c2a633",
    SOL: "#4e44ce", // Přidána Solana
  };

  const defaultColor = "#cccccc"; // Barva pro neznámé kryptoměny

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const accountData = await fetchAccount();
        if (accountData && accountData.portfolio) {
          const updatedPortfolio = await Promise.all(
            accountData.portfolio.map(async (item) => {
              const priceUSD = await fetchPriceFromAPI(item.currency);
              const priceCZK = priceUSD * await fetchExchangeRateUSDToCZK();
              return {
                ...item,
                price: priceCZK,
              };
            })
          );
          // Seřaďte portfolio od největšího po nejmenší
          const sortedPortfolio = updatedPortfolio.sort((a, b) => b.amount * b.price - a.amount * a.price);
          setPortfolio(sortedPortfolio);
        }
      } catch (error) {
        console.error("Chyba při načítání portfolia:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAccount();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Načítání portfolia...</Text>
      </View>
    );
  }

  if (portfolio.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Portfolio je prázdné.</Text>
      </View>
    );
  }

  const totalValue = portfolio.reduce((sum, item) => sum + item.amount * item.price, 0);

  const renderPieChart = () => {
    let cumulativePercentage = 0;

    return portfolio.map((item, index) => {
      const value = item.amount * item.price;
      const percentage = value / totalValue;
      const startAngle = cumulativePercentage * 2 * Math.PI;
      const endAngle = (cumulativePercentage + percentage) * 2 * Math.PI;
      cumulativePercentage += percentage;

      const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
      const x1 = 50 + 40 * Math.cos(startAngle);
      const y1 = 50 + 40 * Math.sin(startAngle);
      const x2 = 50 + 40 * Math.cos(endAngle);
      const y2 = 50 + 40 * Math.sin(endAngle);

      const pathData = `M50,50 L${x1.toFixed(2)},${y1.toFixed(2)} A40,40 0 ${largeArcFlag} 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z`;

      const color = cryptoColors[item.currency] || defaultColor;

      return (
        <TouchableWithoutFeedback
          key={index}
          onPressIn={() => setHoveredSlice(item)}
          onPressOut={() => setHoveredSlice(null)}
        >
          <Path d={pathData} fill={color} />
        </TouchableWithoutFeedback>
      );
    });
  };

  const renderBars = () => {
    return portfolio.map((item, index) => {
      const value = item.amount * item.price;
      const percentage = (value / totalValue) * 100;
      const color = cryptoColors[item.currency] || defaultColor;

      return (
        <View key={index} style={styles.barContainer}>
          <Text style={[styles.cryptoText, { color }]}>{item.currency}</Text>
          <View style={styles.barBackground}>
            <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
          </View>
          <Text style={styles.cryptoText}>{percentage.toFixed(2)}% ({value.toFixed(2)} CZK)</Text>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Portfolio</Text>

      <Svg height="250" width="250" viewBox="0 0 100 100">
        {renderPieChart()}
      </Svg>

      {hoveredSlice && (
        <View style={styles.hoveredInfo}>
          <Text style={styles.hoveredText}>
            {hoveredSlice.currency}: {((hoveredSlice.amount * hoveredSlice.price / totalValue) * 100).toFixed(2)}%
          </Text>
        </View>
      )}

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>Celková hodnota: {totalValue.toFixed(2)} CZK</Text>
      </View>

      {renderBars()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  hoveredInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
    alignItems: "center",
  },
  hoveredText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  summaryContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#e2e8f0",
    borderRadius: 10,
    alignItems: "center",
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    width: "100%",
  },
  barBackground: {
    flex: 1,
    height: 10,
    backgroundColor: "#e2e8f0",
    borderRadius: 5,
    marginHorizontal: 10,
  },
  barFill: {
    height: "100%",
    borderRadius: 5,
  },
  cryptoText: {
    fontSize: 14,
  },
});

async function fetchPriceFromAPI(currency) {
  const currencyMapping = {
    BTC: "bitcoin",
    ETH: "ethereum",
    LTC: "litecoin",
    ADA: "cardano",
    DOT: "polkadot",
    XRP: "ripple",
    DOGE: "dogecoin",
    SOL: "solana",
  };

  const apiCurrency = currencyMapping[currency] || currency.toLowerCase();

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${apiCurrency}&vs_currencies=usd`
    );
    const data = await response.json();
    return data[apiCurrency]?.usd || 0;
  } catch (error) {
    console.error(`Chyba při načítání ceny pro ${currency}:`, error);
    return 0;
  }
}

async function fetchExchangeRateUSDToCZK() {
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=czk");
    const data = await response.json();
    return data.usd?.czk || 1;
  } catch (error) {
    console.error("Chyba při načítání směnného kurzu USD na CZK:", error);
    return 1;
  }
}
