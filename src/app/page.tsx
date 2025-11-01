"use client";

import { useState, useEffect, FormEvent } from "react";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import Image from "next/image";

export default function LoginPage() {
  const [rollNo, setRollNo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/booking");
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (!rollNo.trim()) {
      toast.error("Roll number is required.");
      return;
    }

    setIsLoading(true);

    try {
      const formattedRoll = rollNo.trim().toUpperCase();

      const { data: student, error: fetchError } = await supabase
        .from("students")
        .select("roll_no")
        .eq("roll_no", formattedRoll)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!student) {
        const { error: insertError } = await supabase
          .from("students")
          .insert([{ roll_no: formattedRoll }]);

        if (insertError) throw insertError;
      }

      login(formattedRoll);
      toast.success("Login successful! Redirecting...");
      router.push("/booking");
    } catch (err) {
      console.error("Login Error:", err);
      toast.error("Unable to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-2xl border border-slate-200">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto mb-2 flex justify-center">
              <Image
                src="/logo.webp"
                alt="College Logo"
                width={80}
                height={70}
                priority
                className="rounded-md"
              />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              College Futsal Booking
            </CardTitle>
            <CardDescription className="text-base text-slate-600">
              Sign in with your roll number to manage your futsal bookings.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="rollNo" className="text-sm font-medium">
                  Student Roll Number
                </Label>
                <Input
                  id="rollNo"
                  type="text"
                  placeholder="e.g. 2021CS001"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="h-12 text-base uppercase"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold tracking-wide"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>

          <div className="flex justify-center px-4 pb-6">
            <Image
              src="/banner.webp"
              alt="Campus Banner"
              width={500}
              height={300}
              priority
              className="rounded-lg object-cover"
            />
          </div>
        </Card>
      </div>
    </>
  );
}
