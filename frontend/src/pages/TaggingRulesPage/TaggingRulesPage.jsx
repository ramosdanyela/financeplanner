import { useState, useEffect, useContext } from "react";
import { api } from "../../api/api";
import { AuthContext } from "../../contexts/authContext";

function TaggingRulesPage() {
  const { loggedInUser } = useContext(AuthContext);

  // Data
  const [frequency, setFrequency] = useState([]);
  const [rules, setRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | untagged | tagged
  const [search, setSearch] = useState("");
  const [editingRule, setEditingRule] = useState(null); // null = closed, object = editing/creating
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingSubcategory, setAddingSubcategory] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [sortBy, setSortBy] = useState(null); // 'description' | 'count' | 'totalValue' | 'rule'
  const [sortDir, setSortDir] = useState("asc"); // 'asc' | 'desc'
  const [reapplying, setReapplying] = useState(false);
  const [reapplyResult, setReapplyResult] = useState(null); // { updated, total }
  const [activateAndReapplyLoading, setActivateAndReapplyLoading] = useState(false);
  const [activateAndReapplyResult, setActivateAndReapplyResult] = useState(null); // { rulesActivated, updated, total }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [freqRes, rulesRes, catRes, subRes] = await Promise.all([
        api.get("/tagging-rule/description-frequency"),
        api.get("/tagging-rule/all"),
        api.get("/category/all-categories"),
        api.get("/subcategory/all-subcategories"),
      ]);
      setFrequency(freqRes.data);
      setRules(rulesRes.data);
      setCategories(catRes.data);
      setSubcategories(subRes.data);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Build a map: lowercase description -> rule
  const ruleMap = {};
  for (const rule of rules) {
    // For display purposes, we match rules to descriptions
    for (const item of frequency) {
      const desc = (item.description || "").toLowerCase().trim();
      const pattern = rule.pattern;
      let matches = false;
      if (rule.matchType === "exact") matches = desc === pattern;
      else if (rule.matchType === "startsWith") matches = desc.startsWith(pattern);
      else if (rule.matchType === "contains") matches = desc.includes(pattern);

      if (matches && !ruleMap[desc]) {
        ruleMap[desc] = rule;
      }
    }
  }

  // Filter frequency list
  const filteredFrequency = frequency.filter((item) => {
    const desc = (item.description || "").toLowerCase().trim();
    const hasRule = !!ruleMap[desc];

    if (filter === "tagged" && !hasRule) return false;
    if (filter === "untagged" && hasRule) return false;
    if (search && !desc.includes(search.toLowerCase())) return false;
    return true;
  });

  // Sort: build sorted list for table
  const sortedFrequency = [...filteredFrequency].sort((a, b) => {
    if (!sortBy) return 0;
    const descA = (a.description || "").toLowerCase().trim();
    const descB = (b.description || "").toLowerCase().trim();
    const ruleA = ruleMap[descA];
    const ruleB = ruleMap[descB];
    const ruleLabelA = ruleA
      ? `${ruleA.category?.name || ""} / ${ruleA.subcategory?.name || ""}`.trim()
      : "";
    const ruleLabelB = ruleB
      ? `${ruleB.category?.name || ""} / ${ruleB.subcategory?.name || ""}`.trim()
      : "";

    let cmp = 0;
    if (sortBy === "description") {
      cmp = (a.description || "").localeCompare(b.description || "");
    } else if (sortBy === "count") {
      cmp = (a.count ?? 0) - (b.count ?? 0);
    } else if (sortBy === "totalValue") {
      cmp = (a.totalValue ?? 0) - (b.totalValue ?? 0);
    } else if (sortBy === "rule") {
      cmp = ruleLabelA.localeCompare(ruleLabelB);
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const handleSort = (column, dir) => {
    setSortBy(column);
    setSortDir(dir);
  };

  const handleReapplyRules = async () => {
    setReapplying(true);
    setError("");
    setReapplyResult(null);
    setActivateAndReapplyResult(null);
    try {
      const res = await api.post("/tagging-rule/reapply");
      setReapplyResult({
        updated: res.data.updated,
        total: res.data.total,
      });
      if (res.data.errors?.length) {
        setError(res.data.errors.join("; "));
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to apply rules to transactions");
    } finally {
      setReapplying(false);
    }
  };

  const handleActivateAllAndReapply = async () => {
    setActivateAndReapplyLoading(true);
    setError("");
    setReapplyResult(null);
    setActivateAndReapplyResult(null);
    try {
      const res = await api.post("/tagging-rule/activate-all-and-reapply");
      setActivateAndReapplyResult({
        rulesActivated: res.data.rulesActivated,
        updated: res.data.updated,
        total: res.data.total,
      });
      if (res.data.errors?.length) {
        setError(res.data.errors.join("; "));
      }
      fetchData(); // refresh rules list so isActive state is updated in UI
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to activate rules and apply");
    } finally {
      setActivateAndReapplyLoading(false);
    }
  };

  const SortHeader = ({ column, label, className = "" }) => {
    const isActive = sortBy === column;
    return (
      <th className={className}>
        <span className="inline-flex items-center gap-sm">
          <span>{label}</span>
          <span className="inline-flex items-center gap-1" aria-label={`Sort ${label}`}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSort(column, "asc");
              }}
              title={`${label} ascendente (A→Z, menor→maior)`}
              className={`w-6 h-6 flex items-center justify-center rounded text-sm font-bold transition-colors ${
                isActive && sortDir === "asc"
                  ? "bg-accent-purple text-white"
                  : "text-text-secondary hover:bg-bg-nav-hover hover:text-text-primary"
              }`}
            >
              ↑
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSort(column, "desc");
              }}
              title={`${label} descendente (Z→A, maior→menor)`}
              className={`w-6 h-6 flex items-center justify-center rounded text-sm font-bold transition-colors ${
                isActive && sortDir === "desc"
                  ? "bg-accent-purple text-white"
                  : "text-text-secondary hover:bg-bg-nav-hover hover:text-text-primary"
              }`}
            >
              ↓
            </button>
          </span>
        </span>
      </th>
    );
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "-";
    return `R$ ${Math.abs(value).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleCreateRule = (description) => {
    setEditingRule({
      isNew: true,
      pattern: description || "",
      matchType: "contains",
      category: "",
      subcategory: "",
      priority: 0,
      isActive: true,
    });
  };

  const handleEditRule = (rule) => {
    setEditingRule({
      isNew: false,
      _id: rule._id,
      pattern: rule.pattern,
      matchType: rule.matchType,
      category: rule.category?._id || "",
      subcategory: rule.subcategory?._id || "",
      priority: rule.priority,
      isActive: rule.isActive,
    });
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      await api.delete(`/tagging-rule/delete/${ruleId}`);
      setRules(rules.filter((r) => r._id !== ruleId));
      if (editingRule?._id === ruleId) setEditingRule(null);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to delete rule");
    }
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setError("");
    try {
      const res = await api.post("/category/create-category", { name: name.toLowerCase() });
      setCategories([...categories, res.data]);
      setEditingRule({ ...editingRule, category: res.data._id });
      setNewCategoryName("");
      setAddingCategory(false);
    } catch (err) {
      setError(err.response?.data?.msg || "Falha ao criar categoria");
    }
  };

  const handleAddSubcategory = async () => {
    const name = newSubcategoryName.trim();
    if (!name) return;
    setError("");
    try {
      const res = await api.post("/subcategory/create-subcategory", { name: name.toLowerCase() });
      setSubcategories([...subcategories, res.data]);
      setEditingRule({ ...editingRule, subcategory: res.data._id });
      setNewSubcategoryName("");
      setAddingSubcategory(false);
    } catch (err) {
      setError(err.response?.data?.msg || "Falha ao criar subcategoria");
    }
  };

  const handleSaveRule = async () => {
    if (!editingRule.pattern || !editingRule.category) return;

    setSaving(true);
    setError("");
    try {
      const payload = {
        pattern: editingRule.pattern,
        matchType: editingRule.matchType,
        category: editingRule.category,
        subcategory: editingRule.subcategory || undefined,
        priority: editingRule.priority,
        isActive: editingRule.isActive,
      };

      let response;
      if (editingRule.isNew) {
        response = await api.post("/tagging-rule/create", payload);
        setRules([...rules, response.data]);
      } else {
        response = await api.put(`/tagging-rule/edit/${editingRule._id}`, payload);
        setRules(rules.map((r) => (r._id === editingRule._id ? response.data : r)));
      }
      setEditingRule(null);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to save rule");
    } finally {
      setSaving(false);
    }
  };

  if (!loggedInUser || !loggedInUser.token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-body text-text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-xl py-xl max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-xl">
        <div>
          <h1 className="text-h1 text-text-primary font-semibold">Tagging Rules</h1>
          <p className="text-body text-text-secondary mt-sm">
            Create rules to auto-categorize imported transactions
          </p>
        </div>
        <div className="flex items-center gap-md flex-wrap">
          <button
            onClick={handleActivateAllAndReapply}
            disabled={activateAndReapplyLoading}
            className="btn-primary"
            title="Ativa todas as regras (isActive = true) e aplica elas em todas as transações existentes"
          >
            {activateAndReapplyLoading ? "Ativando e aplicando..." : "Ativar todas as regras e aplicar"}
          </button>
          <button
            onClick={handleReapplyRules}
            disabled={reapplying}
            className="btn-secondary"
            title="Aplica todas as regras ativas às transações já existentes (atualiza category/subcategory)"
          >
            {reapplying ? "Aplicando..." : "Aplicar regras às transações"}
          </button>
          <button onClick={() => handleCreateRule("")} className="btn-secondary">
            + New Rule
          </button>
        </div>
      </div>

      {activateAndReapplyResult != null && (
        <div className="bg-text-income/20 border border-text-income text-text-primary px-lg py-md rounded-button mb-xl">
          <p className="font-semibold">Concluído</p>
          <p className="text-body text-text-secondary">
            {activateAndReapplyResult.rulesActivated} regra(s) ativada(s).{" "}
            {activateAndReapplyResult.updated} de {activateAndReapplyResult.total} transações atualizadas com categoria/subcategoria.
          </p>
        </div>
      )}

      {reapplyResult != null && activateAndReapplyResult == null && (
        <div className="bg-text-income/20 border border-text-income text-text-primary px-lg py-md rounded-button mb-xl">
          <p className="font-semibold">Regras aplicadas</p>
          <p className="text-body text-text-secondary">
            {reapplyResult.updated} de {reapplyResult.total} transações atualizadas com categoria/subcategoria.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-text-outcome/20 border border-text-outcome text-text-outcome px-lg py-md rounded-button mb-xl">
          {error}
          <button onClick={() => setError("")} className="ml-lg font-bold">
            x
          </button>
        </div>
      )}

      <div className="flex gap-xl">
        {/* Main content - Frequency table */}
        <div className={editingRule ? "w-2/3" : "w-full"}>
          {/* Filters */}
          <div className="card mb-lg">
            <div className="flex items-center gap-lg">
              <div className="flex gap-sm">
                {["all", "untagged", "tagged"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-lg py-sm rounded-button text-small font-medium transition-colors ${
                      filter === f
                        ? "bg-accent-purple text-white"
                        : "bg-bg-nav-hover text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search descriptions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-bg-main border border-border-subtle rounded-button px-lg py-sm text-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-purple"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="card text-center py-2xl">
              <p className="text-body text-text-secondary">Loading...</p>
            </div>
          ) : (
            <div className="card">
              <div className="table-container max-h-[70vh] overflow-y-auto">
                <table className="table">
                  <thead className="sticky top-0 bg-bg-card z-10">
                    <tr>
                      <SortHeader column="description" label="Description" />
                      <SortHeader column="count" label="Count" className="text-center" />
                      <SortHeader column="totalValue" label="Total Value" className="text-right" />
                      <SortHeader column="rule" label="Rule" />
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFrequency.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-text-secondary py-xl">
                          No descriptions found
                        </td>
                      </tr>
                    ) : (
                      sortedFrequency.map((item) => {
                        const desc = (item.description || "").toLowerCase().trim();
                        const matchedRule = ruleMap[desc];

                        return (
                          <tr key={item.description || "empty"}>
                            <td className="max-w-xs truncate" title={item.description}>
                              {item.description || "(empty)"}
                            </td>
                            <td className="text-center">{item.count}</td>
                            <td className={`text-right font-semibold ${item.totalValue < 0 ? "text-text-outcome" : "text-text-income"}`}>
                              {formatCurrency(item.totalValue)}
                            </td>
                            <td>
                              {matchedRule ? (
                                <span className="bg-text-income/20 text-text-income px-sm py-xs rounded-full text-small">
                                  {matchedRule.category?.name}
                                  {matchedRule.subcategory?.name && ` / ${matchedRule.subcategory.name}`}
                                </span>
                              ) : (
                                <span className="text-small text-text-secondary">--</span>
                              )}
                            </td>
                            <td className="text-center">
                              {matchedRule ? (
                                <div className="flex items-center justify-center gap-sm">
                                  <button
                                    onClick={() => handleEditRule(matchedRule)}
                                    className="text-small text-accent-purple hover:underline"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRule(matchedRule._id)}
                                    className="text-small text-text-outcome hover:underline"
                                  >
                                    Delete
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleCreateRule(item.description)}
                                  className="text-small text-accent-purple hover:underline"
                                >
                                  Create Rule
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rules summary */}
          {!loading && rules.length > 0 && (
            <div className="card mt-lg">
              <h2 className="text-h2 text-text-primary font-semibold mb-md">
                Active Rules ({rules.filter((r) => r.isActive).length})
              </h2>
              <div className="space-y-sm">
                {rules.map((rule) => (
                  <div
                    key={rule._id}
                    className={`flex items-center justify-between px-lg py-md rounded-button ${
                      rule.isActive ? "bg-bg-main" : "bg-bg-main opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-lg">
                      <span className="text-body text-text-primary font-medium">
                        "{rule.pattern}"
                      </span>
                      <span className="bg-bg-nav-hover text-text-secondary px-sm py-xs rounded-full text-small">
                        {rule.matchType}
                      </span>
                      <span className="text-small text-text-secondary">→</span>
                      <span className="bg-text-income/20 text-text-income px-sm py-xs rounded-full text-small">
                        {rule.category?.name}
                        {rule.subcategory?.name && ` / ${rule.subcategory.name}`}
                      </span>
                      {rule.priority > 0 && (
                        <span className="text-small text-text-secondary">
                          P{rule.priority}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-sm">
                      <button
                        onClick={() => handleEditRule(rule)}
                        className="text-small text-accent-purple hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule._id)}
                        className="text-small text-text-outcome hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Rule Editor */}
        {editingRule && (
          <div className="w-1/3">
            <div className="card sticky top-20">
              <h2 className="text-h2 text-text-primary font-semibold mb-lg">
                {editingRule.isNew ? "Create Rule" : "Edit Rule"}
              </h2>

              <div className="space-y-lg">
                {/* Pattern */}
                <div>
                  <label className="block text-small text-text-secondary mb-sm">Pattern</label>
                  <input
                    type="text"
                    value={editingRule.pattern}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, pattern: e.target.value })
                    }
                    placeholder="e.g. uber, ifood, spotify"
                    className="w-full bg-bg-main border border-border-subtle rounded-button px-lg py-md text-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-purple"
                  />
                </div>

                {/* Match Type */}
                <div>
                  <label className="block text-small text-text-secondary mb-sm">Match Type</label>
                  <select
                    value={editingRule.matchType}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, matchType: e.target.value })
                    }
                    className="w-full bg-bg-main border border-border-subtle rounded-button px-lg py-md text-body text-text-primary focus:outline-none focus:border-accent-purple"
                  >
                    <option value="contains">Contains</option>
                    <option value="startsWith">Starts With</option>
                    <option value="exact">Exact Match</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <div className="flex items-center justify-between mb-sm">
                    <label className="block text-small text-text-secondary">Category *</label>
                    <button
                      type="button"
                      onClick={() => setAddingCategory(true)}
                      className="text-small text-accent-purple hover:underline flex items-center gap-xs"
                      title="Nova categoria"
                    >
                      +
                    </button>
                  </div>
                  <select
                    value={editingRule.category}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, category: e.target.value })
                    }
                    className="w-full bg-bg-main border border-border-subtle rounded-button px-lg py-md text-body text-text-primary focus:outline-none focus:border-accent-purple"
                  >
                    <option value="">Select category...</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {addingCategory && (
                    <div className="flex gap-sm mt-sm">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nome da categoria"
                        className="flex-1 bg-bg-main border border-border-subtle rounded-button px-lg py-sm text-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-purple"
                        onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                      />
                      <button type="button" onClick={handleAddCategory} className="btn-primary py-sm px-md">
                        Add
                      </button>
                      <button type="button" onClick={() => { setAddingCategory(false); setNewCategoryName(""); }} className="btn-secondary py-sm px-md">
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Subcategory */}
                <div>
                  <div className="flex items-center justify-between mb-sm">
                    <label className="block text-small text-text-secondary">
                      Subcategory (optional)
                    </label>
                    <button
                      type="button"
                      onClick={() => setAddingSubcategory(true)}
                      className="text-small text-accent-purple hover:underline flex items-center gap-xs"
                      title="Nova subcategoria"
                    >
                      +
                    </button>
                  </div>
                  <select
                    value={editingRule.subcategory}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, subcategory: e.target.value })
                    }
                    className="w-full bg-bg-main border border-border-subtle rounded-button px-lg py-md text-body text-text-primary focus:outline-none focus:border-accent-purple"
                  >
                    <option value="">None</option>
                    {subcategories.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                  {addingSubcategory && (
                    <div className="flex gap-sm mt-sm">
                      <input
                        type="text"
                        value={newSubcategoryName}
                        onChange={(e) => setNewSubcategoryName(e.target.value)}
                        placeholder="Nome da subcategoria"
                        className="flex-1 bg-bg-main border border-border-subtle rounded-button px-lg py-sm text-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-purple"
                        onKeyDown={(e) => e.key === "Enter" && handleAddSubcategory()}
                      />
                      <button type="button" onClick={handleAddSubcategory} className="btn-primary py-sm px-md">
                        Add
                      </button>
                      <button type="button" onClick={() => { setAddingSubcategory(false); setNewSubcategoryName(""); }} className="btn-secondary py-sm px-md">
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-small text-text-secondary mb-sm">Priority</label>
                  <input
                    type="number"
                    value={editingRule.priority}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, priority: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-bg-main border border-border-subtle rounded-button px-lg py-md text-body text-text-primary focus:outline-none focus:border-accent-purple"
                  />
                  <p className="text-small text-text-secondary mt-xs">
                    Higher = more priority when multiple rules match
                  </p>
                </div>

                {/* Active */}
                <div className="flex items-center gap-md">
                  <input
                    type="checkbox"
                    checked={editingRule.isActive}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, isActive: e.target.checked })
                    }
                    className="w-4 h-4 accent-accent-purple"
                  />
                  <label className="text-body text-text-primary">Active</label>
                </div>

                {/* Buttons */}
                <div className="flex gap-md pt-md">
                  <button
                    onClick={handleSaveRule}
                    disabled={saving || !editingRule.pattern || !editingRule.category}
                    className={`btn-primary flex-1 ${
                      saving || !editingRule.pattern || !editingRule.category
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingRule(null);
                      setAddingCategory(false);
                      setAddingSubcategory(false);
                      setNewCategoryName("");
                      setNewSubcategoryName("");
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaggingRulesPage;
