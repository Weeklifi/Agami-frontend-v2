import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import CheckEmail from "./pages/auth/CheckEmail";
import Activate from "./pages/auth/Activate";
import JoinPage from "./pages/student/JoinPage";

import TeacherDashboard from "./pages/teacher/Dashboard";
import Batches from "./pages/teacher/Batches";
import StudentListPage from "./pages/teacher/StudentListPage";
import Subscription from "./pages/teacher/Subscription";
import Plans from "./pages/teacher/Plans";
import Checkout from "./pages/teacher/Checkout";
import Profile from "./pages/teacher/Profile";
import BulkSms from "./pages/teacher/BulkSms";
import SmsRecharge from "./pages/teacher/SmsRecharge";

import StudentDashboard from "./pages/student/Dashboard";
import MyBatches from "./pages/student/MyBatches";
import Payments from "./pages/student/Payments";

import RoomPage from "./pages/room/RoomPage";
import AttendancePage from "./pages/room/AttendancePage";
import ResultsPage from "./pages/room/ResultsPage";
import RoutinePage from "./pages/room/RoutinePage";
import FeePage from "./pages/room/FeePage";

import Notifications from "./pages/Notifications";
import PaymentResult from "./pages/payment/PaymentResult";

function Home() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "TEACHER" ? "/teacher/batches" : "/student/batches"} replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <LanguageProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route path="/activate/:uid/:token" element={<Activate />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          <Route path="/teacher" element={<ProtectedRoute role="TEACHER"><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/batches" element={<ProtectedRoute role="TEACHER"><Batches /></ProtectedRoute>} />
          <Route path="/teacher/batches/:id/students" element={<ProtectedRoute role="TEACHER"><StudentListPage /></ProtectedRoute>} />
          <Route path="/teacher/batches/:id/attendance" element={<ProtectedRoute role="TEACHER"><AttendancePage /></ProtectedRoute>} />
          <Route path="/teacher/batches/:id/results" element={<ProtectedRoute role="TEACHER"><ResultsPage /></ProtectedRoute>} />
          <Route path="/teacher/batches/:id/routine" element={<ProtectedRoute role="TEACHER"><RoutinePage /></ProtectedRoute>} />
          <Route path="/teacher/batches/:id/fee" element={<ProtectedRoute role="TEACHER"><FeePage /></ProtectedRoute>} />
          <Route path="/teacher/batches/:id" element={<ProtectedRoute role="TEACHER"><RoomPage /></ProtectedRoute>} />

          <Route path="/teacher/subscription" element={<ProtectedRoute role="TEACHER"><Subscription /></ProtectedRoute>} />
          <Route path="/teacher/plans" element={<ProtectedRoute role="TEACHER"><Plans /></ProtectedRoute>} />
          <Route path="/teacher/checkout/:planId" element={<ProtectedRoute role="TEACHER"><Checkout /></ProtectedRoute>} />
          <Route path="/teacher/profile" element={<ProtectedRoute role="TEACHER"><Profile /></ProtectedRoute>} />
          <Route path="/teacher/sms" element={<ProtectedRoute role="TEACHER"><BulkSms /></ProtectedRoute>} />
          <Route path="/teacher/sms/recharge" element={<ProtectedRoute role="TEACHER"><SmsRecharge /></ProtectedRoute>} />

          <Route path="/student" element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/batches" element={<ProtectedRoute role="STUDENT"><MyBatches /></ProtectedRoute>} />
          <Route path="/student/batches/:id/attendance" element={<ProtectedRoute role="STUDENT"><AttendancePage /></ProtectedRoute>} />
          <Route path="/student/batches/:id/results" element={<ProtectedRoute role="STUDENT"><ResultsPage /></ProtectedRoute>} />
          <Route path="/student/batches/:id/routine" element={<ProtectedRoute role="STUDENT"><RoutinePage /></ProtectedRoute>} />
          <Route path="/student/batches/:id/fee" element={<ProtectedRoute role="STUDENT"><FeePage /></ProtectedRoute>} />
          <Route path="/student/batches/:id" element={<ProtectedRoute role="STUDENT"><RoomPage /></ProtectedRoute>} />
          <Route path="/student/payments" element={<ProtectedRoute role="STUDENT"><Payments /></ProtectedRoute>} />

          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/payment/:status" element={<ProtectedRoute><PaymentResult /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </LanguageProvider>
    </QueryClientProvider>
  );
}
