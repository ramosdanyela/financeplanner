import { useState, useEffect, useContext } from "react";
import { Line } from "react-chartjs-2";
import { AuthContext } from "../../contexts/authContext";
import { api } from "../../api/api";

function ChartsPage() {
  const { loggedInUser } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [startMonthYear, setStartMonthYear] = useState("2024-01");
  const [endMonthYear, setEndMonthYear] = useState("2024-12");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const now = new Date();

  const calculateDateRange = (monthsAgo) => {
    const pastDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    return `${pastDate.getFullYear()}-${String(
      pastDate.getMonth() + 1
    ).padStart(2, "0")}`;
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

  // Filtra as transações pelo intervalo de mês/ano ou período relativo
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

  // Processa os dados para os gráficos
  const processMonthlyData = (filtered, type) => {
    const monthlyData = {};
    filtered.forEach((transaction) => {
      const date = new Date(transaction.date);
      const month = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      if (!monthlyData[month]) monthlyData[month] = { total: 0, typeTotal: 0 };
      monthlyData[month].total += transaction.value;
      if (
        type === "category" &&
        transaction.category?.name === selectedCategory
      ) {
        monthlyData[month].typeTotal += transaction.value;
      } else if (
        type === "subcategory" &&
        transaction.subcategory?.name === selectedSubcategory
      ) {
        monthlyData[month].typeTotal += transaction.value;
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
          label: "Total Gasto",
          data: sortedMonths.map((month) => monthlyData[month].total),
          borderColor: "rgba(75, 192, 192, 1)",
          fill: false,
        },
        {
          label:
            type === "category"
              ? "Gasto por Categoria"
              : "Gasto por Subcategoria",
          data: sortedMonths.map((month) => monthlyData[month].typeTotal),
          borderColor: "rgba(255, 99, 132, 1)",
          fill: false,
        },
      ],
    };
  };

  // Gera o ranking
  const generateRanking = (filtered, type) => {
    const ranking = {};
    filtered.forEach((transaction) => {
      const name = transaction[type]?.name;
      if (!name) return;
      if (!ranking[name]) ranking[name] = 0;
      ranking[name] += transaction.value;
    });
    return Object.entries(ranking).sort((a, b) => b[1] - a[1]);
  };

  const calculateTotalRanking = (ranking) => {
    return ranking.reduce((sum, [, total]) => sum + total, 0);
  };

  return (
    <div className="charts-page mt-[250px]">
      {/* Filtro de mês/ano */}
      <div className="date-filter m-10 text-xl">
        <label>Start Month/Year: </label>
        <input
          type="month"
          value={startMonthYear}
          onChange={(e) => setStartMonthYear(e.target.value)}
        />
        <label>End Month/Year: </label>
        <input
          type="month"
          value={endMonthYear}
          onChange={(e) => setEndMonthYear(e.target.value)}
        />
        <div className="date-filter m-10 justify-evenly text-xl w-full">
          <button onClick={() => setStartMonthYear(calculateDateRange(3))}>
            Últimos 3 Meses
          </button>
          <button onClick={() => setStartMonthYear(calculateDateRange(6))}>
            Últimos 6 Meses
          </button>
          <button onClick={() => setStartMonthYear(calculateDateRange(12))}>
            Últimos 12 Meses
          </button>
        </div>
      </div>

      {/* Select para Categoria */}
      <div className="category-filter m-5 text-xl text-left">
        <label>Select Category: </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Select a Category</option>
          {categories.map((category) => (
            <option key={category._id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Gráfico e Ranking por Categoria */}
      <div className="flex flex-row w-full mb-[50px]">
        <div className="chart-container w-[70%]">
          <Line data={processMonthlyData(filteredTransactions, "category")} />
        </div>
        <div className="ranking w-[30%] rounded-md bg-white m-5 text-gray-600">
          <h3 className="text-xl m-2 font-bold">Ranking por Categoria</h3>
          <table className="w-full">
            <thead>
              <tr>
                <th>Posição</th>
                <th>Categoria</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {generateRanking(filteredTransactions, "category").map(
                ([name, total], index) => (
                  <tr key={name}>
                    <td>{index + 1}</td>
                    <td>{name}</td>
                    <td>
                      R${" "}
                      {total.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                )
              )}
              <tr className="font-bold">
                <td colSpan="2">Total</td>
                <td>
                  R${" "}
                  {calculateTotalRanking(
                    generateRanking(filteredTransactions, "category")
                  ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Select para Subcategoria */}
      <div className="subcategory-filter m-5 text-xl text-left">
        <label>Select Subcategory: </label>
        <select
          value={selectedSubcategory}
          onChange={(e) => setSelectedSubcategory(e.target.value)}
        >
          <option value="">Select a Subcategory</option>
          {subcategories.map((subcategory) => (
            <option key={subcategory._id} value={subcategory.name}>
              {subcategory.name}
            </option>
          ))}
        </select>
      </div>

      {/* Gráfico e Ranking por Subcategoria */}
      <div className="flex flex-row w-full mb-[50px]">
        <div className="chart-container w-[70%]">
          <Line
            data={processMonthlyData(filteredTransactions, "subcategory")}
          />
        </div>
        <div className="ranking w-[30%] rounded-md bg-white m-5 text-gray-600">
          <h3 className="text-xl m-2 font-bold">Ranking por Subcategoria</h3>
          <table className="w-full">
            <thead>
              <tr>
                <th>Posição</th>
                <th>Subcategoria</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {generateRanking(filteredTransactions, "subcategory").map(
                ([name, total], index) => (
                  <tr key={name}>
                    <td>{index + 1}</td>
                    <td>{name}</td>
                    <td>
                      R${" "}
                      {total.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                )
              )}
              <tr className="font-bold">
                <td colSpan="2">Total</td>
                <td>
                  R${" "}
                  {calculateTotalRanking(
                    generateRanking(filteredTransactions, "subcategory")
                  ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ChartsPage;
