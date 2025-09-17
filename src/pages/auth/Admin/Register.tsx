import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import logimage from "@/assets/log.jpg";
import logo from "@/assets/logo2.png";
import backgroundImage from "@/assets/bg.jpg";

// Import services
import SignUpAdmin from "@/services/Admin_Service/Auth_service/sign_up_service";
import { supabase } from "@/helper/SupabaseClient";
// Import components
import CustomSpin from "@/components/customised_spins/customised_sprin";
import { showMessage } from "@/components/helper/feedback_message";

const Admin_Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Form state with the specified fields
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    password: "",
    profilePicture: "", // This will now store the Supabase URL
    profilePictureFileName: "",
    profilePictureType: "",
  });

  // State for file upload
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Sanitize filename function
  const sanitizeFilename = (filename) => {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  };

  // Upload file to Supabase function
  const uploadFileToSupabase = async (file, bucket, setProgress) => {
    const sanitizedFileName = sanitizeFilename(file.name);
    const fileName = `${Date.now()}_${sanitizedFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
        onProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setProgress(progress);
        },
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw new Error(`File upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      throw new Error("Failed to get file URL after upload");
    }

    return publicUrlData.publicUrl;
  };

  // Handle file input for profile picture
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          showMessage("error", "Profile picture must be less than 5MB");
          return;
        }

        // Validate file type
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
          showMessage(
            "error",
            "Profile picture must be a valid image (JPEG, PNG, GIF, or WebP)"
          );
          return;
        }

        setProfilePictureFile(file);
        setIsUploading(true);
        setUploadProgress(0);

        // Upload to Supabase
        const profilePictureUrl = await uploadFileToSupabase(
          file, 
          "topics", // bucket name - adjust as needed
          setUploadProgress
        );

        // Update formData with profile picture URL
        setFormData((prev) => ({
          ...prev,
          profilePicture: profilePictureUrl,
          profilePictureFileName: file.name,
          profilePictureType: file.type,
        }));

        showMessage("success", "Profile picture uploaded successfully!");

      } catch (error) {
        console.error("Error uploading profile picture:", error);
        showMessage("error", error.message || "Error uploading image file");
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Enhanced validation with specific error messages
      const errors = [];

      if (!formData.firstName?.trim()) errors.push("First name is required");
      if (!formData.lastName?.trim()) errors.push("Last name is required");
      if (!formData.email?.trim()) errors.push("Email is required");
      if (!formData.contactNumber?.trim())
        errors.push("Contact number is required");
      if (!formData.password) errors.push("Password is required");
      if (!formData.profilePicture) errors.push("Profile picture is required");

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email && !emailRegex.test(formData.email.trim())) {
        errors.push("Please enter a valid email address");
      }

      // Password strength validation
      if (formData.password && formData.password.length < 6) {
        errors.push("Password must be at least 6 characters long");
      }

      // Contact number validation
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
      if (
        formData.contactNumber &&
        !phoneRegex.test(formData.contactNumber.trim())
      ) {
        errors.push("Please enter a valid contact number");
      }

      if (errors.length > 0) {
        showMessage("error", errors.join(". "));
        setIsLoading(false);
        return;
      }

      // Create JSON object - profilePicture now contains the Supabase URL
      const adminData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        contactNumber: formData.contactNumber.trim(),
        password: formData.password,
        profilePicture: formData.profilePicture, // This is now the Supabase URL
      };

      // Debug logging
      console.log("Submitting form with JSON data:", adminData);

      // Call the service
      const response = await SignUpAdmin(adminData);

      // Handle successful response
      showMessage("success", "Registration successful!");

      // Navigate to login or dashboard
      navigate("/admin_dashboard");
    } catch (error) {
      console.error("Registration error:", error);

      // Display user-friendly error message
      const errorMessage =
        error.message || "Registration failed. Please try again.";
      showMessage("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="w-full h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="grid grid-cols-1 md:grid-cols-2 m-auto h-[700px] shadow-lg sm:max-w-[1300px]
        bg-white rounded-xl overflow-hidden"
      >
        {/* Left image container */}
        <div className="w-full h-[700px] hidden md:block">
          <img
            className="w-full h-full object-cover"
            src={logimage}
            alt="Login background"
          />
        </div>

        {/* Right form container */}
        <div className="p-4 flex flex-col items-center justify-center w-full bg-gradient-to-b from-white to-blue-200 rounded-xl rounded-l-none">
          <div className="flex items-center justify-center mb-2">
            <img src={logo} alt="Toto Academy Logo" className="w-16 h-16" />
            <p className="text-3xl font-semibold text-blue-950 text-center ml-2">
              Welcome to Toto Academy
            </p>
          </div>

          <p className="text-xl text-blue-950 font-bold text-center mb-4">
            Sign up to get started
          </p>

          {/* Form */}
          <form
            className="w-full max-w-md flex flex-col p-4 mx-auto"
            onSubmit={handleSubmit}
          >
            <div className="mb-2 w-full">
              {/* First Name */}
              <label className="block mb-1 text-m font-bold text-black">
                First Name
              </label>
              <input
                className="bg-transparent border border-black text-black p-2 rounded-md w-full placeholder-black"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter First Name"
                required
              />

              {/* Last Name */}
              <label className="block mb-1 text-m font-bold text-black">
                Last Name
              </label>
              <input
                className="bg-transparent border border-black text-black p-2 rounded-md w-full placeholder-black"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter Last Name"
                required
              />

              {/* Email */}
              <label className="block mb-1 text-m font-bold text-black">
                Email
              </label>
              <input
                className="bg-transparent border border-black text-black p-2 rounded-md w-full placeholder-black"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email"
                required
              />

              {/* Contact Number */}
              <label className="block mb-1 text-m font-bold text-black">
                Contact Number
              </label>
              <input
                className="bg-transparent border border-black text-black p-2 rounded-md w-full placeholder-black"
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Enter Contact Number"
                required
              />

              {/* Profile Picture */}
              <label className="block mb-1 text-m font-bold text-black">
                Profile Picture
              </label>
              <input
                className="bg-transparent border border-black text-black p-2 rounded-md w-full"
                type="file"
                name="profilePicture"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              
              {/* Upload progress and status */}
              {isUploading && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
              
              {profilePictureFile && !isUploading && formData.profilePicture && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ {profilePictureFile.name} uploaded successfully
                </p>
              )}

              {/* Password */}
              <label className="block mb-1 text-m font-bold text-black">
                Password
              </label>
              <div className="relative mb-1">
                <input
                  className="bg-transparent border border-black text-black p-2 rounded-md w-full placeholder-black"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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

            <button
              type="submit"
              className="font-sans text-white font-bold w-full p-2 bg-yellow-600 hover:bg-yellow-400 rounded-xl disabled:opacity-50"
              disabled={isLoading || isUploading}
            >
              {isLoading ? <CustomSpin /> : "SIGN UP"}
            </button>
          </form>

          <p className="text-center text-sm font-semibold">
            ALREADY HAVE AN ACCOUNT?
            <Link
              to="/Admin_login"
              className="text-yellow-600 hover:underline px-4"
            >
              SIGN IN
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Admin_Register;