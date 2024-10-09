import { useState, useEffect, useContext } from "react";
import { api } from "../../api/api";
import { AuthContext } from "../../contexts/authContext";

function MassEdit({ selectedIds, transactions, setTransactions }) {
  const [subtypes, setSubtypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubtype, setSelectedSubtype] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");

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
        setSubtypes(subtypeResponse); // Set available subtypes

        const categoryResponse = await api.get("/category/all-categories");
        setCategories(categoryResponse.data);

        const subcategoryResponse = await api.get(
          "/subcategory/all-subcategories"
        );
        setSubcategories(subcategoryResponse.data);
      } catch (error) {
        console.error("Error fetching data for mass edit", error);
      }
    }
    fetchData();
  }, []);

  const handleCategoryEdit = async () => {
    try {
      // Lógica para enviar os updates em massa para o backend
      const updateData = {
        category: selectedCategory,
      };

      await Promise.all(
        selectedIds.map(async (id) => {
          await api.put(`/transaction/edit/${id}`, updateData);
        })
      );

      // Atualizar as transações no frontend
      setTransactions((prev) =>
        prev.map((transaction) =>
          selectedIds.includes(transaction._id)
            ? { ...transaction, ...updateData }
            : transaction
        )
      );
      alert("Mass edit applied successfully!");
    } catch (error) {
      console.error("Error during mass edit", error);
    }
  };


  const handleSubCategoryEdit = async () => {
    try {
      // Lógica para enviar os updates em massa para o backend
      const updateData = {
       subcategory: selectedSubcategory,
      };

      await Promise.all(
        selectedIds.map(async (id) => {
          await api.put(`/transaction/edit/${id}`, updateData);
        })
      );

      // Atualizar as transações no frontend
      setTransactions((prev) =>
        prev.map((transaction) =>
          selectedIds.includes(transaction._id)
            ? { ...transaction, ...updateData }
            : transaction
        )
      );
      alert("Mass edit applied successfully!");
    } catch (error) {
      console.error("Error during mass edit", error);
    }
  };

  const handleSubtypeEdit = async () => {
    try {
      // Lógica para enviar os updates em massa para o backend
      const updateData = {
        transac_subtype: selectedSubtype,
      };

      await Promise.all(
        selectedIds.map(async (id) => {
          await api.put(`/transaction/edit/${id}`, updateData);
        })
      );

      // Atualizar as transações no frontend
      setTransactions((prev) =>
        prev.map((transaction) =>
          selectedIds.includes(transaction._id)
            ? { ...transaction, ...updateData }
            : transaction
        )
      );
      alert("Mass edit applied successfully!");
    } catch (error) {
      console.error("Error during mass edit", error);
    }
  };




  if (!loggedInUser || !loggedInUser.user || !loggedInUser.user._doc) {
    return <p>Carregando...</p>; // Renderiza algo enquanto `loggedInUser` não está disponível
  }

  console.log(selectedSubtype);

  return (
    <div className="bg-white mt-[250px] p-6 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-xl text-gray-600 font-bold mb-4">Mass Edit</h2>
      <p className="text-gray-200 bg-gray-600 mb-[20px] text-xl">
        {selectedIds.length} transactions selected
      </p>

      {/* Subtype select */}
      <div className="flex flex-row items-center justify-between mt-[5px]">
        <label className="text-gray-600 font-medium mb-1 mr-[5px]">
          Subtype
        </label>
        <select
          className="bg-white p-2 text-gray-600 rounded border border-gray-300"
          value={selectedSubtype}
          onChange={(e) => setSelectedSubtype(e.target.value)}
        >
          <option value="">Select Subtype</option>
          {subtypes.map((subtype, index) => (
            <option key={index} value={subtype}>
              {subtype}
            </option>
          ))}
        </select>
        <button
          onClick={handleSubtypeEdit}
          className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
        >
          Apply
        </button>
      </div>

      <div className="flex flex-row items-center justify-between mt-[5px]">
        <label className="text-gray-600 mr-[5px] font-medium mb-1">
          Category
        </label>
        <select
          className="bg-white text-gray-600 p-2 rounded border border-gray-300"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleCategoryEdit}
          className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
        >
          Apply
        </button>
      </div>

      {/* Subcategory select and create */}
      <div className="flex flex-row items-center justify-between mt-[5px]">
        <label className="text-gray-600 mr-[5px] font-medium mb-1">
          Subcategory
        </label>
        <select
          className="bg-white text-gray-600 p-2 mr-[5px] rounded border border-gray-300"
          value={selectedSubcategory}
          onChange={(e) => setSelectedSubcategory(e.target.value)}
        >
          <option value="">Select Subcategory</option>
          {subcategories.map((subcategory) => (
            <option key={subcategory._id} value={subcategory._id}>
              {subcategory.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleSubCategoryEdit}
          className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

export default MassEdit;
