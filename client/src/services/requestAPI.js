
import apiClient from "./apiClient.js";

// Registered-user requests (existing protected endpoint)
export const createRequest = (payload) =>
  apiClient.post("/request/create", payload).then((r) => r.data);

// Anonymous website SOS (public endpoint)
export const createAnonymousSOS = (payload) =>
  apiClient.post("/request/sos", payload).then((r) => r.data);

export const getRequests = (params) =>
  apiClient.get("/request/all", { params }).then((r) => r.data);

export const getNearbyRequests = (params) =>
  apiClient.get("/request/nearby", { params }).then((r) => r.data);

export const updateRequest = (id, payload) =>
  apiClient.put(`/request/update/${id}`, payload).then((r) => r.data);

export const deleteRequest = (id) =>
  apiClient.delete(`/request/delete/${id}`).then((r) => r.data);
