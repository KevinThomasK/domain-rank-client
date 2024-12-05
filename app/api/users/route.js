import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  try {
    const body = await req.json();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/add-auth-user`,
      body
    ); // Update with your backend's URL
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to create user" },
      { status: error.response?.status || 500 }
    );
  }
}
