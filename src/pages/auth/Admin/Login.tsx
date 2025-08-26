import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, KeyRound, Shield } from "lucide-react";
import logo from "@/assets/logo2.png";
import backgroundImage from "@/assets/bg.jpg";
import logimage from "@/assets/log.jpg";

// Import services
import loginAdmin, {
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} from "@/services/Admin_Service/Auth_service/Admin_login_service";

// Import components
import CustomSpin from "@/components/customised_spins/customised_sprin";
import { showMessage } from "@/components/helper/feedback_message";

// Import reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";

const Admin_login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Forgot password state
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleForgotPasswordChange = (e) => {
    const { name, value } = e.target;
    setForgotPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call to your backend API
      const response = await loginAdmin(formData);

      // Handle successful response
      showMessage("success", "Login successful!");

      // Save auth token or user data to localStorage if needed
      localStorage.setItem("token", response.token);
      const storedUser = localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );
      console.log("----- storeduser", storedUser);

      // Navigate to dashboard or home page
      navigate("/admin_dashboard");
    } catch (error) {
      console.error("Login error:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (forgotPasswordStep === 1) {
      // Validate email
      if (!forgotPasswordData.email) {
        showMessage("error", "Please enter your email address");
        return;
      }

      setForgotPasswordLoading(true);
      try {
        const response = await forgotPassword(forgotPasswordData.email);
        showMessage("success", response.message || "OTP sent to your email");
        setForgotPasswordStep(2);
        // Start countdown for OTP resend (60 seconds)
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (error) {
        showMessage(
          "error",
          error.response?.data?.message || "Failed to send OTP. Please try again."
        );
      } finally {
        setForgotPasswordLoading(false);
      }
    } else if (forgotPasswordStep === 2) {
      // Validate OTP
      if (!forgotPasswordData.otp) {
        showMessage("error", "Please enter the OTP");
        return;
      }

      setForgotPasswordLoading(true);
      try {
        const response = await verifyResetOTP(
          forgotPasswordData.email,
          forgotPasswordData.otp
        );
        showMessage("success", response.message || "OTP verified successfully");
        setForgotPasswordStep(3);
      } catch (error) {
        showMessage(
          "error",
          error.response?.data?.message || "Invalid OTP. Please try again."
        );
      } finally {
        setForgotPasswordLoading(false);
      }
    } else if (forgotPasswordStep === 3) {
      // Validate new password
      if (!forgotPasswordData.newPassword) {
        showMessage("error", "Please enter a new password");
        return;
      }
      if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
        showMessage("error", "Passwords do not match");
        return;
      }

      setForgotPasswordLoading(true);
      try {
        const response = await resetPassword(
          forgotPasswordData.email,
          forgotPasswordData.otp,
          forgotPasswordData.newPassword
        );
        showMessage("success", response.message || "Password reset successfully");
        setForgotPasswordStep(4);
      } catch (error) {
        showMessage(
          "error",
          error.response?.data?.message || "Failed to reset password. Please try again."
        );
      } finally {
        setForgotPasswordLoading(false);
      }
    }
  };

  const resendOTP = async () => {
    if (countdown > 0) return;

    setForgotPasswordLoading(true);
    try {
      const response = await forgotPassword(forgotPasswordData.email);
      showMessage("success", response.message || "OTP resent to your email");
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      showMessage(
        "error",
        error.response?.data?.message || "Failed to resend OTP. Please try again."
      );
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setForgotPasswordModal(false);
    setForgotPasswordStep(1);
    setForgotPasswordData({
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
    setCountdown(0);
  };

  const getStepIcon = (step) => {
    switch (step) {
      case 1:
        return <Mail className="h-4 w-4" />;
      case 2:
        return <Shield className="h-4 w-4" />;
      case 3:
        return <KeyRound className="h-4 w-4" />;
      default:
        return step;
    }
  };

  const getStepTitle = (step) => {
    switch (step) {
      case 1:
        return "Email";
      case 2:
        return "Verify";
      case 3:
        return "Reset";
      default:
        return "";
    }
  };

  const renderForgotPasswordStep = () => {
    switch (forgotPasswordStep) {
      case 1: // Email input
        return (
          <>
            <div className="mb-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-blue-950" />
              </div>
              <h3 className="text-2xl font-bold text-blue-950 mb-2">
                Forgot Password?
              </h3>
              <p className="text-blue-700 text-sm">
                Enter your email address and we'll send you a verification code to reset your password
              </p>
            </div>
            <FormGroup>
              <label className="block mb-3 text-sm font-semibold text-blue-950">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <Input
                  name="email"
                  value={forgotPasswordData.email}
                  onChange={handleForgotPasswordChange}
                  className="bg-blue-50 border-2 border-blue-200 text-blue-950 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-4 py-3 text-sm font-medium transition-all duration-200 hover:border-blue-300"
                  type="email"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </FormGroup>
          </>
        );
      case 2: // OTP input
        return (
          <>
            <div className="mb-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-950" />
              </div>
              <h3 className="text-2xl font-bold text-blue-950 mb-2">
                Verify Your Email
              </h3>
              <p className="text-blue-700 text-sm mb-1">
                We've sent a 6-digit verification code to
              </p>
              <p className="text-blue-950 font-semibold text-sm">
                {forgotPasswordData.email}
              </p>
            </div>
            <FormGroup>
              <label className="block mb-3 text-sm font-semibold text-blue-950">
                Verification Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <Input
                  name="otp"
                  value={forgotPasswordData.otp}
                  onChange={handleForgotPasswordChange}
                  className="bg-blue-50 border-2 border-blue-200 text-blue-950 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-4 py-3 text-sm font-medium text-center tracking-widest transition-all duration-200 hover:border-blue-300"
                  type="text"
                  placeholder="000000"
                  maxLength="6"
                  required
                />
              </div>
            </FormGroup>
            <div className="text-center mt-6">
              <p className="text-blue-700 text-sm mb-2">Didn't receive the code?</p>
              <button
                type="button"
                onClick={resendOTP}
                disabled={countdown > 0}
                className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${countdown > 0
                  ? "text-blue-400 bg-blue-50 cursor-not-allowed"
                  : "text-blue-950 bg-blue-100 hover:bg-blue-200 hover:text-blue-950"
                  }`}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
              </button>
            </div>
          </>
        );
      case 3: // New password
        return (
          <>
            <div className="mb-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="h-8 w-8 text-blue-950" />
              </div>
              <h3 className="text-2xl font-bold text-blue-950 mb-2">
                Create New Password
              </h3>
              <p className="text-blue-700 text-sm">
                Your new password must be different from your previous password
              </p>
            </div>
            <FormGroup className="mb-4">
              <label className="block mb-3 text-sm font-semibold text-blue-950">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-600" />
                </div>
                <Input
                  name="newPassword"
                  value={forgotPasswordData.newPassword}
                  onChange={handleForgotPasswordChange}
                  className="bg-blue-50 border-2 border-blue-200 text-blue-950 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-12 py-3 text-sm font-medium transition-all duration-200 hover:border-blue-300"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  required
                />
                <div
                  className="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5 text-blue-600 hover:text-blue-800" />
                  ) : (
                    <Eye className="h-5 w-5 text-blue-600 hover:text-blue-800" />
                  )}
                </div>
              </div>
            </FormGroup>
            <FormGroup>
              <label className="block mb-3 text-sm font-semibold text-blue-950">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-600" />
                </div>
                <Input
                  name="confirmPassword"
                  value={forgotPasswordData.confirmPassword}
                  onChange={handleForgotPasswordChange}
                  className="bg-blue-50 border-2 border-blue-200 text-blue-950 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-4 py-3 text-sm font-medium transition-all duration-200 hover:border-blue-300"
                  type="password"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </FormGroup>
          </>
        );
      case 4: // Success
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-blue-950 mb-3">
              Password Reset Successful!
            </h3>
            <p className="text-blue-700 text-sm mb-6">
              Your password has been reset successfully. You can now login with your new password.
            </p>
            <Button
              color="primary"
              onClick={closeForgotPasswordModal}
              className="bg-blue-950 hover:bg-blue-800 border-0 px-8 py-2 rounded-xl font-semibold"
            >
              Continue to Login
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="w-full h-screen flex"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="grid grid-cols-1 md:grid-cols-2 m-auto h-[700px] shadow-[0_8px_32px_rgba(31,41,55,0.15)] sm:max-w-[1300px]
     bg-white rounded-2xl overflow-hidden"
      >
        {/* Left side image */}
        <div className="w-full h-[700px] hidden md:block">
          <img
            className="w-full h-full object-cover"
            src={logimage}
            alt="Login illustration"
          />
        </div>

        {/* Right side login form */}
        <div className="p-8 flex flex-col items-center justify-center w-full bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-center mb-6">
            <img src={logo} alt="Company Logo" className="w-16 h-16 mr-3" />
            <div>
              <p className="text-3xl font-bold text-blue-950">
                Welcome Back
              </p>
              <p className="text-blue-700 text-sm font-medium">
                Admin Portal
              </p>
            </div>
          </div>

          <p className="text-lg mb-8 text-blue-950 font-semibold text-center">
            Sign into your admin account
          </p>

          <Form
            onSubmit={handleSubmit}
            className="w-full max-w-md flex flex-col mx-auto"
          >
            <FormGroup className="mb-6 w-full">
              <label className="w-full block mb-3 text-sm font-semibold text-blue-950">
                Email Address
              </label>
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-white border-2 border-blue-200 text-blue-950 pl-12 pr-4 py-3 rounded-xl w-full placeholder-blue-400 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                  type="email"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <label className="block mb-3 text-sm font-semibold text-blue-950">
                Password
              </label>
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-600" />
                </div>
                <Input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-white border-2 border-blue-200 text-blue-950 pl-12 pr-12 py-3 rounded-xl w-full placeholder-blue-400 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                />
                <div
                  className="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-blue-600 hover:text-blue-800 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-blue-600 hover:text-blue-800 transition-colors" />
                  )}
                </div>
              </div>
            </FormGroup>

            <div className="text-right mb-6">
              <button
                type="button"
                onClick={() => setForgotPasswordModal(true)}
                className="text-blue-950 hover:text-blue-700 text-sm font-semibold hover:underline transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <div className="text-center">
              {isLoading ? (
                <div className="flex justify-center py-3">
                  <CustomSpin />
                </div>
              ) : (
                <Button
                  type="submit"
                  className="font-bold text-white w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 rounded-xl border-0 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  SIGN IN
                </Button>
              )}
            </div>

            <p className="text-center text-sm font-medium text-blue-700 mt-6">
              Don't have an account?{" "}
              <Link
                to="/admin_register"
                className="text-blue-950 font-semibold hover:underline transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </Form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotPasswordModal}
        toggle={closeForgotPasswordModal}
        centered
        className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl" // Responsive sizing
        backdrop="static"
      >
        <ModalHeader
          toggle={closeForgotPasswordModal}
          className="border-0 pb-2"
        >
          <div className="flex items-center text-blue-950">
            {forgotPasswordStep > 1 && forgotPasswordStep < 4 && (
              <button
                onClick={() => setForgotPasswordStep(forgotPasswordStep - 1)}
                className="mr-3 p-2 hover:bg-blue-50 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <span className="font-bold text-lg">Password Recovery</span>
          </div>
        </ModalHeader>
        <ModalBody className="px-6 py-4">
          {/* Enhanced Stepper indicator */}
          {forgotPasswordStep < 4 && (
            <div className="flex justify-center mb-8">
              <div className="flex items-center">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step === forgotPasswordStep
                          ? "bg-blue-950 border-blue-950 text-white shadow-lg scale-110"
                          : step < forgotPasswordStep
                            ? "bg-blue-100 border-blue-950 text-blue-950"
                            : "bg-gray-100 border-gray-300 text-gray-400"
                          }`}
                      >
                        {step < forgotPasswordStep ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          getStepIcon(step)
                        )}
                      </div>
                      <div className={`mt-2 text-xs font-semibold ${step <= forgotPasswordStep ? "text-blue-950" : "text-gray-400"
                        }`}>
                        {getStepTitle(step)}
                      </div>
                    </div>
                    {step < 3 && (
                      <div
                        className={`w-16 h-1 mx-3 mt-6 rounded-full transition-all duration-300 ${step < forgotPasswordStep
                          ? "bg-blue-950"
                          : "bg-gray-200"
                          }`}
                      ></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {renderForgotPasswordStep()}
        </ModalBody>
        {forgotPasswordStep < 4 && (
          <ModalFooter className="border-0 pt-2">
            <Button
              color="light"
              onClick={closeForgotPasswordModal}
              className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 mr-3 px-6 py-2 rounded-xl font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleForgotPassword}
              disabled={forgotPasswordLoading}
              className="bg-blue-950 hover:bg-blue-800 border-0 px-8 py-2 rounded-xl font-semibold text-white"
            >
              {forgotPasswordLoading ? (
                <CustomSpin />
              ) : forgotPasswordStep === 1 ? (
                "Send Code"
              ) : forgotPasswordStep === 2 ? (
                "Verify Code"
              ) : (
                "Reset Password"
              )}
            </Button>
          </ModalFooter>
        )}
      </Modal>
    </div>
  );
};

export default Admin_login;