import { db, auth } from "./firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  arrayUnion,
} from "firebase/firestore";

/**
 * Vrátí referenci na účet aktuálního uživatele podle UID.
 */
const getAccountRef = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in.");

  const accountRef = doc(db, "accounts", user.uid);
  const accountSnap = await getDoc(accountRef);

  if (!accountSnap.exists()) throw new Error("Account not found.");

  return accountRef;
};

/**
 * Vklad peněz na účet.
 */
export const deposit = async (amount) => {
  const accountRef = await getAccountRef();

  await updateDoc(accountRef, { balance: increment(amount) });

  const transaction = {
    id: `transaction-${Date.now()}`,
    type: "Deposit",
    amount,
    currency: "USD",
    createdAt: new Date().toISOString(),
  };

  await updateDoc(accountRef, { transactions: arrayUnion(transaction) });

  return (await getDoc(accountRef)).data();
};

/**
 * Výběr peněz z účtu.
 */
export const withdraw = async (amount) => {
  const accountRef = await getAccountRef();
  const accountData = (await getDoc(accountRef)).data();

  if (accountData.balance < amount) throw new Error("Insufficient balance.");

  await updateDoc(accountRef, { balance: increment(-amount) });

  const transaction = {
    id: `transaction-${Date.now()}`,
    type: "Withdrawal",
    amount,
    currency: "USD",
    createdAt: new Date().toISOString(),
  };

  await updateDoc(accountRef, { transactions: arrayUnion(transaction) });

  return (await getDoc(accountRef)).data();
};

/**
 * Nákup kryptoměny.
 */
export const buyCrypto = async (currency, amount, price) => {
  const accountRef = await getAccountRef();
  const accountData = (await getDoc(accountRef)).data();

  const totalCost = amount * price;
  if (accountData.balance < totalCost) throw new Error("Insufficient balance.");

  await updateDoc(accountRef, { balance: increment(-totalCost) });

  const updatedPortfolio = [...(accountData.portfolio || [])];
  const existingCrypto = updatedPortfolio.find((item) => item.currency === currency);

  if (existingCrypto) {
    existingCrypto.amount += amount;
  } else {
    updatedPortfolio.push({ currency, amount, price, totalValue: totalCost });
  }

  await updateDoc(accountRef, { portfolio: updatedPortfolio });

  const transaction = {
    id: `transaction-${Date.now()}`,
    type: "Buy",
    amount,
    currency,
    createdAt: new Date().toISOString(),
  };

  await updateDoc(accountRef, { transactions: arrayUnion(transaction) });

  return (await getDoc(accountRef)).data();
};

/**
 * Prodej kryptoměny.
 */
export const sellCrypto = async (currency, amount, price) => {
  const accountRef = await getAccountRef();
  const accountData = (await getDoc(accountRef)).data();

  const portfolio = accountData.portfolio || [];
  const crypto = portfolio.find((item) => item.currency === currency);

  if (!crypto || crypto.amount < amount) throw new Error(`Insufficient ${currency} balance.`);

  const updatedPortfolio = portfolio
    .map((item) =>
      item.currency === currency
        ? { ...item, amount: item.amount - amount }
        : item
    )
    .filter((item) => item.amount > 0);

  await updateDoc(accountRef, {
    portfolio: updatedPortfolio,
    balance: increment(amount * price),
    transactions: arrayUnion({
      id: `transaction-${Date.now()}`,
      type: "Sell",
      currency,
      amount,
      totalValue: amount * price,
      createdAt: new Date().toISOString(),
    }),
  });

  return (await getDoc(accountRef)).data();
};
