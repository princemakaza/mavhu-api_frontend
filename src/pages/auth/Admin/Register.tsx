import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { registerUser } from "@/services/Admin_Service/Auth_service/auth_service";
import { useToast } from "@/components/ui/use-toast";
import Logo from "@/assets/logo.png";

const Admin_Register: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [logoAnimation, setLogoAnimation] = useState(true);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    // Password validation
    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
    });

    // Light mode colors only
    const logoGreen = "#008000";
    const logoYellow = "#B8860B";
    const lightBg = "#F5F5F5";
    const lightCardBg = "#FFFFFF";

    // Pause logo animation after 10 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setLogoAnimation(false);
        }, 10000);
        return () => clearTimeout(timer);
    }, []);

    const validatePassword = (password: string) => {
        setPasswordValidation({
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setFormData({ ...formData, password: newPassword });
        validatePassword(newPassword);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords don't match",
                variant: "destructive",
            });
            return;
        }

        // Check if password meets all requirements
        const allValid = Object.values(passwordValidation).every(v => v);
        if (!allValid) {
            toast({
                title: "Error",
                description: "Please ensure your password meets all requirements",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            const { confirmPassword, ...registerData } = formData;
            const response = await registerUser(registerData);
            toast({
                title: "Success",
                description: "Registration successful! Please verify your email.",
            });
            navigate("/admin_confirm_otp", { state: { email: formData.email } });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Registration failed. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-500 flex items-center justify-center p-4">
            {/* Animated background with particles */}
            <div className="fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 transition-all duration-500 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200" />

                {/* Animated gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64">
                    <div
                        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 ${
                            logoAnimation ? "animate-pulse" : ""
                        }`}
                        style={{
                            background: `radial-gradient(circle, ${logoGreen}10, transparent 70%)`,
                        }}
                    />
                </div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96">
                    <div
                        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 ${
                            logoAnimation ? "animate-pulse delay-700" : ""
                        }`}
                        style={{
                            background: `radial-gradient(circle, ${logoYellow}05, transparent 70%)`,
                        }}
                    />
                </div>
            </div>

            {/* Sign Up Container */}
            <div className="relative z-10 w-full max-w-md mx-auto">
                {/* Animated Logo Centerpiece */}
                <div className="relative mb-8">
                    <div className="flex justify-center">
                        <div className="relative group">
                            {/* Outer glow ring */}
                            <div
                                className={`absolute -inset-4 rounded-full blur-xl transition-all duration-1000 ${
                                    logoAnimation ? "animate-ping-slow" : ""
                                }`}
                                style={{
                                    background: `radial-gradient(circle, ${logoGreen}40, transparent 70%)`,
                                }}
                            />

                            {/* Animated rings */}
                            <div
                                className={`absolute -inset-3 rounded-full border-2 transition-all duration-700 ${
                                    logoAnimation ? "animate-spin-slow" : ""
                                }`}
                                style={{
                                    borderImage: `linear-gradient(45deg, ${logoGreen}, ${logoYellow}) 1`,
                                }}
                            />

                            {/* Logo container */}
                            <div
                                className={`relative w-24 h-24 rounded-2xl backdrop-blur-lg border transition-all duration-500 flex items-center justify-center mx-auto shadow-2xl bg-white/60 border-gray-300/50 hover:border-gray-400 ${
                                    logoAnimation ? "animate-float" : ""
                                }`}
                                onMouseEnter={() => setLogoAnimation(true)}
                                onMouseLeave={() => setLogoAnimation(false)}
                            >
                                {/* Logo image with subtle pulse */}
                                <img
                                    src={Logo}
                                    alt="MAVHU Africa Logo"
                                    className={`w-16 h-16 transition-all duration-500 ${
                                        logoAnimation ? "animate-pulse-slow" : ""
                                    }`}
                                />

                                {/* Floating particles */}
                                {logoAnimation && (
                                    <>
                                        <div
                                            className="absolute top-2 left-2 w-2 h-2 rounded-full animate-float-fast"
                                            style={{ backgroundColor: logoGreen }}
                                        />
                                        <div
                                            className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full animate-float-fast delay-300"
                                            style={{ backgroundColor: logoYellow }}
                                        />
                                        <div
                                            className="absolute top-2 right-2 w-1 h-1 rounded-full animate-float-fast delay-500"
                                            style={{ backgroundColor: logoGreen }}
                                        />
                                        <div
                                            className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full animate-float-fast delay-700"
                                            style={{ backgroundColor: logoYellow }}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Logo text with gradient */}
                    <div className="text-center mt-6">
                        <h1 className="text-4xl font-bold tracking-tight">
                            <span
                                className="bg-clip-text text-transparent bg-gradient-to-r"
                                style={{
                                    backgroundImage: `linear-gradient(to right, ${logoGreen}, ${logoYellow})`,
                                }}
                            >
                                MAVHU
                            </span>
                            <span className="ml-2 text-gray-900">Africa</span>
                        </h1>
                        <p className="text-sm font-medium tracking-wider uppercase mt-2 text-gray-600">
                            Create Your Account
                        </p>
                    </div>
                </div>

                {/* Sign Up Card */}
                <div
                    className="backdrop-blur-xl rounded-2xl border transition-all duration-500 shadow-2xl overflow-hidden"
                    style={{
                        backgroundColor: `${lightCardBg}95`,
                        borderColor: "rgba(0,0,0,0.1)",
                        boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 30px ${logoGreen}05`,
                    }}
                >
                    {/* Card header gradient */}
                    <div
                        className="h-1 w-full"
                        style={{
                            background: `linear-gradient(to right, ${logoGreen}, ${logoYellow})`,
                        }}
                    />

                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2">Join MAVHU Africa</h2>
                            <p className="text-gray-700">
                                Create your account to access climate intelligence dashboard
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Full Name
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3">
                                        <User className="w-5 h-5 text-gray-500 transition-colors duration-300" />
                                    </div>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border bg-white/80 border-gray-300 focus:border-green-600 focus:ring-green-600/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3">
                                        <Mail className="w-5 h-5 text-gray-500 transition-colors duration-300" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border bg-white/80 border-gray-300 focus:border-green-600 focus:ring-green-600/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Phone Number
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3">
                                        <Phone className="w-5 h-5 text-gray-500 transition-colors duration-300" />
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border bg-white/80 border-gray-300 focus:border-green-600 focus:ring-green-600/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                        placeholder="+263 77 123 4567"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3">
                                        <Lock className="w-5 h-5 text-gray-500 transition-colors duration-300" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handlePasswordChange}
                                        className="w-full pl-11 pr-12 py-3 rounded-xl border bg-white/80 border-gray-300 focus:border-green-600 focus:ring-green-600/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-0 bottom-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 transition-colors duration-300"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                {/* Password validation */}
                                <div className="mt-3 space-y-2">
                                    {Object.entries(passwordValidation).map(([key, isValid]) => (
                                        <div key={key} className="flex items-center text-sm">
                                            <div
                                                className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                                                    isValid ? "bg-green-500" : "bg-gray-300"
                                                }`}
                                            >
                                                {isValid && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <span
                                                className={
                                                    isValid ? "text-green-600" : "text-gray-600"
                                                }
                                            >
                                                {key === "minLength" && "At least 8 characters"}
                                                {key === "hasUpperCase" && "One uppercase letter"}
                                                {key === "hasLowerCase" && "One lowercase letter"}
                                                {key === "hasNumber" && "One number"}
                                                {key === "hasSpecialChar" && "One special character"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3">
                                        <Lock className="w-5 h-5 text-gray-500 transition-colors duration-300" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border bg-white/80 border-gray-300 focus:border-green-600 focus:ring-green-600/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Terms agreement */}
                            <div className="flex items-start">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    className="w-4 h-4 rounded bg-gray-100 border-gray-300 checked:bg-green-600 focus:ring-green-600/20 transition-all duration-300 focus:ring-2 focus:ring-offset-2 mt-1 mr-3"
                                    required
                                />
                                <label htmlFor="terms" className="text-sm">
                                    I agree to the{" "}
                                    <Link to="/terms" className="font-semibold hover:underline" style={{ color: logoGreen }}>
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link to="/privacy" className="font-semibold hover:underline" style={{ color: logoGreen }}>
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-500 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center shadow-lg overflow-hidden group ${
                                    isLoading ? "opacity-75 cursor-not-allowed" : ""
                                }`}
                                style={{
                                    background: `linear-gradient(135deg, ${logoGreen}, ${logoYellow})`,
                                    boxShadow: `0 10px 30px -5px ${logoGreen}30`,
                                }}
                            >
                                <span className="relative z-10 flex items-center">
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            Creating account...
                                        </>
                                    ) : (
                                        <>
                                            Create Account
                                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                        </>
                                    )}
                                </span>
                                {/* Button hover effect */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{
                                        background: `linear-gradient(135deg, ${logoYellow}, ${logoGreen})`,
                                    }}
                                />
                            </button>
                        </form>

                        {/* Login link */}
                        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                            <p className="text-gray-600">
                                Already have an account?{" "}
                                <Link
                                    to="/portal/login"
                                    className="font-semibold hover:underline transition-all duration-300"
                                    style={{ color: logoGreen }}
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600">
                        Your data is protected by enterprise-grade security
                    </p>
                </div>
            </div>

            {/* Custom CSS for animations */}
            <style>
                {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          
          @keyframes float-fast {
            0%, 100% {
              transform: translateY(0px) translateX(0px);
            }
            25% {
              transform: translateY(-5px) translateX(3px);
            }
            50% {
              transform: translateY(0px) translateX(6px);
            }
            75% {
              transform: translateY(5px) translateX(3px);
            }
          }
          
          @keyframes ping-slow {
            0% {
              transform: scale(0.8);
              opacity: 0.8;
            }
            70%, 100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }
          
          @keyframes spin-slow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          
          @keyframes pulse-slow {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          
          .animate-float-fast {
            animation: float-fast 4s ease-in-out infinite;
          }
          
          .animate-ping-slow {
            animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
          
          .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
          }
          
          .animate-pulse-slow {
            animation: pulse-slow 2s ease-in-out infinite;
          }
        `}
            </style>
        </div>
    );
};

export default Admin_Register;