import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PetService from "../services/pet.service";

const CreatePetListing = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    price: "",
    category: "DOG",
    description: "",
  });

  const [images, setImages] = useState([]); // File objects
  const [video, setVideo] = useState(null); // File object
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (images.length + selectedFiles.length > 5) {
        setErrorMsg("You can only upload a maximum of 5 images.");
        return;
      }
      setImages((prevImages) => [...prevImages, ...selectedFiles]);
      setErrorMsg("");
    }
  };

  const handleVideoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setVideo(e.target.files[0]);
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const removeVideo = () => {
    setVideo(null);
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // 1. Upload Images
      const uploadedImageUrls = [];
      for (const imageFile of images) {
        const res = await PetService.uploadFile(imageFile);
        uploadedImageUrls.push(res.data.url);
      }

      // 2. Upload Video
      let uploadedVideoUrl = "";
      if (video) {
        const res = await PetService.uploadFile(video);
        uploadedVideoUrl = res.data.url;
      }

      // 3. Create Pet Request
      const petRequest = {
        name: formData.name,
        breed: formData.breed,
        age: parseInt(formData.age),
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description,
        imageUrls: uploadedImageUrls,
        videoUrl: uploadedVideoUrl,
      };

      await PetService.createPetListing(petRequest);
      navigate("/pets");
    } catch (error) {
      const resMessage =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      setErrorMsg(resMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          List a New Pet
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Add beautiful photos and a video to help them find a loving home
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleCreateListing}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pet Details */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Pet Name</label>
                <input id="name" name="name" type="text" required value={formData.name} onChange={handleInputChange} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                <select id="category" name="category" value={formData.category} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border">
                  <option value="DOG">Dog</option>
                  <option value="CAT">Cat</option>
                  <option value="BIRD">Bird</option>
                  <option value="RABBIT">Rabbit</option>
                  <option value="REPTILE">Reptile</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="breed" className="block text-sm font-medium text-gray-700">Breed</label>
                <input id="breed" name="breed" type="text" required value={formData.breed} onChange={handleInputChange} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age (months/years)</label>
                <input id="age" name="age" type="number" required min="0" value={formData.age} onChange={handleInputChange} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>

              <div>
                 <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($)</label>
                 <input id="price" name="price" type="number" required min="0" step="0.01" value={formData.price} onChange={handleInputChange} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea id="description" name="description" rows="4" required value={formData.description} onChange={handleInputChange} className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
            </div>

            {/* Media Uploads */}
            <div className="py-4 border-t border-gray-200 mt-6">
               <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Media Uploads</h3>
               
               {/* Image Upload */}
               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 mb-2">Images (Max 5)</label>
                 <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                   <div className="space-y-1 text-center">
                     <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                       <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                     </svg>
                     <div className="flex text-sm text-gray-600 justify-center">
                       <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                         <span>Upload images</span>
                         <input id="image-upload" name="image-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageChange} disabled={images.length >= 5} />
                       </label>
                       <p className="pl-1">or drag and drop</p>
                     </div>
                     <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                   </div>
                 </div>
                 
                 {/* Image Previews */}
                 {images.length > 0 && (
                   <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                     {images.map((img, idx) => (
                       <div key={idx} className="relative rounded-lg overflow-hidden h-24 border border-gray-200 shadow-sm group">
                         <img src={URL.createObjectURL(img)} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                         <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                         </button>
                       </div>
                     ))}
                   </div>
                 )}
               </div>

               {/* Video Upload */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Video (Max 1)</label>
                 {!video ? (
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label htmlFor="video-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>Upload a video</span>
                            <input id="video-upload" name="video-upload" type="file" className="sr-only" accept="video/*" onChange={handleVideoChange} />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">MP4, WebM up to 50MB</p>
                      </div>
                    </div>
                 ) : (
                    <div className="mt-2 flex items-center justify-between p-3 bg-indigo-50 rounded-md border border-indigo-100">
                       <span className="text-sm font-medium text-indigo-700 truncate mr-4">{video.name}</span>
                       <button type="button" onClick={removeVideo} className="text-sm text-red-600 hover:text-red-800 font-medium whitespace-nowrap">
                         Remove Video
                       </button>
                    </div>
                 )}
               </div>
            </div>

            {errorMsg && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="text-sm text-red-700">{errorMsg}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
              >
                {loading ? "Uploading & Creating Listing..." : "Publish Pet Listing"}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePetListing;
