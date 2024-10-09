import { useState, useContext } from "react";
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

  // Manipuladores de filtro
  const handleMacrotypeChange = (macrotype) => {
    setTransacMacrotype(macrotype);
    filterTransactions(macrotype, search, category, subcategory);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    filterTransactions(transacMacrotype, event.target.value, category, subcategory);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    filterTransactions(transacMacrotype, search, event.target.value, subcategory);
  };

  const handleSubcategoryChange = (event) => {
    setSubcategory(event.target.value);
    filterTransactions(transacMacrotype, search, category, event.target.value);
  };

  // Função de filtro principal
  const filterTransactions = (macrotype, search, category, subcategory) => {
    setLoading(true);

    const filteredTransactions = transactions
      .filter((transaction) =>
        macrotype !== "all" ? transaction.transac_macrotype === macrotype : true
      )
      .filter((transaction) =>
        search ? transaction.description.toLowerCase().includes(search.toLowerCase()) : true
      )
      .filter((transaction) =>
        category ? transaction.category?.name === category : true
      )
      .filter((transaction) =>
        subcategory ? transaction.subcategory?.name === subcategory : true
      );

    setTransactions(filteredTransactions);
    setLoading(false);
  };

  // Opções únicas para category e subcategory usando new Set()
  const uniqueCategories = Array.from(
    new Set(transactions.map((transaction) => transaction.category?.name))
  )
    .filter(Boolean)
    .sort();

  const uniqueSubcategories = Array.from(
    new Set(transactions.map((transaction) => transaction.subcategory?.name))
  )
    .filter(Boolean)
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
                className="w-[40%] p-[10px] border-solid bg-[#FFFFFF] text-[#000000] rounded-md text-[1rem]"
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
