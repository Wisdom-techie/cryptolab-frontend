import React, { useState, useEffect, useMemo } from 'react';
import { getAllUsers, updateUserBalance } from '../utils/api';
import './AdminBalance.css';

// Normalize whatever shape the backend returns (id vs _id, balance vs balances map)
const normalizeUser = (u) => {
  const balance =
    typeof u.balance === 'number'
      ? u.balance
      : Number(u.balances?.USDT ?? 0) || 0;

  return {
    ...u,
    id: u.id || u._id,
    balance,
  };
};

const AdminBalance = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [transactionReason, setTransactionReason] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load every registered user
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await getAllUsers();
      const list = (response.data.users || []).map(normalizeUser);
      // Alphabetical by email so it's easy to scan
      list.sort((a, b) => (a.email || '').localeCompare(b.email || ''));
      setUsers(list);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Live filter on the loaded list (email, name, or ID)
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      (u.email || '').toLowerCase().includes(q) ||
      `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(q) ||
      String(u.id || '').toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setBalanceAmount('');
    setTransactionReason('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleBalanceSubmit = (e) => {
    e.preventDefault();

    if (!selectedUser) {
      setErrorMessage('Please select a user');
      return;
    }

    if (!balanceAmount || isNaN(balanceAmount)) {
      setErrorMessage('Please enter a valid balance amount');
      return;
    }

    if (!transactionReason.trim()) {
      setErrorMessage('Please provide a reason for the balance change');
      return;
    }

    setErrorMessage('');
    setPendingUpdate({
      amount: parseFloat(balanceAmount),
      reason: transactionReason,
      currentBalance: selectedUser.balance || 0,
    });
    setShowConfirmModal(true);
  };

  const handleConfirmUpdate = async () => {
    if (!pendingUpdate || !selectedUser) return;

    setLoading(true);
    setShowConfirmModal(false);
    setErrorMessage('');

    try {
      await updateUserBalance(selectedUser.id, {
        newBalance: pendingUpdate.amount,
        reason: pendingUpdate.reason,
      });

      setSuccessMessage('Balance updated successfully!');
      setSelectedUser(null);
      setBalanceAmount('');
      setTransactionReason('');
      setPendingUpdate(null);

      // Refresh the list so the new balance shows immediately
      await loadUsers();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to update balance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-balance-container">
      <div className="admin-balance-wrapper">
        <h1 className="admin-balance-title">User Balance Management</h1>
        <p className="admin-balance-subtitle">Select a user to update their account balance</p>

        {/* Search + User List */}
        <div className="search-section">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Filter by email, name or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button
              type="button"
              onClick={loadUsers}
              disabled={usersLoading}
              className="search-btn"
            >
              {usersLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <div className="search-results">
            <h3>
              Registered Users ({filteredUsers.length}
              {searchQuery.trim() ? ` of ${users.length}` : ''})
            </h3>

            {usersLoading && users.length === 0 ? (
              <p className="user-email">Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="user-email">
                {users.length === 0 ? 'No registered users yet' : 'No users match your filter'}
              </p>
            ) : (
              <div className="results-list">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`result-card ${selectedUser?.id === user.id ? 'selected' : ''}`}
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="result-info">
                      <p className="user-email">{user.email}</p>
                      <p className="user-name">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="user-balance">
                        Current Balance:{' '}
                        <span className="balance-amount">${(user.balance || 0).toFixed(2)}</span>
                      </p>
                    </div>
                    <div className="select-indicator">
                      {selectedUser?.id === user.id && <span className="checkmark">✓</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Balance Update Form */}
        {selectedUser && (
          <div className="balance-form-section">
            <div className="selected-user-card">
              <h3>Selected User</h3>
              <p className="selected-name">
                {selectedUser.firstName} {selectedUser.lastName}
              </p>
              <p className="selected-email">{selectedUser.email}</p>
              <p className="selected-balance">
                Current Balance: <span>${(selectedUser.balance || 0).toFixed(2)}</span>
              </p>
            </div>

            <form onSubmit={handleBalanceSubmit}>
              <div className="form-group">
                <label htmlFor="balanceAmount">New Balance Amount</label>
                <input
                  type="number"
                  id="balanceAmount"
                  placeholder="Enter new balance amount"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="reason">Reason for Change</label>
                <textarea
                  id="reason"
                  placeholder="e.g., Deposit confirmation, Refund, Manual adjustment..."
                  value={transactionReason}
                  onChange={(e) => setTransactionReason(e.target.value)}
                  rows="3"
                  className="form-textarea"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? 'Processing...' : 'Update Balance'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Messages */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && pendingUpdate && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirm Balance Update</h2>
            <div className="confirmation-details">
              <p className="confirm-user">
                <strong>
                  {selectedUser.firstName} {selectedUser.lastName}
                </strong>
              </p>
              <p className="confirm-email">{selectedUser.email}</p>

              <div className="balance-change-display">
                <div className="balance-item">
                  <span className="label">Current Balance:</span>
                  <span className="value current">${pendingUpdate.currentBalance.toFixed(2)}</span>
                </div>
                <div className="balance-arrow">→</div>
                <div className="balance-item">
                  <span className="label">New Balance:</span>
                  <span className="value new">${pendingUpdate.amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="change-info">
                <p>
                  <strong>Change:</strong> $
                  {Math.abs(pendingUpdate.amount - pendingUpdate.currentBalance).toFixed(2)}
                  <span
                    className={
                      pendingUpdate.amount > pendingUpdate.currentBalance ? 'increase' : 'decrease'
                    }
                  >
                    {pendingUpdate.amount > pendingUpdate.currentBalance
                      ? ' (increase)'
                      : ' (decrease)'}
                  </span>
                </p>
                <p>
                  <strong>Reason:</strong> {pendingUpdate.reason}
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
                className="modal-cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpdate}
                disabled={loading}
                className="modal-confirm-btn"
              >
                {loading ? 'Updating...' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBalance;