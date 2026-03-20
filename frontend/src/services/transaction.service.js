import axios from "axios";
import authHeader from "./auth-header";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080/api");

const checkout = (petId) => {
  return axios.post(API_URL + "/transactions/checkout", { petId }, { headers: authHeader() });
};

// Razorpay Step 1: Create Order
const createRazorpayOrder = (petId) => {
  return axios.post(API_URL + "/payments/create-order", { petId }, { headers: authHeader() });
};

// Razorpay Step 2: Verify Payment
const verifyRazorpayPayment = (paymentData) => {
  return axios.post(API_URL + "/payments/verify", paymentData, { headers: authHeader() });
};

const getBuyerTransactions = () => {
  return axios.get(API_URL + "/transactions/buyer", { headers: authHeader() });
};

const getSellerTransactions = () => {
  return axios.get(API_URL + "/transactions/seller", { headers: authHeader() });
};

const TransactionService = {
  checkout,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getBuyerTransactions,
  getSellerTransactions,
};

export default TransactionService;
