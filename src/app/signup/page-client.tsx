"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/src/components/common/auth-shell";
import { useAuthStore } from "@/src/store";
import { User, Lock, Mail, Building, Briefcase, Phone } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    employeeId: "",
    department: "",
    designation: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      handleSignup();
    }
  };

  const handleSignup = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setIsLoading(true);

    // Mock signup logic
    setTimeout(() => {
      const newUser = {
        id: formData.employeeId || `EMP-${Math.floor(Math.random() * 1000)}`,
        name: formData.fullName,
        role: "employee" as const,
        title: formData.designation,
        email: formData.email,
        teamId: "t-general",
        avatar: formData.fullName.charAt(0),
        utilization: 0,
        performance: 0,
        department: formData.department,
        designation: formData.designation,
        mobileNumber: formData.mobileNumber,
      };

      login(newUser);
      router.push("/");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <AuthShell
      title="Employee onboarding"
      description="Create an employee account with profile validation and password security."
    >
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-primary-600" : "bg-slate-200"}`} />
          <div className="mx-2 text-xs font-bold text-slate-500">STEP {step} OF 2</div>
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-primary-600" : "bg-slate-200"}`} />
        </div>
      </div>

      <form onSubmit={handleNext} className="space-y-4">
        {step === 1 ? (
          <>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">Full Name</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Official Email</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="john@gtftechnologies.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="employeeId" className="block text-sm font-medium text-slate-700">Employee ID</label>
                <input
                  id="employeeId"
                  type="text"
                  required
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="GTF-1042"
                />
              </div>
              <div>
                <label htmlFor="mobileNumber" className="block text-sm font-medium text-slate-700">Mobile</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="mobileNumber"
                    type="text"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="9999999999"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-slate-700">Department</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  id="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Select Department</option>
                  <option value="Technology">Technology</option>
                  <option value="Operations">Operations</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-slate-700">Designation</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="designation"
                  type="text"
                  required
                  value={formData.designation}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Software Engineer"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirm Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </>
        )}

        <div className="pt-4 flex gap-3">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 primary-cta flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all"
          >
            {isLoading ? "Processing..." : step === 1 ? "Next Step" : "Complete Signup"}
          </button>
        </div>

        <div className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
