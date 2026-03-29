import { useEffect, useState } from 'react';
import { api } from '../api';

const fallbackDistricts = [
  'Ariyalur',
  'Chengalpattu',
  'Chennai',
  'Coimbatore',
  'Cuddalore',
  'Dharmapuri',
  'Dindigul',
  'Erode',
  'Kallakurichi',
  'Kancheepuram',
  'Kanniyakumari',
  'Karur',
  'Krishnagiri',
  'Madurai',
  'Mayiladuthurai',
  'Nagapattinam',
  'Namakkal',
  'Nilgiris',
  'Perambalur',
  'Pudukkottai',
  'Ramanathapuram',
  'Ranipet',
  'Salem',
  'Sivaganga',
  'Tenkasi',
  'Thanjavur',
  'Theni',
  'Thoothukudi',
  'Tiruchirappalli',
  'Tirunelveli',
  'Tirupathur',
  'Tiruppur',
  'Tiruvallur',
  'Tiruvannamalai',
  'Tiruvarur',
  'Vellore',
  'Viluppuram',
  'Virudhunagar'
].sort((a, b) => a.localeCompare(b));

const buildFallbackFacilities = (districtName) => {
  const normalized = districtName || 'General';
  const offset = normalized.length % 6;

  return [
    {
      id: `${normalized.toLowerCase().replace(/\s+/g, '_')}_shared`,
      facilityName: 'Shared Transport',
      vehicleType: 'Mini Truck',
      etaHours: 12 + (offset % 2),
      price: 60 + offset * 5
    },
    {
      id: `${normalized.toLowerCase().replace(/\s+/g, '_')}_standard`,
      facilityName: 'Standard Delivery',
      vehicleType: 'Pickup Van',
      etaHours: 9 + (offset % 2),
      price: 85 + offset * 5
    },
    {
      id: `${normalized.toLowerCase().replace(/\s+/g, '_')}_express`,
      facilityName: 'Express Delivery',
      vehicleType: 'Express Van',
      etaHours: 6 + (offset % 2),
      price: 115 + offset * 5
    }
  ];
};

function TransportPage() {
  const defaultDistrict = fallbackDistricts[0];
  const [district, setDistrict] = useState(defaultDistrict);
  const [districtSearch, setDistrictSearch] = useState(defaultDistrict);
  const [districtOptions, setDistrictOptions] = useState(fallbackDistricts);
  const [transportData, setTransportData] = useState({
    districtMatched: defaultDistrict,
    facilities: buildFallbackFacilities(defaultDistrict)
  });
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [transportProfiles, setTransportProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const districtAliasForSearch = {
    Tiruchirappalli: 'Trichy',
    Thoothukudi: 'Tuticorin',
    Kanniyakumari: 'Kanyakumari'
  };

  const formatDeparture = (value) => {
    if (!value) return 'Not specified';
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return 'Not specified';
    return dt.toLocaleString('en-IN');
  };

  const toDialNumber = (value = '') => value.toString().replace(/[^+\d]/g, '');

  const toWhatsAppNumber = (value = '') => {
    const digits = value.toString().replace(/\D/g, '');
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await api.get('/logistics/districts');
        const districtsFromApi = Array.isArray(res.data)
          ? res.data
          : (res.data?.districts || []);
        const districts = districtsFromApi.length
          ? districtsFromApi.slice().sort((a, b) => a.localeCompare(b))
          : fallbackDistricts;
        setDistrictOptions(districts);
        if (districts.length > 0) {
          setDistrict(districts[0]);
          setDistrictSearch(districts[0]);
        }
      } catch (err) {
        console.error('Error fetching district list:', err);
        setDistrictOptions(fallbackDistricts);
        setDistrict(defaultDistrict);
        setDistrictSearch(defaultDistrict);
      }
    };

    fetchDistricts();
  }, []);

  useEffect(() => {
    const fetchTransportFacilities = async () => {
      if (!district) return;
      try {
        setLoading(true);
        const res = await api.get('/logistics/district-facilities', {
          params: { district }
        });

        setTransportData({
          districtMatched: res.data?.districtMatched || district,
          facilities: res.data?.facilities || []
        });
      } catch (err) {
        console.error('Error fetching district transport facilities:', err);
        setTransportData({
          districtMatched: district,
          facilities: buildFallbackFacilities(district)
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransportFacilities();
  }, [district]);

  useEffect(() => {
    const fetchTransportProfiles = async () => {
      if (!district) return;

      const origin = districtAliasForSearch[district] || district;

      try {
        setProfilesLoading(true);
        const res = await api.get('/logistics', { params: { origin } });
        const profiles = Array.isArray(res.data) ? res.data : [];
        setTransportProfiles(profiles);
        setSelectedProfile(profiles.length > 0 ? profiles[0] : null);
      } catch (err) {
        console.error('Error fetching transport profiles:', err);
        setTransportProfiles([]);
        setSelectedProfile(null);
      } finally {
        setProfilesLoading(false);
      }
    };

    fetchTransportProfiles();
  }, [district]);

  useEffect(() => {
    if (!districtSearch || districtOptions.length === 0) return;
    const firstMatch = districtOptions.find((option) =>
      option.toLowerCase().includes(districtSearch.toLowerCase())
    );
    if (firstMatch && firstMatch !== district) {
      setDistrict(firstMatch);
    }
  }, [districtSearch, districtOptions, district]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="bg-emerald-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Transport Facilities</h1>
          <p className="text-lg md:text-xl text-emerald-100 max-w-2xl mx-auto">
            District-wise transport options with fixed delivery pricing.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-emerald-900">District-wise Transport Facilities</h2>
              <p className="text-emerald-700 mt-1">Select a district to check available vehicles and transport charges.</p>
            </div>

            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setDistrictSearch(e.target.value);
              }}
              className="px-4 py-2 rounded-xl border border-emerald-200 text-emerald-900 bg-emerald-50 font-medium"
            >
              {districtOptions.length === 0 && <option value="">Loading...</option>}
              {districtOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <input
              type="text"
              value={districtSearch}
              onChange={(e) => setDistrictSearch(e.target.value)}
              placeholder="Search district"
              className="w-full md:w-80 px-4 py-2 rounded-xl border border-emerald-200 text-emerald-900 bg-white"
            />
          </div>

          {loading ? (
            <p className="text-emerald-700">Loading transport facilities...</p>
          ) : transportData.facilities.length === 0 ? (
            <p className="text-emerald-700">No transport facilities available for this district.</p>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Showing results for <span className="font-semibold text-emerald-700">{transportData.districtMatched}</span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {transportData.facilities.map((facility) => (
                  <div key={facility.id} className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <h3 className="font-bold text-emerald-900">{facility.facilityName}</h3>
                    <p className="text-sm text-gray-700 mt-1">Vehicle: {facility.vehicleType}</p>
                    <p className="text-sm text-gray-700">ETA: {facility.etaHours} hrs</p>
                    <div className="mt-3 inline-block bg-emerald-600 text-white text-sm px-3 py-1 rounded-lg font-semibold">
                      Price: Rs.{facility.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 border-t border-emerald-100 pt-6">
            <h3 className="text-xl font-bold text-emerald-900">Transport Profiles</h3>
            <p className="text-emerald-700 mt-1 mb-4">
              View driver and vehicle details for {district} transport routes.
            </p>

            {profilesLoading ? (
              <p className="text-emerald-700">Loading transport profiles...</p>
            ) : transportProfiles.length === 0 ? (
              <p className="text-emerald-700">No transport profiles available for this district currently.</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-1 space-y-3">
                  {transportProfiles.map((profile) => {
                    const profileKey = `${profile.vehicleNumber}-${profile.driverPhone}`;
                    const isActive = selectedProfile && selectedProfile.vehicleNumber === profile.vehicleNumber;

                    return (
                      <button
                        key={profileKey}
                        type="button"
                        onClick={() => setSelectedProfile(profile)}
                        className={`w-full text-left rounded-xl border p-3 transition ${
                          isActive
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-emerald-100 bg-white hover:border-emerald-300'
                        }`}
                      >
                        <p className="font-semibold text-emerald-900">{profile.driverName}</p>
                        <p className="text-sm text-gray-700">{profile.vehicleType}</p>
                        <p className="text-xs text-gray-500 mt-1">{profile.origin}{' -> '}{profile.destination}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="lg:col-span-2 rounded-xl border border-emerald-100 bg-emerald-50/50 p-5">
                  {selectedProfile ? (
                    <>
                      <h4 className="text-lg font-bold text-emerald-900">{selectedProfile.driverName}</h4>
                      <p className="text-sm text-gray-700 mt-1">Phone: {selectedProfile.driverPhone}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm text-gray-800">
                        <p><span className="font-semibold">Vehicle:</span> {selectedProfile.vehicleType}</p>
                        <p><span className="font-semibold">Vehicle No:</span> {selectedProfile.vehicleNumber}</p>
                        <p><span className="font-semibold">Route:</span> {selectedProfile.origin}{' -> '}{selectedProfile.destination}</p>
                        <p><span className="font-semibold">Departure:</span> {formatDeparture(selectedProfile.departureTime)}</p>
                        <p><span className="font-semibold">Capacity:</span> {selectedProfile.capacity} tons</p>
                        <p><span className="font-semibold">Current Load:</span> {selectedProfile.currentLoad} tons</p>
                        <p><span className="font-semibold">Price Per Kg:</span> Rs.{selectedProfile.pricePerKg}</p>
                        <p><span className="font-semibold">Status:</span> {selectedProfile.status}</p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <a
                          href={`tel:${toDialNumber(selectedProfile.driverPhone)}`}
                          className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                          Call Driver
                        </a>
                        <a
                          href={`https://wa.me/${toWhatsAppNumber(selectedProfile.driverPhone)}?text=${encodeURIComponent(`Hello ${selectedProfile.driverName}, I need transport support for ${selectedProfile.origin} to ${selectedProfile.destination}.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-lg border border-emerald-600 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                        >
                          WhatsApp Chat
                        </a>
                      </div>
                    </>
                  ) : (
                    <p className="text-emerald-700">Select a profile to view details.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransportPage;
