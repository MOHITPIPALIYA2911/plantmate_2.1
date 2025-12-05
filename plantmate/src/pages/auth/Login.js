import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginImg from "../../assests/lbg.jpeg";
import Logo from "../../assests/logo.jpeg";
import api from "../../lib/api";
import { triggerNotification } from "../../utils/toastUtil";

const Login = () => {
  const [formData, setFormData] = useState({ emailId: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { emailId, password } = formData;

    if (!emailId || !password) {
      return triggerNotification("error", "Please enter both email and password.");
    }
    if (!isValidEmail(emailId)) {
      return triggerNotification("error", "Please enter a valid email address.");
    }

    try {
      setSubmitting(true);
      const res = await api.post("/api/auth/login", { emailId, password });

      const { token, user } = res.data || {};
      if (!token || !user) {
        return triggerNotification("error", "Invalid server response.");
      }

      localStorage.setItem("token", token);
      const fullName = `${user.first_Name || ""} ${user.LastName || ""}`.trim();
      localStorage.setItem("user", JSON.stringify({ ...user, name: fullName }));

      triggerNotification("success", "Login successful.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.status === 401
          ? "Invalid email or password."
          : err?.response?.data?.message || "Something went wrong.";
      triggerNotification("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="relative bg-no-repeat bg-cover bg-center min-h-screen"
      style={{ backgroundImage: `url(${loginImg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-green-500 to-green-400 opacity-75"></div>

      <div className="flex flex-col sm:flex-row justify-center items-center min-h-screen px-4 py-8 sm:py-0">
        <div className="flex justify-center self-center z-10 w-full max-w-md sm:max-w-none">
          <div className="p-6 sm:p-8 md:p-12 bg-white mx-auto rounded-2xl w-full sm:w-96 shadow-lg">
            <div className="mb-4 sm:mb-6 text-center">
              <img src={Logo} alt="Logo" className="h-12 sm:h-16 mb-3 rounded shadow-lg mx-auto" />
              <p className="text-sm sm:text-base text-gray-500">Please sign in to your account.</p>
            </div>
            <form className="space-y-4 sm:space-y-5" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label htmlFor="emailId" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="emailId"
                  name="emailId"
                  type="text"
                  placeholder="you@example.com"
                  value={formData.emailId}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-green-50 border border-green-200 rounded-lg focus:outline-none focus:border-green-400 focus:bg-green-100 text-gray-900 placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-green-50 border border-green-200 rounded-lg focus:outline-none focus:border-green-400 focus:bg-green-100 text-gray-900 placeholder:text-gray-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center bg-green-400 hover:bg-green-500 text-white py-2.5 sm:p-3 rounded-full text-sm sm:text-base font-semibold shadow-lg transition duration-500 disabled:opacity-60"
              >
                {submitting ? "Signing in..." : "Sign in"}
              </button>
            </form>
            <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600">
              Don't have an account?{" "}
              <span
                onClick={() => navigate("/registration")}
                className="text-green-600 cursor-pointer hover:underline font-medium"
              >
                Sign up
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
