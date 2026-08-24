import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, ArrowRight, Hash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { loginBank } from "../../services/Admin_Service/bank_service";
import Logo from "@/assets/logo.png";

const BankLogin: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [logoAnimation, setLogoAnimation] = useState(true);
    const [formData, setFormData] = useState({
        bank_reference_id: "",
        email: "",
        password: "",
    });

    const primaryNavy = "#0A3B5C";
    const secondaryGold = "#D4AF37";
    const lightBg = "#F0F4F8";
    const lightCardBg = "#FFFFFF";

    useEffect(() => {
        const timer = setTimeout(() => setLogoAnimation(false), 10000);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await loginBank(formData);
            localStorage.setItem("bankToken", response.token);
            localStorage.setItem("bankUser", JSON.stringify(response.user));
            localStorage.setItem("bankInfo", JSON.stringify(response.bank));
            // store token as authToken so api interceptor picks it up
            localStorage.setItem("authToken", response.token);
            toast({ title: "Success", description: "Welcome to MAVHU Finance!" });
            navigate("/bank_dashboard");
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error?.response?.data?.message || error.message || "Invalid credentials.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div
            className="min-h-screen text-gray-900 transition-colors duration-500 flex items-center justify-center p-4"
            style={{ backgroundColor: lightBg }}
        >
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200" />
                <div className="absolute top-1/4 left-1/4 w-64 h-64">
                    <div
                        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 ${logoAnimation ? "animate-pulse" : ""}`}
                        style={{ background: `radial-gradient(circle, ${primaryNavy}15, transparent 70%)` }}
                    />
                </div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96">
                    <div
                        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 ${logoAnimation ? "animate-pulse delay-700" : ""}`}
                        style={{ background: `radial-gradient(circle, ${secondaryGold}10, transparent 70%)` }}
                    />
                </div>
            </div>

            <div className="relative z-10 w-full max-w-md mx-auto">
                {/* Logo */}
                <div className="relative mb-8">
                    <div className="flex justify-center">
                        <div className="relative group">
                            <div
                                className={`absolute -inset-4 rounded-full blur-xl transition-all duration-1000 ${logoAnimation ? "animate-ping-slow" : ""}`}
                                style={{ background: `radial-gradient(circle, ${primaryNavy}40, transparent 70%)` }}
                            />
                            <div
                                className={`relative w-24 h-24 rounded-2xl backdrop-blur-lg border flex items-center justify-center mx-auto shadow-2xl bg-white/60 border-gray-300/50 ${logoAnimation ? "animate-float" : ""}`}
                                onMouseEnter={() => setLogoAnimation(true)}
                                onMouseLeave={() => setLogoAnimation(false)}
                            >
                                <img
                                    src={Logo}
                                    alt="Bank Logo"
                                    className={`w-16 h-16 transition-all duration-500 ${logoAnimation ? "animate-pulse-slow" : ""}`}
                                />
                                {logoAnimation && (
                                    <>
                                        <div className="absolute top-2 left-2 w-2 h-2 rounded-full animate-float-fast" style={{ backgroundColor: primaryNavy }} />
                                        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full animate-float-fast delay-300" style={{ backgroundColor: secondaryGold }} />
                                        <div className="absolute top-2 right-2 w-1 h-1 rounded-full animate-float-fast delay-500" style={{ backgroundColor: primaryNavy }} />
                                        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full animate-float-fast delay-700" style={{ backgroundColor: secondaryGold }} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-6">
                        <h1 className="text-4xl font-bold tracking-tight">
                            <span
                                className="bg-clip-text text-transparent"
                                style={{ backgroundImage: `linear-gradient(to right, ${primaryNavy}, ${secondaryGold})` }}
                            >
                                MAVHU
                            </span>
                            <span className="ml-2 text-gray-900">Finance</span>
                        </h1>
                        <p className="text-sm font-medium tracking-wider uppercase mt-2 text-gray-600">
                            Secure • Reliable • Trusted
                        </p>
                    </div>
                </div>

                {/* Card */}
                <div
                    className="backdrop-blur-xl rounded-2xl border transition-all duration-500 shadow-2xl overflow-hidden"
                    style={{
                        backgroundColor: `${lightCardBg}95`,
                        borderColor: "rgba(0,0,0,0.1)",
                        boxShadow: `0 25px 50px -12px rgba(0,0,0,0.15), 0 0 30px ${primaryNavy}10`,
                    }}
                >
                    <div className="h-1 w-full" style={{ background: `linear-gradient(to right, ${primaryNavy}, ${secondaryGold})` }} />

                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold mb-2">Bank Sign In</h2>
                            <p className="text-gray-700">Access your banking dashboard and financial insights</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Bank Reference ID */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Bank Reference ID</label>
                                <div className="relative group">
                                    <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3">
                                        <Hash className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        name="bank_reference_id"
                                        value={formData.bank_reference_id}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border bg-white/80 border-gray-300 focus:border-blue-800 focus:ring-blue-800/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                        placeholder="e.g. CBZ001"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3">
                                        <Mail className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border bg-white/80 border-gray-300 focus:border-blue-800 focus:ring-blue-800/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                        placeholder="you@bank.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Password</label>
                                <div className="relative group">
                                    <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3">
                                        <Lock className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-12 py-3 rounded-xl border bg-white/80 border-gray-300 focus:border-blue-800 focus:ring-blue-800/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-0 bottom-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-500 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center shadow-lg overflow-hidden group ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
                                style={{
                                    background: `linear-gradient(135deg, ${primaryNavy}, ${secondaryGold})`,
                                    boxShadow: `0 10px 30px -5px ${primaryNavy}40`,
                                }}
                            >
                                <span className="relative z-10 flex items-center">
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                        </>
                                    )}
                                </span>
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{ background: `linear-gradient(135deg, ${secondaryGold}, ${primaryNavy})` }}
                                />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes float-fast { 0%,100%{transform:translateY(0) translateX(0)} 25%{transform:translateY(-5px) translateX(3px)} 50%{transform:translateY(0) translateX(6px)} 75%{transform:translateY(5px) translateX(3px)} }
        @keyframes ping-slow { 0%{transform:scale(0.8);opacity:0.8} 70%,100%{transform:scale(1.5);opacity:0} }
        @keyframes pulse-slow { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        .animate-float{animation:float 3s ease-in-out infinite}
        .animate-float-fast{animation:float-fast 4s ease-in-out infinite}
        .animate-ping-slow{animation:ping-slow 2s cubic-bezier(0,0,0.2,1) infinite}
        .animate-pulse-slow{animation:pulse-slow 2s ease-in-out infinite}
      `}</style>
        </div>
    );
};

export default BankLogin;
