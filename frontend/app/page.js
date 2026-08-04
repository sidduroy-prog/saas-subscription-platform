import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-24">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">
        Manage Subscriptions Effortlessly
      </h1>
      <p className="text-slate-600 max-w-xl mb-8">
        A complete SaaS billing platform with flexible plans, automated invoicing,
        and usage analytics — built for growing businesses.
      </p>
      <div className="flex gap-4">
        <Link href="/pricing" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium">
          View Plans
        </Link>
        <Link href="/register" className="border border-slate-300 px-6 py-3 rounded-lg font-medium">
          Get Started
        </Link>
      </div>
    </div>
  );
}
