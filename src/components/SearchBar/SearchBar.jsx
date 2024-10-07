import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../contexts/authContext";

function SearchBar({
  transacMacrotype,
  setTransacMacrotype,
  search,
  setSearch,
  category,
  setCategory,
  subcategory,
  setSubcategory,
  setSortBy,
  setTransactions,
  transactions = [],
  loading,
  setLoading,
}) {
  const { loggedInUser } = useContext(AuthContext);

  if (!loggedInUser || !loggedInUser.user || !loggedInUser.user._doc) {
    return <p>Carregando...</p>; // Renderiza algo enquanto `loggedInUser` não está disponível
  }

  const token = loggedInUser.token;

  // Carregar dados das transações
  useEffect(() => {
    setLoading(true);
    async function fetchData() {
      try {
        const response = await axios.get(
          "http://localhost:4000/transaction/all-transactions",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTransactions(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data", error);
        setLoading(false);
      }
    }
    fetchData();
  }, [setTransactions]);

  // Manipuladores de filtro
  const handleMacrotypeChange = (macrotype) => {
    setTransacMacrotype(macrotype);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleSubcategoryChange = (event) => {
    setSubcategory(event.target.value);
  };

  // Opções únicas para category e subcategory usando new Set()
  const uniqueCategories = Array.from(
    new Set(transactions.map((transaction) => transaction.category?.name)) // Usando ?. para evitar erro se category for undefined
  )
    .filter(Boolean) // Remove valores nulos ou undefined
    .sort();

  const uniqueSubcategories = Array.from(
    new Set(transactions.map((transaction) => transaction.subcategory?.name)) // Usando ?. para evitar erro se subcategory for undefined
  )
    .filter(Boolean) // Remove valores nulos ou undefined
    .sort();

  return (
    <>
      {loading && <p>Loading...</p>}
      {!loading && (
        <div className="flex flex-col justify-evenly items-center m-[10px] w-full bg-[#3d423c] mt-0 pt-[60px] pb-[10px] fixed">
          {/* Filtro por transac_macrotype */}
          <div className="mt-[10px] text-[#FFFFFF]">
            <span className="mr-[20px] font-semibold">Filter by: </span>
            <span
              className={`mr-[10px] cursor-pointer ${
                transacMacrotype === "all" ? "font-bold" : ""
              }`}
              onClick={() => handleMacrotypeChange("all")}
            >
              {" "}
              All
            </span>
            <span
              className={`mr-[20px] cursor-pointer ${
                transacMacrotype === "income" ? "font-bold" : ""
              }`}
              onClick={() => handleMacrotypeChange("income")}
            >
              Income
            </span>
            <span
              className={`mr-[20px] cursor-pointer ${
                transacMacrotype === "outcome" ? "font-bold" : ""
              }`}
              onClick={() => handleMacrotypeChange("outcome")}
            >
              Outcome
            </span>
            <span
              className={`mr-[20px] cursor-pointer ${
                transacMacrotype === "transfer between account"
                  ? "font-bold"
                  : ""
              }`}
              onClick={() => handleMacrotypeChange("transfer between account")}
            >
              Transfer Between Accounts
            </span>
            <span
              className={`cursor-pointer ${
                transacMacrotype === "investments" ? "font-bold" : ""
              }`}
              onClick={() => handleMacrotypeChange("investments")}
            >
              Investments
            </span>
          </div>

          {/* Campo de busca por descrição */}
          <div className="flex-row w-full justify-between gap-[20px]">
            <form className="flex flex-row gap-[20px] m-[20px] justify-evenly w-[80%]">
              <input
                type="text"
                placeholder="Search description..."
                value={search}
                onChange={handleSearchChange}
                className="flex flex-col w-[60%] p-[10px] border-solid bg-[#FFFFFF] text-[#3d423c] rounded-md text-[1rem]"
              />

              {/* Filtro por categoria */}

              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-[15%] p-[10px] border-solid bg-[#FFFFFF] text-[#000000] rounded-md text-[1rem]"
              >
                <option key="x" value="">
                  Select Category
                </option>
                {uniqueCategories.map((categoryName, index) => (
                  <option key={index} value={categoryName}>
                    {categoryName}
                  </option>
                ))}
              </select>

              {/* Filtro por subcategoria */}
              <select
                value={subcategory}
                onChange={handleSubcategoryChange}
                className="w-[4
              0%] p-[10px] border-solid bg-[#FFFFFF] text-[#000000] rounded-md text-[1rem]"
              >
                <option key="x" value="">
                  Select Subcategory
                </option>
                {uniqueSubcategories.map((subcategoryName, index) => (
                  <option key={index} value={subcategoryName}>
                    {subcategoryName}
                  </option>
                ))}
              </select>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default SearchBar;
