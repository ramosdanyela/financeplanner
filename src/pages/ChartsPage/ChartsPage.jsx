import { useState, useEffect, useContext } from "react";
import { Line } from "react-chartjs-2";
import { AuthContext } from "../../contexts/authContext";
import { api } from "../../api/api";
import Chart from "chart.js/auto"; // Necessário para charts

function ChartsPage() {
  const { loggedInUser } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    async function fetchTransactions() {
      const response = await api.get("/transaction/all-transactions");
      setTransactions(response.data);
    }
    fetchTransactions();

    // Fetch categories and subcategories
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

  // Filtra as transações pelo intervalo de datas
  useEffect(() => {
    if (startDate && endDate) {
      const filtered = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate >= new Date(startDate) &&
          transactionDate <= new Date(endDate)
        );
      });
      setFilteredTransactions(filtered);
    }
  }, [startDate, endDate, transactions]);

  // Processa os dados para os gráficos (totais mensais)
  const processMonthlyData = (filtered, type) => {
    const monthlyData = {};
    filtered.forEach((transaction) => {
      const date = new Date(transaction.date);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; // Corrige a obtenção de ano e mês
    if (!monthlyData[month]) monthlyData[month] = { total: 0, typeTotal: 0 };
    monthlyData[month].total += transaction.value;
    if (
      transaction[category]?.name ===
      (category === "category" ? selectedCategory : selectedSubcategory)
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

  // Gera o ranking de categorias ou subcategorias
  const generateRanking = (filtered, type) => {
    const ranking = {};
    filtered.forEach((transaction) => {
      const name = transaction[type]?.name;
      if (!name) return;
      if (!ranking[name]) ranking[name] = 0;
      ranking[name] += transaction.value;
    });

    // Ordena em ordem decrescente
    return Object.entries(ranking).sort((a, b) => b[1] - a[1]);
  };

  return (
    <div className="charts-page mt-[250px]">
      {/* Filtro de período */}
      <div className="date-filter m-5 text-xl">
        <label>Start Date: </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label>End Date: </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
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
          <Line data={processMonthlyData(filteredTransactions, "category")} />{" "}
        </div>
        <div className="ranking w-[30%] rounded-md bg-white m-5 text-gray-600">
          <h3 className="text-xl m-2 font-bold">Ranking por Categoria</h3>
          <ul className="text-left m-5">
            {generateRanking(filteredTransactions, "category").map(
              ([name, total]) => (
                <li key={name}>
                  {name}: R$ {total.toFixed(2)}
                </li>
              )
            )}
          </ul>
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
          <ul className="text-left m-5">
            {generateRanking(filteredTransactions, "subcategory").map(
              ([name, total]) => (
                <li key={name}>
                  {name}: R$ {total.toFixed(2)}
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ChartsPage;
