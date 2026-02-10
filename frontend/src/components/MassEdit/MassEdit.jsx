import { useState, useEffect, useContext } from "react";
import { api } from "../../api/api";
import { AuthContext } from "../../contexts/authContext";

function MassEdit({ selectedIds, setSelectedIds, transactions, setTransactions }) {
  const [subtypes, setSubtypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubtype, setSelectedSubtype] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [deleting, setDeleting] = useState(false);

  const { loggedInUser } = useContext(AuthContext);

  useEffect(() => {
    async function fetchData() {
      try {
        const subtypeResponse = [
          "income transference/pix",
          "cash receiving",
          "credit card",
          "debit card",
          "outcome transference/Pix",
          "boleto",
          "account taxes",
          "saque",
          "credit card payment",
          "transference between accounts",
          "locked money",
          "lended money",
        ];
        setSubtypes(subtypeResponse);

        const categoryResponse = await api.get("/category/all-categories");
        setCategories(categoryResponse.data);

        const subcategoryResponse = await api.get("/subcategory/all-subcategories");
        setSubcategories(subcategoryResponse.data);
      } catch (error) {
        console.error("Error fetching data for mass edit", error);
      }
    }
    fetchData();
  }, []);

  const handleCategoryEdit = async () => {
    try {
      const updateData = { category: selectedCategory };
      await Promise.all(
        selectedIds.map(async (id) => {
          await api.put(`/transaction/edit/${id}`, updateData);
        })
      );
      setTransactions?.((prev) =>
        prev.map((transaction) =>
          selectedIds.includes(transaction._id)
            ? { ...transaction, ...updateData }
            : transaction
        )
      );
      alert("Category updated successfully!");
    } catch (error) {
      console.error("Error during mass edit", error);
    }
  };

  const handleSubCategoryEdit = async () => {
    try {
      const updateData = { subcategory: selectedSubcategory };
      await Promise.all(
        selectedIds.map(async (id) => {
          await api.put(`/transaction/edit/${id}`, updateData);
        })
      );
      setTransactions?.((prev) =>
        prev.map((transaction) =>
          selectedIds.includes(transaction._id)
            ? { ...transaction, ...updateData }
            : transaction
        )
      );
      alert("Subcategory updated successfully!");
    } catch (error) {
      console.error("Error during mass edit", error);
    }
  };

  const handleSubtypeEdit = async () => {
    try {
      const updateData = { transac_subtype: selectedSubtype };
      await Promise.all(
        selectedIds.map(async (id) => {
          await api.put(`/transaction/edit/${id}`, updateData);
        })
      );
      setTransactions?.((prev) =>
        prev.map((transaction) =>
          selectedIds.includes(transaction._id)
            ? { ...transaction, ...updateData }
            : transaction
        )
      );
      alert("Subtype updated successfully!");
    } catch (error) {
      console.error("Error during mass edit", error);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const msg = `Excluir ${selectedIds.length} transação(ões) selecionada(s)? Esta ação não pode ser desfeita.`;
    if (!window.confirm(msg)) return;
    setDeleting(true);
    try {
      const { data } = await api.delete("/transaction/bulk-delete", {
        data: { ids: selectedIds },
      });
      setTransactions?.((prev) => prev.filter((t) => !selectedIds.includes(t._id)));
      setSelectedIds?.([]);
      alert(data?.msg ?? "Transações excluídas.");
    } catch (error) {
      console.error("Error during mass delete", error);
      alert(error.response?.data?.msg || "Erro ao excluir. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  };

  if (!loggedInUser || !loggedInUser.token) {
    return (
      <div className="card">
        <p className="text-body text-text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="card sticky top-40">
      <h2 className="text-h1 text-text-primary mb-lg">Mass Edit</h2>

      <div className="bg-accent-purple/10 text-accent-purple px-lg py-md rounded-button mb-xl">
        <span className="text-body font-medium">
          {selectedIds.length} transactions selected
        </span>
      </div>

      {/* Subtype */}
      <div className="mb-lg">
        <label className="label">Transaction Type</label>
        <div className="flex gap-sm">
          <select
            className="select flex-1"
            value={selectedSubtype}
            onChange={(e) => setSelectedSubtype(e.target.value)}
          >
            <option value="">Select type</option>
            {subtypes.map((subtype, index) => (
              <option key={index} value={subtype}>
                {subtype}
              </option>
            ))}
          </select>
          <button
            onClick={handleSubtypeEdit}
            disabled={!selectedSubtype}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Category */}
      <div className="mb-lg">
        <label className="label">Category</label>
        <div className="flex gap-sm">
          <select
            className="select flex-1"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleCategoryEdit}
            disabled={!selectedCategory}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Subcategory */}
      <div className="mb-lg">
        <label className="label">Subcategory</label>
        <div className="flex gap-sm">
          <select
            className="select flex-1"
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
          >
            <option value="">Select subcategory</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory._id} value={subcategory._id}>
                {subcategory.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleSubCategoryEdit}
            disabled={!selectedSubcategory}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Delete */}
      <div className="mt-xl pt-xl border-t border-border-subtle">
        <label className="label text-text-outcome">Excluir selecionadas</label>
        <p className="text-small text-text-secondary mb-sm">
          Remove as transações selecionadas permanentemente.
        </p>
        <button
          onClick={handleDeleteSelected}
          disabled={deleting || selectedIds.length === 0}
          className="w-full py-md px-lg rounded-button font-medium bg-text-outcome/20 text-text-outcome border border-text-outcome hover:bg-text-outcome/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {deleting ? "Excluindo..." : `Excluir ${selectedIds.length} transação(ões)`}
        </button>
      </div>
    </div>
  );
}

export default MassEdit;
