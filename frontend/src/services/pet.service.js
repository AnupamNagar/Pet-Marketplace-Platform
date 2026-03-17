import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8080/api/pets";

const getAvailablePets = () => {
  return axios.get(API_URL + "/available");
};

const getPetById = (id) => {
  return axios.get(API_URL + "/" + id);
};

const searchPets = (category, keyword) => {
  let url = API_URL + "/search?";
  if (category) url += `category=${category}&`;
  if (keyword) url += `keyword=${keyword}`;
  return axios.get(url);
};

const getPetsBySeller = (sellerId) => {
  return axios.get(API_URL + "/seller/" + sellerId, { headers: authHeader() });
};

const createPetListing = (petData) => {
  return axios.post(API_URL, petData, { headers: authHeader() });
};

const updatePetStatus = (id, status) => {
  return axios.patch(API_URL + `/${id}/status?status=${status}`, {}, { headers: authHeader() });
};

const deletePetListing = (id) => {
  return axios.delete(API_URL + "/" + id, { headers: authHeader() });
};

const uploadFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post("http://localhost:8080/api/files/upload", formData, {
    headers: {
      ...authHeader(),
      "Content-Type": "multipart/form-data"
    }
  });
};

const PetService = {
  getAvailablePets,
  getPetById,
  searchPets,
  getPetsBySeller,
  createPetListing,
  updatePetStatus,
  deletePetListing,
  uploadFile,
};

export default PetService;
