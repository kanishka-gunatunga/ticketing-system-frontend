"use client";

import Header from "@/components/Header";
import Modal from "@/components/Modal";
import SideMenu from "@/components/SideMenu";
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useCreateUser, useUpdateUser, useUsers } from "@/hooks/useUser";
import { useCurrentUser } from "@/utils/auth";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";
import { useDebounce } from "@/hooks/useDebounce";
import { z } from "zod";

const ROLES = {
    ADMIN: "Admin",
    COMPANY: "Company",
    AGENTL1: "AgentL1",
    AGENTL2: "AgentL2",
};

export default function UserManagement() {
    const user = useCurrentUser();
    const { toast, showToast, hideToast } = useToast();

    const [filters, setFilters] = useState({
        role: "",
        search: ""
    });

    const [searchUserQuery, setSearchUserQuery] = useState("");
    const debouncedSearch = useDebounce(searchUserQuery, 500);

    const filtersWithSearch = React.useMemo(() => ({
        ...filters,
        search: debouncedSearch
    }), [filters, debouncedSearch]);

    const { data: users = [], isLoading, refetch } = useUsers(filtersWithSearch);
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();

    const [selectedUser, setSelectedUser] = useState<any | null>(null);

    const [isAddNewUserModalOpen, setIsAddNewUserModalOpen] = useState(false);
    const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form inputs
    const [fullName, setFullName] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [email, setEmail] = useState("");
    const [userRole, setUserRole] = useState(ROLES.AGENTL1);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Company specific licenses
    const [hasDMS, setHasDMS] = useState(false);
    const [hasHRIS, setHasHRIS] = useState(false);
    const [dmsInstantId, setDmsInstantId] = useState("");
    const [hrisInstantId, setHrisInstantId] = useState("");

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const resetAddForm = () => {
        setFullName("");
        setContactNumber("");
        setEmail("");
        setUserRole(ROLES.AGENTL1);
        setPassword("");
        setConfirmPassword("");
        setHasDMS(false);
        setHasHRIS(false);
        setDmsInstantId("");
        setHrisInstantId("");
        setFormErrors({});
    };

    const validateForm = (isEditMode = false) => {
        const errors: Record<string, string> = {};

        const currentName = isEditMode ? selectedUser?.full_name : fullName;
        const currentEmail = isEditMode ? selectedUser?.email : email;
        const currentRole = isEditMode ? selectedUser?.role : userRole;

        if (!currentName || currentName.trim() === "") {
            errors.full_name = "Full Name is required";
        }
        if (!currentEmail || currentEmail.trim() === "") {
            errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(currentEmail)) {
            errors.email = "Invalid Email Format";
        }

        if (!isEditMode) {
            if (!password || password.length < 6) {
                errors.password = "Password must be at least 6 characters";
            }
            if (password !== confirmPassword) {
                errors.confirm_password = "Passwords do not match";
            }
        } else {
            if (password && password.length < 6) {
                errors.password = "Password must be at least 6 characters";
            }
            if (password && password !== confirmPassword) {
                errors.confirm_password = "Passwords do not match";
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateClick = async () => {
        if (!validateForm(false)) {
            showToast("Please fix the errors in the form", "error");
            return;
        }

        try {
            // Build custom company details
            const products: string[] = [];
            const instant_ids: Record<string, string> = {};

            if (userRole === "Company") {
                if (hasDMS) {
                    products.push("DMS");
                    if (dmsInstantId) instant_ids["DMS"] = dmsInstantId;
                }
                if (hasHRIS) {
                    products.push("HRIS");
                    if (hrisInstantId) instant_ids["HRIS"] = hrisInstantId;
                }
            }

            const payload = {
                name: fullName,
                full_name: fullName,
                contact_no: contactNumber,
                email,
                role: userRole,
                password,
                confirm_password: confirmPassword,
                products: userRole === "Company" ? products : undefined,
                instant_ids: userRole === "Company" ? instant_ids : undefined
            };

            await createUserMutation.mutateAsync(payload);
            showToast("User created successfully!", "success");
            setIsAddNewUserModalOpen(false);
            resetAddForm();
            refetch();
        } catch (error: any) {
            console.error("Error creating user:", error);
            const msg = error.response?.data?.message || "Failed to create user";
            showToast(msg, "error");
        }
    };

    const handleUpdateClick = async () => {
        if (!validateForm(true)) {
            showToast("Please fix the errors", "error");
            return;
        }

        try {
            const products: string[] = [];
            const instant_ids: Record<string, string> = {};

            if (selectedUser.role === "Company") {
                if (hasDMS) {
                    products.push("DMS");
                    if (dmsInstantId) instant_ids["DMS"] = dmsInstantId;
                }
                if (hasHRIS) {
                    products.push("HRIS");
                    if (hrisInstantId) instant_ids["HRIS"] = hrisInstantId;
                }
            }

            const payload = {
                name: selectedUser.full_name,
                full_name: selectedUser.full_name,
                contact_no: selectedUser.contact_no,
                email: selectedUser.email,
                role: selectedUser.role,
                products: selectedUser.role === "Company" ? products : undefined,
                instant_ids: selectedUser.role === "Company" ? instant_ids : undefined,
                ...(password ? { password, confirm_password: confirmPassword } : {})
            };

            await updateUserMutation.mutateAsync({
                id: selectedUser.id,
                data: payload
            });

            showToast("User updated successfully!", "success");
            setIsUserDetailsModalOpen(false);
            setIsEditing(false);
            setPassword("");
            setConfirmPassword("");
            refetch();
        } catch (error: any) {
            const msg = error.response?.data?.message || "Failed to update user";
            showToast(msg, "error");
        }
    };

    if (user?.role !== "Admin") {
        return (
            <div className="flex h-screen items-center justify-center font-semibold text-lg text-red-600 bg-gray-50">
                Access Denied: Admins Only
            </div>
        );
    }

    return (
        <div className="relative w-full min-h-screen bg-gray-50 text-gray-900 font-sans pb-10">
            <Toast
                message={toast.message}
                type={toast.type}
                visible={toast.visible}
                onClose={hideToast}
            />

            <Header title="User Administration" />
            <SideMenu />

            <main className="pt-30 px-16 ml-16 max-w-[1440px] mx-auto flex flex-col gap-6">
                <section className="bg-white rounded-[30px] p-8 shadow-sm flex flex-col">
                    <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">User Roster</h2>
                            <p className="text-sm text-gray-500">Manage agents, clients, and platform permissions</p>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <input
                                type="text"
                                value={searchUserQuery}
                                onChange={(e) => setSearchUserQuery(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full sm:w-64 px-4 py-2 text-sm rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-100 transition"
                            />
                            <button
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-red-500/10 cursor-pointer"
                                onClick={() => {
                                    resetAddForm();
                                    setIsAddNewUserModalOpen(true);
                                }}
                            >
                                Add User
                            </button>
                        </div>
                    </div>

                    <div className="w-full overflow-x-auto rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-500 font-bold text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4">Full Name</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">User Role</th>
                                    <th className="px-6 py-4">licensed Products</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-500">Loading users...</td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-400 font-medium">No users found</td>
                                    </tr>
                                ) : (
                                    users.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition">
                                            <td className="px-6 py-4 font-semibold text-gray-900">{item.full_name || item.name}</td>
                                            <td className="px-6 py-4 text-gray-500">{item.contact_no || "-"}</td>
                                            <td className="px-6 py-4 text-gray-600">{item.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                    item.role === 'Admin' ? 'bg-purple-50 text-purple-700' :
                                                    item.role === 'Company' ? 'bg-blue-50 text-blue-700' :
                                                    item.role === 'AgentL1' ? 'bg-orange-50 text-orange-700' :
                                                    'bg-red-50 text-red-700'
                                                }`}>
                                                    {item.role === 'AgentL1' ? 'Agent Level 1' : item.role === 'AgentL2' ? 'Agent Level 2' : item.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.role === 'Company' && item.products && Array.isArray(item.products) && item.products.length > 0 ? (
                                                    <div className="flex gap-1.5 flex-wrap">
                                                        {item.products.map((p: string) => (
                                                            <span key={p} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] uppercase font-bold">
                                                                {p} {item.instant_ids?.[p] ? `(${item.instant_ids[p]})` : ''}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : "-"}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(item);
                                                        setHasDMS(item.products?.includes("DMS") || false);
                                                        setHasHRIS(item.products?.includes("HRIS") || false);
                                                        setDmsInstantId(item.instant_ids?.["DMS"] || "");
                                                        setHrisInstantId(item.instant_ids?.["HRIS"] || "");
                                                        setIsEditing(false);
                                                        setIsUserDetailsModalOpen(true);
                                                    }}
                                                    className="px-3 py-1.5 hover:bg-red-50 text-gray-600 hover:text-red-700 text-xs font-semibold rounded-lg transition active:scale-95 cursor-pointer"
                                                >
                                                    View / Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {/* Add User Modal */}
            {isAddNewUserModalOpen && (
                <Modal
                    title="Register New User"
                    onClose={() => setIsAddNewUserModalOpen(false)}
                    actionButton={{
                        label: "Register User",
                        onClick: handleCreateClick,
                    }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div>
                            <label className="block mb-1.5 text-xs font-bold text-gray-500 uppercase">Full / Company Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border ${formErrors.full_name ? "border-red-500" : "border-gray-200"} text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition`}
                                placeholder="John Doe / Acme Corp"
                            />
                            {formErrors.full_name && <p className="text-red-500 text-xs mt-1">{formErrors.full_name}</p>}
                        </div>
                        <div>
                            <label className="block mb-1.5 text-xs font-bold text-gray-500 uppercase">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border ${formErrors.email ? "border-red-500" : "border-gray-200"} text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition`}
                                placeholder="name@domain.com"
                            />
                            {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                        </div>
                        <div>
                            <label className="block mb-1.5 text-xs font-bold text-gray-500 uppercase">Contact Number</label>
                            <input
                                type="text"
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition"
                                placeholder="0771234567"
                            />
                        </div>
                        <div>
                            <label className="block mb-1.5 text-xs font-bold text-gray-500 uppercase">Platform Role</label>
                            <select
                                value={userRole}
                                onChange={(e) => setUserRole(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition bg-white"
                            >
                                <option value={ROLES.AGENTL1}>Agent Level 1 (Company Side Support)</option>
                                <option value={ROLES.AGENTL2}>Agent Level 2 (Product Owner Support)</option>
                                <option value={ROLES.COMPANY}>Customer Company (Inquiry Submitter)</option>
                                <option value={ROLES.ADMIN}>Platform Administrator</option>
                            </select>
                        </div>

                        {userRole === "Company" && (
                            <div className="md:col-span-2 bg-gray-50 border border-gray-150 rounded-xl p-4 space-y-3">
                                <span className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Licensed Products Setup</span>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                                        <input type="checkbox" checked={hasDMS} onChange={(e) => setHasDMS(e.target.checked)} className="rounded text-red-600" />
                                        DMS Product
                                    </label>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                                        <input type="checkbox" checked={hasHRIS} onChange={(e) => setHasHRIS(e.target.checked)} className="rounded text-red-600" />
                                        HRIS Product
                                    </label>
                                </div>
                                {hasDMS && (
                                    <div>
                                        <label className="block mb-1 text-[11px] font-bold text-gray-500 uppercase">DMS Instant ID</label>
                                        <input
                                            type="text"
                                            value={dmsInstantId}
                                            onChange={(e) => setDmsInstantId(e.target.value)}
                                            placeholder="e.g. HNBLife"
                                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
                                        />
                                    </div>
                                )}
                                {hasHRIS && (
                                    <div>
                                        <label className="block mb-1 text-[11px] font-bold text-gray-500 uppercase">HRIS Instant ID</label>
                                        <input
                                            type="text"
                                            value={hrisInstantId}
                                            onChange={(e) => setHrisInstantId(e.target.value)}
                                            placeholder="e.g. HNBHR"
                                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block mb-1.5 text-xs font-bold text-gray-500 uppercase">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full px-4 py-2.5 rounded-xl border ${formErrors.password ? "border-red-500" : "border-gray-200"} text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition`}
                                    placeholder="Min 6 chars"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                        </div>
                        <div>
                            <label className="block mb-1.5 text-xs font-bold text-gray-500 uppercase">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full px-4 py-2.5 rounded-xl border ${formErrors.confirm_password ? "border-red-500" : "border-gray-200"} text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition`}
                                    placeholder="Repeat password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {formErrors.confirm_password && <p className="text-red-500 text-xs mt-1">{formErrors.confirm_password}</p>}
                        </div>
                    </div>
                </Modal>
            )}

            {/* View / Edit User Details Modal */}
            {isUserDetailsModalOpen && selectedUser && (
                <Modal
                    title={isEditing ? "Edit User Profile" : "User Details"}
                    onClose={() => {
                        setIsUserDetailsModalOpen(false);
                        setIsEditing(false);
                    }}
                    actionButton={
                        isEditing
                            ? { label: "Save Changes", onClick: handleUpdateClick }
                            : { label: "Modify Profile", onClick: () => setIsEditing(true) }
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-sm">
                        <div>
                            <label className="block mb-1.5 text-xs font-bold text-gray-500 uppercase">Full / Company Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={selectedUser.full_name || selectedUser.name}
                                    onChange={(e) => setSelectedUser({ ...selectedUser, full_name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition"
                                />
                            ) : (
                                <p className="px-4 py-2 border border-transparent font-semibold text-gray-800 bg-gray-50 rounded-xl">
                                    {selectedUser.full_name || selectedUser.name}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block mb-1.5 text-xs font-bold text-gray-500 uppercase">Email Address</label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    value={selectedUser.email}
                                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition"
                                />
                            ) : (
                                <p className="px-4 py-2 border border-transparent text-gray-800 bg-gray-50 rounded-xl">
                                    {selectedUser.email}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block mb-1.5 text-xs font-bold text-gray-500 uppercase">Contact Number</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={selectedUser.contact_no || ""}
                                    onChange={(e) => setSelectedUser({ ...selectedUser, contact_no: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition"
                                />
                            ) : (
                                <p className="px-4 py-2 border border-transparent text-gray-800 bg-gray-50 rounded-xl">
                                    {selectedUser.contact_no || "-"}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block mb-1.5 text-xs font-bold text-gray-500 uppercase">Platform Role</label>
                            {isEditing ? (
                                <select
                                    value={selectedUser.role}
                                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition bg-white"
                                >
                                    <option value={ROLES.AGENTL1}>Agent Level 1 (Company Side Support)</option>
                                    <option value={ROLES.AGENTL2}>Agent Level 2 (Product Owner Support)</option>
                                    <option value={ROLES.COMPANY}>Customer Company (Inquiry Submitter)</option>
                                    <option value={ROLES.ADMIN}>Platform Administrator</option>
                                </select>
                            ) : (
                                <p className="px-4 py-2 border border-transparent font-semibold text-gray-800 bg-gray-50 rounded-xl">
                                    {selectedUser.role}
                                </p>
                            )}
                        </div>

                        {selectedUser.role === "Company" && (
                            <div className="md:col-span-2 bg-gray-50 border border-gray-150 rounded-xl p-4 space-y-3">
                                <span className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Licensed Products Setup</span>
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <div className="flex gap-6">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                                                <input type="checkbox" checked={hasDMS} onChange={(e) => setHasDMS(e.target.checked)} className="rounded text-red-600" />
                                                DMS Product
                                            </label>
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                                                <input type="checkbox" checked={hasHRIS} onChange={(e) => setHasHRIS(e.target.checked)} className="rounded text-red-600" />
                                                HRIS Product
                                            </label>
                                        </div>
                                        {hasDMS && (
                                            <div>
                                                <label className="block mb-1 text-[11px] font-bold text-gray-500 uppercase">DMS Instant ID</label>
                                                <input
                                                    type="text"
                                                    value={dmsInstantId}
                                                    onChange={(e) => setDmsInstantId(e.target.value)}
                                                    placeholder="e.g. HNBLife"
                                                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-red-500"
                                                />
                                            </div>
                                        )}
                                        {hasHRIS && (
                                            <div>
                                                <label className="block mb-1 text-[11px] font-bold text-gray-500 uppercase">HRIS Instant ID</label>
                                                <input
                                                    type="text"
                                                    value={hrisInstantId}
                                                    onChange={(e) => setHrisInstantId(e.target.value)}
                                                    placeholder="e.g. HNBHR"
                                                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-red-500"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedUser.products && Array.isArray(selectedUser.products) && selectedUser.products.length > 0 ? (
                                            selectedUser.products.map((p: string) => (
                                                <div key={p} className="flex justify-between items-center text-xs py-1 border-b border-gray-200/50">
                                                    <span className="font-bold text-gray-700 uppercase">{p} Product</span>
                                                    <span className="font-semibold text-gray-600 bg-white px-2 py-0.5 border rounded">
                                                        Instant ID: {selectedUser.instant_ids?.[p] || "-"}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-400">No licensed products setup</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {isEditing && (
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
                                <div>
                                    <label className="block mb-1.5 text-xs font-bold text-gray-500 uppercase">New Password (Optional)</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition"
                                        placeholder="Min 6 chars"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1.5 text-xs font-bold text-gray-500 uppercase">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition"
                                        placeholder="Repeat new password"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}
