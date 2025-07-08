import React, { useContext, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/layout/MainLayout';
import { Role } from './types';
import NotFoundPage from './pages/NotFoundPage';
import PageLoader from './components/ui/PageLoader';

// Portal Imports
import { PortalAuthContext } from './context/PortalAuthContext';
import PortalLayout from './components/layout/PortalLayout';
import PortalLoginPage from './pages/portal/PortalLoginPage';

// --- Lazy Loaded Page Components ---

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageUsersPage = lazy(() => import('./pages/admin/ManageUsersPage'));
const TariffsPage = lazy(() => import('./pages/admin/TariffsPage'));
const AuditLogsPage = lazy(() => import('./pages/admin/AuditLogsPage'));
const DataExchangePage = lazy(() => import('./pages/admin/DataExchangePage'));
const AnnouncementsPage = lazy(() => import('./pages/admin/AnnouncementsPage'));
const CompanySettingsPage = lazy(() => import('./pages/admin/CompanySettingsPage'));

// Engineer Pages
const EngineerDashboard = lazy(() => import('./pages/engineer/EngineerDashboard'));
const AbonentsPage = lazy(() => import('./pages/engineer/AbonentsPage'));
const RequestsPage = lazy(() => import('./pages/engineer/RequestsPage'));
const MapPage = lazy(() => import('./pages/engineer/MapPage'));
const MaintenancePage = lazy(() => import('./pages/engineer/MaintenancePage'));
const WaterQualityPage = lazy(() => import('./pages/engineer/WaterQualityPage'));
const ReadingsPage = lazy(() => import('./pages/engineer/ReadingsPage'));
const InventoryPage = lazy(() => import('./pages/engineer/InventoryPage'));
const AccrualsPage = lazy(() => import('./pages/engineer/AccrualsPage'));
const InfrastructurePage = lazy(() => import('./pages/engineer/InfrastructurePage'));
const ReportsPage = lazy(() => import('./pages/engineer/ReportsPage'));
const CheckClosingPage = lazy(() => import('./pages/engineer/CheckClosingPage'));

// Accountant Pages
const AccountantDashboard = lazy(() => import('./pages/accountant/dashboard/AccountantDashboard'));
const PaymentsPage = lazy(() => import('./pages/accountant/PaymentsPage'));
const ExpensesPage = lazy(() => import('./pages/accountant/ExpensesPage'));
const SalariesPage = lazy(() => import('./pages/accountant/SalariesPage'));
const BudgetPage = lazy(() => import('./pages/accountant/BudgetPage'));
const AccountantReportsPage = lazy(() => import('./pages/accountant/ReportsPage'));
const BankOperationsPage = lazy(() => import('./pages/accountant/BankOperationsPage'));
const DebtorsPage = lazy(() => import('./pages/accountant/DebtorsPage'));
const ManualChargesPage = lazy(() => import('./pages/accountant/ManualChargesPage'));
const DocumentsPage = lazy(() => import('./pages/accountant/DocumentsPage'));
const AppealsPage = lazy(() => import('./pages/accountant/AppealsPage'));

// Portal Pages
const PortalDashboardPage = lazy(() => import('./pages/portal/PortalDashboardPage'));
const PortalReadingsPage = lazy(() => import('./pages/portal/ReadingsPage'));
const PortalHistoryPage = lazy(() => import('./pages/portal/HistoryPage'));
const PortalProfilePage = lazy(() => import('./pages/portal/ProfilePage'));

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const auth = useContext(AuthContext);

    if (!auth?.user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(auth.user.role)) {
        const defaultPath = `/${auth.user.role}/dashboard`;
        return <Navigate to={defaultPath} replace />;
    }

    return <>{children}</>;
};

const PortalProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const portalAuth = useContext(PortalAuthContext);
    if (!portalAuth?.abonent) {
        return <Navigate to="/portal/login" replace />;
    }
    return <>{children}</>;
};

const App: React.FC = () => {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={[Role.Admin]}>
                        <MainLayout />
                    </ProtectedRoute>
                }>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<ManageUsersPage />} />
                    <Route path="tariffs" element={<TariffsPage />} />
                    <Route path="logs" element={<AuditLogsPage />} />
                    <Route path="data-exchange" element={<DataExchangePage />} />
                    <Route path="announcements" element={<AnnouncementsPage />} />
                    <Route path="settings" element={<CompanySettingsPage />} />
                    <Route index element={<Navigate to="dashboard" replace />} />
                </Route>

                {/* Engineer and Controller Routes */}
                <Route path="/engineer" element={
                    <ProtectedRoute allowedRoles={[Role.Engineer, Role.Controller]}>
                        <MainLayout />
                    </ProtectedRoute>
                }>
                    <Route path="dashboard" element={<EngineerDashboard />} />
                    <Route path="abonents" element={<AbonentsPage />} />
                    <Route path="requests" element={<RequestsPage />} />
                    <Route path="map" element={<MapPage />} />
                    <Route path="maintenance" element={<MaintenancePage />} />
                    <Route path="water-quality" element={<WaterQualityPage />} />
                    <Route path="readings" element={<ReadingsPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="accruals" element={<AccrualsPage />} />
                    <Route path="infrastructure" element={<InfrastructurePage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="check-closing" element={<CheckClosingPage />} />
                    <Route index element={<Navigate to="dashboard" replace />} />
                </Route>

                {/* Accountant Routes */}
                <Route path="/accountant" element={
                    <ProtectedRoute allowedRoles={[Role.Accountant]}>
                        <MainLayout />
                    </ProtectedRoute>
                }>
                    <Route path="dashboard" element={<AccountantDashboard />} />
                    <Route path="payments" element={<PaymentsPage />} />
                    <Route path="expenses" element={<ExpensesPage />} />
                    <Route path="salaries" element={<SalariesPage />} />
                    <Route path="budget" element={<BudgetPage />} />
                    <Route path="reports" element={<AccountantReportsPage />} />
                    <Route path="bank-operations" element={<BankOperationsPage />} />
                    <Route path="debtors" element={<DebtorsPage />} />
                    <Route path="manual-charges" element={<ManualChargesPage />} />
                    <Route path="documents" element={<DocumentsPage />} />
                    <Route path="appeals" element={<AppealsPage />} />
                    <Route index element={<Navigate to="dashboard" replace />} />
                </Route>
                
                {/* Portal Routes */}
                <Route path="/portal/login" element={<PortalLoginPage />} />
                <Route path="/portal" element={
                    <PortalProtectedRoute>
                        <PortalLayout />
                    </PortalProtectedRoute>
                }>
                    <Route path="dashboard" element={<PortalDashboardPage />} />
                    <Route path="readings" element={<PortalReadingsPage />} />
                    <Route path="history" element={<PortalHistoryPage />} />
                    <Route path="profile" element={<PortalProfilePage />} />
                    <Route index element={<Navigate to="dashboard" replace />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
};

export default App;
