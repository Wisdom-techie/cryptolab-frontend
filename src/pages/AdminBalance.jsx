import React, { useState } from 'react';
import { searchUsers, updateUserBalance } from '../utils/api';
import './AdminBalance.css';

const AdminBalance = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [transactionReason, setTransactionReason] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setErrorMessage('Please enter an email or user ID');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const response = await searchUsers(searchQuery);
      setSearchResults(response.data.users || []);
      if (!response.data.users || response.data.users.length === 0) {
        setErrorMessage('No users found');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to search users');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

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

    setPendingUpdate({
      amount: parseFloat(balanceAmount),
      reason: transactionReason,
      currentBalance: selectedUser.balance || 0
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
        reason: pendingUpdate.reason
      });

      setSuccessMessage('Balance updated successfully!');
      setSelectedUser(null);
      setBalanceAmount('');
      setTransactionReason('');
      setPendingUpdate(null);

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
        <p className="admin-balance-subtitle">Search and update user account balances</p>

        {/* Search Section */}
        <div className="search-section">
          <form onSubmit={handleSearch}>
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Search by email or user ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" disabled={loading} className="search-btn">
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="search-results">
              <h3>Search Results</h3>
              <div className="results-list">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className={`result-card ${selectedUser?.id === user.id ? 'selected' : ''}`}
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="result-info">
                      <p className="user-name">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="user-email">{user.email}</p>
                      <p className="user-balance">
                        Current Balance: <span className="balance-amount">${(user.balance || 0).toFixed(2)}</span>
                      </p>
                    </div>
                    <div className="select-indicator">
                      {selectedUser?.id === user.id && <span className="checkmark">✓</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-btn"
                >
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
                <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>
              </p>
              <p className="confirm-email">{selectedUser.email}</p>
              
              <div className="balance-change-display">
                <div className="balance-item">
                  <span className="label">Current Balance:</span>
                  <span className="value current">${(pendingUpdate.currentBalance).toFixed(2)}</span>
                </div>
                <div className="balance-arrow">→</div>
                <div className="balance-item">
                  <span className="label">New Balance:</span>
                  <span className="value new">${(pendingUpdate.amount).toFixed(2)}</span>
                </div>
              </div>

              <div className="change-info">
                <p>
                  <strong>Change:</strong> ${Math.abs(pendingUpdate.amount - pendingUpdate.currentBalance).toFixed(2)} 
                  <span className={pendingUpdate.amount > pendingUpdate.currentBalance ? 'increase' : 'decrease'}>
                    {pendingUpdate.amount > pendingUpdate.currentBalance ? ' (increase)' : ' (decrease)'}
                  </span>
                </p>
                <p><strong>Reason:</strong> {pendingUpdate.reason}</p>
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
