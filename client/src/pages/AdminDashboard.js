import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ totalFarmers: 0, totalBuyers: 0, totalProducts: 0, totalScans: 0 });
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const navigate = useNavigate();
    const userRole = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    useEffect(() => {
        // Security Check
        if (userRole !== 'admin') {
            navigate('/');
            return;
        }

        fetchData();
    }, [userRole, navigate]);

    const fetchData = async () => {
        if (!token) {
            console.error("❌ No token found in localStorage");
            navigate('/');
            return;
        }

        setLoading(true);
        try {
            console.log("📡 Admin Fetching Data...");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const [statsRes, usersRes, productsRes, reportsRes] = await Promise.all([
                axios.get(`${API_URL}/admin/stats`, config),
                axios.get(`${API_URL}/admin/users`, config),
                axios.get(`${API_URL}/admin/products`, config),
                axios.get(`${API_URL}/admin/reports`, config)
            ]);

            console.log("✅ Stats:", statsRes.data);
            console.log("✅ Users Count:", usersRes.data.length);

            setStats(statsRes.data);
            setUsers(usersRes.data);
            setProducts(productsRes.data);
            setReports(reportsRes.data);
        } catch (err) {
            console.error("❌ Admin Data Fetch Error:", err);
            if(err.response?.status === 401 || err.response?.status === 403) {
                console.warn("🔐 Unauthorized - Clearing session");
                localStorage.clear();
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.delete(`${API_URL}/admin/user/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(u => u._id !== id));
            alert("User deleted successfully");
        } catch (err) {
            alert("Error deleting user");
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to remove this product?")) return;
        try {
            await axios.delete(`${API_URL}/admin/product/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(products.filter(p => p._id !== id));
            alert("Product removed");
        } catch (err) {
            alert("Error deleting product");
        }
    };

    if (loading) return <div className="admin-loading">🛡️ Securing Admin Access...</div>;

    return (
        <div className="admin-dashboard">
            {/* SIDEBAR */}
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <span className="logo-icon">🌿</span>
                    <h2>Agri Admin</h2>
                </div>
                <nav>
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>📊 Overview</button>
                    <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>👥 Users</button>
                    <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>🌾 Products</button>
                    <button className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>🩺 AI Reports</button>
                </nav>
                <div className="admin-footer">
                    <button className="logout-btn" onClick={() => { localStorage.clear(); navigate('/'); }}>🚪 Logout</button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="admin-main">
                <header>
                    <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                    <div className="admin-user-info">
                        <span>Logged in as <b>Administrator</b></span>
                    </div>
                </header>

                <div className="admin-content">
                    {activeTab === 'overview' && (
                        <div className="overview-grid">
                            <div className="stat-card">
                                <div className="stat-icon">👨‍🌾</div>
                                <div className="stat-info">
                                    <h3>Total Farmers</h3>
                                    <p>{stats.totalFarmers}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🛒</div>
                                <div className="stat-info">
                                    <h3>Total Buyers</h3>
                                    <p>{stats.totalBuyers}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📦</div>
                                <div className="stat-info">
                                    <h3>Total Orders</h3>
                                    <p>{stats.totalOrders || 0}</p>
                                </div>
                            </div>
                            <div className="stat-card revenue">
                                <div className="stat-icon">💰</div>
                                <div className="stat-info">
                                    <h3>Total Revenue</h3>
                                    <p>₹{(stats.totalRevenue || 0).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="stat-card warning">
                                <div className="stat-icon">🚚</div>
                                <div className="stat-info">
                                    <h3>Pending Deliveries</h3>
                                    <p>{stats.pendingDeliveries || 0}</p>
                                </div>
                            </div>
                            <div className="stat-card danger">
                                <div className="stat-icon">❌</div>
                                <div className="stat-info">
                                    <h3>Failed Payments</h3>
                                    <p>{stats.failedPayments || 0}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🧪</div>
                                <div className="stat-info">
                                    <h3>AI Scans</h3>
                                    <p>{stats.totalScans}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Joined</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user._id} onClick={() => setSelectedUser(user)} style={{ cursor: 'pointer' }} className="user-row-clickable">
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td onClick={(e) => e.stopPropagation()}>
                                                <button className="delete-btn" onClick={() => handleDeleteUser(user._id)}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Category</th>
                                        <th>Farmer</th>
                                        <th>Price</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p._id}>
                                            <td>{p.name}</td>
                                            <td>{p.category}</td>
                                            <td>{p.farmer?.name || 'Unknown'}</td>
                                            <td>₹{p.price}/{p.unit}</td>
                                            <td>
                                                <button className="delete-btn" onClick={() => handleDeleteProduct(p._id)}>🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <div className="reports-grid">
                            {reports.map(report => (
                                <div className="report-card" key={report._id}>
                                    <div className="report-header">
                                        <span className="report-date">{new Date(report.timestamp).toLocaleDateString()}</span>
                                        <span className="report-conf">{(report.confidence * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="report-user">👤 {report.user?.name || 'Guest'}</div>
                                    <div className="report-diag">🩺 {report.diagnosisEn}</div>
                                    <p className="report-crop">📍 Crop: {report.crop}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>User Details</h2>
                            <button className="modal-close" onClick={() => setSelectedUser(null)}>&times;</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="detail-section">
                                <h3>Basic Information</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Name</label>
                                        <p>{selectedUser.name}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Email</label>
                                        <p>{selectedUser.email}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Role</label>
                                        <p><span className={`role-badge ${selectedUser.role}`}>{selectedUser.role}</span></p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Phone</label>
                                        <p>{selectedUser.phone || 'Not set'}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Location</label>
                                        <p>{selectedUser.location || 'Not set'}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Joined</label>
                                        <p>{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedUser.role === 'farmer' && (
                                <>
                                    <div className="detail-section">
                                        <h3>Farm Information</h3>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <label>Specialty</label>
                                                <p>{selectedUser.specialty || 'Not set'}</p>
                                            </div>
                                            <div className="detail-item">
                                                <label>About</label>
                                                <p>{selectedUser.about || 'Not set'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedUser.loanProfile && (
                                        <div className="detail-section">
                                            <h3>🏦 Loan Profile</h3>
                                            <div className="detail-grid">
                                                <div className="detail-item">
                                                    <label>Date of Birth</label>
                                                    <p>{selectedUser.loanProfile.dateOfBirth || 'Not set'}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Address Line 1</label>
                                                    <p>{selectedUser.loanProfile.addressLine1 || 'Not set'}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Address Line 2</label>
                                                    <p>{selectedUser.loanProfile.addressLine2 || 'Not set'}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Pincode</label>
                                                    <p>{selectedUser.loanProfile.pincode || 'Not set'}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Aadhaar Number</label>
                                                    <p>{selectedUser.loanProfile.aadhaarNumber || 'Not set'}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>PAN Number</label>
                                                    <p>{selectedUser.loanProfile.panNumber || 'Not set'}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Annual Income (Rs)</label>
                                                    <p>{selectedUser.loanProfile.annualIncome ? selectedUser.loanProfile.annualIncome.toLocaleString() : 'Not set'}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Requested Loan Amount (Rs)</label>
                                                    <p>{selectedUser.loanProfile.requestedLoanAmount ? selectedUser.loanProfile.requestedLoanAmount.toLocaleString() : 'Not set'}</p>
                                                </div>
                                                <div className="detail-item full-width">
                                                    <label>Loan Purpose</label>
                                                    <p>{selectedUser.loanProfile.loanPurpose || 'Not set'}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Bank Name</label>
                                                    <p>{selectedUser.loanProfile.bankName || 'Not set'}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Account Holder</label>
                                                    <p>{selectedUser.loanProfile.accountHolderName || 'Not set'}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Account Number</label>
                                                    <p>{selectedUser.loanProfile.accountNumber || 'Not set'}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>IFSC Code</label>
                                                    <p>{selectedUser.loanProfile.ifscCode || 'Not set'}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Land Area (Acres)</label>
                                                    <p>{selectedUser.loanProfile.landAreaAcres || 'Not set'}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Experience (Years)</label>
                                                    <p>{selectedUser.loanProfile.farmingExperienceYears || 'Not set'}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Primary Crops</label>
                                                    <p>{selectedUser.loanProfile.primaryCrops || 'Not set'}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Irrigation Type</label>
                                                    <p>{selectedUser.loanProfile.irrigationType || 'Not set'}</p>
                                                </div>
                                                <div className="detail-item">
                                                    <label>Consent to Loan Processing</label>
                                                    <p>{selectedUser.loanProfile.consentToLoanProcessing ? 'Yes' : 'No'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {selectedUser.role === 'buyer' && selectedUser.buyerProfile && (
                                <div className="detail-section">
                                    <h3>🛒 Business Profile</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label>Business Name</label>
                                            <p>{selectedUser.buyerProfile.businessName || 'Not set'}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Business Type</label>
                                            <p>{selectedUser.buyerProfile.businessType || 'Not set'}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>GST Number</label>
                                            <p>{selectedUser.buyerProfile.gstNumber || 'Not set'}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Years in Business</label>
                                            <p>{selectedUser.buyerProfile.yearsInBusiness || 'Not set'}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Monthly Purchase Volume (Rs)</label>
                                            <p>{selectedUser.buyerProfile.monthlyPurchaseVolume ? selectedUser.buyerProfile.monthlyPurchaseVolume.toLocaleString() : 'Not set'}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Preferred Categories</label>
                                            <p>{selectedUser.buyerProfile.preferredCategories || 'Not set'}</p>
                                        </div>
                                        <div className="detail-item">
                                            <label>Purchase Frequency</label>
                                            <p>{selectedUser.buyerProfile.purchaseFrequency || 'Not set'}</p>
                                        </div>
                                        <div className="detail-item full-width">
                                            <label>Delivery Address</label>
                                            <p>{selectedUser.buyerProfile.deliveryAddress || 'Not set'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-close" onClick={() => setSelectedUser(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
