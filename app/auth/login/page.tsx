"use client";

import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface LoginFormData {
  email: string;
  password: string;
}

export default function AdminLoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const searchParams = useSearchParams();

  // State to manage password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Toggle function for password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  // Function to capitalize the first letter of the string
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Update the role based on the user role from query parameters
  const role = capitalizeFirstLetter(searchParams.get("role") || "");

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false, // Prevent automatic redirect
      });

      if (res?.error) {
        // Use the error message returned from the backend
        throw new Error(res.error);
      }

      // Fetch session manually
      const response = await fetch("/api/auth/session");
      const session = await response.json();

      console.log("response: ", session);

      switch (session?.user?.role) {
        case "SUPER_ADMIN":
          router.push("/admin/dashboard/adminHome");
          break;
        case "COLLEGE":
          router.push("/college/dashboard/collegeHome");
          break;
        case "DEPARTMENT":
          router.push("/department/dashboard");
          break;
        case "HOD":
          router.push("/hod/dashboard");
          break;
        case "FACULTY":
          router.push("/faculty/dashboard");
          break;
        case "STUDENT":
          router.push("/students/dashboard");
          break;
        default:
          router.push("/home");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center mb-6">
          <span className="text-indigo-600">{role}</span> Login
        </h2>

        {errorMessage && (
          <p className="text-red-500 text-center mb-4">{errorMessage}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="email"
            {...register("email", { required: "Email is required" })}
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password", { required: "Password is required" })}
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <div
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </div>
          </div>
          {errors.password && (
            <p className="text-red-500">{errors.password.message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-lg ${
              loading
                ? "bg-gray-400"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {loading && (
          <div className="text-center mt-4">Loading, please wait...</div>
        )}
      </div>
    </div>
  );
}
