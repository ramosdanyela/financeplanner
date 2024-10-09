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

  const handleMassEdit = async () => {
    try {
      // Lógica para enviar os updates em massa para o backend
      const updateData = {
        transac_subtype: selectedSubtype,
        category: selectedCategory,
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

  const handleCreateCategory = async () => {
    try {
      if (!newCategory) return alert("Category name cannot be empty!");

      const categoryExists = categories.find(
        (category) => category.name === newCategory.toLowerCase()
      );
      if (categoryExists) return alert("Category already exists!");

      const response = await api.post("/category/create", {
        name: newCategory,
      });
      setCategories([...categories, response.data]);
      setNewCategory("");
      alert("Category created successfully!");
    } catch (error) {
      console.error("Error creating category", error);
    }
  };

  const handleCreateSubcategory = async () => {
    try {
      if (!newSubcategory) return alert("Subcategory name cannot be empty!");

      const subcategoryExists = subcategories.find(
        (subcategory) => subcategory.name === newSubcategory.toLowerCase()
      );
      if (subcategoryExists) return alert("Subcategory already exists!");

      const response = await api.post("/subcategory/create", {
        name: newSubcategory,
      });
      setSubcategories([...subcategories, response.data]);
      setNewSubcategory("");
      alert("Subcategory created successfully!");
    } catch (error) {
      console.error("Error creating subcategory", error);
    }
  };

  if (!loggedInUser || !loggedInUser.user || !loggedInUser.user._doc) {
    return <p>Carregando...</p>; // Renderiza algo enquanto `loggedInUser` não está disponível
  }



  return (
    <div className="bg-white mt-[250px] p-6 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Mass Edit</h2>
      <p>{selectedIds.length} transactions selected</p>

      {/* Subtype select */}
      <div className="flex flex-col mb-4">
        <label className="text-gray-600 font-medium mb-1">Subtype</label>
        <select
          className="bg-white p-2 rounded border border-gray-300"
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
      </div>

      {/* Category select and create */}
      <div className="flex items-center mb-4">
        <div className="flex flex-col flex-grow">
          <label className="text-gray-600 font-medium mb-1">Category</label>
          <select
            className="bg-white p-2 rounded border border-gray-300"
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
        </div>
        <button
          onClick={handleCreateCategory}
          className="ml-4 text-blue-600 hover:text-blue-800"
          title="Add Category"
        >
          ➕
        </button>
      </div>

      <input
        type="text"
        placeholder="New category name"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        className="mb-4 bg-gray-100 p-2 rounded border border-gray-300 w-full"
      />
      <button
        onClick={handleCreateCategory}
        className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-4"
      >
        Create Category
      </button>

      {/* Subcategory select and create */}
      <div className="flex items-center mb-4">
        <div className="flex flex-col flex-grow">
          <label className="text-gray-600 font-medium mb-1">Subcategory</label>
          <select
            className="bg-white p-2 rounded border border-gray-300"
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
        </div>
        <button
          onClick={handleCreateSubcategory}
          className="ml-4 text-blue-600 hover:text-blue-800"
          title="Add Subcategory"
        >
          ➕
        </button>
      </div>

      <input
        type="text"
        placeholder="New subcategory name"
        value={newSubcategory}
        onChange={(e) => setNewSubcategory(e.target.value)}
        className="mb-4 bg-gray-100 p-2 rounded border border-gray-300 w-full"
      />
      <button
        onClick={handleCreateSubcategory}
        className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
      >
        Create Subcategory
      </button>

      {/* Mass Edit Button */}
      <button
        onClick={handleMassEdit}
        className="mt-4 bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
      >
        Apply Mass Edit
      </button>
    </div>
  );
}


export default MassEdit;
