import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAnimal, getProducts, getComments, addComment } from '../../services/api';
import { useAuth, useCart } from '../../context';

const EMOJI = { cow:'🐄', sheep:'🐑', chicken:'🐓', rabbit:'🐇', other:'🐾' };
const Stars = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map(s => (
      <button key={s} onClick={() => onChange?.(s)}
        className={`text-2xl transition ${s <= value ? 'text-amber-400' : 'text-gray-200'} ${onChange ? 'hover:text-amber-300' : 'cursor-default'}`}>
        ★
      </button>
    ))}
  </div>
);

export default function AnimalDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [animal, setAnimal]     = useState(null);
  const [products, setProducts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [imgIdx, setImgIdx]     = useState(0);

  const [comment, setComment] = useState({ text: '', rating: 5 });
  const [sending, setSending] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL?.replace('/api','') || '';

  useEffect(() => {
    Promise.all([getAnimal(id), getProducts(), getComments(id)])
      .then(([a, p, c]) => {
        setAnimal(a.data);
        setProducts(p.data.filter(prod => prod.animal_id?._id === id || prod.animal_id === id));
        setComments(c.data);
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSending(true);
    try {
      const res = await addComment({ animal_id: id, ...comment });
      setComments(prev => [res.data, ...prev]);
      setComment({ text: '', rating: 5 });
      toast.success('Comment added!');
    } catch { toast.error('Failed to add comment'); }
    finally { setSending(false); }
  };

  const handleAddProduct = (product) => {
    if (!user) return navigate('/login');
    addToCart({ _id: product._id, name: product.name, price: product.final_price || product.price, unit: product.unit, type: 'product' });
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full"/></div>;
  if (!animal) return <div className="text-center py-20 text-gray-400">Animal not found</div>;

  const avgRating = comments.length ? (comments.reduce((s,c) => s + c.rating, 0) / comments.length).toFixed(1) : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-green-600 mb-6 flex items-center gap-1">
        ← Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Images */}
        <div>
          <div className="bg-gradient-to-br from-green-50 to-amber-50 rounded-2xl h-72 flex items-center justify-center overflow-hidden mb-3">
            {animal.images?.[imgIdx] ? (
              <img src={animal.images[imgIdx].startsWith("data:") ? animal.images[imgIdx] : `${API_BASE}${animal.images[imgIdx]}`} alt={animal.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <span className="text-9xl">{EMOJI[animal.type]}</span>
            )}
          </div>
          {animal.images?.length > 1 && (
            <div className="flex gap-2">
              {animal.images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${imgIdx === i ? 'border-green-500' : 'border-gray-200'}`}>
                  <img src={img.startsWith("data:") ? img : `${API_BASE}${img}`} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{animal.name}</h1>
              <p className="text-gray-400 capitalize mt-1">{EMOJI[animal.type]} {animal.type}</p>
            </div>
            <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${animal.status === 'available' ? 'badge-green' : 'badge-red'}`}>
              {animal.status}
            </span>
          </div>

          {avgRating && (
            <div className="flex items-center gap-2 mb-4">
              <Stars value={Math.round(avgRating)} />
              <span className="text-sm text-gray-500">{avgRating} ({comments.length} reviews)</span>
            </div>
          )}

          {animal.description && <p className="text-gray-600 mb-6 leading-relaxed">{animal.description}</p>}

          {animal.birth_date && (
            <p className="text-sm text-gray-400 mb-4">🎂 Born: {new Date(animal.birth_date).toLocaleDateString()}</p>
          )}

          {/* Buy animal option */}
          {animal.for_sale && animal.status === 'available' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4">
              <h3 className="font-semibold text-amber-800 mb-2">🏷️ Buy this animal</h3>
              <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                <div className="bg-white rounded-xl p-2">
                  <p className="text-xs text-gray-400">Price</p>
                  <p className="font-bold text-amber-700">{animal.sale_price} MAD</p>
                </div>
                <div className="bg-white rounded-xl p-2">
                  <p className="text-xs text-gray-400">Age</p>
                  <p className="font-bold text-gray-700">{animal.sale_age}</p>
                </div>
                <div className="bg-white rounded-xl p-2">
                  <p className="text-xs text-gray-400">Weight</p>
                  <p className="font-bold text-gray-700">{animal.sale_weight} kg</p>
                </div>
              </div>
              <button onClick={() => {
                addToCart({ _id: animal._id, name: animal.name, price: animal.sale_price, type: 'animal' });
                toast.success('Animal added to cart!');
              }} className="btn-primary w-full">
                🛒 Add to cart — Full purchase
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Products */}
      {products.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Products from {animal.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{product.name}</h3>
                  {product.discount && (
                    <span className="badge-amber">-{product.discount}%</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-3">Unit: {product.unit}</p>
                <div className="flex items-center justify-between">
                  <div>
                    {product.discount ? (
                      <>
                        <span className="line-through text-gray-400 text-sm">{product.price} MAD</span>
                        <span className="text-green-600 font-bold ml-2">{product.final_price} MAD</span>
                      </>
                    ) : (
                      <span className="text-green-600 font-bold">{product.price} MAD</span>
                    )}
                  </div>
                  <button onClick={() => handleAddProduct(product)} className="btn-primary py-1.5 px-3 text-sm">
                    🛒 Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Comments */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-5">Reviews & Comments</h2>

        {/* Add comment form */}
        {user ? (
          <form onSubmit={handleAddComment} className="card mb-6">
            <h3 className="font-medium text-gray-700 mb-3">Leave a review</h3>
            <Stars value={comment.rating} onChange={(r) => setComment(p => ({ ...p, rating: r }))} />
            <textarea className="input mt-3" rows={3} placeholder="Your comment..."
              value={comment.text} onChange={e => setComment(p => ({ ...p, text: e.target.value }))} required />
            <button type="submit" disabled={sending} className="btn-primary mt-3 px-6">
              {sending ? 'Sending...' : 'Submit'}
            </button>
          </form>
        ) : (
          <div className="card mb-6 text-center text-gray-400">
            <button onClick={() => navigate('/login')} className="text-green-600 font-medium hover:underline">Login</button> to leave a review
          </div>
        )}

        {/* Comments list */}
        <div className="space-y-4">
          {comments.length === 0 && <p className="text-gray-400 text-center py-8">No reviews yet — be the first!</p>}
          {comments.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold text-sm">
                  {c.user_id?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{c.user_id?.name || 'User'}</p>
                  <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
                <Stars value={c.rating} />
              </div>
              <p className="text-gray-600 text-sm">{c.text}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
