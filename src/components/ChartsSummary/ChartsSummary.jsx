import { Line, Bar } from "react-chartjs-2";
import { useState, useEffect } from "react";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function ChartsSummary({ transactions, setTransactions }) {
  const [filteredTransactions, setFilteredTransactions] =
    useState(transactions);
  const [period, setPeriod] = useState("3 months");

  const filterByPeriod = (period) => {
    const now = new Date();
    let filtered;

    if (period === "3 months") {
      filtered = transactions.filter(
        (transaction) => new Date(transaction.date) >= new Date(now.setMonth(now.getMonth() - 3))
      );
    } else if (period === "6 months") {
      filtered = transactions.filter(
        (transaction) => new Date(transaction.date) >= new Date(now.setMonth(now.getMonth() - 6))
      );
    } else if (period === "1year") {
      filtered = transactions.filter(
        (transaction) =>
          new Date(transaction.date) >= new Date(now.setFullYear(now.getFullYear() - 1))
      );
    }

    setFilteredTransactions(filtered);
  };

  useEffect(() => {
    filterByPeriod(period);
  }, [period, transactions]);

  const lineData = {
    labels: [
      ...new Set(
        filteredTransactions.map((transaction) => new Date(transaction.date).toLocaleString())
      ),
    ],
    datasets: [
      {
        label: "Income",
        data: filteredTransactions
          .filter((transaction) => transaction.type === "income")
          .map((transaction) => transaction.value),
        borderColor: "green",
        fill: false,
      },
      {
        label: "Outcome",
        data: filteredTransactions
          .filter((transaction => transaction.type === "outcome"))
          .map((transaction) => transaction.value),
        borderColor: "red",
        fill: false,
      },
    ],
  };

  const categoryData = {
    labels: [...new Set(filteredTransactions.map((transaction) => transaction.category))],
    datasets: [
      {
        label: "Category Totals",
        data: [...new Set(filteredTransactions.map((transaction) => transaction.category))].map(
          (category) =>
            filteredTransactions
              .filter((transaction) => transaction.category === category)
              .reduce((acc, transaction) => acc + transaction.value, 0)
        ),
        backgroundColor: "blue",
      },
    ],
  };

  return (
    <div className="flex flex-col rounded-md m-5 bg-white items-center text-gray-600">
      <div className="flex flex-row">
        <button onClick={() => setPeriod("3 months")}>3 months</button>
        <button onClick={() => setPeriod("6 months")}>6 months</button>
        <button onClick={() => setPeriod("1 year")}>1 year</button>
      </div>
      <div className="flex flex-row justify-between">
        <div className="w-[50%]">
          <Line data={lineData} />
        </div>
        <div className="w-[50%]">
          <Bar data={categoryData} />
        </div>
      </div>
    </div>
  );
}

export default ChartsSummary;
