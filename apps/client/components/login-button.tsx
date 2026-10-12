"use client";

import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export function LoginButton() {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push("/login")}
      className="bg-amber-500 text-white font-bold rounded-md hover:bg-amber-600 transition-all duration-300 hover:scale-105 active:scale-90 p-3"
    >
      Login
    </Button>
  );
}
