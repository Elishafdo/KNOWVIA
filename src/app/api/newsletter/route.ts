import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const trimmed = email.trim().toLowerCase();

    await prisma.newsletterSubscriber.upsert({
      where: { email: trimmed },
      update: {},
      create: { email: trimmed },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing to KNOWVIA! We look forward to sharing great discoveries.",
    });
  } catch (err: any) {
    console.error("Newsletter error:", err);
    return NextResponse.json(
      { error: "Unable to process subscription. Please try again." },
      { status: 500 }
    );
  }
}
