"use client";

import { useState } from "react";
import { AppShell } from "@/src/components/common/app-shell";
import { PageHeader } from "@/src/components/sections/page-header";
import { FormField, Input } from "@/src/components/ui/form-field";
import { Modal } from "@/src/components/ui/modal";
import { useAuthStore, useEmployeeStore } from "@/src/store";
import type { User } from "@/src/types";
import {
  User as UserIcon,
  Personalcard,
  Briefcase,
  Buildings,
  ExportSquare,
  Sms,
  Call,
  Edit2
} from "iconsax-react";

interface ProfileFormState {
  name: string;
  title: string;
  department: string;
  email: string;
  mobileNumber: string;
  reportingManager: string;
}

const getInitialFormState = (user: User): ProfileFormState => ({
  name: user.name,
  title: user.title || user.designation || "",
  department: user.department || "",
  email: user.email,
  mobileNumber: user.mobileNumber || "",
  reportingManager: user.reportingManager || "",
});

export default function ProfilePage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const setCurrentUser = useAuthStore((s) => s.setCurrentUser);
  const updateUser = useEmployeeStore((state) => state.updateUser);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm] = useState<ProfileFormState | null>(null);
  const [error, setError] = useState("");

  if (!currentUser) return null;

  const openEditProfile = () => {
    setForm(getInitialFormState(currentUser));
    setError("");
    setIsEditOpen(true);
  };

  const closeEditProfile = () => {
    setIsEditOpen(false);
    setError("");
  };

  const updateField = (field: keyof ProfileFormState, value: string) => {
    setForm((previous) => previous ? { ...previous, [field]: value } : previous);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;

    const name = form.name.trim();
    const email = form.email.trim();

    if (!name) {
      setError("Full name is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid official email address.");
      return;
    }

    const updates: Partial<User> = {
      name,
      title: form.title.trim(),
      designation: form.title.trim(),
      department: form.department.trim(),
      email,
      mobileNumber: form.mobileNumber.trim(),
      reportingManager: form.reportingManager.trim(),
    };

    const updatedUser = { ...currentUser, ...updates };
    updateUser(currentUser.id, updates);
    setCurrentUser(updatedUser);
    setIsEditOpen(false);
    setError("");
  };

  const profileItems = [
    { label: "Full Name", value: currentUser.name, icon: UserIcon },
    { label: "Employee ID", value: currentUser.id, icon: Personalcard },
    { label: "Designation", value: currentUser.title || currentUser.designation || "Not Set", icon: Briefcase },
    { label: "Department", value: currentUser.department || "Not Set", icon: Buildings },
    { label: "Official Email", value: currentUser.email, icon: Sms },
    { label: "Mobile Number", value: currentUser.mobileNumber || "Not Set", icon: Call },
    { label: "Reporting Manager", value: currentUser.reportingManager || "Not Set", icon: UserIcon },
    { label: "Role", value: currentUser.role.toUpperCase(), icon: ExportSquare },
  ];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <PageHeader
            eyebrow="My Profile"
            title="Employee Information"
            description="Manage your personal details, professional information, and security settings."
          />
          <button
            type="button"
            onClick={openEditProfile}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <Edit2 size={16} />
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profileItems.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                <item.icon color="#2563eb" size={24} variant="Outline" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.label}</p>
                <p className="text-base font-bold text-slate-900 mt-1">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <Modal
          isOpen={isEditOpen}
          onClose={closeEditProfile}
          title="Edit Profile"
          description="Update your visible employee information."
        >
          {form && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField id="profile-name" label="Full Name" required>
                  <Input
                    id="profile-name"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    autoComplete="name"
                    required
                  />
                </FormField>

                <FormField id="profile-title" label="Designation">
                  <Input
                    id="profile-title"
                    value={form.title}
                    onChange={(event) => updateField("title", event.target.value)}
                    autoComplete="organization-title"
                  />
                </FormField>

                <FormField id="profile-department" label="Department">
                  <Input
                    id="profile-department"
                    value={form.department}
                    onChange={(event) => updateField("department", event.target.value)}
                    autoComplete="organization"
                  />
                </FormField>

                <FormField id="profile-email" label="Official Email" required>
                  <Input
                    id="profile-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    autoComplete="email"
                    required
                  />
                </FormField>

                <FormField id="profile-mobile" label="Mobile Number">
                  <Input
                    id="profile-mobile"
                    type="tel"
                    value={form.mobileNumber}
                    onChange={(event) => updateField("mobileNumber", event.target.value)}
                    autoComplete="tel"
                  />
                </FormField>

                <FormField id="profile-manager" label="Reporting Manager">
                  <Input
                    id="profile-manager"
                    value={form.reportingManager}
                    onChange={(event) => updateField("reportingManager", event.target.value)}
                    autoComplete="off"
                  />
                </FormField>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Read-only</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  Employee ID: {currentUser.id} | Role: {currentUser.role.toUpperCase()}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditProfile}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </AppShell>
  );
}
