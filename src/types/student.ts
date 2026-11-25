export interface Student {
  sid: number | string;
  sname: string;
  phone: number | string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
