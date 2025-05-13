import { api, paymentApi } from "../services/api";

export interface LoginCredentials {
  user: string;
  pass: string;
  hwid?: string;
}

export interface LoginLicense {
  license: string;
  hwid?: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
  license: string;
  hwid?: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  user?: {
    username: string;
    email: string;
    licenseKey?: string;
  };
  license?: {
    key: string;
    productId: string;
    expiry: string;
  };
}

let hwid = localStorage.getItem("hwid") || "";

if (!hwid) {
  // Requisição para pegar do servidor autenticado
  api.get("/hwid")
    .then((res) => {
      hwid = res.data.hwid;
      localStorage.setItem("hwid", hwid);
    })
    .catch(() => {
      localStorage.setItem("hwid", hwid);
    });
}

export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth', {
      user: credentials.user,
      pass: credentials.pass,
      hwid: credentials.hwid || hwid
    });
    return response.data;
  },

  loginWithLicense: async (data: LoginLicense): Promise<AuthResponse> => {
    const response = await api.post('/login', {
      license: data.license,
      hwid: data.hwid || hwid,
    });
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/register', {
      username: data.username,
      password: data.password,
      email: data.email,
      license: data.license,
      hwid: data.hwid || hwid
    });
    return response.data;
  }
};