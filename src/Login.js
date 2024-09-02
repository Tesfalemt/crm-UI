import React, { useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Toaster, toast } from "react-hot-toast";
import apiService from "./ApiService";
import { useAuth } from "./AuthContext";

const InputField = ({ id, label, type, value, onChange, icon: Icon }) => (
    <div className="input-field">
      <input
        id={id}
        name={id}
        type={type}
        placeholder={label}
        required
        value={value}
        onChange={onChange}
      />
      {Icon && <Icon className="input-icon" aria-hidden="true" />}
    </div>
  );
  
  export default function LoginRegister() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { setIsAuthenticated } = useAuth();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
  
      try {
        if (isLogin) {
          console.log("Attempting login with:", { username: email, password });
          const data = await apiService.login(email, password);
          console.log("Login response:", data);
          setIsAuthenticated(true);
          navigate("/dashboard");
          toast.success("Logged in successfully!");
        } else {
          if (password !== confirmPassword) {
            throw new Error("Passwords don't match");
          }
          console.log("Attempting registration with:", { email, username, password });
          await apiService.register(email, username, password);
          console.log("Registration successful");
          toast.success("Registered successfully! Please log in.");
          setIsLogin(true);
        }
      } catch (error) {
        console.error('Login/Register error:', error);
        toast.error(error.response?.data || error.message || 'An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div className="login-container">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="login-form">
        <div className="form-header">
          <h2>{isLogin ? "Sign in" : "Create Account"}</h2>
          <p>
            {isLogin
              ? "Use your email to sign in."
              : "Enter your details to get started."}
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <InputField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {!isLogin && (
            <InputField
              id="username"
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
          <div className="password-field">
            <InputField
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? (
                <EyeSlashIcon className="password-icon" aria-hidden="true" />
              ) : (
                <EyeIcon className="password-icon" aria-hidden="true" />
              )}
            </button>
          </div>
          {!isLogin && (
            <InputField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}
          {isLogin && (
            <div className="forgot-password">
              <a href="#">Forgot username or password?</a>
            </div>
          )}
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Processing..." : isLogin ? "Sign In" : "Register"}
          </button>
        </form>
        <div className="toggle-form">
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin
              ? "Don't have an account? Create one."
              : "Already have an account? Sign in."}
          </button>
        </div>
      </div>
    </div>
  );
}
