import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, ArrowRight, RefreshCw } from "lucide-react";
import { verifyEmailOtp } from "@/services/Admin_Service/Auth_service/auth_service";
import { useToast } from "@/components/ui/use-toast";

const ConfirmOtpScreen: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [timer, setTimer] = useState(60);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [formData, setFormData] = useState({
        email: "",
        otp: "",
    });

    // Light mode colors
    const logoGreen = "#008000";
    const logoYellow = "#B8860B";
    const lightBg = "#F5F5F5";
    const lightCardBg = "#FFFFFF";

    // Get email from location state or localStorage
    useEffect(() => {
        const emailFromState = location.state?.email;
        const savedEmail = localStorage.getItem("pendingEmail");

        if (emailFromState) {
            setFormData(prev => ({ ...prev, email: emailFromState }));
            localStorage.setItem("pendingEmail", emailFromState);
        } else if (savedEmail) {
            setFormData(prev => ({ ...prev, email: savedEmail }));
        } else {
            navigate("/signup");
        }
    }, [location, navigate]);

    // Timer for resend OTP
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleOtpChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }

        // Update form data
        setFormData(prev => ({ ...prev, otp: newOtp.join("") }));
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").slice(0, 6);
        const pasteArray = pasteData.split("");

        const newOtp = [...otp];
        pasteArray.forEach((char, index) => {
            if (index < 6 && /^\d*$/.test(char)) {
                newOtp[index] = char;
            }
        });

        setOtp(newOtp);
        setFormData(prev => ({ ...prev, otp: newOtp.join("") }));

        // Focus the last filled input
        const lastFilledIndex = Math.min(pasteArray.length, 5);
        const lastInput = document.getElementById(`otp-${lastFilledIndex}`);
        lastInput?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.otp.length !== 6) {
            toast({
                variant: "destructive",
                title: "Invalid OTP",
                description: "Please enter a 6-digit OTP",
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await verifyEmailOtp(formData);
            toast({
                title: "Success!",
                description: "Email verified successfully!",
            });
            localStorage.removeItem("pendingEmail");
            navigate("/admin_login");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Verification failed",
                description: error.response?.data?.message || "An error occurred during verification",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (timer > 0) return;

        setIsResending(true);
        try {
            // Call your resend OTP API here
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
            toast({
                title: "OTP Sent",
                description: "New OTP sent to your email!",
            });
            setTimer(60);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to resend",
                description: "Failed to resend OTP. Please try again.",
            });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div
            className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 flex items-center justify-center p-4"
            style={{ backgroundColor: lightBg }}
        >
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,128,0,0.05),transparent_50%)]" />
            </div>

            {/* Floating animated logo */}
            <div className="fixed top-8 left-8 z-20">
                <div className="relative group">
                    <div
                        className="absolute -inset-1 bg-gradient-to-r from-green-500 to-yellow-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200 animate-pulse"
                        style={{
                            background: `linear-gradient(to right, ${logoGreen}, ${logoYellow})`,
                        }}
                    />
                    <div
                        className="relative px-4 py-2 rounded-lg backdrop-blur-sm border border-gray-300/70"
                        style={{ backgroundColor: `${lightCardBg}95` }}
                    >
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <div
                                    className="w-3 h-3 rounded-full animate-ping absolute -top-1 -right-1"
                                    style={{ backgroundColor: logoGreen }}
                                />
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm animate-bounce"
                                    style={{ backgroundColor: logoGreen }}
                                >
                                    M
                                </div>
                            </div>
                            <span className="font-bold tracking-wider">MAVHU</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* OTP Verification Card */}
            <div className="relative z-10 w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="relative inline-block mb-6">
                        <div
                            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2"
                            style={{
                                borderColor: logoGreen,
                                background: `linear-gradient(135deg, ${logoGreen}20, ${logoYellow}20)`,
                            }}
                        >
                            <Mail className="w-10 h-10" style={{ color: logoGreen }} />
                        </div>
                        <div
                            className="absolute -top-2 -right-2 w-8 h-8 rounded-full animate-ping"
                            style={{ backgroundColor: logoGreen }}
                        />
                    </div>

                    <h1 className="text-3xl font-bold mb-2">Verify Your Email</h1>
                    <p className="text-gray-700">
                        We've sent a 6-digit code to
                    </p>
                    <p className="font-medium mt-1" style={{ color: logoGreen }}>
                        {formData.email || "your email"}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                        Please check your inbox and enter the code below
                    </p>
                </div>

                <div
                    className="backdrop-blur-xl rounded-2xl p-8 border border-gray-300/70 shadow-2xl"
                    style={{ backgroundColor: `${lightCardBg}95` }}
                >
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* OTP Inputs */}
                        <div>
                            <label className="block text-sm font-medium mb-4 text-center">
                                6-Digit Verification Code
                            </label>
                            <div className="flex justify-center space-x-2" onPaste={handlePaste}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(e.target.value, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        className="w-12 h-14 text-2xl font-bold text-center rounded-lg border-2 border-gray-300/70 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300"
                                        style={{
                                            backgroundColor: lightBg,
                                        }}
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Resend OTP */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={timer > 0 || isResending}
                                className={`text-sm font-medium ${timer > 0 ? "text-gray-600" : ""
                                    } hover:underline flex items-center justify-center mx-auto`}
                                style={{ color: timer === 0 ? logoGreen : undefined }}
                            >
                                {isResending ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Resending...
                                    </>
                                ) : timer > 0 ? (
                                    `Resend code in ${timer}s`
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Resend code
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || formData.otp.length !== 6}
                            className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center ${isLoading || formData.otp.length !== 6
                                    ? "opacity-75 cursor-not-allowed"
                                    : ""
                                }`}
                            style={{
                                background: `linear-gradient(to right, ${logoGreen}, ${logoYellow})`,
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    Verify Email
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Back to signup */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Didn't receive the code?{" "}
                            <button
                                onClick={handleResendOtp}
                                className="font-semibold hover:underline"
                                style={{ color: logoGreen }}
                            >
                                Resend OTP
                            </button>
                        </p>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => navigate("/signup")}
                                className="text-sm font-medium hover:underline"
                                style={{ color: logoGreen }}
                            >
                                ← Back to Sign Up
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security note */}
                <div className="mt-8 text-center">
                    <div className="inline-flex items-center text-sm">
                        <Lock className="w-4 h-4 mr-2" style={{ color: logoGreen }} />
                        <span className="text-gray-600">
                            Your verification code is secure and expires in 15 minutes
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom decorative element */}
            <div
                className="fixed bottom-0 left-0 right-0 h-1"
                style={{
                    background: `linear-gradient(to right, ${logoGreen}, ${logoYellow})`,
                }}
            />

            {/* Animated verification indicator */}
            <div className="fixed bottom-8 right-8 z-20">
                <div className="relative">
                    <div className="absolute inset-0 animate-ping" style={{ color: logoGreen }}>
                        🔒
                    </div>
                    <div className="relative">🔒</div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmOtpScreen;