"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface LoginFormProps {
  onBack?: () => void;
}

export default function LoginForm({ onBack }: LoginFormProps) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    displayName: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register({
          email: formData.email,
          password: formData.password,
          username: formData.username || undefined,
          displayName: formData.displayName || undefined,
        });
      }

      if (!result.success) {
        setMessage(result.message);
      }
    } catch {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="mb-4 text-primary hover:text-primary/80 text-sm flex items-center"
            >
              ← Back to home
            </button>
          )}
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            {isLogin ? "Sign in to Meju" : "Create your account"}
          </h2>
          <p className="mt-2 text-center text-sm text-foreground">
            Plan your weekly meals with ease
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <>
                <input
                  name="username"
                  type="text"
                  placeholder="Username (optional)"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-input text-foreground placeholder-muted-foreground"
                />
                <input
                  name="displayName"
                  type="text"
                  placeholder="Display Name (optional)"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-input text-foreground placeholder-muted-foreground"
                />
              </>
            )}

            <input
              name="email"
              type="email"
              required
              placeholder="Email address"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-input text-foreground placeholder-muted-foreground"
            />

            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-input text-foreground placeholder-muted-foreground"
            />
          </div>

          {message && (
            <div className="text-red-600 text-sm text-center">{message}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {loading ? "Loading..." : isLogin ? "Sign in" : "Sign up"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-primary/80 text-sm"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
