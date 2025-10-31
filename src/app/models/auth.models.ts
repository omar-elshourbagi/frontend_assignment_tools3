export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginResponse {
  user_id: number;
  name: string;
  email: string;
  message: string;
}

export interface RegisterResponse {
  user_id: number;
  name: string;
  email: string;
  message: string;
}


