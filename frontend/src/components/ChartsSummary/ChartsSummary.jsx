import { useState, useEffect, useMemo } from "react";
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
  Filler,
} from "chart.js";

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function getDefaultMonthRange() {
  const now = new Date();
  const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
  const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const start = `${startDate.getFullYear()}-${String(
    startDate.getMonth() + 1
  ).padStart(2, "0")}`;
  return { start, end };
}

function filterByDateRange(transactions, startMonthYear, endMonthYear) {
  if (!transactions?.length || !startMonthYear || !endMonthYear)
    return transactions || [];
  const [startYear, startMonth] = startMonthYear.split("-").map(Number);
  const [endYear, endMonth] = endMonthYear.split("-").map(Number);
  return transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const afterStart = y > startYear || (y === startYear && m >= startMonth);
    const beforeEnd = y < endYear || (y === endYear && m <= endMonth);
    return afterStart && beforeEnd;
  });
}

function ChartsSummary({ transactions: rawTransactions }) {
  const transactions = rawTransactions ?? [];
  const { start: defaultStart, end: defaultEnd } = getDefaultMonthRange();
  const [startMonthYear, setStartMonthYear] = useState(defaultStart);
  const [endMonthYear, setEndMonthYear] = useState(defaultEnd);
  const [presetLabel, setPresetLabel] = useState("1 year");

  const filteredTransactions = useMemo(
    () => filterByDateRange(transactions, startMonthYear, endMonthYear),
    [transactions, startMonthYear, endMonthYear]
  );

  const setPresetRange = (monthsBack, label) => {
    const now = new Date();
    const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - monthsBack,
      1
    );
    const start = `${startDate.getFullYear()}-${String(
      startDate.getMonth() + 1
    ).padStart(2, "0")}`;
    setStartMonthYear(start);
    setEndMonthYear(end);
    setPresetLabel(label);
  };

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
    (filteredTransactions || [])
      .filter(
        (transaction) => transaction.transac_macrotype === transac_macrotype
      )
      .forEach((transaction) => {
        const monthYear = formatDateManual(transaction.date);
        const amount =
          transac_macrotype === "outcome"
            ? Math.abs(transaction.value)
            : transaction.value;
        grouped[monthYear] = (grouped[monthYear] || 0) + amount;
      });
    return grouped;
  };

  const labels = [
    ...new Set(
      (filteredTransactions || []).map((transaction) =>
        formatDateManual(transaction.date)
      )
    ),
  ].sort((a, b) => {
    const [monthA, yearA] = a.split(". ");
    const [monthB, yearB] = b.split(". ");
    if (yearA !== yearB) return yearA - yearB;
    return (monthMap[monthA] ?? 0) - (monthMap[monthB] ?? 0);
  });

  const incomeData = labels.map((label) => groupByMonth("income")[label] || 0);
  const outcomeData = labels.map(
    (label) => groupByMonth("outcome")[label] || 0
  );

  const lineData = {
    labels,
    datasets: [
      {
        label: "Income",
        data: incomeData,
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Outcome",
        data: outcomeData,
        borderColor: "#FF5252",
        backgroundColor: "rgba(255, 82, 82, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const categoryDataArray = [
    ...new Set(
      (filteredTransactions || [])
        .filter((t) => t.transac_macrotype === "outcome")
        .map((transaction) => transaction.category?.name)
    ),
  ]
    .filter(Boolean)
    .map((categoryName) => {
      const total = (filteredTransactions || [])
        .filter(
          (t) =>
            t.transac_macrotype === "outcome" &&
            t.category?.name === categoryName
        )
        .reduce((acc, t) => acc + Math.abs(t.value), 0);
      return { categoryName, total };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const categoryLabels = categoryDataArray.map((item) => item.categoryName);
  const categoryTotals = categoryDataArray.map((item) => item.total);

  const barColors = [
    "#FF4D4D",
    "#FF9800",
    "#E9C46A",
    "#4CAF50",
    "#3498DB",
    "#BB86FC",
    "#2980B9",
    "#E76F51",
  ];

  const categoryData = {
    labels: categoryLabels,
    datasets: [
      {
        label: "By Category",
        data: categoryTotals,
        backgroundColor: barColors.slice(0, categoryLabels.length),
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#E0E0E0",
          font: { size: 12 },
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "#A0A0A0", font: { size: 11 } },
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "#A0A0A0", font: { size: 11 } },
      },
    },
  };

  const periodPresets = [
    { monthsBack: 2, label: "3 months" },
    { monthsBack: 5, label: "6 months" },
    { monthsBack: 11, label: "1 year" },
  ];

  return (
    <div className="card">
      {/* Period selector: from / to + presets */}
      <div className="flex flex-wrap items-center gap-lg mb-xl">
        <div className="flex items-center gap-sm">
          <label className="text-body text-text-secondary">From:</label>
          <input
            type="month"
            value={startMonthYear}
            onChange={(e) => {
              setStartMonthYear(e.target.value);
              setPresetLabel("");
            }}
            className="input"
          />
        </div>
        <div className="flex items-center gap-sm">
          <label className="text-body text-text-secondary">To:</label>
          <input
            type="month"
            value={endMonthYear}
            onChange={(e) => {
              setEndMonthYear(e.target.value);
              setPresetLabel("");
            }}
            className="input"
          />
        </div>
        <div className="flex gap-sm">
          {periodPresets.map(({ monthsBack, label }) => (
            <button
              key={label}
              onClick={() => setPresetRange(monthsBack, label)}
              className={`px-md py-xs rounded-full text-small transition-colors ${
                presetLabel === label
                  ? "bg-accent-purple text-white"
                  : "bg-bg-nav-active text-text-secondary hover:text-text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
        {/* Line chart */}
        <div className="bg-bg-main rounded-button p-lg">
          <h3 className="text-h2 text-text-primary mb-lg">Income vs Outcome</h3>
          <div className="h-64 flex items-center justify-center">
            {labels.length === 0 ? (
              <p className="text-body text-text-secondary">
                No data in this period
              </p>
            ) : (
              <Line data={lineData} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Bar chart */}
        <div className="bg-bg-main rounded-button p-lg">
          <h3 className="text-h2 text-text-primary mb-lg">
            Spending by Category
          </h3>
          <div className="h-64 flex items-center justify-center">
            {categoryLabels.length === 0 ? (
              <p className="text-body text-text-secondary">
                No data in this period
              </p>
            ) : (
              <Bar data={categoryData} options={chartOptions} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChartsSummary;
