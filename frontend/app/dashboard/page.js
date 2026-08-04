"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    const fetchData = async () => {
      try {
        const [subRes, invRes] = await Promise.all([
          api.get("/subscriptions/me"),
          api.get("/invoices"),
        ]);
        setSubscription(subRes.data);
        setInvoices(invRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user, authLoading]);

  if (authLoading || loading) return <div className="p-8 text-center">Loading...</div>;

  if (!user) {
    return (
      <div className="p-8 text-center">
        Please <Link href="/login" className="text-blue-600">login</Link> to view your dashboard.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Current Subscription</h2>
        {subscription ? (
          <div>
            <p className="text-slate-700">
              Plan: <span className="font-medium">{subscription.plan_name}</span>
            </p>
            <p className="text-slate-700">
              Status: <span className="font-medium capitalize">{subscription.status}</span>
            </p>
            <p className="text-slate-700">
              Renews: {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <p className="text-slate-600">
            You&apos;re on the Free plan. <Link href="/pricing" className="text-blue-600">Upgrade now</Link>
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Billing History</h2>
        {invoices.length === 0 ? (
          <p className="text-slate-500">No invoices yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2">Date</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b">
                  <td className="py-2">{new Date(inv.invoice_date).toLocaleDateString()}</td>
                  <td className="py-2">${Number(inv.amount_paid).toFixed(2)}</td>
                  <td className="py-2 capitalize">{inv.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
