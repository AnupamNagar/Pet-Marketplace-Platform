import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PetService from "../services/pet.service";
import TransactionService from "../services/transaction.service";
import AuthService from "../services/auth.service";
import { ArrowLeft, Mail, Calendar, Info, Tag, ShoppingCart, CheckCircle } from "lucide-react";

const PetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState(null);
  const [activeMediaType, setActiveMediaType] = useState('image');
  const [showModal, setShowModal] = useState(false);
  const [buying, setBuying] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const [buyError, setBuyError] = useState("");
  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    PetService.getPetById(id)
      .then((response) => {
        setPet(response.data);
        if (response.data.imageUrls && response.data.imageUrls.length > 0) {
           setActiveMedia(response.data.imageUrls[0]);
           setActiveMediaType('image');
        } else if (response.data.videoUrl) {
           setActiveMedia(response.data.videoUrl);
           setActiveMediaType('video');
        } else {
           setActiveMedia(`https://placehold.co/800x600?text=${response.data.category}`);
           setActiveMediaType('image');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching pet details:", error);
        setLoading(false);
      });
  }, [id]);

  const handleCheckout = async () => {
    setBuying(true);
    setBuyError("");
    try {
      // 1. Create Razorpay Order on Backend
      const orderRes = await TransactionService.createRazorpayOrder(pet.id);
      const { orderId, amount, currency, keyId } = orderRes.data;

      // 2. Configure Razorpay Options
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "PetVerse",
        description: `Purchase ${pet.name}`,
        image: pet.imageUrls && pet.imageUrls.length > 0 ? pet.imageUrls[0] : "https://placehold.co/100x100?text=PetVerse",
        order_id: orderId,
        handler: async (response) => {
          // 3. Verify Payment on Backend
          try {
            setBuying(true);
            const verifyRes = await TransactionService.verifyRazorpayPayment({
              petId: pet.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            
            setTransaction(verifyRes.data);
            setPet(prev => ({ ...prev, status: 'SOLD' }));
            setShowModal(false);
          } catch (error) {
            setBuyError("Payment verification failed. Please contact support.");
          } finally {
            setBuying(false);
          }
        },
        prefill: {
          name: currentUser.username,
          email: currentUser.email || "",
        },
        theme: {
          color: "#4f46e5", // Indigo-600
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setBuyError(response.error.description || "Payment failed");
      });
      rzp.open();
    } catch (error) {
      const msg = (error.response && error.response.data && error.response.data.message) || error.message || "Could not initiate payment";
      setBuyError(msg);
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900">Pet Not Found</h2>
        <button onClick={() => navigate("/")} className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Listings
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Media Gallery Section */}
          <div className="flex flex-col border-r border-gray-100">
            {/* Main Display */}
            <div className="h-96 bg-gray-100 relative w-full">
              {activeMediaType === 'video' ? (
                <video 
                  src={activeMedia} 
                  controls 
                  autoPlay
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <img 
                  src={activeMedia}
                  alt={pet.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => { 
                    e.currentTarget.onerror = null; 
                    e.currentTarget.src = "https://placehold.co/800x600?text=Image+Not+Found"; 
                  }}
                />
              )}
              <div className="absolute top-4 right-4 tracking-wide z-10">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm ${
                  pet.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {pet.status.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex p-4 gap-2 overflow-x-auto bg-white">
               {pet.imageUrls && pet.imageUrls.map((url, idx) => (
                 <button 
                  key={`img-${idx}`}
                  onClick={() => { setActiveMedia(url); setActiveMediaType('image'); }}
                  className={`relative flex-shrink-0 h-20 w-24 rounded-md overflow-hidden border-2 transition-all ${activeMedia === url ? 'border-indigo-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                 >
                   <img src={url} alt={`Thumbnail ${idx}`} className="h-full w-full object-cover" />
                 </button>
               ))}
               {pet.videoUrl && (
                 <button 
                  onClick={() => { setActiveMedia(pet.videoUrl); setActiveMediaType('video'); }}
                  className={`relative flex-shrink-0 h-20 w-24 rounded-md overflow-hidden border-2 transition-all flex items-center justify-center bg-gray-900 ${activeMedia === pet.videoUrl ? 'border-indigo-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                 >
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                       <svg className="w-4 h-4 text-white ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path></svg>
                     </div>
                   </div>
                   <video src={pet.videoUrl} className="h-full w-full object-cover opacity-50" />
                 </button>
               )}
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8 lg:p-12 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {pet.category}
              </span>
              <span className="text-sm text-gray-400">Listed on {new Date(pet.createdAt).toLocaleDateString()}</span>
            </div>

            <h1 className="text-4xl font-extrabold text-gray-900 mb-1">{pet.name}</h1>
            <p className="text-xl text-indigo-600 font-semibold mb-6">
              ${pet.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-start">
                <Tag className="h-5 w-5 text-gray-400 mr-2 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Breed</p>
                  <p className="text-base text-gray-900">{pet.breed}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mr-2 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Age</p>
                  <p className="text-base text-gray-900">{pet.age} {pet.age === 1 ? 'month' : 'months'}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 flex items-center mb-2">
                <Info className="h-5 w-5 text-gray-400 mr-2" />
                About {pet.name}
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {pet.description || "No description provided for this pet yet."}
              </p>
            </div>

              <div className="mt-auto border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Seller Information</h3>
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold text-lg mr-3">
                    {pet.sellerUsername.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900">{pet.sellerUsername}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-0.5">
                      <Mail className="h-3.5 w-3.5 mr-1" />
                      {pet.sellerEmail}
                    </div>
                  </div>
                </div>

                {transaction ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="font-bold text-green-800">Purchase Successful! 🎉</p>
                    <p className="text-sm text-green-600 mt-1">Transaction #{transaction.id} confirmed. Check your email for details.</p>
                  </div>
                ) : (
                  <button
                    className="w-full mt-2 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-bold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed gap-2"
                    disabled={pet.status !== 'AVAILABLE' || !currentUser || currentUser.username === pet.sellerUsername}
                    onClick={() => setShowModal(true)}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {pet.status === 'AVAILABLE' 
                      ? currentUser 
                        ? currentUser.username === pet.sellerUsername ? 'This is your listing' : 'Buy Now'
                        : 'Log in to Buy'
                      : 'Currently Unavailable'}
                  </button>
                )}
              </div>
            
          </div>
        </div>
      </div>

      {showModal && pet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Confirm Purchase</h2>
            <p className="text-sm text-gray-500 mb-6">Please review your order before confirming.</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-4 flex items-center gap-4">
              <img
                src={pet.imageUrls && pet.imageUrls.length > 0 ? pet.imageUrls[0] : `https://placehold.co/80x80?text=${pet.category}`}
                alt={pet.name}
                className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
              />
              <div>
                <p className="font-bold text-gray-900">{pet.name}</p>
                <p className="text-sm text-gray-500">{pet.breed} · {pet.category}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between text-gray-700">
                <span>Pet Price</span>
                <span className="font-semibold">${pet.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Platform Fee (5%)</span>
                <span>-${(pet.price * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t pt-2 mt-2">
                <span>Total Charged</span>
                <span className="text-indigo-700">${pet.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            {buyError && (
              <div className="mb-4 rounded-md bg-red-50 p-3 border border-red-200 text-sm text-red-700">{buyError}</div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setShowModal(false); setBuyError(""); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleCheckout} disabled={buying} className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-bold text-white disabled:opacity-50 transition-colors">
                {buying ? 'Processing...' : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetDetails;
