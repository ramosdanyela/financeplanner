import { useState } from "react";
import { Link } from "react-router-dom";
import ChartsSummary from "../../components/ChartsSummary/ChartsSummary";
import TransactionBox from "../../components/TransactionBox/TransactionBox";

function HomePage({ transactions }) {
  const [search] = useState("");
  const [transacMacrotype] = useState("");
  const [category] = useState("");
  const [subcategory] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  return (
    <div className="p-xl max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-2xl">
        <h1 className="text-display text-text-primary mb-sm">Dashboard</h1>
        <p className="text-body text-text-secondary">
          Overview of your financial activity
        </p>
      </div>

      {/* Charts Section */}
      <div className="mb-2xl">
        <div className="section-header">
          <h2 className="section-title">Financial Overview</h2>
          <Link to="/charts" className="section-link">
            View detailed charts
          </Link>
        </div>
        <ChartsSummary transactions={transactions} />
      </div>

      {/* Recent Transactions Section */}
      <div>
        <div className="section-header">
          <h2 className="section-title">Recent Transactions</h2>
          <Link to="/transactions" className="section-link">
            View all transactions
          </Link>
        </div>
        <TransactionBox
          search={search}
          transacMacrotype={transacMacrotype}
          category={category}
          subcategory={subcategory}
          transactions={transactions.slice(0, 10)}
          setSelectedTransaction={() => {}}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          massEditOpen={false}
        />
      </div>
    </div>
  );
}

export default HomePage;
