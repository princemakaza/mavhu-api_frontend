// sign_up_service.tsx
import axios from "axios";

export interface Admin {
  _id: string;
  email?: string;
  name?: string;
  [k: string]: any;
}

export interface SignUpResult {
  message?: string;
  admin?: Admin;
  token?: string;
  raw?: any; // raw response for debugging if needed
}

const BASE_URL = "/api/v1/admin_route";

/**
 * Try to find an object shaped like an Admin in a variety of common response shapes.
 * This makes the client resilient to backend shape changes like { data: {...} } vs { admin: {...} } etc.
 */
function extractAdminAndToken(rd: any): SignUpResult {
  if (!rd || typeof rd !== "object") return {};

  const message =
    rd.message ??
    rd.msg ??
    rd.statusText ??
    (typeof rd.status === "string" ? rd.status : undefined);

  const token =
    rd.token ??
    rd.accessToken ??
    rd.data?.token ??
    rd.payload?.token ??
    rd.result?.token;

  // potential places the admin object may live
  const candidates = [
    rd.data,
    rd.admin,
    rd.user,
    rd.payload,
    rd.result,
    // some APIs return { data: { admin: {...} } }
    rd.data?.admin,
    rd.data?.user,
    rd // fallback (in case the API returns the admin at the top level)
  ];

  const admin = candidates.find(
    (c: any) => c && typeof c === "object" && typeof c._id === "string"
  ) as Admin | undefined;

  return { message, admin, token, raw: rd };
}

const SignUpAdmin = async (userData: Record<string, unknown>): Promise<SignUpResult> => {
  try {
    console.log("Sending JSON data to API...");

    const response = await axios.post(`${BASE_URL}/signup`, userData, {
      headers: { "Content-Type": "application/json" }
    });

    console.log("API Response:", response.data);

    const { message, admin, token, raw } = extractAdminAndToken(response.data);

    // Store only when we actually have something to store
    if (token) localStorage.setItem("adminToken", token);
    if (admin) {
      localStorage.setItem("adminData", JSON.stringify(admin));
      localStorage.setItem("adminId", admin._id);
      console.log("Admin signup successful — token/admin stored.");
    } else {
      console.warn("Signup response missing admin object with _id.");
    }

    // Return consistently shaped data to the caller UI
    return { message, admin, token, raw };
  } catch (error: any) {
    console.error("Error signing up admin:", error);

    if (error.response) {
      console.error("Error response:", error.response.data);
      const errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        `Server error: ${error.response.status}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      console.error("No response received:", error.request);
      throw new Error("Network error: No response from server");
    } else {
      console.error("Error message:", error.message);
      throw new Error(error.message || "Unknown error");
    }
  }
};

export default SignUpAdmin;
