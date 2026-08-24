import api from "./Auth_service/api";

export interface Bank {
  id: string;
  name: string;
  reference_id: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  website?: string;
  description?: string;
  status: "active" | "inactive" | "suspended";
  created_at: string;
  updated_at: string;
}

export interface BankUser {
  id: string;
  bank_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface CreateBankPayload {
  name: string;
  reference_id: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  website?: string;
  description?: string;
}

export interface CreateBankUserPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role?: "admin" | "user";
}

export interface BankLoginPayload {
  bank_reference_id: string;
  email: string;
  password: string;
}

export interface PaginatedBanksResponse {
  banks: Bank[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Bank CRUD ──────────────────────────────────────────────────────────────

export const createBank = async (payload: CreateBankPayload): Promise<{ bank: Bank }> => {
  const res = await api.post("/banks", payload);
  return res.data;
};

export const getBanks = async (page = 1, limit = 20, search = ""): Promise<PaginatedBanksResponse> => {
  const res = await api.get("/banks", { params: { page, limit, search } });
  return res.data;
};

export const getBankById = async (id: string): Promise<{ bank: Bank }> => {
  const res = await api.get(`/banks/${id}`);
  return res.data;
};

export const updateBank = async (id: string, payload: Partial<CreateBankPayload> & { status?: string }): Promise<{ bank: Bank }> => {
  const res = await api.patch(`/banks/${id}`, payload);
  return res.data;
};

export const deleteBank = async (id: string): Promise<void> => {
  await api.delete(`/banks/${id}`);
};

// ── Bank User management ───────────────────────────────────────────────────

export const createBankUser = async (bankId: string, payload: CreateBankUserPayload): Promise<{ user: BankUser }> => {
  const res = await api.post(`/banks/${bankId}/users`, payload);
  return res.data;
};

export const getBankUsers = async (bankId: string): Promise<{ users: BankUser[] }> => {
  const res = await api.get(`/banks/${bankId}/users`);
  return res.data;
};

export const updateBankUser = async (bankId: string, userId: string, payload: Partial<CreateBankUserPayload> & { status?: string }): Promise<{ user: BankUser }> => {
  const res = await api.patch(`/banks/${bankId}/users/${userId}`, payload);
  return res.data;
};

export const deleteBankUser = async (bankId: string, userId: string): Promise<void> => {
  await api.delete(`/banks/${bankId}/users/${userId}`);
};

// ── Bank Auth ──────────────────────────────────────────────────────────────

export const loginBank = async (payload: BankLoginPayload): Promise<{ token: string; user: BankUser; bank: Bank }> => {
  const res = await api.post("/banks/login", payload);
  return res.data;
};

export const getBankProfile = async (): Promise<{ user: BankUser }> => {
  const res = await api.get("/banks/profile");
  return res.data;
};
