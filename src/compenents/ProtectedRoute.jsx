import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const adminToken = localStorage.getItem("adminToken");

  // إذا لم يوجد توكن → نعيد المستخدم إلى صفحة تسجيل الدخول
  if (!adminToken) {
    return <Navigate to="/login" replace />;
  }

  // إذا وجد → نعرض الصفحة المطلوبة
  return children;
};

export default ProtectedRoute;
