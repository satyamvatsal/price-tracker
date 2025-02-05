import { useState } from "react";
import { resendOtp, signup, verifyOtp } from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLoading } from "../context/LoadingContext";
import LoadingOverlay from "../components/LoadingOverlay";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [confirm, setConfirm] = useState(false);
  const { loading, setLoading } = useLoading();
  const navigate = useNavigate();

  const handleResendOtp = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const response = await resendOtp({ email });
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      toast.error("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!confirm) {
      setLoading(true);
      try {
        const response = await signup({ firstName, lastName, email, password });
        const message = response.data.message;
        toast.success(message);
        setConfirm(true);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const response = await verifyOtp({ email, otp });
        toast.success(response.data.message);
        navigate("/login");
      } catch (error) {
        toast.error(error.response.data.error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <LoadingOverlay loading={loading} />
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Register
        </h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="First Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {confirm ? (
            <div className="flex flex-row justify-around">
              <input
                type="number"
                placeholder="Enter OTP"
                className="w-full px-4 py-2 mx-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <button
                onClick={handleResendOtp}
                className="w-full bg-blue-500 mx-2 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Resend OTP
              </button>
            </div>
          ) : (
            <> </>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:text-blue-700">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
