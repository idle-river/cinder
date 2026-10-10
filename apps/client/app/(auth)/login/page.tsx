"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-orange-50 via-amber-50/20 to-background px-4 py-12 dark:from-orange-950/20 dark:via-amber-950/10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto w-full max-w-md"
      >
        <Card className="border-orange-200/70 shadow-xl shadow-orange-100/50 dark:border-orange-900/40 dark:shadow-none">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <Flame className="size-4" />
              <span className="text-sm font-semibold">Cinder</span>
            </div>
            <CardTitle className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-2xl font-bold text-transparent dark:from-orange-300 dark:to-amber-200">
              Welcome back
            </CardTitle>
            <CardDescription>
              Sign in to continue to your communities.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@cinder.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Your password"
                />
              </div>

              <Button type="submit" className="w-full">
                Sign in
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Need an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-orange-700 hover:underline dark:text-orange-300"
                >
                  Create one
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
