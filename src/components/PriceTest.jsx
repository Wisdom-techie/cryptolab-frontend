import { useState, useEffect } from 'react';
import { cryptoAPI } from '../utils/api';

export default function PriceTest() {
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);
  const [prices, setPrices] = useState(null);

  const runTest = async () => {
    setTesting(true);
    setTestResults([]);
    
    const results = [];
    
    // Test 1: Check if axios is installed
    results.push({
      test: 'Axios installed',
      status: typeof cryptoAPI !== 'undefined' ? '✅ Pass' : '❌ Fail',
      message: typeof cryptoAPI !== 'undefined' ? 'API client ready' : 'Import failed'
    });

    // Test 2: Try fetching prices
    try {
      results.push({
        test: 'Fetching prices',
        status: '🔄 Running',
        message: 'Attempting to fetch...'
      });
      
      const response = await cryptoAPI.getLivePrices();
      
      if (response && response.data) {
        const priceCount = Object.keys(response.data.prices || {}).length;
        const validPrices = Object.keys(response.data.prices || {}).filter(
          k => response.data.prices[k].price > 0
        ).length;
        
        results.push({
          test: 'API Response',
          status: validPrices > 0 ? '✅ Pass' : '⚠️ Warning',
          message: `Got ${validPrices}/${priceCount} valid prices from ${response.data.source || 'unknown'}`
        });
        
        setPrices(response.data.prices);
      } else {
        results.push({
          test: 'API Response',
          status: '❌ Fail',
          message: 'Invalid response structure'
        });
      }
    } catch (error) {
      results.push({
        test: 'API Fetch',
        status: '❌ Fail',
        message: error.message
      });
    }

    setTestResults(results);
    setTesting(false);
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <div style={{
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '2rem',
      background: 'var(--card-bg, #1a1a1a)',
      borderRadius: '12px',
      color: 'var(--text-color, #fff)'
    }}>
      <h2 style={{ marginBottom: '1rem' }}>🔍 Price API Test</h2>
      
      <button
        onClick={runTest}
        disabled={testing}
        style={{
          padding: '0.75rem 1.5rem',
          background: testing ? '#666' : '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: testing ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        {testing ? '⏳ Testing...' : '🔄 Run Test'}
      </button>

      <div style={{ marginTop: '1rem' }}>
        <h3>Test Results:</h3>
        {testResults.map((result, index) => (
          <div
            key={index}
            style={{
              padding: '1rem',
              margin: '0.5rem 0',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              borderLeft: `4px solid ${
                result.status.includes('✅') ? '#10b981' :
                result.status.includes('❌') ? '#ef4444' :
                result.status.includes('⚠️') ? '#f59e0b' :
                '#6366f1'
              }`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong>{result.test}</strong>
              <span>{result.status}</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
              {result.message}
            </div>
          </div>
        ))}
      </div>

      {prices && Object.keys(prices).length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Sample Prices:</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            {Object.entries(prices).slice(0, 6).map(([symbol, data]) => (
              <div
                key={symbol}
                style={{
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {symbol}
                </div>
                <div style={{ fontSize: '1.5rem', color: '#10b981' }}>
                  ${data.price.toLocaleString()}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: data.change24h >= 0 ? '#10b981' : '#ef4444',
                  marginTop: '0.5rem'
                }}>
                  {data.change24h >= 0 ? '+' : ''}{data.change24h.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: 'rgba(99, 102, 241, 0.1)',
        borderRadius: '8px',
        fontSize: '0.9rem'
      }}>
        <strong>Instructions:</strong>
        <ol style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
          <li>Check the test results above</li>
          <li>If all tests pass (✅), your API is working!</li>
          <li>If tests fail (❌), check the error messages</li>
          <li>Open browser console (F12) for detailed logs</li>
        </ol>
      </div>
    </div>
  );
}