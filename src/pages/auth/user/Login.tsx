import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, User, Phone, Mail, Lock, GraduationCap, School, MapPinHouse } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import logimage from "@/assets/log.jpg";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Step state
  const [formData, setFormData] = useState({
    fullName: "", // Combine firstName and lastName into fullName
    phoneNumber: "",
    email: "",
    password: "", // Move password to the first step
    address: "",
    educationLevel: "",
    school: "",
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phoneNumber || !formData.email || !formData.password) {
      toast({
        title: "Please fill out all fields in this step.",
      });
      return;
    }
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const splitFullName = (fullName) => {
    const [firstName, ...lastNameParts] = fullName.trim().split(" ");
    return {
      firstName: firstName || "",
      lastName: lastNameParts.join(" ") || "",
    };
  };

  interface FormData {
    fullName: string;
    phoneNumber: string;
    email: string;
    password: string;
    address: string;
    educationLevel: string;
    school: string;
  }

  interface RegisterProps {
    firstName: string;
    lastName: string;
    phone_number: string;
    email: string;
    level: string;
    password: string;
    school: string;
    address: string;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const { firstName, lastName } = splitFullName(formData.fullName);

      if (!lastName) {
        toast({
          title: "Please enter both your first and last name.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const error = await register({
        firstName,
        lastName,
        phone_number: formData.phoneNumber,
        email: formData.email,
        level: formData.educationLevel,
        password: formData.password,
        school: formData.school,
        address: formData.address,
      } as RegisterProps);

      if (error) {
        toast({
          title: "Registration Error",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration success",
          // description: error,
          variant: "default",
        })
      }
    } catch (error) {
      toast({
        title: "An error occurred while registering",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="w-full h-screen flex justify-center"
      style={{
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 m-auto sm:max-w-screen-lg w-[90%] shadow-2xl rounded-2xl overflow-hidden border"
      >
        <div className="p-4 flex flex-col items-center justify-center w-full bg-background">
          <div className="text-center items-center justify-center mb-4">
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <Link to={"/"}>
                <img
                  src={"./logo-full.png"}
                  alt="Toto Academy Logo"
                  className="h-24 mx-auto my-4"
                />
              </Link>
            </motion.div>
            <motion.h1
              className="text-sm font-bold text-gray-800 dark:text-gray-50"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Create your account
            </motion.h1>
            <p className="text-xs font-medium text-gray-600 mt-2">
              Step {currentStep} of 2
            </p>
          </div>
          <form
            onSubmit={currentStep === 1 ? handleNext : handleSubmit}
            className="w-full max-w-md flex flex-col p-6 mx-auto space-y-4"
          >
            {currentStep === 1 && (
              <div className="mb-4 w-full space-y-6">
                <div>
                  <Label className="w-full mb-2 text-sm font-bold flex items-center gap-1">
                    <User className="h-4" />
                    Full Name
                  </Label>
                  <Input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                    placeholder="Enter Full Name"
                    required
                  />
                </div>
                <div>
                  <Label className="w-full mb-2 text-sm font-bold flex items-center gap-1">
                    <Phone className="h-4" />
                    Phone Number
                  </Label>
                  <Input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                    placeholder="Enter Phone Number"
                    required
                  />
                </div>
                <div>
                  <Label className="w-full mb-2 text-sm font-bold flex items-center gap-1">
                    <Mail className="h-4" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                    placeholder="Enter Email"
                    required
                  />
                </div>
                <div>
                  <Label className="w-full mb-2 text-sm font-bold flex items-center gap-1">
                    <Lock className="h-4" />
                    Password
                  </Label>
                  <div className="relative border border-input rounded-md">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                      placeholder="Enter Password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div className="mb-4 w-full space-y-6">
                <div>
                  <Label className="w-full mb-2 text-sm font-bold flex items-center gap-1">
                    <School className="h-4" />
                    School
                  </Label>
                  <Input
                    type="text"
                    name="school"
                    value={formData.school}
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                    placeholder="Enter School Name"
                    required
                  />
                </div>
                <div>
                  <Label className="w-full mb-2 text-sm font-bold flex items-center gap-1">
                    <MapPinHouse className="h-4" />

                    Address
                  </Label>
                  <Input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleChange(e.target.name, e.target.value)
                    }
                    placeholder="Enter Address"
                    required
                  />
                </div>
                <div>
                  <Label className="w-full mb-2 text-sm font-bold flex items-center gap-1">
                    <GraduationCap className="h-4" />
                    Education Level
                  </Label>
                  <Select
                    value={formData.educationLevel}
                    onValueChange={(value) =>
                      handleChange("educationLevel", value)
                    }
                  >
                    <SelectTrigger className="bg-transparent border border-input p-2 rounded-md w-full">
                      <SelectValue placeholder="Select Education Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="O Level">Ordinary Level (O-Level)</SelectItem>
                      <SelectItem value="A Level">Advanced Level (A-Level)</SelectItem>
                      <SelectItem value="Others">Form 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div className="min-h-12 items-center">
              <div className="flex justify-between gap-24">
                {currentStep === 2 && (
                  <Button variant="ghost" type="button" onClick={handleBack}>
                    BACK
                  </Button>
                )}
                <Button
                  variant="ghost"
                  type="submit"
                  disabled={isLoading}
                  className="ml-auto"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 dark:border-gray-200 border-toto-blue "></span>
                      {currentStep === 1 ? "LOADING..." : "SIGNING UP..."}
                    </div>
                  ) : currentStep === 1 ? (
                    "NEXT"
                  ) : (
                    "SIGN UP"
                  )}
                </Button>
              </div>

            </div>
            <p className="text-center text-xs font-semibold">
              Already have an account?
              <Link
                to="/login"
                className="text-yellow-600 hover:underline px-2"
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>
        <div className="w-full hidden md:block">
          <img className="h-full object-cover" src={logimage} />
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
