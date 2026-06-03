import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface DashboardMetrics {
    totalRevenue: number;
    ticketsSold: number;
    pendingOrders: number;
    activeMoviesCount: number;
}

export interface ChartData {
    name: string;
    total: number;
}

export interface RecentSale {
    paymentId: number;
    bookingId: string | null;
    fnbOrderId: string | null;
    provider: string;
    providerPaymentId: string;
    externalId: string;
    invoiceUrl: string;
    paymentMethod: string;
    amount: string;
    currency: string;
    paymentDate: string;
    paymentStatus: string;
    paidAt: string | null;
    expiresAt: string | null;
    failureReason: string | null;
}

export interface DashboardResponse {
    metrics: DashboardMetrics;
    chart: ChartData[];
    recentSales: RecentSale[];
}

export const useAdminDashboard = () => {
    return useQuery<DashboardResponse, Error>({
        queryKey: ['adminDashboard'],
        queryFn: async () => {
            const response = await api.get<DashboardResponse>('/admin/dashboard');
            return response.data;
        },
        refetchInterval: 60000, 
    });
};