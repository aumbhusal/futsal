"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, X, Upload, LogOut, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { FACULTIES, SEMESTERS, TIME_SLOTS } from "@/utils/utils";

export default function BookingPage() {
  const { rollNo, logout, isAuthenticated } = useAuth();
  const router = useRouter();


  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<string[]>(["", ""]);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string>("");
  const [faculty, setFaculty] = useState("");
  const [semester, setSemester] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [previousBookings, setPreviousBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    const fetchPreviousBookings = async () => {
      try {
        const { data: student } = await supabase
          .from("students")
          .select("id")
          .eq("roll_no", rollNo).eq('approved', true)
          .maybeSingle();

        if (!student) return;

        const { data: bookings } = await supabase
          .from("bookings")
          .select("*")
          .eq("student_id", student.id)
          .order("booking_date", { ascending: false });

        setPreviousBookings(bookings || []);
      } catch (error) {
        console.error("Error fetching previous bookings:", error);
      }
    };

    fetchPreviousBookings();
  }, [isAuthenticated, rollNo, router]);

  const addTeamMember = () => setTeamMembers([...teamMembers, ""]);
  const removeTeamMember = (index: number) => {
    if (teamMembers.length > 2)
      setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };
  const updateTeamMember = (index: number, value: string) => {
    const updated = [...teamMembers];
    updated[index] = value;
    setTeamMembers(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setIdCardFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setIdCardPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const validTeamMembers = teamMembers.filter((m) => m.trim() !== "");
    if (validTeamMembers.length < 2) {
      toast.error("Add at least 2 team members");
      return false;
    }
    if (!idCardFile) {
      toast.error("Upload your college ID card");
      return false;
    }
    if (!faculty) {
      toast.error("Select your faculty");
      return false;
    }
    if (!semester) {
      toast.error("Select your semester");
      return false;
    }
    if (!bookingDate) {
      toast.error("Select a booking date");
      return false;
    }
    if (!timeSlot) {
      toast.error("Select a time slot");
      return false;
    }

    const selectedDate = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error("Cannot book past dates");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("roll_no", rollNo)
        .maybeSingle();
      if (!student) throw new Error("Student record not found");

      const fileExt = idCardFile!.name.split(".").pop();
      const fileName = `${student.id}-${Date.now()}.${fileExt}`;
      const filePath = `id-cards/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("futsal-bookings")
        .upload(filePath, idCardFile!);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("futsal-bookings")
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;
      console.log(publicUrl);

      const { data: existingBooking } = await supabase
        .from("bookings")
        .select("*")
        .eq("booking_date", bookingDate)
        .eq("time_slot", timeSlot)
        .maybeSingle();

      if (existingBooking) {
        toast.error("This time slot is already booked");
        setIsLoading(false);
        return;
      }

      const validTeamMembers = teamMembers.filter((m) => m.trim() !== "");
      await supabase.from("bookings").insert([
        {
          student_id: student.id,
          team_members: validTeamMembers,
          id_card_url: publicUrl,
          faculty,
          semester: parseInt(semester),
          booking_date: bookingDate,
          time_slot: timeSlot,
          email: email,
          approved: false,
        },
      ]);

      toast.success("Booking confirmed!");
      router.push(
        `/confirmation?date=${bookingDate}&time=${timeSlot}&team=${validTeamMembers.join(",")}`,
      );
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to create booking");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };
  const getTodayDate = () => new Date().toISOString().split("T")[0];

  if (!isAuthenticated) return null;

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Book Futsal Court
              </h1>
              <p className="text-slate-600 mt-1">Logged in as: {rollNo}</p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>

          {previousBookings.length > 0 && (
            <Card className="mb-6 shadow-md border border-slate-200">
              <CardHeader>
                <CardTitle>Previous Bookings</CardTitle>
                <CardDescription>Your past futsal bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {previousBookings.map((b) => (
                    <li
                      key={b.id}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <span>
                        {new Date(b.booking_date).toLocaleDateString()} -{" "}
                        {b.time_slot}
                      </span>
                      <span className="text-sm text-slate-500">
                        {b.team_members.join(", ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
              <CardDescription>
                Fill in all the required information to book the futsal court
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">
                    Team Members Roll Numbers
                  </Label>
                  {teamMembers.map((member, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        placeholder={`Team Member ${idx + 1} Roll No`}
                        value={member}
                        onChange={(e) => updateTeamMember(idx, e.target.value)}
                        className="flex-1"
                        disabled={isLoading}
                      />
                      {teamMembers.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeTeamMember(idx)}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-semibold">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTeamMember}
                    className="w-full gap-2"
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4" /> Add Another Team Member
                  </Button>

                </div>

                <div className="space-y-2">
                  <Label htmlFor="idCard" className="text-base font-semibold">
                    College ID Card
                  </Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
                    <input
                      id="idCard"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                    <label htmlFor="idCard" className="cursor-pointer">
                      {idCardPreview ? (
                        <div className="space-y-2">
                          <img
                            src={idCardPreview}
                            alt="ID Card Preview"
                            className="max-h-48 mx-auto rounded"
                          />
                          <p className="text-sm text-slate-600">
                            Click to change
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-12 w-12 mx-auto text-slate-400" />
                          <p className="text-slate-600">
                            Click to upload ID card
                          </p>
                          <p className="text-xs text-slate-500">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Faculty</Label>
                    <Select
                      value={faculty}
                      onValueChange={setFaculty}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select faculty" />
                      </SelectTrigger>
                      <SelectContent>
                        {FACULTIES.map((f) => (
                          <SelectItem key={f} value={f}>
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Semester</Label>
                    <Select
                      value={semester}
                      onValueChange={setSemester}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEMESTERS.map((s) => (
                          <SelectItem key={s} value={s.toString()}>
                            {s}
                            {s === 1
                              ? "st"
                              : s === 2
                                ? "nd"
                                : s === 3
                                  ? "rd"
                                  : "th"}{" "}
                            Semester
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="bookingDate"
                      className="text-base font-semibold"
                    >
                      Booking Date
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <Input
                        id="bookingDate"
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={getTodayDate()}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Time Slot</Label>
                    <Select
                      value={timeSlot}
                      onValueChange={setTimeSlot}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Booking...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
