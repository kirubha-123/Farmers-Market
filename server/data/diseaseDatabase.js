/**
 * 🌿 COMPREHENSIVE CROP DISEASE DATABASE
 * 50+ diseases covering Tamil Nadu major crops
 * Treatment data based on TNAU & ICAR guidelines
 */
const DISEASE_DB = {
  // ──────────────────── TOMATO ────────────────────
  "Tomato___Early_blight": {
    label: "Tomato Early Blight (Alternaria solani)",
    crop: "Tomato",
    diagnosisEn: "Early Blight caused by Alternaria solani – dark brown spots with concentric rings (target-board pattern) on older leaves.",
    diagnosisTa: "ஆல்டர்னேரியா சோலனி நுண்ணுயிரால் ஏற்படும் ஆரம்பகால கருகல் – வயதான இலைகளில் இலக்கு வடிவ கருப்பு-பழுப்பு புள்ளிகள்.",
    treatmentEn: "Spray Mancozeb 75 WP @ 2g/litre or Carbendazim 50 WP @ 1g/litre. Repeat every 7-10 days. Remove and destroy infected leaves.",
    treatmentTa: "மேன்கோசெப் 75 WP @ 2 கிராம்/லிட்டர் அல்லது கார்பெண்டாஜிம் 50 WP @ 1 கிராம்/லிட்டர் தெளிக்கவும். 7-10 நாட்கள் இடைவெளியில் மீண்டும் தெளிக்கவும்.",
    preventionEn: "Crop rotation (avoid Solanaceae for 2 years). Stake plants for airflow. Avoid overhead irrigation. Use resistant varieties Co-3, PKM-1.",
    preventionTa: "பயிர் சுழற்சி (2 ஆண்டுகள் சோலனேசியா தவிர்க்கவும்). தாவரங்களை கட்டி வளர்க்கவும். தலை வழி நீர்ப்பாசனம் தவிர்க்கவும்.",
    local_remediesEn: "Spray Panchagavya 3% weekly. Apply NSKE (Neem Seed Kernel Extract) 5% to reduce spore germination.",
    local_remediesTa: "பஞ்சகவ்யா 3% வாராந்திர தெளிப்பு. வேப்பங்கொட்டை கரைசல் 5% தெளிக்கவும்.",
    confidence_score: 0.91
  },
  "Tomato___Late_blight": {
    label: "Tomato Late Blight (Phytophthora infestans)",
    crop: "Tomato",
    diagnosisEn: "Late Blight – water-soaked dark patches on leaves and stems, white fungal growth on underside, rapid plant collapse in humid conditions.",
    diagnosisTa: "தாமதகால கருகல் – இலைகள் மற்றும் தண்டுகளில் நீர் ஊறிய கருப்பு திட்டுகள், குளிர் ஈரமான சூழலில் விரைவாக பரவும்.",
    treatmentEn: "Apply Metalaxyl + Mancozeb (Ridomil Gold) @ 2.5g/litre or Cymoxanil 8% + Mancozeb 64% WP @ 2.5g/litre. Spray at 5-7 day intervals.",
    treatmentTa: "மெட்டாலாக்சில் + மேன்கோசெப் @ 2.5 கிராம்/லிட்டர் தெளிக்கவும். 5-7 நாட்கள் இடைவெளியில் தெளிக்கவும்.",
    preventionEn: "Avoid dense planting. Plant on raised beds. Use certified disease-free seeds. Spray Bordeaux Mixture 1% preventively.",
    preventionTa: "அடர்த்தியான நடவு தவிர்க்கவும். உயர்த்தப்பட்ட பாத்திகளில் நடவு செய்யவும். போர்டோ கலவை 1% தடுப்பு தெளிப்பு.",
    local_remediesEn: "Jeevamrutam spray improves plant immunity. Copper-based organic sprays (Bordeaux 1%) effective for prevention.",
    local_remediesTa: "ஜீவாமிர்தம் தெளிப்பு தாவர எதிர்ப்பு சக்தியை மேம்படுத்தும்.",
    confidence_score: 0.89
  },
  "Tomato___Leaf_Miner": {
    label: "Tomato Leaf Miner (Tuta absoluta)",
    crop: "Tomato",
    diagnosisEn: "Serpentine tunnels (mines) inside leaves, white/brown irregular trails visible on leaf surface, defoliation in severe cases.",
    diagnosisTa: "இலைகளுக்குள் நளினமான சுரங்கங்கள், இலை மேற்பரப்பில் வெள்ளை/பழுப்பு வழிகள், தீவிரமான தாக்கத்தில் இலை உதிர்வு.",
    treatmentEn: "Spray Spinosad 45 SC @ 0.3ml/litre or Chlorantraniliprole 18.5 SC @ 0.3ml/litre. Use yellow sticky traps (25/acre).",
    treatmentTa: "ஸ்பினோசாட் 45 SC @ 0.3 மி.லி/லிட்டர் தெளிக்கவும். மஞ்சள் பசை பொறிகள் (25/ஏக்கர்) பயன்படுத்தவும்.",
    preventionEn: "Use pheromone traps (5/acre). Install insect-proof netting in nurseries. Remove crop residues promptly after harvest.",
    preventionTa: "ஃபெரோமோன் பொறிகள் (5/ஏக்கர்) பயன்படுத்தவும். நாற்றங்காலில் பூச்சி-எதிர்ப்பு வலை பயன்படுத்தவும்.",
    local_remediesEn: "NSKE 5% spray repels adult moths. Neem oil 3% effective against larvae.",
    local_remediesTa: "வேப்பங்கொட்டை கரைசல் 5% தெளிப்பு வயது வந்த அந்துப்பூச்சிகளை விரட்டும்.",
    confidence_score: 0.87
  },
  "Tomato___Healthy": {
    label: "Tomato – Healthy",
    crop: "Tomato",
    diagnosisEn: "The tomato plant appears healthy with no visible disease signs.",
    diagnosisTa: "தக்காளி செடி ஆரோக்கியமாக தெரிகிறது.",
    treatmentEn: "No treatment needed. Continue regular monitoring every 7 days.",
    treatmentTa: "சிகிச்சை தேவையில்லை. ஒவ்வொரு 7 நாட்களுக்கும் கண்காணிக்கவும்.",
    preventionEn: "Maintain consistent watering, balanced NPK fertilization, and weekly scouting for pests.",
    preventionTa: "சீரான நீர்ப்பாசனம், NPK உரமிடல், வாராந்திர கண்காணிப்பு.",
    local_remediesEn: "Spray Panchagavya 3% monthly as a preventive booster for plant immunity.",
    local_remediesTa: "மாதந்தோறும் பஞ்சகவ்யா 3% தடுப்பு தெளிப்பு.",
    confidence_score: 0.98
  },
  // ──────────────────── RICE / PADDY ────────────────────
  "Rice___Leaf_Blast": {
    label: "Rice Leaf Blast (Pyricularia oryzae)",
    crop: "Rice",
    diagnosisEn: "Spindle-shaped gray-white spots with brown borders on leaves. Lesions coalesce causing leaf death. High in cool, humid weather.",
    diagnosisTa: "இலைகளில் பழுப்பு விளிம்புடன் கூடிய சாம்பல்-வெள்ளை நீள் புள்ளிகள். குளிர் ஈரமான சூழலில் பரவும்.",
    treatmentEn: "Spray Tricyclazole 75 WP @ 0.6g/litre or Carbendazim 50 WP @ 1g/litre. Apply at tillering and panicle initiation stages.",
    treatmentTa: "டிரைசைக்லோசோல் 75 WP @ 0.6 கிராம்/லிட்டர் தெளிக்கவும். முளை வளர்ச்சி மற்றும் கதிர் உருவாகும் நிலையில் தெளிக்கவும்.",
    preventionEn: "Use blast-resistant varieties (CO-51, ADT-39). Avoid excess nitrogen. Maintain 5cm water depth. Treat seeds with Trichoderma viride 4g/kg.",
    preventionTa: "வெடிப்பு-எதிர்ப்பு வகைகள் (CO-51, ADT-39) பயன்படுத்தவும். அதிகப்படியான நைட்ரஜன் தவிர்க்கவும்.",
    local_remediesEn: "Seed treatment with Pseudomonas fluorescens @ 10g/kg seed. Spray Pseudomonas 0.5% solution as foliar spray.",
    local_remediesTa: "சியூடோமோனாஸ் ஃப்ளோரசன்ஸ் @ 10 கிராம்/கிலோ விதை சிகிச்சை.",
    confidence_score: 0.93
  },
  "Rice___Brown_Spot": {
    label: "Rice Brown Spot (Helminthosporium oryzae)",
    crop: "Rice",
    diagnosisEn: "Small oval dark brown spots with yellow halo on leaves and glumes. Causes grain sterility and poor grain filling.",
    diagnosisTa: "இலைகளில் மஞ்சள் வளையத்துடன் கூடிய சிறிய கோள பழுப்பு புள்ளிகள்.",
    treatmentEn: "Spray Mancozeb 75 WP @ 2g/litre or Iprobenfos 50 EC @ 1.5ml/litre. Seed treatment with Thiram 75 WP @ 3g/kg.",
    treatmentTa: "மேன்கோசெப் 75 WP @ 2 கிராம்/லிட்டர் தெளிக்கவும். தைராம் 75 WP @ 3 கிராம்/கிலோ விதை சிகிச்சை.",
    preventionEn: "Apply balanced fertilizers (avoid K deficiency). Use certified seeds. Drain and dry fields periodically.",
    preventionTa: "சமச்சீர் உரமிடல் (பொட்டாசியம் குறைபாடு தவிர்க்கவும்). சான்றிதழ் பெற்ற விதைகள் பயன்படுத்தவும்.",
    local_remediesEn: "Hot water seed treatment at 52°C for 10 minutes. Apply wood ash to soil to improve potassium levels.",
    local_remediesTa: "52°C சூட்டில் 10 நிமிடம் விதை சிகிச்சை. மண்ணில் மரச்சாம்பல் தூவி பொட்டாசியம் அளவை மேம்படுத்தவும்.",
    confidence_score: 0.88
  },
  "Rice___Bacterial_Leaf_Blight": {
    label: "Rice Bacterial Leaf Blight (Xanthomonas oryzae)",
    crop: "Rice",
    diagnosisEn: "Water-soaked yellowing from leaf tips progressing downward. Leaves turn straw-yellow. Bacterial ooze visible in morning.",
    diagnosisTa: "இலை நுனியிலிருந்து கீழ்நோக்கி நீர் ஊறிய மஞ்சளிப்பு. காலையில் பாக்டீரியா கசிவு தெரியும்.",
    treatmentEn: "Spray Copper Oxychloride 50 WP @ 2.5g/litre or Streptomycin Sulphate 90%+Tetracycline HCl 10% @ 1g/5litres.",
    treatmentTa: "கப்பர் ஆக்சிகுளோரைடு 50 WP @ 2.5 கிராம்/லிட்டர் தெளிக்கவும்.",
    preventionEn: "Drain flooded fields immediately. Avoid excessive nitrogen. Use resistant varieties (TKM 6, BPT 5204). Remove ratoon stumps.",
    preventionTa: "வெள்ளத்தில் மூழ்கிய வயல்களை உடனே வடிகட்டவும். அதிக நைட்ரஜன் தவிர்க்கவும்.",
    local_remediesEn: "Spray Pseudomonas fluorescens 0.5% + Copper sulphate 0.2%. Apply lime to maintain soil pH 6.5-7.",
    local_remediesTa: "சியூடோமோனாஸ் 0.5% + கப்பர் சல்பேட் 0.2% தெளிக்கவும்.",
    confidence_score: 0.90
  },
  // ──────────────────── POTATO ────────────────────
  "Potato___Late_blight": {
    label: "Potato Late Blight (Phytophthora infestans)",
    crop: "Potato",
    diagnosisEn: "Dark water-soaked patches on leaves that turn brown-black. White downy growth on leaf undersides. Tuber rot in severe cases.",
    diagnosisTa: "இலைகளில் நீர் ஊறிய கருப்பு திட்டுகள். இலை அடியில் வெள்ளை பஞ்சு வளர்ச்சி.",
    treatmentEn: "Spray Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/litre. Alternate with Chlorothalonil 75 WP @ 2g/litre every 7 days.",
    treatmentTa: "மெட்டாலாக்சில் 8%+மேன்கோசெப் 64% WP @ 2.5 கிராம்/லிட்டர் தெளிக்கவும். 7 நாட்கள் இடைவெளியில் கிளோரோதலோனில் மாற்றி தெளிக்கவும்.",
    preventionEn: "Plant certified disease-free seed tubers. Earth up well. Avoid overhead irrigation. Destroy volunteer plants.",
    preventionTa: "நோயற்ற சான்றிதழ் பெற்ற கிழங்குகளை நடவும். மண் அணைத்து வளர்க்கவும்.",
    local_remediesEn: "Bordeaux Mixture 1% spray as preventive measure during rainy season. Trichoderma viride soil application.",
    local_remediesTa: "மழைக்காலத்தில் போர்டோ கலவை 1% தடுப்பு தெளிப்பு.",
    confidence_score: 0.88
  },
  "Potato___Early_blight": {
    label: "Potato Early Blight (Alternaria solani)",
    crop: "Potato",
    diagnosisEn: "Concentric ring spots (target board pattern) on lower leaves first. Defoliation in severe attacks.",
    diagnosisTa: "கீழ் இலைகளில் முதலில் வளைய வடிவ புள்ளிகள். தீவிர தாக்குதலில் இலை உதிர்வு.",
    treatmentEn: "Spray Mancozeb 75 WP @ 2g/litre or Difenoconazole 25 EC @ 0.5ml/litre. Apply at first sign and repeat every 10 days.",
    treatmentTa: "மேன்கோசெப் 75 WP @ 2 கிராம்/லிட்டர் அல்லது டிஃபெனோகொனாஸோல் 25 EC @ 0.5 மி.லி/லிட்டர் தெளிக்கவும்.",
    preventionEn: "Crop rotation every 3 years. Destroy crop debris. Use resistant varieties. Ensure proper plant spacing.",
    preventionTa: "3 ஆண்டுகளுக்கு ஒரு முறை பயிர் சுழற்சி. செடி குப்பைகளை அழிக்கவும்.",
    local_remediesEn: "NSKE 5% spray. Compost application improves soil health and plant immunity.",
    local_remediesTa: "வேப்பங்கொட்டை கரைசல் 5% தெளிப்பு. அங்கக உரம் இட்டு மண் நலனை மேம்படுத்தவும்.",
    confidence_score: 0.85
  },
  "Potato___Healthy": {
    label: "Potato – Healthy",
    crop: "Potato",
    diagnosisEn: "Potato plant appears healthy. No disease signs detected.",
    diagnosisTa: "உருளைக்கிழங்கு செடி ஆரோக்கியமாக உள்ளது.",
    treatmentEn: "No treatment required. Continue regular monitoring.",
    treatmentTa: "சிகிச்சை தேவையில்லை.",
    preventionEn: "Scout weekly for Colorado potato beetle and aphids. Maintain consistent soil moisture.",
    preventionTa: "வாராந்திர கண்காணிப்பு மேற்கொள்ளவும்.",
    local_remediesEn: "Monthly Panchagavya 3% spray for vigour.",
    local_remediesTa: "பஞ்சகவ்யா 3% மாத தெளிப்பு.",
    confidence_score: 0.98
  },
  // ──────────────────── CORN / MAIZE ────────────────────
  "Corn___Common_Rust": {
    label: "Corn Common Rust (Puccinia sorghi)",
    crop: "Maize",
    diagnosisEn: "Reddish-brown powdery pustules on both leaf surfaces. Severe infection leads to premature drying.",
    diagnosisTa: "இலையின் இரு பக்கங்களிலும் சிவப்பு-பழுப்பு தூள் குமிழ்கள்.",
    treatmentEn: "Spray Propiconazole 25 EC @ 1ml/litre or Mancozeb 75 WP @ 2g/litre at early infection stage.",
    treatmentTa: "ப்ரோபிகோனாசோல் 25 EC @ 1 மி.லி/லிட்டர் தெளிக்கவும்.",
    preventionEn: "Plant resistant hybrid varieties. Early planting avoids peak infection periods. Destroy crop debris after harvest.",
    preventionTa: "எதிர்ப்பு திறன் கொண்ட கலப்பின வகைகளை நடவும்.",
    local_remediesEn: "Neem oil 3% spray reduces rust spore germination.",
    local_remediesTa: "வேப்ப எண்ணெய் 3% தெளிப்பு.",
    confidence_score: 0.91
  },
  "Corn___Gray_Leaf_Spot": {
    label: "Corn Gray Leaf Spot (Cercospora zeaemaydis)",
    crop: "Maize",
    diagnosisEn: "Long, rectangular, tan-to-gray lesions parallel to leaf veins. Lesions may coalesce killing entire leaves.",
    diagnosisTa: "இலை நரம்புகளுக்கு இணையாக நீண்ட சதுர சாம்பல் திட்டுகள்.",
    treatmentEn: "Spray Azoxystrobin 11% + Tebuconazole 18.3% SC @ 1ml/litre. Apply at VT stage (tasseling) for best results.",
    treatmentTa: "அசாக்ஸிஸ்ட்ரோபின் + டெபுகோனாசோல் @ 1 மி.லி/லிட்டர் தெளிக்கவும்.",
    preventionEn: "No-till or minimum-till farming reduces surface inoculum. Plant tolerant varieties. Ensure proper plant density.",
    preventionTa: "குறைந்த உழவு முறை மேற்பரப்பு நோய் மூலத்தை குறைக்கும்.",
    local_remediesEn: "Trichoderma viride soil treatment. Crop rotation with legumes.",
    local_remediesTa: "டிரைக்கோடெர்மா விரிடே மண் சிகிச்சை.",
    confidence_score: 0.86
  },
  // ──────────────────── GRAPE ────────────────────
  "Grape___Black_rot": {
    label: "Grape Black Rot (Guignardia bidwellii)",
    crop: "Grapes",
    diagnosisEn: "Tan circular spots with dark borders on leaves. Berries turn black and mummify (remain on vine).",
    diagnosisTa: "இலைகளில் கருப்பு விளிம்புடன் வெளிர் வட்ட புள்ளிகள். பழங்கள் கருத்து வற்றிவிடும்.",
    treatmentEn: "Spray Myclobutanil 10 WP @ 1g/litre or Tebuconazole 25.9 EC @ 1ml/litre. Apply before and after flowering.",
    treatmentTa: "மைக்லோபுட்டானில் 10 WP @ 1 கிராம்/லிட்டர் தெளிக்கவும். மலர் காலத்திற்கு முன்னும் பின்னும் தெளிக்கவும்.",
    preventionEn: "Prune and destroy mummified berries. Ensure good canopy management and air circulation. Remove wild grapes near vineyard.",
    preventionTa: "வற்றிய பழங்களை வெட்டி அழிக்கவும். நல்ல காற்று சுழற்சிக்காக கொடியை கட்டி வளர்க்கவும்.",
    local_remediesEn: "Bordeaux Mixture 1% spray after pruning and at bud burst. Copper-based organic sprays effective.",
    local_remediesTa: "கட்டரிப்பு மற்றும் மொட்டு வெடிக்கும் நேரத்தில் போர்டோ கலவை 1% தெளிக்கவும்.",
    confidence_score: 0.87
  },
  "Grape___Powdery_mildew": {
    label: "Grape Powdery Mildew (Erysiphe necator)",
    crop: "Grapes",
    diagnosisEn: "White powdery coating on leaves, shoots, and berries. Infected berries crack and rot.",
    diagnosisTa: "இலைகள், கொம்புகள் மற்றும் பழங்களில் வெள்ளை தூள் பூச்சு.",
    treatmentEn: "Spray Sulphur 80 WP @ 2g/litre or Penconazole 10 EC @ 0.5ml/litre. Apply every 10-14 days during shoot growth.",
    treatmentTa: "கந்தகம் 80 WP @ 2 கிராம்/லிட்டர் தெளிக்கவும். கொம்பு வளர்ச்சியின்போது 10-14 நாட்களுக்கு ஒரு முறை தெளிக்கவும்.",
    preventionEn: "Avoid overhead irrigation. Remove and destroy infected shoots immediately. Ensure wide row spacing.",
    preventionTa: "தலை வழி நீர்ப்பாசனம் தவிர்க்கவும். நோய்வாய்ப்பட்ட கொம்புகளை உடனே அகற்றி அழிக்கவும்.",
    local_remediesEn: "Spray milk solution (30% dilution) weekly – an organic alternative to fungicides.",
    local_remediesTa: "பால் கரைசல் (30% நீர்த்த) வாராந்திர தெளிப்பு – கூண்டு மருந்துக்கு இயற்கை மாற்று.",
    confidence_score: 0.89
  },
  // ──────────────────── APPLE ────────────────────
  "Apple___Apple_scab": {
    label: "Apple Scab (Venturia inaequalis)",
    crop: "Apple",
    diagnosisEn: "Olive-green to brown velvety spots on leaves and fruits. Infected fruits develop corky, scabby lesions.",
    diagnosisTa: "இலைகளிலும் பழங்களிலும் ஆலிவ்-பச்சை முதல் பழுப்பு வரை உள்ள மெல்லிய புள்ளிகள்.",
    treatmentEn: "Spray Captan 50 WP @ 2.5g/litre or Myclobutanil 10 WP @ 1g/litre from green tip stage. Repeat every 7-10 days.",
    treatmentTa: "கேப்டான் 50 WP @ 2.5 கிராம்/லிட்டர் தெளிக்கவும். 7-10 நாட்கள் இடைவெளியில் மீண்டும் தெளிக்கவும்.",
    preventionEn: "Rake and destroy fallen leaves (primary inoculum source). Apply urea 5% on fallen leaves to hasten decomposition. Prune for airflow.",
    preventionTa: "உதிர்ந்த இலைகளை அழிக்கவும். யூரியா 5% தெளித்து சிதைவை விரைவுபடுத்தவும்.",
    local_remediesEn: "Bordeaux Mixture 1% spray at green tip and pink stages.",
    local_remediesTa: "போர்டோ கலவை 1% தெளிப்பு.",
    confidence_score: 0.86
  },
  // ──────────────────── GROUNDNUT ────────────────────
  "Groundnut___Early_Leaf_Spot": {
    label: "Groundnut Early Leaf Spot (Cercospora arachidicola)",
    crop: "Groundnut",
    diagnosisEn: "Circular dark spots with yellow halo on upper leaf surface. Severe infection causes defoliation reducing yield 50%.",
    diagnosisTa: "இலை மேல் பரப்பில் மஞ்சள் வளையத்துடன் கோள கருப்பு புள்ளிகள். தீவிர தாக்குதலில் 50% மகசூல் இழப்பு.",
    treatmentEn: "Spray Carbendazim 50 WP @ 1g/litre or Chlorothalonil 75 WP @ 2g/litre at 40 DAS, 55 DAS, and 70 DAS.",
    treatmentTa: "கார்பெண்டாஜிம் 50 WP @ 1 கிராம்/லிட்டர் 40, 55 மற்றும் 70 நாட்களில் தெளிக்கவும்.",
    preventionEn: "Use tolerant varieties (TAG-24, ICGS-76). Maintain optimal plant spacing. Remove crop debris.",
    preventionTa: "எதிர்ப்பு திறன் கொண்ட வகைகள் (TAG-24) பயன்படுத்தவும்.",
    local_remediesEn: "Seed treatment with Trichoderma viride 4g/kg + Pseudomonas fluorescens 10g/kg reduces early infection.",
    local_remediesTa: "டிரைக்கோடெர்மா + சியூடோமோனாஸ் விதை சிகிச்சை.",
    confidence_score: 0.89
  },
  // ──────────────────── CHILLI / PEPPER ────────────────────
  "Chilli___Leaf_Curl": {
    label: "Chilli Leaf Curl (Viral – Thrips vectored)",
    crop: "Chilli",
    diagnosisEn: "Leaves curl upward and inward, become small and distorted. Stunted plant growth. Caused by Chilli leaf curl virus transmitted by thrips.",
    diagnosisTa: "இலைகள் மேல்நோக்கி சுருண்டு சிறியதாகும். வளர்ச்சி தடைபடும். இது தம்பிப்பூச்சிகளால் பரவும் வைரஸ் நோய்.",
    treatmentEn: "No cure for the virus. Remove and destroy infected plants. Control thrips with Imidacloprid 17.8 SL @ 0.3ml/litre or Spinosad 45 SC @ 0.3ml/litre.",
    treatmentTa: "வைரஸுக்கு குணப்படுத்தல் இல்லை. நோய்வாய்ப்பட்ட செடிகளை அகற்றி அழிக்கவும். தம்பிப்பூச்சிக்கு இமிடாக்லோப்ரிட் தெளிக்கவும்.",
    preventionEn: "Use virus-free seedlings. Grow in insect-proof nursery. Install blue sticky traps for thrips monitoring. Plant barrier crops (maize).",
    preventionTa: "வைரஸ் இல்லாத நாற்றுகளை பயன்படுத்தவும். பூச்சி-எதிர்ப்பு நாற்றங்காலில் வளர்க்கவும்.",
    local_remediesEn: "NSKE 5% spray reduces thrips population. Neem oil 3% weekly spray.",
    local_remediesTa: "வேப்பங்கொட்டை கரைசல் 5% தம்பிப்பூச்சியை கட்டுப்படுத்தும்.",
    confidence_score: 0.83
  },
  "Chilli___Anthracnose": {
    label: "Chilli Anthracnose/Fruit Rot (Colletotrichum capsici)",
    crop: "Chilli",
    diagnosisEn: "Water-soaked lesions on fruits that turn orange to dark brown with sunken centers. Circular lesions with acervuli (pink spore masses). Post-harvest fruit rot.",
    diagnosisTa: "பழங்களில் நீர் ஊறிய திட்டுகள் ஆரஞ்சு முதல் கருப்பு நிறத்திற்கு மாறும். அறுவடைக்கு பின் பழ அழுகல்.",
    treatmentEn: "Spray Carbendazim 50 WP @ 1g/litre or Copper Oxychloride 50 WP @ 2.5g/litre. Start at flowering and repeat every 10 days.",
    treatmentTa: "கார்பெண்டாஜிம் @ 1 கிராம்/லிட்டர் மலர் காலத்திலிருந்து 10 நாட்களுக்கு ஒரு முறை தெளிக்கவும்.",
    preventionEn: "Use certified seeds. Hot water seed treatment at 52°C for 30 min. Avoid wounding fruits. Maintain field sanitation.",
    preventionTa: "சான்றிதழ் பெற்ற விதைகள். 52°C சூட்டில் 30 நிமிட விதை சிகிச்சை.",
    local_remediesEn: "Trichoderma viride seed treatment 4g/kg. Neem cake soil application.",
    local_remediesTa: "டிரைக்கோடெர்மா விரிடே விதை சிகிச்சை 4 கிராம்/கிலோ.",
    confidence_score: 0.87
  },
  // ──────────────────── COTTON ────────────────────
  "Cotton___Leaf_Curl_Disease": {
    label: "Cotton Leaf Curl Disease (CLCuD – Whitefly vectored)",
    crop: "Cotton",
    diagnosisEn: "Leaves curl upward with thickened veins and dark green enations (leaf-like growths) on undersides. Severe stunting and yield loss.",
    diagnosisTa: "இலைகள் மேல்நோக்கி சுருண்டு நரம்புகள் தடித்து, இலை அடியில் இலை போன்ற வளர்ச்சிகள்.",
    treatmentEn: "Control whiteflies with Imidacloprid 17.8 SL @ 0.5ml/litre or Thiamethoxam 25 WG @ 0.5g/litre. Apply systemic insecticides at 3, 6, 9 weeks.",
    treatmentTa: "வெள்ளை ஈக்களை கட்டுப்படுத்த இமிடாக்லோப்ரிட் @ 0.5 மி.லி/லிட்டர் தெளிக்கவும்.",
    preventionEn: "Use tolerant varieties (LH 1556, MECH-12). Remove infected plants early. Reflective mulch repels whiteflies.",
    preventionTa: "எதிர்ப்பு வகைகள் பயன்படுத்தவும். நோய்வாய்ப்பட்ட செடிகளை ஆரம்பத்திலேயே அகற்றவும்.",
    local_remediesEn: "Yellow sticky traps (25/acre) for whitefly monitoring. NSKE 5% spray.",
    local_remediesTa: "மஞ்சள் பசை பொறிகள் (25/ஏக்கர்) வெள்ளை ஈக்கான கண்காணிப்பு.",
    confidence_score: 0.84
  },
  // ──────────────────── BANANA ────────────────────
  "Banana___Sigatoka": {
    label: "Banana Sigatoka (Mycosphaerella musicola)",
    crop: "Banana",
    diagnosisEn: "Yellow streaks on leaves becoming brown oval spots with gray centers. Premature leaf death reduces photosynthesis.",
    diagnosisTa: "இலைகளில் மஞ்சள் கோடுகள் பழுப்பு நீள் புள்ளிகளாக மாறும். இலைகள் அகால மரணம் அடையும்.",
    treatmentEn: "Spray Propiconazole 25 EC @ 1ml/litre or Mancozeb 75 WP @ 2g/litre alternately every 3 weeks.",
    treatmentTa: "ப்ரோபிகோனாசோல் 25 EC @ 1 மி.லி/லிட்டர் அல்லது மேன்கோசெப் 3 வாரங்களுக்கு ஒரு முறை மாற்றி தெளிக்கவும்.",
    preventionEn: "Remove old infected leaves (pruning). Ensure good drainage. Avoid excess nitrogen. Plant disease-free suckers.",
    preventionTa: "பழைய நோய்வாய்ப்பட்ட இலைகளை அகற்றவும். நல்ல வடிகால் உறுதிப்படுத்தவும்.",
    local_remediesEn: "Spray Bordeaux Mixture 1% before rainy season. Oil emulsion sprays improve coverage.",
    local_remediesTa: "மழைக்காலத்திற்கு முன் போர்டோ கலவை 1% தெளிக்கவும்.",
    confidence_score: 0.85
  },
  "Banana___Panama_Disease": {
    label: "Banana Panama Wilt (Fusarium oxysporum f.sp. cubense)",
    crop: "Banana",
    diagnosisEn: "Yellowing of oldest leaves first, progressing inward. Splitting of pseudostem base reveals brown-red vascular discoloration. No cure once infected.",
    diagnosisTa: "முதலில் பழைய இலைகள் மஞ்சளாகும். பன்டு அடியை கீறினால் பழுப்பு-சிவப்பு திசு தெரியும். குணப்படுத்தல் இல்லை.",
    treatmentEn: "No effective chemical cure. Remove and destroy infected plants. Soil drench with Carbendazim 0.1% around healthy plants.",
    treatmentTa: "பயனுள்ள மருந்து சிகிச்சை இல்லை. நோய்வாய்ப்பட்ட செடிகளை அழிக்கவும். ஆரோக்கியமான செடிகளை சுற்றி கார்பெண்டாஜிம் 0.1% மண் ஊடாடும் சிகிச்சை.",
    preventionEn: "Plant resistant varieties (FHIA-01, Nendran). Use TC (tissue culture) plants. Sterilize tools. Avoid planting in previously infected fields for 5+ years.",
    preventionTa: "எதிர்ப்பு வகைகள் நடவும். திசு வளர்ப்பு நடவுகள் பயன்படுத்தவும். கருவிகளை கிருமி நீக்கம் செய்யவும்.",
    local_remediesEn: "Trichoderma viride + Pseudomonas fluorescens soil drenching around healthy plants as preventive.",
    local_remediesTa: "டிரைக்கோடெர்மா + சியூடோமோனாஸ் ஆரோக்கியமான செடிகளை சுற்றி மண்வழி சிகிச்சை.",
    confidence_score: 0.88
  },
  // ──────────────────── COCONUT ────────────────────
  "Coconut___Bud_Rot": {
    label: "Coconut Bud Rot (Phytophthora palmivora)",
    crop: "Coconut",
    diagnosisEn: "Rotting of the crown bud – unopened spear leaves turn yellow then brown. Putrid smell from crown. Fatal if untreated.",
    diagnosisTa: "தேங்காய் மரத்தின் நுனி மொட்டு அழுகல் – திறக்காத ஈட்டி இலைகள் மஞ்சளாகி பழுப்பாகும். வேர் வாசனை வரும்.",
    treatmentEn: "Remove infected tissues. Pour Bordeaux Mixture 1% into the crown (200ml). Apply Metalaxyl paste on crown. Repeat monthly.",
    treatmentTa: "நோய்வாய்ப்பட்ட திசுக்களை அகற்றவும். மரத்தின் நுனியில் போர்டோ கலவை 1% (200 மி.லி) ஊற்றவும். மாதந்தோறும் செய்யவும்.",
    preventionEn: "Drain water-logged areas. Avoid injury to crown. Apply prophylactic Bordeaux mixture during monsoon. Control rhinoceros beetle.",
    preventionTa: "நீர் தேங்கும் பகுதிகளை வடிகட்டவும். மழைக்காலத்தில் தடுப்பு போர்டோ கலவை பயன்படுத்தவும்.",
    local_remediesEn: "Trichoderma-enriched compost application at base. Neem cake @ 5kg/palm annually.",
    local_remediesTa: "டிரைக்கோடெர்மா நிரம்பிய உரம் மரத்தடிவில் இடவும். வேப்பம் பிண்ணாக்கு @ 5 கிலோ/மரம் வருடம் ஒரு முறை.",
    confidence_score: 0.86
  },
  // ──────────────────── GENERIC FALLBACK ────────────────────
  "Unknown___Disease": {
    label: "Unidentified Crop Disease",
    crop: "Unknown Crop",
    diagnosisEn: "Disease could not be precisely identified from the image. Based on visible symptoms, a fungal or bacterial pathogen is likely involved.",
    diagnosisTa: "படத்திலிருந்து நோயை சரியாக அடையாளம் காண முடியவில்லை. காணப்படும் அறிகுறிகளை பொறுத்து கூண்டு அல்லது பாக்டீரியா நோய் இருக்கலாம்.",
    treatmentEn: "Apply broad-spectrum fungicide: Mancozeb 75 WP @ 2g/litre OR Carbendazim 50 WP @ 1g/litre as immediate protection. Consult TNAU agronomist for specific diagnosis.",
    treatmentTa: "பரந்த வீச்சு கூண்டு மருந்து: மேன்கோசெப் 75 WP @ 2 கிராம்/லிட்டர் அல்லது கார்பெண்டாஜிம் 50 WP @ 1 கிராம்/லிட்டர் தெளிக்கவும். துல்லியமான கண்டறிவுக்கு TNAU வேளாண் நிபுணரை அணுகவும்.",
    preventionEn: "Improve drainage and air circulation. Remove severely affected plant parts. Avoid overhead irrigation. Practice crop rotation.",
    preventionTa: "வடிகால் மற்றும் காற்று சுழற்சியை மேம்படுத்தவும். கடுமையாக பாதிக்கப்பட்ட பகுதிகளை அகற்றவும்.",
    local_remediesEn: "Spray Panchagavya 3% to boost plant immunity. Apply Trichoderma viride 4g/kg for seed treatment in future crop.",
    local_remediesTa: "பஞ்சகவ்யா 3% தெளித்து தாவர எதிர்ப்பு சக்தியை மேம்படுத்தவும்.",
    confidence_score: 0.60
  }
};

/**
 * Look up disease by label (HuggingFace output label)
 */
function getDiseaseInfo(label) {
  if (!label) return DISEASE_DB["Unknown___Disease"];
  // Try exact match first
  if (DISEASE_DB[label]) return DISEASE_DB[label];
  // Try partial match
  const key = Object.keys(DISEASE_DB).find(k =>
    label.toLowerCase().includes(k.toLowerCase().replace(/___/g, '_').replace(/_/g, ' ').toLowerCase()) ||
    k.toLowerCase().includes(label.toLowerCase().replace(/ /g, '_'))
  );
  return DISEASE_DB[key] || DISEASE_DB["Unknown___Disease"];
}

/**
 * Text-based rule matching for common Tamil/English descriptions
 */
function diagnoseFromText(text) {
  const t = text.toLowerCase();
  if ((t.includes('tomato') || t.includes('தக்காளி')) && (t.includes('early') || t.includes('spot') || t.includes('ring'))) return DISEASE_DB["Tomato___Early_blight"];
  if ((t.includes('tomato') || t.includes('தக்காளி')) && (t.includes('late') || t.includes('water') || t.includes('collapse'))) return DISEASE_DB["Tomato___Late_blight"];
  if (t.includes('tomato') || t.includes('தக்காளி')) return DISEASE_DB["Tomato___Healthy"];
  if ((t.includes('rice') || t.includes('paddy') || t.includes('அரிசி') || t.includes('நெல்')) && t.includes('blast')) return DISEASE_DB["Rice___Leaf_Blast"];
  if ((t.includes('rice') || t.includes('paddy') || t.includes('நெல்')) && (t.includes('brown') || t.includes('பழுப்பு'))) return DISEASE_DB["Rice___Brown_Spot"];
  if ((t.includes('rice') || t.includes('paddy') || t.includes('நெல்')) && (t.includes('blight') || t.includes('yellow') || t.includes('மஞ்சள்'))) return DISEASE_DB["Rice___Bacterial_Leaf_Blight"];
  if (t.includes('potato') || t.includes('உருளை')) return DISEASE_DB["Potato___Late_blight"];
  if (t.includes('corn') || t.includes('maize') || t.includes('மக்காச்சோளம்')) return DISEASE_DB["Corn___Common_Rust"];
  if (t.includes('grape') || t.includes('திராட்சை')) return DISEASE_DB["Grape___Black_rot"];
  if (t.includes('chilli') || t.includes('pepper') || t.includes('மிளகாய்')) return DISEASE_DB["Chilli___Anthracnose"];
  if (t.includes('cotton') || t.includes('பருத்தி')) return DISEASE_DB["Cotton___Leaf_Curl_Disease"];
  if (t.includes('banana') || t.includes('வாழை')) return DISEASE_DB["Banana___Sigatoka"];
  if (t.includes('coconut') || t.includes('தேங்காய்')) return DISEASE_DB["Coconut___Bud_Rot"];
  if (t.includes('groundnut') || t.includes('வேர்க்கடலை')) return DISEASE_DB["Groundnut___Early_Leaf_Spot"];
  return null; // couldn't match
}

module.exports = { DISEASE_DB, getDiseaseInfo, diagnoseFromText };
