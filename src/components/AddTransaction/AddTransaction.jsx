import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../contexts/authContext";

function AddTransaction({ setTransactions }) {
  const { loggedInUser } = useContext(AuthContext);

  if (!loggedInUser || !loggedInUser.token) {
    return <p>Loading...</p>;
  }

  const token = loggedInUser.token;

  // Estados para o formulário
  const [formData, setFormData] = useState({
    bank: "",
    date: "",
    value: "",
    description: "",
    macrotype: "",
    subtype: "",
    category: "",
    subcategory: "",
    location: "",
    notes: "",
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch para categorias e subcategorias
    async function fetchCategoriesAndSubcategories() {
      try {
        const categoryResponse = await axios.get(
          "http://localhost:4000/category/all-categories",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const subcategoryResponse = await axios.get(
          "http://localhost:4000/subcategory/all-subcategories",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCategories(categoryResponse.data);
        setSubcategories(subcategoryResponse.data);
      } catch (error) {
        console.error("Error fetching categories and subcategories", error);
      }
    }
    fetchCategoriesAndSubcategories();
  }, [token]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        "http://localhost:4000/transaction/create",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Atualizar transações na interface após adicionar
      setTransactions((prev) => [...prev, response.data]);

      // Limpar formulário
      setFormData({
        bank: "",
        date: "",
        value: "",
        description: "",
        macrotype: "",
        subtype: "",
        category: "",
        subcategory: "",
        location: "",
        notes: "",
      });

      alert("Transaction added successfully!");
    } catch (error) {
      console.error("Error adding transaction", error);
      alert("Failed to add transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white mt-[250px] p-6 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-xl text-gray-600 font-bold mb-4">Add Transaction</h2>
      <form onSubmit={handleSubmit}>
        {/* Input para Bank */}
        <div className="mb-4">
          <label className="text-gray-600 font-medium mb-1 block">Bank</label>
          <input
            type="text"
            name="bank"
            value={formData.bank}
            onChange={handleInputChange}
            className="bg-white p-2 rounded border border-gray-300 w-full"
            placeholder="Enter bank"
          />
        </div>

        {/* Input para Date */}
        <div className="mb-4">
          <label className="text-gray-600 font-medium mb-1 block">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="bg-white p-2 rounded border border-gray-300 w-full"
          />
        </div>

        {/* Input para Value */}
        <div className="mb-4">
          <label className="text-gray-600 font-medium mb-1 block">Value</label>
          <input
            type="number"
            name="value"
            value={formData.value}
            onChange={handleInputChange}
            className="bg-white p-2 rounded border border-gray-300 w-full"
            placeholder="Enter value"
          />
        </div>

        {/* Input para Description */}
        <div className="mb-4">
          <label className="text-gray-600 font-medium mb-1 block">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="bg-white p-2 rounded border border-gray-300 w-full"
            placeholder="Enter description"
          />
        </div>

        {/* Select para Macrotype */}
        <div className="mb-4">
          <label className="text-gray-600 font-medium mb-1 block">
            Macrotype
          </label>
          <select
            name="macrotype"
            value={formData.macrotype}
            onChange={handleInputChange}
            className="bg-white p-2 rounded border border-gray-300 w-full"
          >
            <option value="">Select Macrotype</option>
            <option value="income">Income</option>
            <option value="outcome">Outcome</option>
          </select>
        </div>

        {/* Select para Subtype */}
        <div className="mb-4">
          <label className="text-gray-600 font-medium mb-1 block">Subtype</label>
          <select
            name="subtype"
            value={formData.subtype}
            onChange={handleInputChange}
            className="bg-white p-2 rounded border border-gray-300 w-full"
          >
            <option value="">Select Subtype</option>
            <option value="pix">Pix</option>
            <option value="cash">Cash</option>
            {/* Adicionar outras opções conforme necessário */}
          </select>
        </div>

        {/* Categoria */}
        <div className="mb-4">
          <label className="text-gray-600 font-medium mb-1 block">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="bg-white p-2 rounded border border-gray-300 w-full"
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* SubCategory */}
        <div className="mb-4">
          <label className="text-gray-600 font-medium mb-1 block">
            Subcategory
          </label>
          <select
            name="subcategory"
            value={formData.subcategory}
            onChange={handleInputChange}
            className="bg-white p-2 rounded border border-gray-300 w-full"
          >
            <option value="">Select Subcategory</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory._id} value={subcategory._id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>

        {/* Botão de Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white p-2 rounded font-semibold hover:bg-blue-600 transition duration-300 w-full"
        >
          {isSubmitting ? "Adding..." : "Add Transaction"}
        </button>
      </form>
    </div>
  );
}

export default AddTransaction;
