import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

interface FailedRequestQueue {
    resolve: (value: string | null) => void;
    reject: (reason: AxiosError) => void;
}

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, 
    timeout: 10000, 
});

let isRefreshing = false;
let failedQueue: FailedRequestQueue[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (error.response && error.response.status === 401 && originalRequest) {
            
            const isAuthRoute = originalRequest.url?.includes('/auth/') || originalRequest.url?.includes('/logout');
            if (isAuthRoute) return Promise.reject(error);

            const isAdminRequest = originalRequest.url?.includes('/admin/');
            const refreshEndpoint = isAdminRequest ? '/admin/auth/refresh' : '/auth/refresh';
            
            // CEK APAKAH INI PERMINTAAN PROFIL DARI NAVBAR
            const isProfileRequest = originalRequest.url?.includes('/profile');

            if (originalRequest.url?.includes(refreshEndpoint)) {
                // Jangan redirect kalau ternyata dia cuma guest (belum punya profile)
                if (!isProfileRequest) {
                    window.location.href = isAdminRequest ? '/admin/login' : '/login';
                }
                return Promise.reject(error);
            }

            if (!originalRequest._retry) {
                if (isRefreshing) {
                    return new Promise<string | null>((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then(() => api(originalRequest)).catch(err => Promise.reject(err));
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    await api.post(refreshEndpoint);
                    processQueue(null);
                    return api(originalRequest);
                } catch (refreshError) {
                    const axiosRefreshError = refreshError as AxiosError;
                    processQueue(axiosRefreshError);
                    
                    // Jangan redirect ke login jika yang gagal di-refresh adalah navbar profile
                    if (!isProfileRequest) {
                        window.location.href = isAdminRequest ? '/admin/login' : '/login';
                    }
                    return Promise.reject(axiosRefreshError);
                } finally {
                    isRefreshing = false;
                }
            }
        }
        return Promise.reject(error);
    }
);