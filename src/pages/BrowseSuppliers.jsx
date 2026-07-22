import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';
import apiClient from '../api/client';

const DISTRICTS = [
  'Chumoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng',
  'Meluri', 'Mokokchung', 'Mon', 'Niuland', 'Noklak',
  'Peren', 'Phek', 'Shamator', 'Tuensang', 'Tseminyu',
  'Wokha', 'Zunheboto',
];

export default function BrowseSuppliers() {
  const navigate = useNavigate();
  const [district, setDistrict] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    apiClient
      .get('/water-suppliers', { params: district ? { district } : {} })
      .then((res) => setSuppliers(res.data.suppliers))
      .catch(() => setError('Could not load suppliers.'))
      .finally(() => setLoading(false));
  }, [district]);

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <h1>Browse Suppliers</h1>
        <p>Verified water suppliers, filterable by district.</p>

        <label htmlFor="district-filter">District</label>
        <select
          id="district-filter"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          style={{ maxWidth: 300, marginBottom: '1.5rem' }}
        >
          <option value="">All districts</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <p>Loading...</p>
        ) : suppliers.length === 0 ? (
          <p>No verified suppliers found{district ? ` in ${district}` : ''}.</p>
        ) : (
          <div className="dashboard-cards">
            {suppliers.map((s) => (
              <div key={s.id} className="dashboard-card">
                <h3>{s.business_name}</h3>
                <p>{s.district}</p>
                {s.service_area && <p>{s.service_area}</p>}
                <p>₹{s.rate_per_liter}/liter</p>
                <p>{s.tankers?.length || 0} tanker(s)</p>
                <button
                  onClick={() =>
                    navigate('/water/order-water', {
                      state: { preferredSupplierId: s.id, preferredDistrict: s.district, preferredSupplierName: s.business_name },
                    })
                  }
                >
                  Order from this supplier
                </button>
              </div>
            ))}
          </div>
        )}

        <BackButton />
      </div>
    </div>
  );
}
