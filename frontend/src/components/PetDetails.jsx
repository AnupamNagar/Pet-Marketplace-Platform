import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PetService from "../services/pet.service";
import { ArrowLeft, MapPin, Mail, Calendar, Info, Tag } from "lucide-react";

const PetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState(null); // URL of active image or video
  const [activeMediaType, setActiveMediaType] = useState('image'); // 'image' or 'video'

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

              <button 
                className="w-full mt-2 inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.98]"
                disabled={pet.status !== 'AVAILABLE'}
              >
                {pet.status === 'AVAILABLE' ? 'Contact Seller to Buy' : 'Currently Unavailable'}
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetails;
