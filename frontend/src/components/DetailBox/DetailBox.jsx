import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../contexts/authContext";

function DetailBox({ selectedTransaction, setTransactions, onClose }) {
  const { loggedInUser } = useContext(AuthContext);

  if (!loggedInUser || !loggedInUser.token) {
    return (
      <div className="card">
        <p className="text-body text-text-secondary">Loading...</p>
      </div>
    );
  }

  const token = loggedInUser.token;
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    transac_subtype: selectedTransaction?.transac_subtype || "",
    bank: selectedTransaction?.bank || "",
    date: selectedTransaction?.date || "",
    description: selectedTransaction?.description || "",
    value: selectedTransaction?.value || "",
    category: selectedTransaction?.category || "",
    subcategory: selectedTransaction?.subcategory || "",
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

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

  const bankOptions = ["nubank", "itau pf", "itau pj"];

  useEffect(() => {
    async function fetchData() {
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTransactions?.((prev) =>
        prev.map((transaction) =>
          transaction._id === selectedTransaction._id
            ? { ...transaction, ...formData }
            : transaction
        )
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating transaction", error);
    }
  };

  return (
    <div className="card sticky top-40">
      <div className="flex items-center justify-between mb-xl">
        <h3 className="text-h1 text-text-primary">Transaction Details</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            &times;
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-md">
          <div className="flex justify-between py-sm border-b border-border-subtle">
            <span className="text-body text-text-secondary">Type</span>
            <span className="text-body text-text-primary">{formData.transac_subtype}</span>
          </div>
          <div className="flex justify-between py-sm border-b border-border-subtle">
            <span className="text-body text-text-secondary">Bank</span>
            <span className="text-body text-text-primary">{formData.bank}</span>
          </div>
          <div className="flex justify-between py-sm border-b border-border-subtle">
            <span className="text-body text-text-secondary">Date</span>
            <span className="text-body text-text-primary">
              {new Date(formData.date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between py-sm border-b border-border-subtle">
            <span className="text-body text-text-secondary">Description</span>
            <span className="text-body text-text-primary text-right max-w-[60%]">
              {formData.description}
            </span>
          </div>
          <div className="flex justify-between py-sm border-b border-border-subtle">
            <span className="text-body text-text-secondary">Value</span>
            <span className="text-body text-text-primary font-semibold">
              R$ {formData.value?.toLocaleString?.("pt-BR", { minimumFractionDigits: 2 }) || formData.value}
            </span>
          </div>
          <div className="flex justify-between py-sm border-b border-border-subtle">
            <span className="text-body text-text-secondary">Category</span>
            <span className="text-body text-text-primary">
              {formData.category?.name || "No category"}
            </span>
          </div>
          <div className="flex justify-between py-sm border-b border-border-subtle">
            <span className="text-body text-text-secondary">Subcategory</span>
            <span className="text-body text-text-primary">
              {formData.subcategory?.name || "No subcategory"}
            </span>
          </div>

          <button onClick={() => setIsEditing(true)} className="btn-secondary w-full mt-lg">
            Edit
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-md">
          <div>
            <label className="label">Type</label>
            <select
              className="select w-full"
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

          <div>
            <label className="label">Bank</label>
            <select
              className="select w-full"
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

          <div>
            <label className="label">Date</label>
            <input
              className="input w-full"
              type="date"
              name="date"
              value={new Date(formData.date).toISOString().slice(0, 10)}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="label">Description</label>
            <input
              className="input w-full"
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="label">Value</label>
            <input
              className="input w-full"
              type="number"
              name="value"
              value={formData.value}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="label">Category</label>
            <select
              className="select w-full"
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

          <div>
            <label className="label">Subcategory</label>
            <select
              className="select w-full"
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

          <div className="flex gap-md pt-md">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default DetailBox;
