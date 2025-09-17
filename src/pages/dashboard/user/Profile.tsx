import { useAuth, User } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Pencil, User as UserIcon, Mail, Phone, Home, School, Book, Shield, Users } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
    const { user, updateStudent } = useAuth();
    const { toast } = useToast();
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editFormData, setEditFormData] = useState({
        fullName: `${user?.firstName || ""} ${user?.lastName || ""}`,
        email: user?.email || "",
        phone_number: user?.phone_number || "",
        address: user?.address || "",
        school: user?.school || "",
        level: user?.level || "",
        subscription_status: user?.subscription_status || "",
        profile_picture: user?.profile_picture || "",
        next_of_kin_full_name: user?.next_of_kin_full_name || "",
        next_of_kin_phone_number: user?.next_of_kin_phone_number || "",
        subjects: user?.subjects?.join(", ") || "",
    });

    const handleEditChange = (name, value) => {
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        // Split fullName into firstName and lastName
        const [firstName, ...lastNameParts] = editFormData.fullName.trim().split(" ");
        const lastName = lastNameParts.join(" ");
        // Convert subjects string to array
        const subjectsArr = editFormData.subjects
            ? editFormData.subjects.split(",").map((s) => s.trim()).filter(Boolean)
            : [];
        try {
            const req = await updateStudent({
                firstName,
                lastName,
                email: editFormData.email,
                phone_number: editFormData.phone_number,
                address: editFormData.address,
                school: editFormData.school,
                level: editFormData.level,
                subscription_status: editFormData.subscription_status,
                profile_picture: editFormData.profile_picture,
                next_of_kin_full_name: editFormData.next_of_kin_full_name,
                next_of_kin_phone_number: editFormData.next_of_kin_phone_number,
                subjects: subjectsArr,
            });
            // Show success toast
            if (req) {
                const t = toast({
                    title: "Oops! Profile Update Failed",
                    description: "We couldn’t update your profile right now. Please try again.",
                    variant: "destructive",
                    duration: 8000,
                    action: (
                        <Button
                            variant="secondary"
                            className="bg-white text-red-600 hover:bg-red-100"
                            onClick={() => t.dismiss()} // dismiss the toast safely
                        >
                            Dismiss
                        </Button>
                    ),
                });

            } else {
                setEditDialogOpen(false);
                const t = toast({
                    title: "✅ Profile Updated Successfully",
                    description: "Your account has been updated. Everything is good to go!",
                    variant: "default",
                    duration: 8000,
                    action: (
                        <Button
                            variant="secondary"
                            className="bg-green-600 text-white hover:bg-green-700"
                            onClick={() => t.dismiss()} // dismiss the toast safely
                        >
                            Got it
                        </Button>
                    ),
                });

            }
        } catch (error) {
            const t = toast({
                title: "Oops! Update Failed",
                description: (error as Error)?.message || "We couldn’t update your profile right now. Please try again.",
                variant: "destructive",
                duration: 8000,
                action: (
                    <Button
                        variant="secondary"
                        className="bg-white text-red-600 hover:bg-red-100"
                        onClick={() => t.dismiss()} // dismiss the toast safely
                    >
                        Dismiss
                    </Button>
                ),
            });

        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return <div> <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-900"></div>
        </div></div>;
    }

    return (
        <div className="max-w-screen-xl mx-auto py-4 md:py-6">
            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Edit Account</DialogTitle>
                    </DialogHeader>
                    <form className="grid grid-cols-2 gap-4" onSubmit={e => { e.preventDefault(); handleSaveChanges(); }}>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="fullName" className="mb-2 text-sm font-bold">
                                    Full Name
                                </Label>
                                <Input
                                    id="fullName"
                                    type="text"
                                    value={editFormData.fullName}
                                    onChange={(e) => handleEditChange("fullName", e.target.value)}
                                    placeholder="Enter Full Name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="email" className="mb-2 text-sm font-bold">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={editFormData.email}
                                    onChange={(e) => handleEditChange("email", e.target.value)}
                                    placeholder="Enter Email"
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone_number" className="mb-2 text-sm font-bold">
                                    Phone Number
                                </Label>
                                <Input
                                    id="phone_number"
                                    type="tel"
                                    value={editFormData.phone_number}
                                    onChange={(e) => handleEditChange("phone_number", e.target.value)}
                                    placeholder="Enter Phone Number"
                                />
                            </div>
                            <div>
                                <Label htmlFor="address" className="mb-2 text-sm font-bold">
                                    Address
                                </Label>
                                <Input
                                    id="address"
                                    type="text"
                                    value={editFormData.address}
                                    onChange={(e) => handleEditChange("address", e.target.value)}
                                    placeholder="Enter Address"
                                />
                            </div>
                            <div>
                                <Label htmlFor="school" className="mb-2 text-sm font-bold">
                                    School
                                </Label>
                                <Input
                                    id="school"
                                    type="text"
                                    value={editFormData.school}
                                    onChange={(e) => handleEditChange("school", e.target.value)}
                                    placeholder="Enter School"
                                />
                            </div>
                            <div>
                                <Select
                                    value={editFormData.level}
                                    onValueChange={(e) => handleEditChange("level", e)}
                                >
                                    <SelectTrigger className="bg-transparent border border-input p-2 rounded-md w-full">
                                        <SelectValue placeholder="Select Education Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* <SelectItem value="primary">Primary School</SelectItem> */}
                                        <SelectItem value="O Level">
                                            Ordinary Level (O-Level)
                                        </SelectItem>
                                        <SelectItem value="A Level">
                                            Advanced Level (A-Level)
                                        </SelectItem>
                                        <SelectItem value="Others">
                                            Others
                                        </SelectItem>

                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-4">

                            <div>
                                <Label htmlFor="subscription_status" className="mb-2 text-sm font-bold">
                                    Subscription Status
                                </Label>
                                <Input
                                    id="subscription_status"
                                    type="text"
                                    value={editFormData.subscription_status}
                                    onChange={(e) => handleEditChange("subscription_status", e.target.value)}
                                    placeholder="Enter Subscription Status"
                                />
                            </div>
                            <div>
                                <Label htmlFor="profile_picture" className="mb-2 text-sm font-bold">
                                    Profile Picture URL
                                </Label>
                                <Input
                                    id="profile_picture"
                                    type="text"
                                    value={editFormData.profile_picture}
                                    onChange={(e) => handleEditChange("profile_picture", e.target.value)}
                                    placeholder="Enter Profile Picture URL"
                                />
                            </div>
                            <div>
                                <Label htmlFor="subjects" className="mb-2 text-sm font-bold">
                                    Subjects (comma separated)
                                </Label>
                                <Input
                                    id="subjects"
                                    type="text"
                                    value={editFormData.subjects}
                                    onChange={(e) => handleEditChange("subjects", e.target.value)}
                                    placeholder="e.g. Math, Physics, Chemistry"
                                />
                            </div>
                            <div>
                                <Label htmlFor="next_of_kin_full_name" className="mb-2 text-sm font-bold">
                                    Next of Kin Full Name
                                </Label>
                                <Input
                                    id="next_of_kin_full_name"
                                    type="text"
                                    value={editFormData.next_of_kin_full_name}
                                    onChange={(e) => handleEditChange("next_of_kin_full_name", e.target.value)}
                                    placeholder="Enter Next of Kin Full Name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="next_of_kin_phone_number" className="mb-2 text-sm font-bold">
                                    Next of Kin Phone Number
                                </Label>
                                <Input
                                    id="next_of_kin_phone_number"
                                    type="text"
                                    value={editFormData.next_of_kin_phone_number}
                                    onChange={(e) => handleEditChange("next_of_kin_phone_number", e.target.value)}
                                    placeholder="Enter Next of Kin Phone Number"
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => setEditDialogOpen(false)} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400"></span>
                                            Saving...
                                        </span>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </DialogFooter>
                        </div>

                    </form>
                </DialogContent>
            </Dialog>
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left Column - Profile Info */}
                <div className="w-full md:w-1/3 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-col items-center pb-4">
                            <div className="relative">
                                {/* <img
                                    src={user.profile_picture || "/default-avatar.png"}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="h-32 w-32 rounded-full object-cover border-4 border-primary/10"
                                /> */}
                                <Avatar className="h-32 w-32  cursor-pointer">
                                    <AvatarImage src={user?.profile_picture} />
                                    <AvatarFallback className="text-4xl">{user.firstName.slice(0, 1) + user.lastName.slice(0, 1)}</AvatarFallback>
                                </Avatar>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="absolute bottom-0 right-0 rounded-full bg-background"
                                    onClick={() => {
                                        // Logic to edit profile photo
                                        console.log("Edit profile photo clicked");
                                    }}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </div>
                            <h2 className="text-2xl font-bold mt-4">
                                {user.firstName} {user.lastName}
                            </h2>
                            <p className="text-muted-foreground">{user.level} Student</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button onClick={() => setEditDialogOpen(true)} variant="outline" className="w-full">
                                Edit Profile
                            </Button>
                            <Button className="w-full">Upgrade Subscription</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <SectionTitle title="Account Information" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p>{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p>{user.phone_number}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Subscription</p>
                                    <p className="capitalize">
                                        {user.subscription_status || "Not subscribed"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Additional Details */}
                <div className="w-full md:w-2/3 space-y-6">
                    <Card>
                        <CardHeader>
                            <SectionTitle title="Personal Information" />
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">
                                        First Name
                                    </h3>
                                    <p>{user.firstName}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">
                                        Last Name
                                    </h3>
                                    <p>{user.lastName}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">
                                        Education Level
                                    </h3>
                                    <p>{user.level}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">
                                        Address
                                    </h3>
                                    <p>{user.address || "Not provided"}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">
                                        School
                                    </h3>
                                    <p>{user.school || "Not provided"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {user.subjects && user.subjects.length > 0 && (
                        <Card>
                            <CardHeader>
                                <SectionTitle title="Subjects" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {user.subjects.map((subject) => (
                                        <span
                                            key={subject}
                                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                        >
                                            {subject}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <SectionTitle title="Next of Kin" />
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">
                                    Full Name
                                </h3>
                                <p>{user.next_of_kin_full_name || "Not provided"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">
                                    Phone Number
                                </h3>
                                <p>{user.next_of_kin_phone_number || "Not provided"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* <div className="flex gap-4">
                        <Button variant="outline" asChild>
                            <Link to="/">Back to Dashboard</Link>
                        </Button>
                        <Button>Save Changes</Button>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default Profile;