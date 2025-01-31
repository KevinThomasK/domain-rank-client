//email password login

// "use client";
// import React, { useState } from "react";
// import { signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";

// const Login = () => {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setIsLoading(true);

//     try {
//       const res = await signIn("credentials", {
//         email: formData.email,
//         password: formData.password,
//         redirect: false,
//       });

//       if (res.error) {
//         setError("Invalid credentials");
//         console.log("signin error", res.error);
//         setIsLoading(false);
//         return;
//       }

//       toast("Logged in", {
//         theme: "colored",
//       });

//       router.replace("/dashboard");
//     } catch (error) {
//       console.log(error);
//       setError("An unexpected error occurred. Please try again later.");
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-100">
//       <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
//         <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
//           Login
//         </h2>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label
//               className="block text-gray-600 font-medium mb-2"
//               htmlFor="email"
//             >
//               Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
//               required
//             />
//           </div>
//           <div className="mb-6">
//             <label
//               className="block text-gray-600 font-medium mb-2"
//               htmlFor="password"
//             >
//               Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
//               required
//             />
//           </div>
//           {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
//           <button
//             type="submit"
//             className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
//             disabled={isLoading}
//           >
//             {isLoading ? "Logging in..." : "Login"} {/* Show loading text */}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;

//email otp login
"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false); // New state to track OTP sent status

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/request-auth-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json(); // Parse the response JSON
        setError(
          errorData.message || "Failed to request OTP. Please try again."
        ); // Use server error message if available
        setIsLoading(false);
        return;
      }

      toast("OTP sent to your email!", {
        theme: "colored",
      });

      setOtpSent(true); // OTP has been sent, now ask the user for the OTP
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setError("An unexpected error occurred. Please try again later.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email: formData.email,
        otp: formData.otp,
        redirect: false,
      });

      if (res.error) {
        setError("Invalid credentials");
        console.log("signin error", res.error);
        setIsLoading(false);
        return;
      }

      toast("Logged in", {
        theme: "colored",
      });

      router.replace("/dashboard");
    } catch (error) {
      console.log(error);
      setError("An unexpected error occurred. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Login with OTP
        </h2>
        <form onSubmit={otpSent ? handleSubmit : handleRequestOtp}>
          <div className="mb-4">
            <label
              className="block text-gray-600 font-medium mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* OTP Input - Shown after OTP request */}
          {otpSent && (
            <div className="mb-4">
              <label
                className="block text-gray-600 font-medium mb-2"
                htmlFor="otp"
              >
                OTP
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
            disabled={isLoading}
          >
            {isLoading
              ? otpSent
                ? "Verifying..."
                : "Requesting OTP..."
              : otpSent
              ? "Verify OTP"
              : "Request OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
