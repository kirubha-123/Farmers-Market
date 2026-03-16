import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { api, BASE_URL } from '../api';

function FarmerProfile() {
  const { id } = useParams(); 
  const [farmer, setFarmer] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // ✅ UPDATED: Fetch from the dedicated endpoint we created
        // This returns { farmer: {...}, products: [...] }
        const res = await api.get(`/farmers/${id}`);
        
        setFarmer(res.data.farmer);
        setProducts(res.data.products);
      } catch (err) {
        console.error("Failed to load farmer profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  // ✅ ADDED: Function to handle Add to Cart
  const addToCart = (e, product) => {
    e.preventDefault(); // Prevent navigating to product page when clicking button
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item) => item._id === product._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage')); // Updates Navbar count
    alert(`${product.name} added to cart!`);
  };

  if (loading) return <div className="p-10 text-center text-lg font-semibold">Loading Profile...</div>;
  if (!farmer) return <div className="p-10 text-center text-red-500">Farmer not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header / Profile Card */}
      <div className="bg-emerald-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-emerald-700 text-3xl font-bold shadow-lg border-4 border-emerald-500">
             {farmer.name ? farmer.name[0].toUpperCase() : 'F'}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">{farmer.name}</h1>
            {farmer.specialty && (
              <p className="text-emerald-200 text-sm font-semibold uppercase tracking-wider mb-2">
                Specialist in {farmer.specialty}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
              <p className="text-emerald-100 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {farmer.location || 'Location not specified'}
              </p>
              {farmer.phone && (
                <p className="text-emerald-100 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {farmer.phone}
                </p>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium justify-center md:justify-start">
               <span className="bg-emerald-800/50 px-3 py-1.5 rounded-full border border-emerald-500/30 backdrop-blur-sm flex items-center gap-1 shadow-inner">
                 📦 {products.length} Products
               </span>
               <span className="bg-emerald-800/50 px-3 py-1.5 rounded-full border border-emerald-500/30 backdrop-blur-sm flex items-center gap-1 shadow-inner">
                 Verified Seller ✅
               </span>
               <span className="bg-emerald-800/50 px-3 py-1.5 rounded-full border border-emerald-500/30 backdrop-blur-sm flex items-center gap-1 shadow-inner">
                 Since {new Date(farmer.createdAt).getFullYear()}
               </span>
               <Link 
                  to={`/messages/${farmer._id}`}
                  className="bg-amber-400 text-amber-900 border border-amber-300 px-4 py-1.5 rounded-full font-bold hover:bg-amber-300 transition shadow-lg flex items-center gap-2 active:scale-95"
               >
                 💬 Chat with Farmer
               </Link>
            </div>
            {/* Show About text if available */}
            {farmer.about && (
              <div className="mt-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300 mb-2">Our Farm Story</p>
                <p className="text-emerald-50 max-w-2xl text-lg leading-relaxed opacity-90 italic border-l-4 border-emerald-400 pl-6 py-2">
                  "{farmer.about}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Farm Fresh Produce</h2>
        
        {products.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">This farmer has no active listings at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link 
                to={`/product/${product._id}`} 
                key={product._id} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition duration-300 block"
              >
                <div className="h-48 bg-gray-100 relative">
                  <img 
                    src={product.image ? `${BASE_URL}${product.image}` : 'https://via.placeholder.com/300'}                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 right-2 bg-white/90 text-emerald-800 text-xs font-bold px-2 py-1 rounded shadow-sm">
                    {product.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2 h-10">{product.description}</p>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-bold text-emerald-600">₹{product.price}/kg</span>
                    <button 
                      onClick={(e) => addToCart(e, product)}
                      className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-700 active:scale-95 transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default FarmerProfile;
