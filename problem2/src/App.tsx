import { useEffect, useState } from "react";
import "./App.css";
import DataResponse from "./mock/get-currency.json";

const mockCallGetData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(DataResponse);
    }, 2000);
  });
};

type Currency = {
  currency: string;
  date: string;
  price: number;
};

function App() {
  const [data, setData] = useState<Record<string, Currency>>({});
  const [result, setResult] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState({
    fromCurrency: "",
    toCurrency: "",
  });

  const convertCurrency = (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ) => {
    const fromCurrencyPrice = data[fromCurrency].price;
    const toCurrencyPrice = data[toCurrency].price;

    return (amount * toCurrencyPrice) / fromCurrencyPrice;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(
      (document.getElementById("amount") as HTMLInputElement).value
    );
    const fromCurrency = (
      document.getElementById("fromCurrency") as HTMLSelectElement
    ).value;
    const toCurrency = (
      document.getElementById("toCurrency") as HTMLSelectElement
    ).value;

    const swapCurrency = convertCurrency(amount, fromCurrency, toCurrency);
    setResult(swapCurrency);
  };

  useEffect(() => {
    const mappingCurrencyData = (data: Currency[]) => {
      const currencyData: Record<string, Currency> = {};
      data.forEach((currency) => {
        currencyData[currency.currency] = currency;
      });
      return currencyData;
    };

    mockCallGetData().then((data) => {
      setData(mappingCurrencyData(data as Currency[]));
      setSelectedCurrency({
        fromCurrency: (data as Currency[])[0].currency,
        toCurrency: (data as Currency[])[0].currency,
      })
    });
  }, []);

  return (
    <div className="container-bg">
      <div className="container-card">
        <h1 className="container-card__title">Currency Swap</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input required type="number" id="amount" />
          </div>

          <div className="container-card__exchange">
            <div className="form-group">
              <label htmlFor="fromCurrency">From Currency</label>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div className="currency-icon">
                  <img
                    src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${selectedCurrency.fromCurrency}.svg`}
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null; // prevents looping
                      currentTarget.src="/src/assets/404.svg";
                    }}
                  />
                </div>
                <select onChange={(e) => {
                  setSelectedCurrency({
                    ...selectedCurrency,
                    fromCurrency: e.target.value,
                  });
                }} id="fromCurrency">
                  {Object.entries(data).map(([currencyName, currencyInfo]) => (
                    <option
                      key={`${currencyName}-${currencyInfo.price}`}
                      value={currencyName}
                    >
                      {currencyName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <img
              src="/src/assets/exchange.svg"
              alt="Exchange Icon"
              className="exchange-icon"
            />

            <div className="form-group">
              <label htmlFor="toCurrency">To Currency</label>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div className="currency-icon">
                  <img
                    src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${selectedCurrency.toCurrency}.svg`}
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null; // prevents looping
                      currentTarget.src="/src/assets/404.svg";
                    }}
                  />
                </div>
                <select onChange={(e) => {
                  setSelectedCurrency({
                    ...selectedCurrency,
                    toCurrency: e.target.value,
                  });
                }} id="toCurrency">
                  {Object.entries(data).map(([currencyName, currencyInfo]) => (
                    <option
                      key={`${currencyName}-${currencyInfo.price}`}
                      value={currencyName}
                    >
                      {currencyName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <p>1 {selectedCurrency.fromCurrency} = {data[selectedCurrency.fromCurrency]?.price} {selectedCurrency.toCurrency}</p>
          </div>

          <button className="btn-submit" type="submit">
            Swap
          </button>
        </form>
        <div className="result">{result}</div>
      </div>
    </div>
  );
}

export default App;
