"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading || !user) return;
    const fetchData = async () => {
      try {
        const [statsRes, subsRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/subscriptions/all"),
        ]);
        setStats(statsRes.data);
        setSubscriptions(subsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, authLoading]);

  if (authLoading || loading) return <div className="p-8 text-center">Loading...</div>;

  if (!user || user.role !== "admin") {
    return <div className="p-8 text-center text-red-500">Admin access only.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <h3 className="text-3xl font-bold text-slate-900">{stats?.totalUsers ?? 0}</h3>
          <p className="text-slate-500">Total Users</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <h3 className="text-3xl font-bold text-slate-900">{stats?.activeSubscriptions ?? 0}</h3>
          <p className="text-slate-500">Active Subscriptions</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Revenue by Plan</h2>
        {stats?.revenueByPlan?.length ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2">Plan</th>
                <th className="py-2">Subscribers</th>
                <th className="py-2">Monthly Revenue</th>
              </tr>
            </thead>
            <tbody>
              {stats.revenueByPlan.map((row, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2">{row.name}</td>
                  <td className="py-2">{row.subscriber_count}</td>
                  <td className="py-2">${Number(row.monthly_revenue).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-slate-500">No active subscriptions yet.</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">All Subscribers</h2>
        {subscriptions.length === 0 ? (
          <p className="text-slate-500">No subscribers yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Plan</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="border-b">
                  <td className="py-2">{sub.user_name}</td>
                  <td className="py-2">{sub.email}</td>
                  <td className="py-2">{sub.plan_name}</td>
                  <td className="py-2 capitalize">{sub.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
