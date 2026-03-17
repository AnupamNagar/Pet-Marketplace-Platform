import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8080/api/transactions";

const checkout = (petId) => {
  return axios.post(API_URL + "/checkout", { petId }, { headers: authHeader() });
};

const getBuyerTransactions = () => {
  return axios.get(API_URL + "/buyer", { headers: authHeader() });
};

const getSellerTransactions = () => {
  return axios.get(API_URL + "/seller", { headers: authHeader() });
};

const TransactionService = {
  checkout,
  getBuyerTransactions,
  getSellerTransactions,
};

export default TransactionService;
