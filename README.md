# Krypto Aplikace

Tato aplikace umožňuje uživatelům sledovat trh s kryptoměnami, nakupovat, prodávat a spravovat své portfolio.

## Funkce

* Zobrazení kryptoměn – aktuální tržní ceny
* Správa portfolia – přidání, prodej a nákup kryptoměn
* Historie transakcí – přehled všech operací
* Nastavení účtu – změna hesla, jména a smazání účtu

## Instalace

1. Naklonuj si repozitář:
```bash
git clone https://github.com/DavidekZidek/Mobile-application.git
```

2. Nainstaluj závislosti:
```bash
npm install -g expo-cli
```

3. Spusť aplikaci:
```bash
npx expo start
```

## Technologie

* React Native – vývoj mobilní aplikace
* Firebase – autentizace, Firestore databáze
* Expo – usnadnění vývoje

## Struktura projektu

```
📂 app
 ┣ 📂 api        # API volání pro krypto data
 ┣ 📂 database   # Firebase služby (fetchAccount, buyCrypto, deleteAccount, ...)
 ┣ 📂 navigation # Navigace mezi obrazovkami
 ┣ 📂 screens    # Obrazovky aplikace (Home, Market, Transactions, Settings)
 ┣ 📄 index.js   # Hlavní vstupní soubor aplikace
 ┗ 📄 README.md  # Dokumentace projektu
```