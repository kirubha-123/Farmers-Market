import { useEffect, useState } from 'react';
import { api } from '../api';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    location: '',
    phone: '',
    about: '',
    specialty: '',
    dateOfBirth: '',
    addressLine1: '',
    addressLine2: '',
    pincode: '',
    aadhaarNumber: '',
    panNumber: '',
    annualIncome: '',
    requestedLoanAmount: '',
    loanPurpose: '',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    landAreaAcres: '',
    farmingExperienceYears: '',
    primaryCrops: '',
    irrigationType: '',
    businessName: '',
    businessType: '',
    gstNumber: '',
    yearsInBusiness: '',
    monthlyPurchaseVolume: '',
    preferredCategories: '',
    purchaseFrequency: '',
    deliveryAddress: '',
    consentToLoanProcessing: false,
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      const loan = storedUser.loanProfile || {};
      const buyer = storedUser.buyerProfile || {};
      setUser(storedUser);
      setEditForm({
        name: storedUser.name || '',
        email: storedUser.email || '',
        location: storedUser.location || '',
        phone: storedUser.phone || '',
        about: storedUser.about || '',
        specialty: storedUser.specialty || '',
        dateOfBirth: loan.dateOfBirth || '',
        addressLine1: loan.addressLine1 || '',
        addressLine2: loan.addressLine2 || '',
        pincode: loan.pincode || '',
        aadhaarNumber: loan.aadhaarNumber || '',
        panNumber: loan.panNumber || '',
        annualIncome: loan.annualIncome || '',
        requestedLoanAmount: loan.requestedLoanAmount || '',
        loanPurpose: loan.loanPurpose || '',
        bankName: loan.bankName || '',
        accountHolderName: loan.accountHolderName || '',
        accountNumber: loan.accountNumber || '',
        ifscCode: loan.ifscCode || '',
        landAreaAcres: loan.landAreaAcres || '',
        farmingExperienceYears: loan.farmingExperienceYears || '',
        primaryCrops: loan.primaryCrops || '',
        irrigationType: loan.irrigationType || '',
        businessName: buyer.businessName || '',
        businessType: buyer.businessType || '',
        gstNumber: buyer.gstNumber || '',
        yearsInBusiness: buyer.yearsInBusiness || '',
        monthlyPurchaseVolume: buyer.monthlyPurchaseVolume || '',
        preferredCategories: buyer.preferredCategories || '',
        purchaseFrequency: buyer.purchaseFrequency || '',
        deliveryAddress: buyer.deliveryAddress || '',
        consentToLoanProcessing: Boolean(loan.consentToLoanProcessing),
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm({ ...editForm, [name]: type === 'checkbox' ? checked : value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      const toNumberOrUndefined = (value) => {
        if (value === '' || value === null || value === undefined) return undefined;
        const numeric = Number(value);
        return Number.isNaN(numeric) ? undefined : numeric;
      };

      const payload = {
        name: editForm.name,
        location: editForm.location,
        phone: editForm.phone,
        about: editForm.about,
        specialty: editForm.specialty,
      };

      if (user.role === 'farmer') {
        payload.loanProfile = {
          dateOfBirth: editForm.dateOfBirth,
          addressLine1: editForm.addressLine1,
          addressLine2: editForm.addressLine2,
          pincode: editForm.pincode,
          aadhaarNumber: editForm.aadhaarNumber,
          panNumber: editForm.panNumber,
          annualIncome: toNumberOrUndefined(editForm.annualIncome),
          requestedLoanAmount: toNumberOrUndefined(editForm.requestedLoanAmount),
          loanPurpose: editForm.loanPurpose,
          bankName: editForm.bankName,
          accountHolderName: editForm.accountHolderName,
          accountNumber: editForm.accountNumber,
          ifscCode: editForm.ifscCode,
          landAreaAcres: toNumberOrUndefined(editForm.landAreaAcres),
          farmingExperienceYears: toNumberOrUndefined(editForm.farmingExperienceYears),
          primaryCrops: editForm.primaryCrops,
          irrigationType: editForm.irrigationType,
          consentToLoanProcessing: editForm.consentToLoanProcessing,
        };
      } else {
        payload.buyerProfile = {
          businessName: editForm.businessName,
          businessType: editForm.businessType,
          gstNumber: editForm.gstNumber,
          yearsInBusiness: toNumberOrUndefined(editForm.yearsInBusiness),
          monthlyPurchaseVolume: toNumberOrUndefined(editForm.monthlyPurchaseVolume),
          preferredCategories: editForm.preferredCategories,
          purchaseFrequency: editForm.purchaseFrequency,
          deliveryAddress: editForm.deliveryAddress,
        };
      }
      
      const res = await api.put('/auth/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local storage and state with new data
      const updatedUser = { ...user, ...res.data }; 
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setShowEditModal(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-emerald-50">


      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-emerald-900 mb-6">My Profile</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-700">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-900">{user.name}</h2>
                <p className="text-emerald-600 capitalize font-medium">{user.role}</p>
                {user.role === 'farmer' && user.specialty && (
                  <p className="text-xs text-emerald-700 mt-1 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                    Specialty: {user.specialty}
                  </p>
                )}
              </div>
            </div>
            
            {/* Edit Button */}
            <button 
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition"
            >
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-6">
            <div className="p-4 bg-emerald-50/50 rounded-xl">
              <p className="text-emerald-900/60 mb-1">Email Address</p>
              <p className="font-medium text-emerald-900">{user.email}</p>
            </div>
            <div className="p-4 bg-emerald-50/50 rounded-xl">
              <p className="text-emerald-900/60 mb-1">Location</p>
              <p className="font-medium text-emerald-900">{user.location || 'Not set'}</p>
            </div>
            <div className="p-4 bg-emerald-50/50 rounded-xl">
              <p className="text-emerald-900/60 mb-1">Phone Number</p>
              <p className="font-medium text-emerald-900">{user.phone || 'Not set'}</p>
            </div>
            {user.role === 'farmer' && (
              <div className="p-4 bg-emerald-50/50 rounded-xl">
                <p className="text-emerald-900/60 mb-1">Specialty</p>
                <p className="font-medium text-emerald-900">{user.specialty || 'Not specified'}</p>
              </div>
            )}
            {user.role === 'farmer' ? (
              <>
                <div className="p-4 bg-emerald-50/50 rounded-xl">
                  <p className="text-emerald-900/60 mb-1">Loan Purpose</p>
                  <p className="font-medium text-emerald-900">{user.loanProfile?.loanPurpose || 'Not set'}</p>
                </div>
                <div className="p-4 bg-emerald-50/50 rounded-xl">
                  <p className="text-emerald-900/60 mb-1">Requested Loan Amount</p>
                  <p className="font-medium text-emerald-900">
                    {user.loanProfile?.requestedLoanAmount ? `Rs ${user.loanProfile.requestedLoanAmount}` : 'Not set'}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-emerald-50/50 rounded-xl">
                  <p className="text-emerald-900/60 mb-1">Business Name</p>
                  <p className="font-medium text-emerald-900">{user.buyerProfile?.businessName || 'Not set'}</p>
                </div>
                <div className="p-4 bg-emerald-50/50 rounded-xl">
                  <p className="text-emerald-900/60 mb-1">Monthly Purchase Volume</p>
                  <p className="font-medium text-emerald-900">
                    {user.buyerProfile?.monthlyPurchaseVolume ? `Rs ${user.buyerProfile.monthlyPurchaseVolume}` : 'Not set'}
                  </p>
                </div>
              </>
            )}
          </div>

          {user.role === 'farmer' && (
            <div className="mt-4 border-t border-emerald-50 pt-4">
              <p className="text-sm text-emerald-900/60 mb-1 uppercase tracking-wider font-bold text-[10px]">About Me</p>
              <p className="text-emerald-900 italic leading-relaxed">
                {user.about || 'No about information provided yet.'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-emerald-50/50 sticky top-0">
              <h3 className="text-lg font-bold text-emerald-900">Edit Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {user.role === 'farmer' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Specialty</label>
                  <input 
                    name="specialty"
                    value={editForm.specialty}
                    onChange={handleInputChange}
                    placeholder="e.g. Organic Grains"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                <input 
                  name="location"
                  value={editForm.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Perambalur"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                <input 
                  name="phone"
                  value={editForm.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {user.role === 'farmer' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">About Me</label>
                  <textarea 
                    name="about"
                    value={editForm.about}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Tell buyers about your farm and experience..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  />
                </div>
              )}

              {user.role === 'farmer' ? (
                <>
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-emerald-900 mb-2">Loan Readiness Details</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={editForm.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Address Line 1</label>
                    <input
                      name="addressLine1"
                      value={editForm.addressLine1}
                      onChange={handleInputChange}
                      placeholder="House / Street"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Address Line 2</label>
                    <input
                      name="addressLine2"
                      value={editForm.addressLine2}
                      onChange={handleInputChange}
                      placeholder="Area / Landmark"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Pincode</label>
                    <input
                      name="pincode"
                      value={editForm.pincode}
                      onChange={handleInputChange}
                      placeholder="6-digit pincode"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Aadhaar Number</label>
                      <input
                        name="aadhaarNumber"
                        value={editForm.aadhaarNumber}
                        onChange={handleInputChange}
                        placeholder="For verification"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">PAN Number</label>
                      <input
                        name="panNumber"
                        value={editForm.panNumber}
                        onChange={handleInputChange}
                        placeholder="For underwriting"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Annual Income (Rs)</label>
                      <input
                        type="number"
                        min="0"
                        name="annualIncome"
                        value={editForm.annualIncome}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Requested Loan Amount (Rs)</label>
                      <input
                        type="number"
                        min="0"
                        name="requestedLoanAmount"
                        value={editForm.requestedLoanAmount}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Loan Purpose</label>
                    <textarea
                      name="loanPurpose"
                      value={editForm.loanPurpose}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Expansion, machinery, working capital, storage, etc."
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                    />
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-emerald-900 mb-2">Bank Details</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Bank Name</label>
                    <input
                      name="bankName"
                      value={editForm.bankName}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Account Holder Name</label>
                    <input
                      name="accountHolderName"
                      value={editForm.accountHolderName}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Account Number</label>
                      <input
                        name="accountNumber"
                        value={editForm.accountNumber}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">IFSC Code</label>
                      <input
                        name="ifscCode"
                        value={editForm.ifscCode}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-emerald-900 mb-2">Farm Details</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Land Area (Acres)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="landAreaAcres"
                        value={editForm.landAreaAcres}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Experience (Years)</label>
                      <input
                        type="number"
                        min="0"
                        name="farmingExperienceYears"
                        value={editForm.farmingExperienceYears}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Primary Crops</label>
                    <input
                      name="primaryCrops"
                      value={editForm.primaryCrops}
                      onChange={handleInputChange}
                      placeholder="e.g. Tomato, Onion, Brinjal"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Irrigation Type</label>
                    <input
                      name="irrigationType"
                      value={editForm.irrigationType}
                      onChange={handleInputChange}
                      placeholder="Drip, borewell, canal, rainfed"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-emerald-900 mb-2">Business Details</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Business Name</label>
                    <input
                      name="businessName"
                      value={editForm.businessName}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Business Type</label>
                      <input
                        name="businessType"
                        value={editForm.businessType}
                        onChange={handleInputChange}
                        placeholder="Retail, Wholesale, Processing"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Years in Business</label>
                      <input
                        type="number"
                        min="0"
                        name="yearsInBusiness"
                        value={editForm.yearsInBusiness}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">GST Number</label>
                      <input
                        name="gstNumber"
                        value={editForm.gstNumber}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Monthly Purchase Volume (Rs)</label>
                    <input
                      type="number"
                      min="0"
                      name="monthlyPurchaseVolume"
                      value={editForm.monthlyPurchaseVolume}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Preferred Categories</label>
                    <input
                      name="preferredCategories"
                      value={editForm.preferredCategories}
                      onChange={handleInputChange}
                      placeholder="Vegetables, Fruits, Grains"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Purchase Frequency</label>
                    <input
                      name="purchaseFrequency"
                      value={editForm.purchaseFrequency}
                      onChange={handleInputChange}
                      placeholder="Daily / Weekly / Monthly"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Delivery Address</label>
                    <textarea
                      name="deliveryAddress"
                      value={editForm.deliveryAddress}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {user.role === 'farmer' && (
                <label className="flex items-start gap-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    name="consentToLoanProcessing"
                    checked={editForm.consentToLoanProcessing}
                    onChange={handleInputChange}
                    className="mt-0.5"
                  />
                  I consent to use these details for loan eligibility checks and future extraction.
                </label>
              )}

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
