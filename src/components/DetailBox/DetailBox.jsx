import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../contexts/authContext";

function DetailBox({ selectedTransaction, setTransactions }) {
  const { loggedInUser } = useContext(AuthContext);

  if (!loggedInUser || !loggedInUser.user || !loggedInUser.user._doc) {
    return <p>Carregando ...</p>; // Renderiza algo enquanto `loggedInUser` não está disponível
  }

  const token = loggedInUser.token;
  const [isEditing, setIsEditing] = useState(false); // Controla se o formulário está editável

  const [formData, setFormData] = useState({
    transac_subtype: selectedTransaction?.transac_subtype || "",
    bank: selectedTransaction?.bank || "",
    date: selectedTransaction?.date || "",
    description: selectedTransaction?.description || "",
    value: selectedTransaction?.value || "",
    category: selectedTransaction?.category || "",
    subcategory: selectedTransaction?.subcategory || "",
  });

  const [categories, setCategories] = useState([]); // Categorias disponíveis
  const [subcategories, setSubcategories] = useState([]); // Subcategorias disponíveis

  const transacSubtypes = [
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

  // Array de bancos como enum
  const bankOptions = ["nubank", "itau pf", "itau pj"];

  useEffect(() => {
    // Fetch categories and subcategories from the backend
    async function fetchData() {
      try {
        const categoryResponse = await axios.get(
          "http://localhost:4000/category/all-categories",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const subcategoryResponse = await axios.get(
          "http://localhost:4000/subcategory/all-subcategories",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setCategories(categoryResponse.data);
        setSubcategories(subcategoryResponse.data);
      } catch (error) {
        console.error("Error fetching categories or subcategories", error);
      }
    }
    fetchData();
  }, [token]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.put(
        `http://localhost:4000/transaction/edit/${selectedTransaction._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction._id === selectedTransaction._id
            ? { ...transaction, ...formData }
            : transaction
        )
      );
      setIsEditing(false); // Voltar para o modo de visualização após salvar
    } catch (error) {
      console.error("Error updating transaction", error);
    }
  };

  return (
    <div className="flex w-full bg-white text-gray-800 flex-col bg-gray-100 mt-[250px] text-left  rounded-lg p-8 m-10 shadow-md w-full max-w-lg">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">
        Transaction Details
      </h3>

      {!isEditing ? (
        // Exibir informações da transação
        <div>
          <p>
            <strong>Subtype:</strong> {formData.transac_subtype}
          </p>
          <p>
            <strong>Bank:</strong> {formData.bank}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(formData.date).toLocaleDateString()}
          </p>
          <p>
            <strong>Description:</strong> {formData.description}
          </p>
          <p>
            <strong>Value:</strong> {formData.value}
          </p>
          <p>
            <strong>Category:</strong>{" "}
            {formData.category.name || "Sem categoria"}
          </p>
          <p>
            <strong>Subcategory:</strong>{" "}
            {formData.subcategory.name || "Sem subcategoria"}
          </p>

          <button
            onClick={() => setIsEditing(true)}
            className="bg-yellow-500 text-white p-3 rounded font-semibold hover:bg-yellow-600 transition duration-300 mt-4"
          >
            Edit
          </button>
        </div>
      ) : (
        // Formulário para edição
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-gray-600 font-medium mb-1">Subtype</label>
            <select
              className="bg-white p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              name="transac_subtype"
              value={formData.transac_subtype}
              onChange={handleInputChange}
            >
              {transacSubtypes.map((subtype, index) => (
                <option key={index} value={subtype}>
                  {subtype}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-gray-600 font-medium mb-1">Bank</label>
            <select
              className="bg-white p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              name="bank"
              value={formData.bank}
              onChange={handleInputChange}
            >
              {bankOptions.map((bank, index) => (
                <option key={index} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-gray-600 font-medium mb-1">Date</label>
            <input
              className="bg-white p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="date"
              name="date"
              value={new Date(formData.date).toISOString().slice(0, 10)}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-600 font-medium mb-1">
              Description
            </label>
            <input
              className="bg-white p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-600 font-medium mb-1">Value</label>
            <input
              className="bg-white p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="number"
              name="value"
              value={formData.value}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-600 font-medium mb-1">Category</label>
            <select
              className="bg-white p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-gray-600 font-medium mb-1">
              Subcategory
            </label>
            <select
              className="bg-white p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleInputChange}
            >
              {subcategories.map((subcategory) => (
                <option key={subcategory._id} value={subcategory._id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 text-white p-3 rounded font-semibold hover:bg-gray-600 transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white p-3 rounded font-semibold hover:bg-blue-600 transition duration-300"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default DetailBox;
