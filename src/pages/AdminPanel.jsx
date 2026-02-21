import { useState, useEffect } from 'react';
import './AdminPanel.css';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);

  // Get token from localStorage
  const getToken = () => localStorage.getItem('token');

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Fetch users error:', error);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/transactions`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Fetch transactions error:', error);
      alert('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending withdrawals
  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/withdrawals/pending`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setWithdrawals(response.data.withdrawals || []);
    } catch (error) {
      console.error('Fetch withdrawals error:', error);
      alert('Failed to fetch withdrawals');
    } finally {
      setLoading(false);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'transactions') fetchTransactions();
    else if (activeTab === 'withdrawals') fetchWithdrawals();
  }, [activeTab]);

  // Approve deposit
  const handleApproveDeposit = async (transactionId) => {
    if (!confirm('Approve this deposit?')) return;
    
    try {
      await axios.post(
        `${API_URL}/admin/deposits/${transactionId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      alert('Deposit approved successfully!');
      fetchTransactions();
    } catch (error) {
      console.error('Approve deposit error:', error);
      alert(error.response?.data?.message || 'Failed to approve deposit');
    }
  };

  // Approve withdrawal
  const handleApproveWithdrawal = async (withdrawalId) => {
    const txHash = prompt('Enter transaction hash (optional):');
    if (txHash === null) return;
    
    try {
      await axios.post(
        `${API_URL}/admin/withdrawals/${withdrawalId}/approve`,
        { txHash },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      alert('Withdrawal approved successfully!');
      fetchWithdrawals();
    } catch (error) {
      console.error('Approve withdrawal error:', error);
      alert(error.response?.data?.message || 'Failed to approve withdrawal');
    }
  };

  // Reject withdrawal
  const handleRejectWithdrawal = async (withdrawalId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      await axios.post(
        `${API_URL}/admin/withdrawals/${withdrawalId}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      alert('Withdrawal rejected');
      fetchWithdrawals();
    } catch (error) {
      console.error('Reject withdrawal error:', error);
      alert(error.response?.data?.message || 'Failed to reject withdrawal');
    }
  };

  // Open balance modal
  const openBalanceModal = (user) => {
    setSelectedUser(user);
    setShowBalanceModal(true);
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🔐 Admin Panel</h1>
        <p>Manage users, transactions, and withdrawals</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          👥 Users ({users.length})
        </button>
        <button
          className={activeTab === 'transactions' ? 'active' : ''}
          onClick={() => setActiveTab('transactions')}
        >
          💰 Deposits ({transactions.filter(t => t.status === 'pending').length})
        </button>
        <button
          className={activeTab === 'withdrawals' ? 'active' : ''}
          onClick={() => setActiveTab('withdrawals')}
        >
          💸 Withdrawals ({withdrawals.length})
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        )}

        {/* USERS TAB */}
        {!loading && activeTab === 'users' && (
          <div className="users-section">
            <div className="section-header">
              <h2>All Users</h2>
              <button className="refresh-btn" onClick={fetchUsers}>
                🔄 Refresh
              </button>
            </div>

            {users.length === 0 ? (
              <div className="empty-state">No users found</div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Country</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className="user-cell">
                            <div className="avatar">
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div>
                              <strong>{user.firstName} {user.lastName}</strong>
                              <span className="user-role">{user.role}</span>
                            </div>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.country}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="btn-edit"
                            onClick={() => openBalanceModal(user)}
                          >
                            💰 Edit Balance
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {!loading && activeTab === 'transactions' && (
          <div className="transactions-section">
            <div className="section-header">
              <h2>Deposit Transactions</h2>
              <button className="refresh-btn" onClick={fetchTransactions}>
                🔄 Refresh
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className="empty-state">No transactions found</div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Asset</th>
                      <th>Amount</th>
                      <th>Total (USD)</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx._id}>
                        <td>
                          {tx.user?.firstName} {tx.user?.lastName}<br/>
                          <small>{tx.user?.email}</small>
                        </td>
                        <td><strong>{tx.asset}</strong></td>
                        <td>{tx.amount}</td>
                        <td>${tx.total?.toFixed(2)}</td>
                        <td>
                          <span className={`status-badge ${tx.status}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td>{new Date(tx.createdAt).toLocaleString()}</td>
                        <td>
                          {tx.status === 'pending' && (
                            <button
                              className="btn-approve"
                              onClick={() => handleApproveDeposit(tx._id)}
                            >
                              ✅ Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* WITHDRAWALS TAB */}
        {!loading && activeTab === 'withdrawals' && (
          <div className="withdrawals-section">
            <div className="section-header">
              <h2>Pending Withdrawals</h2>
              <button className="refresh-btn" onClick={fetchWithdrawals}>
                🔄 Refresh
              </button>
            </div>

            {withdrawals.length === 0 ? (
              <div className="empty-state">No pending withdrawals</div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Asset</th>
                      <th>Amount</th>
                      <th>Fee</th>
                      <th>Total</th>
                      <th>Wallet</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((wd) => (
                      <tr key={wd._id}>
                        <td>
                          {wd.user?.firstName} {wd.user?.lastName}<br/>
                          <small>{wd.user?.email}</small>
                        </td>
                        <td><strong>{wd.asset}</strong></td>
                        <td>{wd.amount}</td>
                        <td>{wd.fee}</td>
                        <td><strong>{wd.total}</strong></td>
                        <td>
                          <code className="wallet-address">
                            {wd.walletAddress.slice(0, 10)}...
                            {wd.walletAddress.slice(-8)}
                          </code>
                        </td>
                        <td>{new Date(wd.createdAt).toLocaleString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-approve"
                              onClick={() => handleApproveWithdrawal(wd._id)}
                            >
                              ✅ Approve
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() => handleRejectWithdrawal(wd._id)}
                            >
                              ❌ Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Balance Edit Modal */}
      {showBalanceModal && selectedUser && (
        <BalanceModal
          user={selectedUser}
          onClose={() => {
            setShowBalanceModal(false);
            setSelectedUser(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}

// Balance Modal Component
function BalanceModal({ user, onClose }) {
  const [balances, setBalances] = useState(() => {
    // Convert Map to object
    const balObj = {};
    if (user.balances) {
      Object.entries(user.balances).forEach(([key, value]) => {
        balObj[key] = value;
      });
    }
    return balObj;
  });

  const [saving, setSaving] = useState(false);

  const cryptos = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'USDC', 'ADA', 'TRX', 'DOGE', 'MATIC'];

  const handleBalanceChange = (crypto, value) => {
    setBalances(prev => ({
      ...prev,
      [crypto]: parseFloat(value) || 0
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      await axios.put(
        `${API_URL}/admin/users/${user._id}/balances`,
        { balances },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('✅ Balances updated successfully!');
      onClose();
    } catch (error) {
      console.error('Update balance error:', error);
      alert(error.response?.data?.message || 'Failed to update balances');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content balance-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Balances - {user.firstName} {user.lastName}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="balances-grid">
            {cryptos.map((crypto) => (
              <div key={crypto} className="balance-input-group">
                <label>{crypto}</label>
                <input
                  type="number"
                  step="0.00000001"
                  value={balances[crypto] || 0}
                  onChange={(e) => handleBalanceChange(crypto, e.target.value)}
                  placeholder="0.00000000"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}