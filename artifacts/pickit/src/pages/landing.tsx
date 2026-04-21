import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { GraduationCap, Store } from "lucide-react";
import brandLogo from "@assets/WhatsApp_Image_2026-04-17_at_12.01.44_PM_1776407538276.jpeg";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <header className="container mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={brandLogo} alt="PickIT" className="h-8 w-8 object-contain rounded-full" />
          <span className="font-semibold text-slate-900">
            Pick<span className="text-emerald-500">IT</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm font-medium text-slate-700 hover:text-slate-900">
            Login
          </Link>
          <Button
            asChild
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-5 h-9 text-sm font-medium shadow-none"
          >
            <Link href="/auth/register">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium border border-emerald-100">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Now Live on Campus
          </div>

          <p className="mt-8 text-lg text-slate-600">Queue-Free Campus Printing</p>

          <h1 className="mt-4 font-extrabold tracking-tight leading-none text-[88px] md:text-[140px]">
            <span className="text-[#1a1f4d]">Pick</span>
            <span className="text-emerald-500">IT</span>
          </h1>

          <p className="mt-2 text-xs tracking-[0.4em] text-slate-400">
            REQ &nbsp;·&nbsp; READY &nbsp;·&nbsp; RETRIEVE
          </p>

          <p className="mt-10 text-slate-600 text-base md:text-lg leading-relaxed">
            Upload documents from anywhere. Skip the queue.
            <br />
            Pick up when it's ready.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-12 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-base font-medium shadow-[0_8px_24px_rgba(37,99,235,0.25)]"
            >
              <Link href="/auth/register?role=student">
                <GraduationCap className="mr-2 h-5 w-5" />
                I'm a Student
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-12 px-7 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-base font-medium shadow-[0_8px_24px_rgba(15,23,42,0.2)]"
            >
              <Link href="/auth/register?role=owner">
                <Store className="mr-2 h-5 w-5" />
                I Own a Shop
              </Link>
            </Button>
          </div>

          <p className="mt-10 text-sm text-slate-400">
            Trusted by students across 50+ campuses
          </p>
        </motion.div>
      </main>
    </div>
  );
}
