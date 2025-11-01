"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Resend } from 'resend';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const FACULTIES = [
  "Civil",
  "Computer",
  "IT",
  "Architecture",
  "BBA",
  "Electronics",
];
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
export const TIME_SLOTS = [
  "07:00 - 08:00",
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
];

