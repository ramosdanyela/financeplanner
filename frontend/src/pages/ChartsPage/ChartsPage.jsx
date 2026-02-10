import { useState, useEffect, useContext } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { AuthContext } from "../../contexts/authContext";
import { api } from "../../api/api";

Chart.register(
  CategoryScale,
  LinearScale,
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

function ChartsPage() {
  const { loggedInUser } = useContext(AuthContext);
  const { start: defaultStart, end: defaultEnd } = getDefaultMonthRange();
  const [transactions, setTransactions] = useState([]);
  const [startMonthYear, setStartMonthYear] = useState(defaultStart);
  const [endMonthYear, setEndMonthYear] = useState(defaultEnd);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categorySortBy, setCategorySortBy] = useState("value"); // 'name' | 'value'
  const [categorySortDir, setCategorySortDir] = useState("desc"); // 'asc' | 'desc'
  const [subcategorySortBy, setSubcategorySortBy] = useState("value");
  const [subcategorySortDir, setSubcategorySortDir] = useState("desc");

  const now = new Date();

  // Only outcome (expenses) for spending charts and rankings
  const spendingTransactions = filteredTransactions.filter(
    (t) => t.transac_macrotype === "outcome"
  );

  const setPresetRange = (monthsBack) => {
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
  };

  useEffect(() => {
    async function fetchTransactions() {
      const response = await api.get("/transaction/all-transactions");
      setTransactions(response.data);
    }
    fetchTransactions();

    async function fetchCategoriesAndSubcategories() {
      const categoryResponse = await api.get("/category/all-categories");
      const subcategoryResponse = await api.get(
        "/subcategory/all-subcategories"
      );
      setCategories(categoryResponse.data);
      setSubcategories(subcategoryResponse.data);
    }
    fetchCategoriesAndSubcategories();
  }, []);

  useEffect(() => {
    const filtered = transactions.filter((transaction) => {
      const date = new Date(transaction.date);
      if (startMonthYear && endMonthYear) {
        const [startYear, startMonth] = startMonthYear.split("-").map(Number);
        const [endYear, endMonth] = endMonthYear.split("-").map(Number);
        const isAfterStart =
          date.getFullYear() > startYear ||
          (date.getFullYear() === startYear &&
            date.getMonth() + 1 >= startMonth);
        const isBeforeEnd =
          date.getFullYear() < endYear ||
          (date.getFullYear() === endYear && date.getMonth() + 1 <= endMonth);
        return isAfterStart && isBeforeEnd;
      }
      return false;
    });
    setFilteredTransactions(filtered);
  }, [startMonthYear, endMonthYear, transactions]);

  const processMonthlyData = (filtered, type) => {
    const monthlyData = {};
    if (!filtered || filtered.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: "Total Spending",
            data: [],
            borderColor: "#3498DB",
            backgroundColor: "rgba(52, 152, 219, 0.1)",
            fill: true,
            tension: 0.4,
          },
          {
            label:
              type === "category"
                ? `Category: ${selectedCategory || "None"}`
                : `Subcategory: ${selectedSubcategory || "None"}`,
            data: [],
            borderColor: "#FF4D4D",
            backgroundColor: "rgba(255, 77, 77, 0.1)",
            fill: true,
            tension: 0.4,
          },
        ],
      };
    }
    filtered.forEach((transaction) => {
      const amount = Math.abs(transaction.value);
      const date = new Date(transaction.date);
      const month = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      if (!monthlyData[month]) monthlyData[month] = { total: 0, typeTotal: 0 };
      monthlyData[month].total += amount;
      if (
        type === "category" &&
        transaction.category?.name === selectedCategory
      ) {
        monthlyData[month].typeTotal += amount;
      } else if (
        type === "subcategory" &&
        transaction.subcategory?.name === selectedSubcategory
      ) {
        monthlyData[month].typeTotal += amount;
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      const [yearA, monthA] = a.split("-").map(Number);
      const [yearB, monthB] = b.split("-").map(Number);
      return yearA === yearB ? monthA - monthB : yearA - yearB;
    });

    return {
      labels: sortedMonths,
      datasets: [
        {
          label: "Total Spending",
          data: sortedMonths.map((month) => monthlyData[month].total),
          borderColor: "#3498DB",
          backgroundColor: "rgba(52, 152, 219, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label:
            type === "category"
              ? `Category: ${selectedCategory || "None"}`
              : `Subcategory: ${selectedSubcategory || "None"}`,
          data: sortedMonths.map((month) => monthlyData[month].typeTotal),
          borderColor: "#FF4D4D",
          backgroundColor: "rgba(255, 77, 77, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const generateRanking = (filtered, type) => {
    const ranking = {};
    filtered.forEach((transaction) => {
      const name = transaction[type]?.name;
      if (!name) return;
      if (!ranking[name]) ranking[name] = 0;
      ranking[name] += Math.abs(transaction.value);
    });
    return Object.entries(ranking);
  };

  const sortRanking = (entries, sortBy, sortDir) => {
    return [...entries].sort((a, b) => {
      const [nameA, valueA] = a;
      const [nameB, valueB] = b;
      let cmp = 0;
      if (sortBy === "name") {
        cmp = (nameA || "").localeCompare(nameB || "");
      } else {
        cmp = (valueA ?? 0) - (valueB ?? 0);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  };

  const RankingSortHeader = ({ column, label, sortBy, sortDir, onSort }) => (
    <th className={column === "value" ? "text-right" : ""}>
      <span className="inline-flex items-center gap-sm">
        <span>{label}</span>
        <span className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSort(column, "asc")}
            title={`${label} ascendente`}
            className={`w-6 h-6 flex items-center justify-center rounded text-sm font-bold transition-colors ${
              sortBy === column && sortDir === "asc"
                ? "bg-accent-purple text-white"
                : "text-text-secondary hover:bg-bg-nav-hover hover:text-text-primary"
            }`}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onSort(column, "desc")}
            title={`${label} descendente`}
            className={`w-6 h-6 flex items-center justify-center rounded text-sm font-bold transition-colors ${
              sortBy === column && sortDir === "desc"
                ? "bg-accent-purple text-white"
                : "text-text-secondary hover:bg-bg-nav-hover hover:text-text-primary"
            }`}
          >
            ↓
          </button>
        </span>
      </span>
    </th>
  );

  const calculateTotalRanking = (ranking) => {
    return ranking.reduce((sum, [, total]) => sum + total, 0);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#E0E0E0", font: { size: 12 } },
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

  return (
    <div className="p-xl max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-2xl">
        <h1 className="text-display text-text-primary mb-sm">Analytics</h1>
        <p className="text-body text-text-secondary">
          Detailed breakdown of your spending patterns
        </p>
      </div>

      {/* Date filters */}
      <div className="card mb-2xl">
        <h3 className="text-h2 text-text-primary mb-lg">Date Range</h3>
        <div className="flex flex-wrap items-center gap-lg">
          <div className="flex items-center gap-sm">
            <label className="text-body text-text-secondary">From:</label>
            <input
              type="month"
              value={startMonthYear}
              onChange={(e) => setStartMonthYear(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex items-center gap-sm">
            <label className="text-body text-text-secondary">To:</label>
            <input
              type="month"
              value={endMonthYear}
              onChange={(e) => setEndMonthYear(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex gap-sm ml-auto">
            <button onClick={() => setPresetRange(2)} className="btn-secondary">
              Last 3 months
            </button>
            <button onClick={() => setPresetRange(5)} className="btn-secondary">
              Last 6 months
            </button>
            <button
              onClick={() => setPresetRange(11)}
              className="btn-secondary"
            >
              Last 12 months
            </button>
          </div>
        </div>
      </div>

      {/* Category Analysis */}
      <div className="mb-2xl">
        <div className="section-header">
          <h2 className="section-title">By Category</h2>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select w-48"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          {/* Chart */}
          <div className="lg:col-span-2 card">
            <div className="h-80 flex items-center justify-center">
              {filteredTransactions.length === 0 ? (
                <p className="text-body text-text-secondary">
                  No transactions in this period
                </p>
              ) : (
                <Line
                  data={processMonthlyData(spendingTransactions, "category")}
                  options={chartOptions}
                />
              )}
            </div>
          </div>

          {/* Ranking */}
          <div className="card">
            <h3 className="text-h2 text-text-primary mb-lg">
              Category Ranking
            </h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <RankingSortHeader
                      column="name"
                      label="Category"
                      sortBy={categorySortBy}
                      sortDir={categorySortDir}
                      onSort={(col, dir) => {
                        setCategorySortBy(col);
                        setCategorySortDir(dir);
                      }}
                    />
                    <RankingSortHeader
                      column="value"
                      label="Value"
                      sortBy={categorySortBy}
                      sortDir={categorySortDir}
                      onSort={(col, dir) => {
                        setCategorySortBy(col);
                        setCategorySortDir(dir);
                      }}
                    />
                  </tr>
                </thead>
                <tbody>
                  {sortRanking(
                    generateRanking(spendingTransactions, "category"),
                    categorySortBy,
                    categorySortDir
                  ).map(([name, total], index) => (
                    <tr key={name}>
                      <td className="text-text-secondary">{index + 1}</td>
                      <td>{name}</td>
                      <td className="text-right font-semibold">
                        R${" "}
                        {total.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border-subtle">
                    <td colSpan="2" className="font-semibold">
                      Total
                    </td>
                    <td className="text-right font-bold text-accent-primary">
                      R${" "}
                      {calculateTotalRanking(
                        generateRanking(spendingTransactions, "category")
                      ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Subcategory Analysis */}
      <div>
        <div className="section-header">
          <h2 className="section-title">By Subcategory</h2>
          <select
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            className="select w-48"
          >
            <option value="">Select subcategory</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory._id} value={subcategory.name}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          {/* Chart */}
          <div className="lg:col-span-2 card">
            <div className="h-80 flex items-center justify-center">
              {filteredTransactions.length === 0 ? (
                <p className="text-body text-text-secondary">
                  No transactions in this period
                </p>
              ) : (
                <Line
                  data={processMonthlyData(spendingTransactions, "subcategory")}
                  options={chartOptions}
                />
              )}
            </div>
          </div>

          {/* Ranking */}
          <div className="card">
            <h3 className="text-h2 text-text-primary mb-lg">
              Subcategory Ranking
            </h3>
            <div className="table-container max-h-96 overflow-y-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <RankingSortHeader
                      column="name"
                      label="Subcategory"
                      sortBy={subcategorySortBy}
                      sortDir={subcategorySortDir}
                      onSort={(col, dir) => {
                        setSubcategorySortBy(col);
                        setSubcategorySortDir(dir);
                      }}
                    />
                    <RankingSortHeader
                      column="value"
                      label="Value"
                      sortBy={subcategorySortBy}
                      sortDir={subcategorySortDir}
                      onSort={(col, dir) => {
                        setSubcategorySortBy(col);
                        setSubcategorySortDir(dir);
                      }}
                    />
                  </tr>
                </thead>
                <tbody>
                  {sortRanking(
                    generateRanking(spendingTransactions, "subcategory"),
                    subcategorySortBy,
                    subcategorySortDir
                  ).map(([name, total], index) => (
                    <tr key={name}>
                      <td className="text-text-secondary">{index + 1}</td>
                      <td>{name}</td>
                      <td className="text-right font-semibold">
                        R${" "}
                        {total.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border-subtle">
                    <td colSpan="2" className="font-semibold">
                      Total
                    </td>
                    <td className="text-right font-bold text-accent-primary">
                      R${" "}
                      {calculateTotalRanking(
                        generateRanking(spendingTransactions, "subcategory")
                      ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChartsPage;
