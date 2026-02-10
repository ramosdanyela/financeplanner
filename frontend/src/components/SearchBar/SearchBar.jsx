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
  categories = [],
  subcategories = [],
  massEditOpen,
  setMassEditOpen,
  createTransactionOpen,
  setCreateTransactionOpen,
}) {
  // Use full list from API (same as Rules page) when provided; otherwise fallback to values present in transactions
  const categoryOptions =
    categories.length > 0
      ? categories.map((c) => c.name).filter(Boolean).sort()
      : Array.from(new Set(transactions.map((t) => t.category?.name))).filter(Boolean).sort();

  const subcategoryOptions =
    subcategories.length > 0
      ? subcategories.map((s) => s.name).filter(Boolean).sort()
      : Array.from(new Set(transactions.map((t) => t.subcategory?.name))).filter(Boolean).sort();

  const handleMassEditToggle = (e) => {
    e.preventDefault();
    setMassEditOpen(!massEditOpen);
  };

  const handleCreateTransactionToggle = (e) => {
    e.preventDefault();
    setCreateTransactionOpen(!createTransactionOpen);
  };

  const filterOptions = [
    { value: "all", label: "All" },
    { value: "income", label: "Income" },
    { value: "outcome", label: "Outcome" },
    { value: "transfer between account", label: "Transfers" },
    { value: "investments", label: "Investments" },
  ];

  return (
    <div className="bg-bg-sidebar fixed top-16 left-0 right-0 z-40 border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-xl py-lg">
        {/* Filter chips */}
        <div className="flex items-center gap-sm mb-lg">
          <span className="text-body text-text-secondary mr-sm">Filter:</span>
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTransacMacrotype(option.value)}
              className={`px-md py-xs rounded-full text-small transition-colors ${
                transacMacrotype === option.value
                  ? "bg-accent-purple text-white"
                  : "bg-bg-nav-active text-text-secondary hover:text-text-primary"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Search and filters row */}
        <div className="flex items-center gap-lg">
          {/* Search input */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input w-full"
            />
          </div>

          {/* Category filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="select w-40"
          >
            <option value="">All Categories</option>
            {categoryOptions.map((categoryName, index) => (
              <option key={index} value={categoryName}>
                {categoryName}
              </option>
            ))}
          </select>

          {/* Subcategory filter */}
          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="select w-48"
          >
            <option value="">All Subcategories</option>
            {subcategoryOptions.map((subcategoryName, index) => (
              <option key={index} value={subcategoryName}>
                {subcategoryName}
              </option>
            ))}
          </select>

          {/* Action buttons */}
          <div className="flex gap-sm ml-auto">
            <button
              onClick={handleMassEditToggle}
              className={`btn-secondary ${massEditOpen ? "ring-2 ring-accent-purple" : ""}`}
            >
              Mass Edit
            </button>
            <button onClick={handleCreateTransactionToggle} className="btn-primary">
              + New Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
