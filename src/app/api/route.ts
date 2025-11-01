import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND);

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Booking Approved ✅",
            html: `<p>Your futsal booking has been approved. See you on the court!</p>`,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Resend error:", error);
        return NextResponse.json({ success: false, error }, { status: 500 });
    }
}
