//1nd - import methods from react

import { useState, useEffect } from "react";

//1st  - import components for the charts

//DUVIDA 1: preciso importar o line, bar e depois os comp um a um como abaixo?

import { Line, Bar } from "react-chartjs-2";
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

//register  of graphs components
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

//3rd declare function
//use parameters transactions and setTransactions from app/homepage
function ChartsSummary({ transactions }) {
  //create state and setter for filtered transactions
  //the initial value is the list transactions
  const [filteredTransactions, setFilteredTransactions] =
    useState(transactions);

  //create state and setter for period
  //the initial value is 3 months
  const [period, setPeriod] = useState("3 months");

  //create function to filter period using conditional and the period setter

  const filterByPeriod = (period) => {
    //defining current time with new Date method (corresponds to the current day)
    const now = new Date();

    //declare the var filtered
    let filtered;

    //conditional
    if (period === "3 months") {
      //method of filtering transactions by date using new date = 1] being today and 2] being now - 3 months
      filtered = transactions.filter(
        (transaction) =>
          new Date(transaction.date) >=
          new Date(now.setMonth(now.getMonth() - 3))
      );
    } else if (period === "6 months") {
      filtered = transactions.filter(
        (transaction) =>
          new Date(transaction.date) >=
          new Date(now.setMonth(now.getMonth() - 6))
      );
    } else if (period === "1 year") {
      filtered = transactions.filter(
        (transaction) =>
          new Date(transaction.date) >=
          new Date(now.setFullYear(now.getFullYear() - 1))
      );
    }
    //setter for bringing all the elements of filtered to filteredtransactions
    setFilteredTransactions(filtered);
  };

  // side effect with dependencies to call again/update the fetch always when period or transactions were changed;
  useEffect(() => {
    filterByPeriod(period);
  }, [period, transactions]);

  //composing the graphs - line data:
  const lineData = {
    labels: [
      ...new Set(
        filteredTransactions.map((transaction) =>
          new Date(transaction.date).toLocaleString("pt-BR", {
            month: "short",
            year: "numeric",
          })
        )
      ),
    ],
    datasets: [
      {
        label: "Income",
        data: filteredTransactions
          .filter((transaction) => transaction.type === "income")
          .reduce((acc, curr) => {
            const dateKey = new Date[curr.date].toLocaleString("pt-BR", {
              month: "short",
              year: "numeric",
            });
            acc[dateKey] = (acc[dateKey] || 0) + curr.value;
            return acc;
          }, {}),
        borderColor: "green",
        fill: false,
      },
      {
        label: "Outcome",
        data: filteredTransactions
          .filter((transaction) => transaction.type === "income")
          .reduce((acc, curr) => {
            const dateKey = new Date[curr.date].toLocaleString("pt-BR", {
              month: "short",
              year: "numeric",
            });
            acc[dateKey] = (acc[dateKey] || 0) + curr.value;
            return acc;
          }, {}),
        borderColor: "red",
        fill: false,
      },
    ],
  };

  const categoryData = {
    labels: [
      ...new Set(
        filteredTransactions.map((transaction) => transaction.category)
      ),
    ],
    datasets: [
      {
        label: "Category Totals",
        data: [
          ...new Set(
            filteredTransactions.map((transaction) => transaction.category)
          ),
        ].map((category) =>
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
        <div className="w-[50%] h-full">
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
