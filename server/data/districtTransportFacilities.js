const tamilNaduDistricts = [
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
];

const seededFacilities = {
  Perambalur: [
    { id: 'mini_pickup', facilityName: 'Mini Pickup', vehicleType: 'Mahindra Bolero Pickup', etaHours: 8, price: 60 },
    { id: 'tractor_shared', facilityName: 'Shared Tractor Load', vehicleType: 'Swaraj 744 XT', etaHours: 12, price: 45 },
    { id: 'express_van', facilityName: 'Express Van', vehicleType: 'Tata Ace', etaHours: 6, price: 90 }
  ],
  Madurai: [
    { id: 'small_truck', facilityName: 'Small Truck', vehicleType: 'Ashok Leyland Dost', etaHours: 10, price: 80 },
    { id: 'express_pickup', facilityName: 'Express Pickup', vehicleType: 'Mahindra Bolero', etaHours: 7, price: 120 },
    { id: 'bulk_truck', facilityName: 'Bulk Transport', vehicleType: 'Eicher Pro 2055', etaHours: 14, price: 70 }
  ],
  Chennai: [
    { id: 'city_van', facilityName: 'City Delivery Van', vehicleType: 'Tata Ace Gold', etaHours: 5, price: 110 },
    { id: 'shared_city_truck', facilityName: 'Shared City Truck', vehicleType: 'Ashok Leyland Bada Dost', etaHours: 8, price: 75 },
    { id: 'priority_city', facilityName: 'Priority Dispatch', vehicleType: 'BharatBenz 1617R', etaHours: 4, price: 150 }
  ],
  Tiruchirappalli: [
    { id: 'market_pickup', facilityName: 'Market Pickup', vehicleType: 'Mahindra Bolero Pickup', etaHours: 7, price: 70 },
    { id: 'shared_tata_ace', facilityName: 'Shared Tata Ace', vehicleType: 'Tata Ace Gold', etaHours: 9, price: 55 },
    { id: 'express_market', facilityName: 'Express Market Delivery', vehicleType: 'Tata 407', etaHours: 6, price: 95 }
  ],
  Salem: [
    { id: 'farm_to_city', facilityName: 'Farm to City Truck', vehicleType: 'Eicher 11.10', etaHours: 11, price: 85 },
    { id: 'shared_tractor', facilityName: 'Shared Tractor Service', vehicleType: 'Mahindra Tractor', etaHours: 13, price: 50 },
    { id: 'fast_pickup', facilityName: 'Fast Pickup', vehicleType: 'Tata Ace', etaHours: 7, price: 105 }
  ],
  Coimbatore: [
    { id: 'coimbatore_van', facilityName: 'Local Van Service', vehicleType: 'Ashok Leyland Dost', etaHours: 6, price: 65 },
    { id: 'regional_truck', facilityName: 'Regional Truck', vehicleType: 'Tata 407', etaHours: 10, price: 90 },
    { id: 'express_regional', facilityName: 'Express Regional', vehicleType: 'Eicher Pro', etaHours: 7, price: 125 }
  ],
  Vellore: [
    { id: 'standard_pickup', facilityName: 'Standard Pickup', vehicleType: 'Mahindra Bolero', etaHours: 8, price: 60 },
    { id: 'shared_van', facilityName: 'Shared Van', vehicleType: 'Tata Ace', etaHours: 10, price: 50 },
    { id: 'priority_pickup', facilityName: 'Priority Pickup', vehicleType: 'Ashok Leyland Dost', etaHours: 6, price: 95 }
  ]
};

const generatedTemplates = [
  { id: 'shared', facilityName: 'Shared Transport', vehicleType: 'Mini Truck', etaHours: 12, basePrice: 55 },
  { id: 'standard', facilityName: 'Standard Delivery', vehicleType: 'Pickup Van', etaHours: 9, basePrice: 80 },
  { id: 'express', facilityName: 'Express Delivery', vehicleType: 'Express Van', etaHours: 6, basePrice: 115 }
];

const makeDistrictId = (districtName) => districtName.toLowerCase().replace(/\s+/g, '_');

const buildGeneratedFacilities = (districtName, districtIndex) => {
  const districtId = makeDistrictId(districtName);
  const priceOffset = (districtIndex % 7) * 5;
  const etaOffset = districtIndex % 3;

  return generatedTemplates.map((tpl, idx) => ({
    id: `${districtId}_${tpl.id}`,
    facilityName: tpl.facilityName,
    vehicleType: tpl.vehicleType,
    etaHours: tpl.etaHours + etaOffset,
    price: tpl.basePrice + priceOffset + (idx * 5)
  }));
};

const districtTransportFacilities = tamilNaduDistricts.reduce((acc, districtName, districtIndex) => {
  acc[districtName] = seededFacilities[districtName] || buildGeneratedFacilities(districtName, districtIndex);
  return acc;
}, {});

// Aliases for common district spellings/short names used by users.
districtTransportFacilities.Trichy = districtTransportFacilities.Tiruchirappalli;
districtTransportFacilities.Tuticorin = districtTransportFacilities.Thoothukudi;
districtTransportFacilities.Kanyakumari = districtTransportFacilities.Kanniyakumari;

const defaultFacilities = [
  { id: 'default_shared', facilityName: 'Shared Transport', vehicleType: 'Mini Truck', etaHours: 12, price: 65 },
  { id: 'default_standard', facilityName: 'Standard Delivery', vehicleType: 'Pickup Van', etaHours: 9, price: 85 },
  { id: 'default_express', facilityName: 'Express Delivery', vehicleType: 'Express Van', etaHours: 6, price: 120 }
];

const availableDistricts = tamilNaduDistricts;

const findDistrictFacilities = (districtName = '') => {
  const normalizedInput = districtName.trim().toLowerCase();
  if (!normalizedInput) {
    return { matchedDistrict: 'General', facilities: defaultFacilities };
  }

  const matchedDistrict = Object.keys(districtTransportFacilities).find((district) =>
    district.toLowerCase() === normalizedInput || district.toLowerCase().includes(normalizedInput)
  );

  if (!matchedDistrict) {
    return { matchedDistrict: 'General', facilities: defaultFacilities };
  }

  return { matchedDistrict, facilities: districtTransportFacilities[matchedDistrict] };
};

module.exports = {
  districtTransportFacilities,
  defaultFacilities,
  findDistrictFacilities,
  availableDistricts
};
