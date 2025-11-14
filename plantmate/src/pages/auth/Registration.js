// src/pages/auth/Registration.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import loginImg from "../../assests/lbg.jpeg";
import Logo from "../../assests/logo.jpeg";
import api from "../../lib/api";
import { triggerNotification } from "../../utils/toastUtil";

export default function Registration() {
  const [form, setForm] = useState({ firstName:"", lastName:"", emailId:"", password:"", confirm:"" });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const isEmail = (e)=>/^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(e);
  const onChange = (e)=> setForm(p=>({...p,[e.target.name]:e.target.value}));

  const postRegister = async (payload) => {
    try { return await api.post("/auth/register", payload); }
    catch (err) {
      if (err?.response?.status === 404) return await api.post("/api/auth/register", payload);
      throw err;
    }
  };

  const onSubmit = async (e)=>{
    e.preventDefault();
    const { firstName,lastName,emailId,password,confirm } = form;
    if(!firstName.trim() || !lastName.trim()) return triggerNotification("error","Enter your name.");
    if(!isEmail(emailId)) return triggerNotification("error","Enter a valid email.");
    if(!password) return triggerNotification("error","Enter a password.");
    if(password!==confirm) return triggerNotification("error","Passwords do not match.");

    setSubmitting(true);
    try{
      await postRegister({
        first_Name:firstName.trim(),
        LastName:lastName.trim(),
        emailId: emailId.trim().toLowerCase(),
        password
      });
      triggerNotification("success","Registration complete. Please sign in.");
      navigate("/login",{replace:true});
    }catch(err){
      const s = err?.response?.status;
      if(!err?.response) triggerNotification("error","Cannot reach API at http://localhost:7777.");
      else if(s===409) triggerNotification("error","Email already registered.");
      else triggerNotification("error", err?.response?.data?.message || "Server error.");
    }finally{ setSubmitting(false); }
  };

  return (
    <div className="relative bg-no-repeat bg-cover bg-center min-h-screen" style={{backgroundImage:`url(${loginImg})`}}>
      <div className="absolute inset-0 bg-gradient-to-b from-green-500 to-green-400 opacity-75" />
      <div className="flex flex-col sm:flex-row justify-center items-center min-h-screen">
        <div className="flex justify-center self-center z-10">
          <div className="p-12 bg-white mx-auto rounded-2xl w-96 shadow-lg">
            <div className="mb-4 text-center">
              <img src={Logo} alt="Logo" className="h-16 mb-3 rounded shadow-lg mx-auto" />
              <p className="text-gray-500">Register yourself.</p>
            </div>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">First name</label>
                  <input name="firstName" value={form.firstName} onChange={onChange}
                         className="w-full px-4 py-2 bg-green-50 border border-green-200 rounded-lg focus:outline-none focus:border-green-400 focus:bg-green-100 text-gray-900 placeholder:text-gray-500"/>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Last name</label>
                  <input name="lastName" value={form.lastName} onChange={onChange}
                         className="w-full px-4 py-2 bg-green-50 border border-green-200 rounded-lg focus:outline-none focus:border-green-400 focus:bg-green-100 text-gray-900 placeholder:text-gray-500"/>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input name="emailId" value={form.emailId} onChange={onChange} placeholder="you@email.com"
                       className="w-full px-4 py-2 bg-green-50 border border-green-200 rounded-lg focus:outline-none focus:border-green-400 focus:bg-green-100 text-gray-900 placeholder:text-gray-500"/>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Password</label>
                <input type="password" name="password" value={form.password} onChange={onChange}
                       className="w-full px-4 py-2 bg-green-50 border border-green-200 rounded-lg focus:outline-none focus:border-green-400 focus:bg-green-100 text-gray-900 placeholder:text-gray-500"/>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                <input type="password" name="confirm" value={form.confirm} onChange={onChange}
                       className="w-full px-4 py-2 bg-green-50 border border-green-200 rounded-lg focus:outline-none focus:border-green-400 focus:bg-green-100 text-gray-900 placeholder:text-gray-500"/>
              </div>
              <button type="submit" disabled={submitting}
                      className="w-full flex justify-center bg-green-500 hover:bg-green-600 text-white p-3 rounded-full font-semibold shadow-lg transition duration-300 disabled:opacity-60">
                {submitting ? "Signing up..." : "Sign Up"}
              </button>
            </form>
            <p className="mt-3 text-center text-sm text-gray-600">
              Already have an account? <span onClick={()=>navigate("/login")} className="text-green-600 cursor-pointer hover:underline">Sign in</span>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
