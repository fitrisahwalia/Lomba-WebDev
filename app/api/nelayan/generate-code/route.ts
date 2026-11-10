import { NextResponse } from "next/server";

export async function POST() {
  // Generate 6 digit angka acak untuk kode tautan
  const kode = Math.floor(100000 + Math.random() * 900000).toString();
  return NextResponse.json({ kode });
}