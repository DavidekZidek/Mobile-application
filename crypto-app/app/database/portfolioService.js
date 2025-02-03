import { fetchAccount } from "./accountService";
import { getCryptoPrices } from "../api/cryptoAPI";

// Crypto colors
const cryptoColors = {
  bitcoin: "#F7931A",
  ethereum: "#627EEA",
  solana: "#00FFA3",
  tether: "#26A17B",
  ripple: "#23292F",
  dogecoin: "#C3A634",
  cardano: "#0033AD",
  binancecoin: "#F3BA2F",
  polkadot: "#E6007A",
  litecoin: "#345D9D",
  polygon: "#8247E5",
  avalanche: "#E84142",
  chainlink: "#2A5ADA",
  uniswap: "#FF007A",
  cosmos: "#2E3148",
  DEFAULT: "#CCCCCC",
};

export const fetchPortfolioData = async () => {
  try {
    const accountData = await fetchAccount();
    const cryptoPrices = await getCryptoPrices();

    if (!accountData || !accountData.portfolio) {
      throw new Error("Portfolio není dostupné.");
    }

    const portfolioWithValues = accountData.portfolio.map((item) => {
      // Normalize currency to match keys in cryptoColors
      const normalizedCurrency = item.currency.toLowerCase();
      const value = item.amount * (cryptoPrices[normalizedCurrency]?.usd || 0);

      return {
        ...item,
        currency: normalizedCurrency, // Ensure consistent formatting
        value,
        color: cryptoColors[normalizedCurrency] || cryptoColors.DEFAULT,
      };
    });

    const totalValue = portfolioWithValues.reduce((sum, item) => sum + item.value, 0);

    return {
      portfolio: portfolioWithValues,
      total: totalValue,
    };
  } catch (error) {
    console.error("Chyba při načítání portfolia:", error.message);
    throw error;
  }
};
