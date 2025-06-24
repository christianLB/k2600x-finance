'use client';

import { useRouter } from "next/navigation";
import { Button } from "@k2600x/design-system";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-10 flex flex-col items-center gap-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Finance Dashboard V2</h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-300">
          A modern, secure, and flexible admin interface for managing your financial data.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Button size="lg" className="w-full sm:w-auto" onClick={() => router.push('/admin/finance-dashboard')}>
            Go to Admin V2
          </Button>
        </div>
        <div className="mt-6 text-center">
            <Link href="/admin" className="text-xs text-gray-400 hover:text-primary underline">
                Access Legacy Admin (Reference Only)
            </Link>
        </div>
        <div className="mt-6 text-xs text-gray-400 text-center">
          Powered by <span className="font-semibold">k2600x</span> &amp; Next.js
        </div>
      </div>
    </div>
  );
}
