"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  Home,
} from "lucide-react";

export default function ConfirmationPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [bookingDetails, setBookingDetails] = useState({
    date: "",
    time: "",
    team: [] as string[],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    const date = searchParams.get("date") || "";
    const time = searchParams.get("time") || "";
    const team = searchParams.get("team")?.split(",") || [];

    setBookingDetails({ date, time, team });
  }, [isAuthenticated, router, searchParams]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleBackToBooking = () => {
    router.push("/booking");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-green-600">
            Booking Confirmed!
          </CardTitle>
          <CardDescription className="text-base">
            Your futsal court has been successfully booked
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg mb-4">Booking Details</h3>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-slate-600 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">Date</p>
                <p className="text-slate-600">
                  {formatDate(bookingDetails.date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-slate-600 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">Time Slot</p>
                <p className="text-slate-600">{bookingDetails.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-slate-600 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">Team Members</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {bookingDetails.team.map((member, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white rounded-full text-sm text-slate-700 border border-slate-200"
                    >
                      {member}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-amber-900 ml-2">
              <p className="font-semibold mb-2">Important Notice</p>
              <p className="text-sm">
                If your team doesn&apos;t show up after booking, future bookings
                will be least prioritized. Please ensure all team members are
                available at the scheduled time.
              </p>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button
              onClick={handleBackToBooking}
              className="w-full h-12 text-base font-semibold gap-2"
            >
              <Home className="w-5 h-5" />
              Back to Booking
            </Button>

            <div className="text-center">
              <p className="text-sm text-slate-500">
                Please arrive 10 minutes before your scheduled time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
