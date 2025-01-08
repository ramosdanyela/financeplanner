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
  const [period, setPeriod] = useState("1 year");

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
          new Date(new Date().setMonth(now.getMonth() - 3))
      );
    } else if (period === "6 months") {
      filtered = transactions.filter(
        (transaction) =>
          new Date(transaction.date) >=
          new Date(new Date().setMonth(now.getMonth() - 6))
      );
    } else if (period === "1 year") {
      filtered = transactions.filter(
        (transaction) =>
          new Date(transaction.date) >=
          new Date(new Date().setFullYear(now.getFullYear() - 1))
      );
    }
    //setter for bringing all the elements of filtered to filteredtransactions
    setFilteredTransactions(filtered);
  };

  // side effect with dependencies to call again/update the fetch always when period or transactions were changed;
  useEffect(() => {
    filterByPeriod(period);
  }, [period, transactions]);

  const monthMap = {
    jan: 0,
    fev: 1,
    mar: 2,
    abr: 3,
    mai: 4,
    jun: 5,
    jul: 6,
    ago: 7,
    set: 8,
    out: 9,
    nov: 10,
    dez: 11,
  };

  const formatDateManual = (date) => {
    const d = new Date(date);
    const months = [
      "jan",
      "fev",
      "mar",
      "abr",
      "mai",
      "jun",
      "jul",
      "ago",
      "set",
      "out",
      "nov",
      "dez",
    ];
    return `${months[d.getMonth()]}. ${d.getFullYear()}`;
  };

  const groupByMonth = (transac_macrotype) => {
    const grouped = {};
    filteredTransactions
      .filter(
        (transaction) => transaction.transac_macrotype === transac_macrotype
      )
      .forEach((transaction) => {
        const monthYear = formatDateManual(transaction.date);
        grouped[monthYear] = (grouped[monthYear] || 0) + transaction.value;
      });

    return grouped;
  };

  const labels = [
    ...new Set(
      filteredTransactions.map((transaction) =>
        formatDateManual(transaction.date)
      )
    ),
  ].sort((a, b) => {
    const [monthA, yearA] = a.split(". ");
    const [monthB, yearB] = b.split(". ");

    // Compare os anos primeiro
    if (yearA !== yearB) {
      return yearA - yearB;
    }

    // Se os anos forem iguais, compare os meses
    return monthMap[monthA] - monthMap[monthB];
  });

  // Calculate income data
  const incomeData = labels.map((label) => {
    const groupedIncome = groupByMonth("income");
    return groupedIncome[label] || 0;
  });
  // Calculate outcome data
  const outcomeData = labels.map((label) => {
    const groupedOutcome = groupByMonth("outcome");
    return groupedOutcome[label] || 0;
  });

  const lineData = {
    labels,
    datasets: [
      {
        label: "Income",
        data: incomeData,
        borderColor: "green",
        fill: false,
      },
      {
        label: "Outcome",
        data: outcomeData,
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
