import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({ data: "Hello World" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to Hello World" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
