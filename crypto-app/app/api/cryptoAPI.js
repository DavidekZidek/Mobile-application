export const getCryptoPrices = async () => {
  const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd";

  const icons = {
    bitcoin: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    ethereum: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    solana: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
  };

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Přidání ikon ke kryptoměnám
    const enhancedData = Object.keys(data).reduce((acc, key) => {
      acc[key] = { ...data[key], icon: icons[key] };
      return acc;
    }, {});

    return enhancedData;
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    return null;
  }
};

export const getCryptoHistory = async (id) => {
  const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=30`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.prices.map((price) => price[1]); // Vrací pouze ceny
  } catch (error) {
    console.error("Chyba při načítání historických dat:", error);
    return [];
  }
};


