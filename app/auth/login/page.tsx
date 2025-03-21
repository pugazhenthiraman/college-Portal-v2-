"use client";

import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

interface LoginFormData {
  email: string;
  password: string;
}

export default function AdminLoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const searchParams = useSearchParams();

//Fuction to  Capitalize the first letter of the string
const capitalizeFirstLetter = (str:string)=>{
  return str.charAt(0).toUpperCase()+str.slice(1).toLowerCase();
}
//update the role based on the user role
 const role=capitalizeFirstLetter(searchParams.get("role")||"");

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

      console.log("response: ", session)
  
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
          router.push("/student/dashboard");
          break;
        default:
          router.push("/auth/login");
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
        <h2 className="text-3xl font-bold text-center mb-6"> <span className="text-indigo-600"> {role} </span> Login</h2>

        {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
        

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="email" {...register("email", { required: "Email is required" })} placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-lg" />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}

          <input type="password" {...register("password", { required: "Password is required" })} placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-lg" />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-lg ${loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {loading && <div className="text-center mt-4">Loading, please wait...</div>}
      </div>
    </div>
  );
}
