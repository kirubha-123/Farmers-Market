import { useEffect, useState, useRef } from 'react';
import { api, BASE_URL } from '../api';
import { Link } from 'react-router-dom';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported. Please use Chrome.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      setQuery(spoken);
    };
    recognition.onerror = (e) => {
      console.warn('Voice error:', e.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  useEffect(() => {
    api
      .get('/products')
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  const filtered = products.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(query.toLowerCase());
    return matchesQuery;
  });

  const addToCart = (product) => {
    const stored = localStorage.getItem('cart');
    const current = stored ? JSON.parse(stored) : [];
    const existing = current.find((i) => i._id === product._id);

    const currentQtyInCart = existing ? existing.quantityKg : 0;

    if (currentQtyInCart + 1 > product.stockKg) {
      alert(`Sorry, only ${product.stockKg} kg of ${product.name} available in total.`);
      return;
    }

    if (existing) {
      existing.quantityKg += 1;
    } else {
      current.push({ ...product, quantityKg: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(current));
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-emerald-50">
      {/* page header */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-semibold text-center text-emerald-900">
          Fresh Marketplace
        </h1>
        <p className="text-center text-sm text-emerald-900/70 mt-1">
          Browse fresh produce directly from local farmers
        </p>

        {/* search bar */}
        <div className="mt-6 flex justify-center gap-3">
          <div className="w-full max-w-xl flex items-center bg-white border border-emerald-100 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
            <span className="text-emerald-500 mr-2">🔍</span>
            <input
              className="flex-1 bg-transparent outline-none text-sm text-emerald-900"
              placeholder="Search for crops, vegetables, fruits..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={startVoiceSearch}
              title={isListening ? 'Stop listening' : 'Voice search'}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '2px 4px',
                color: isListening ? '#ef4444' : '#10b981',
                transition: 'color 0.3s'
              }}
            >
              {isListening ? '🔴' : '🎤'}
            </button>
          </div>
        </div>
        {isListening && (
          <p className="text-center mt-2 text-red-500 text-sm font-bold animate-pulse">
            🎙️ Listening... Say a crop or vegetable name
          </p>
        )}
      </section>

      {/* content */}
      <main className="mx-auto max-w-6xl px-4 pb-10">
        {/* products grid */}
        <section>
          <p className="text-xs text-emerald-900/70 mb-3">
            {filtered.length} products found
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              // ✅ FULLY CLICKABLE PRODUCT CARD - navigates to details
              <Link
                key={p._id}
                to={`/product/${p._id}`}
                className="block hover:shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200"
              >
                <article className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden flex flex-col h-full">
                  {/* Image Section */}
                  <div className="h-40 bg-gray-100 relative group-hover:brightness-105">
                    {p.image ? (
                      <img
                        src={`${BASE_URL}${p.image}`}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-500 text-sm bg-emerald-50">
                        No Image
                      </div>
                    )}
                    {p.category && (
                      <span className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded-lg text-emerald-800 shadow-md border border-emerald-200">
                        {p.category}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-emerald-900 text-base leading-tight line-clamp-2">
                        {p.name}
                      </h3>
                      <span className="text-sm font-bold text-emerald-900 ml-2 whitespace-nowrap">
                        ₹{p.pricePerKg}
                        <span className="text-[11px] text-emerald-900/70 font-normal">
                          /{p.unit || 'kg'}
                        </span>
                      </span>
                    </div>

                    {/* ✅ FARMER LINK */}
                    {p.farmer && (
                      <div className="mb-3">
                        <Link 
                          to={`/farmers/${p.farmer._id}`}
                          onClick={(e) => e.stopPropagation()} // Prevent card click
                          className="text-[11px] font-bold text-emerald-900 hover:text-emerald-500 transition-colors flex items-center gap-1"
                        >
                          👨‍🌾 {p.farmer.name}
                        </Link>
                        <p className="text-[10px] text-emerald-600/70 truncate">
                          {p.farmer.specialty || 'General Farmer'} • {p.location || 'Local Area'}
                        </p>
                      </div>
                    )}

                    <p className="text-[12px] text-emerald-900/70 mb-3 flex-1 line-clamp-2 leading-relaxed">
                      {p.description || 'Fresh produce from local farmers. Harvested today!'}
                    </p>

                    {/* Stock & Action - Fixed at bottom */}
                    <div className="flex items-center justify-between pt-2 border-t border-emerald-50 mt-auto">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${p.stockKg < 10 ? 'bg-red-50 text-red-700 border-red-200' :
                        p.stockKg < 50 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                        {p.stockKg} {p.unit || 'kg'} left
                      </span>

                      {/* Quick Add Button - Still works on hover */}
                      <button
                        onClick={(e) => {
                          e.preventDefault(); // Prevent navigation
                          e.stopPropagation(); // Stop bubbling
                          addToCart(p);
                        }}
                        className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                      >
                        + Quick Add
                      </button>
                    </div>
                  </div>
                </article>
              </Link>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full py-10 text-center bg-white rounded-2xl border border-emerald-100">
                <div className="text-emerald-900/50">
                  <p className="text-lg mb-2">No products match your search.</p>
                  <button
                    onClick={() => { setQuery('') }}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition"
                  >
                    Clear search
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProductList;