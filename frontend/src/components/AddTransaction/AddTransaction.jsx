import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../contexts/authContext";

function AddTransaction({ setTransactions }) {
  const { loggedInUser } = useContext(AuthContext);

  if (!loggedInUser || !loggedInUser.token) {
    return (
      <div className="card">
        <p className="text-body text-text-secondary">Loading...</p>
      </div>
    );
  }

  const token = loggedInUser.token;

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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTransactions?.((prev) => [...prev, response.data]);
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
    <div className="card sticky top-40">
      <h2 className="text-h1 text-text-primary mb-xl">Add Transaction</h2>

      <form onSubmit={handleSubmit} className="space-y-md">
        <div>
          <label className="label">Bank</label>
          <input
            type="text"
            name="bank"
            value={formData.bank}
            onChange={handleInputChange}
            className="input w-full"
            placeholder="Enter bank"
          />
        </div>

        <div>
          <label className="label">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="input w-full"
          />
        </div>

        <div>
          <label className="label">Value</label>
          <input
            type="number"
            name="value"
            value={formData.value}
            onChange={handleInputChange}
            className="input w-full"
            placeholder="Enter value"
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="input w-full min-h-[80px] resize-y"
            placeholder="Enter description"
          />
        </div>

        <div>
          <label className="label">Type</label>
          <select
            name="macrotype"
            value={formData.macrotype}
            onChange={handleInputChange}
            className="select w-full"
          >
            <option value="">Select type</option>
            <option value="income">Income</option>
            <option value="outcome">Outcome</option>
          </select>
        </div>

        <div>
          <label className="label">Subtype</label>
          <select
            name="subtype"
            value={formData.subtype}
            onChange={handleInputChange}
            className="select w-full"
          >
            <option value="">Select subtype</option>
            <option value="pix">Pix</option>
            <option value="cash">Cash</option>
            <option value="credit card">Credit Card</option>
            <option value="debit card">Debit Card</option>
          </select>
        </div>

        <div>
          <label className="label">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="select w-full"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Subcategory</label>
          <select
            name="subcategory"
            value={formData.subcategory}
            onChange={handleInputChange}
            className="select w-full"
          >
            <option value="">Select subcategory</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory._id} value={subcategory._id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full mt-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Adding..." : "Add Transaction"}
        </button>
      </form>
    </div>
  );
}

export default AddTransaction;
