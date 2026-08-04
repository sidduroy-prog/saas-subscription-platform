"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await api.get("/plans");
      setPlans(data);
    };
    fetchPlans();
  }, []);

  const handleChoosePlan = async (plan) => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (Number(plan.price_monthly) === 0) {
      alert("You're all set on the Free plan!");
      return;
    }

    setLoadingPlanId(plan.id);
    try {
      const { data } = await api.post("/subscriptions/create-checkout-session", {
        planId: plan.id,
      });
      window.location.href = data.url;
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">Simple, Transparent Pricing</h1>
      <p className="text-center text-slate-600 mb-12">Choose the plan that fits your needs</p>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl shadow p-6 flex flex-col">
            <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
            <p className="text-slate-500 text-sm mb-4">{plan.description}</p>
            <div className="text-3xl font-bold text-slate-900 mb-4">
              ${Number(plan.price_monthly).toFixed(0)}
              <span className="text-base font-normal text-slate-500">/month</span>
            </div>
            <ul className="text-sm text-slate-600 space-y-2 mb-6 flex-1">
              {(plan.features || []).map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleChoosePlan(plan)}
              disabled={loadingPlanId === plan.id}
              className="bg-blue-600 text-white py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {loadingPlanId === plan.id ? "Redirecting..." : "Choose Plan"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
