function SearchBar({
  search,
  setSearch,
  transacMacrotype,
  setTransacMacrotype,
  category,
  setCategory,
  subcategory,
  setSubcategory,
  transactions,
}) {
  // Opções únicas para category e subcategory usando new Set()
  const uniqueCategories = Array.from(
    new Set(transactions.map((transaction) => transaction.category?.name))
  )
    .filter(Boolean) // Remove valores nulos ou undefined
    .sort();

  const uniqueSubcategories = Array.from(
    new Set(transactions.map((transaction) => transaction.subcategory?.name))
  )
    .filter(Boolean) // Remove valores nulos ou undefined
    .sort();

  return (
    <div className="flex flex-col justify-evenly items-center m-[10px] w-full bg-[#3d423c] mt-0 pt-[60px] pb-[10px] fixed">
      {/* Filtro por transac_macrotype */}
      <div className="mt-[10px] text-[#FFFFFF]">
        <span className="mr-[20px] font-semibold">Filter by: </span>
        <span
          className={`mr-[10px] cursor-pointer ${
            transacMacrotype === "all" ? "font-bold" : ""
          }`}
          onClick={() => setTransacMacrotype("all")}
        >
          All
        </span>
        <span
          className={`mr-[20px] cursor-pointer ${
            transacMacrotype === "income" ? "font-bold" : ""
          }`}
          onClick={() => setTransacMacrotype("income")}
        >
          Income
        </span>
        <span
          className={`mr-[20px] cursor-pointer ${
            transacMacrotype === "outcome" ? "font-bold" : ""
          }`}
          onClick={() => setTransacMacrotype("outcome")}
        >
          Outcome
        </span>
        <span
          className={`mr-[20px] cursor-pointer ${
            transacMacrotype === "transfer between account" ? "font-bold" : ""
          }`}
          onClick={() => setTransacMacrotype("transfer between account")}
        >
          Transfer Between Accounts
        </span>
        <span
          className={`cursor-pointer ${
            transacMacrotype === "investments" ? "font-bold" : ""
          }`}
          onClick={() => setTransacMacrotype("investments")}
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
            onChange={(e) => setSearch(e.target.value)}
            className="flex flex-col w-[60%] p-[10px] border-solid bg-[#FFFFFF] text-[#3d423c] rounded-md text-[1rem]"
          />

          {/* Filtro por categoria */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
            onChange={(e) => setSubcategory(e.target.value)}
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
  );
}

export default SearchBar;
