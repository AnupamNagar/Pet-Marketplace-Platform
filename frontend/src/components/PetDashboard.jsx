import React, { useState, useEffect } from "react";
import PetService from "../services/pet.service";
import { Search, Filter, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const PetDashboard = () => {
  const [pets, setPets] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = () => {
    setLoading(true);
    PetService.getAvailablePets()
      .then((response) => {
        setPets(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching pets:", error);
        setLoading(false);
      });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    PetService.searchPets(category, keyword)
      .then((response) => {
        setPets(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error searching pets:", error);
        setLoading(false);
      });
  };

  return (
    <div className="flex flex-col space-y-8">
      {/* Header and Search */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Find Your New <span className="text-indigo-600">Best Friend</span>
        </h1>
        
        <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
          <div className="relative flex-grow md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              placeholder="Search breeds, names..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <select
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-700"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="DOG">Dogs</option>
              <option value="CAT">Cats</option>
              <option value="BIRD">Birds</option>
              <option value="FISH">Fish</option>
              <option value="RABBIT">Rabbits</option>
              <option value="REPTILE">Reptiles</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Pet Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">No pets found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search filters.</p>
          <button 
            onClick={() => { setKeyword(""); setCategory(""); fetchPets(); }}
            className="mt-4 text-indigo-600 font-medium hover:text-indigo-800"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pets.map((pet) => (
            <Link key={pet.id} to={`/pets/${pet.id}`} className="group">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
                  <img
                    src={pet.imageUrls && pet.imageUrls.length > 0 ? pet.imageUrls[0] : `https://placehold.co/400x300?text=${pet.category}`}
                    alt={pet.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { 
                      e.currentTarget.onerror = null; 
                      e.currentTarget.src = "https://placehold.co/400x300?text=Pet+Image"; 
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-900 shadow-sm">
                    ${pet.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{pet.name}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                      {pet.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm font-medium mb-1">{pet.breed}</p>
                  
                  <div className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {pet.age} {pet.age === 1 ? 'month' : 'months'} old
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      Listed by {pet.sellerUsername}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PetDashboard;
