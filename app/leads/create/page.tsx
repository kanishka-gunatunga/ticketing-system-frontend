"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import RedSpinner from "@/components/RedSpinner";
import Toast from "@/components/Toast";
import SideMenu from "@/components/SideMenu";
import { useCurrentUser } from "@/utils/auth";
import { useToast } from "@/hooks/useToast";
import { LeadsService } from "@/hooks/useLeads";
import { ArrowLeft, Paperclip, X, ImageIcon, Loader2, FileText } from "lucide-react";
import { uploadToBlob } from "@/utils/uploadBlob";

type FormFieldProps = {
    label: string;
    placeholder?: string;
    isIcon?: boolean;
    type?: "text" | "number" | "date" | "textarea" | "select";
    options?: { value: string; label: string }[];
    register?: any;
    error?: any;
    disabled?: boolean;
    value?: string;
    onChange?: (e: any) => void;
    [key: string]: any;
};

function FormField({
    label,
    placeholder,
    isIcon = false,
    type = "text",
    options = [],
    register,
    error,
    disabled = false,
    ...rest
}: FormFieldProps) {
    const baseInputClasses = `w-full ${isIcon ? "px-10" : "px-4"} py-4 rounded-3xl bg-white/80 backdrop-blur text-sm placeholder-[#575757] focus:outline-none focus:ring-2 focus:ring-red-700 ${disabled ? "bg-gray-200" : ""}`;

    return (
        <label className="flex flex-col space-y-2 font-medium text-gray-900">
            <span className="text-[#1D1D1D] font-medium text-[17px] montserrat">{label}</span>
            <div className="relative">
                {type === "textarea" ? (
                    <textarea
                        placeholder={placeholder}
                        rows={5}
                        className={baseInputClasses}
                        {...register}
                        disabled={disabled}
                        {...rest}
                    />
                ) : type === "select" ? (
                    <select
                        className={baseInputClasses}
                        {...register}
                        disabled={disabled}
                        style={{ appearance: "none" }}
                        {...rest}
                    >
                        <option value="">{placeholder || "Select an option"}</option>
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        placeholder={placeholder}
                        className={baseInputClasses}
                        {...register}
                        disabled={disabled}
                        {...rest}
                    />
                )}
                {isIcon && (
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M14.1935 13.5122L16.6532 15.9719M15.8762 9.1838C15.8762 10.7723 15.2451 12.2958 14.1219 13.419C12.9986 14.5422 11.4752 15.1733 9.88669 15.1733C8.29818 15.1733 6.77473 14.5422 5.65149 13.419C4.52825 12.2958 3.89722 10.7723 3.89722 9.1838C3.89722 7.5953 4.52825 6.07185 5.65149 4.94861C6.77473 3.82537 8.29818 3.19434 9.88669 3.19434C11.4752 3.19434 12.9986 3.82537 14.1219 4.94861C15.2451 6.07185 15.8762 7.5953 15.8762 9.1838Z"
                            stroke="#575757"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
                {(type === "select" || isIcon) && (
                    <svg
                        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        width="10"
                        height="6"
                        viewBox="0 0 10 6"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M9.9142 0.58667L5.12263 5.37824L0.331055 0.58667H9.9142Z" fill="#575757" />
                    </svg>
                )}

            </div>
            {error && <span className="text-red-600 text-sm">{error.message}</span>}
        </label>
    );
}

interface AttachmentFile {
    file: File;
    preview: string;
    uploading: boolean;
    url?: string;
    error?: string;
}

export default function CreateLead() {
    const user = useCurrentUser();
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- State Management ---
    const [ticketNumber] = useState(`TKT-${Date.now()}`);
    const [ticketTitle, setTicketTitle] = useState("");
    const [ticketCategory, setTicketCategory] = useState("Technical Issue");
    const [ticketPriority, setTicketPriority] = useState("Medium");
    const [ticketProduct, setTicketProduct] = useState("");
    const [ticketInstantId, setTicketInstantId] = useState("");

    // Requester info
    const [reqName, setReqName] = useState("");
    const [reqEmail, setReqEmail] = useState("");
    const [reqPhone, setReqPhone] = useState("");
    const [reqDept, setReqDept] = useState("");
    const [reqBranch, setReqBranch] = useState("");

    // Issue details & impact
    const [issueDesc, setIssueDesc] = useState("");
    const [impactLevel, setImpactLevel] = useState("Single User");
    const [impactDetails, setImpactDetails] = useState("");

    // Attachments — multiple files
    const [attachmentFiles, setAttachmentFiles] = useState<AttachmentFile[]>([]);

    const [isPending, setIsPending] = useState(false);

    const parseInstantIds = (instantIds: any): Record<string, string> => {
        if (!instantIds) return {};
        if (typeof instantIds === 'object') return instantIds;
        if (typeof instantIds === 'string') {
            try {
                const parsed = JSON.parse(instantIds);
                return typeof parsed === 'object' ? parsed : {};
            } catch {
                return {};
            }
        }
        return {};
    };

    // Options maps
    let productsArray: string[] = [];
    if (user?.products) {
        if (Array.isArray(user.products)) {
            productsArray = user.products;
        } else {
            const rawProducts = String(user.products);
            try {
                const parsed = JSON.parse(rawProducts);
                if (Array.isArray(parsed)) {
                    productsArray = parsed;
                } else {
                    productsArray = [rawProducts];
                }
            } catch {
                if (rawProducts.includes(',')) {
                    productsArray = rawProducts.split(',').map((p: string) => p.trim());
                } else {
                    productsArray = [rawProducts];
                }
            }
        }
    }
    const productOptions = productsArray.map((p: string) => ({ value: p, label: p }));

    const categoryOptions = [
        { value: "Technical Issue", label: "Technical Issue" },
        { value: "Bug Report", label: "Bug Report" },
        { value: "Login & Access", label: "Login & Access" },
        { value: "Feature Request", label: "Feature Request" },
        { value: "Data Issue", label: "Data Issue" },
        { value: "UI/UX Issue", label: "UI/UX Issue" },
        { value: "Security Issue", label: "Security Issue" },
        { value: "Other", label: "Other" }
    ];

    const priorityOptions = [
        { value: "Low", label: "Low" },
        { value: "Medium", label: "Medium" },
        { value: "High", label: "High" },
        { value: "Critical", label: "Critical" }
    ];

    const impactOptions = [
        { value: "Single User", label: "Single User" },
        { value: "Department", label: "Department" },
        { value: "Branch", label: "Branch" },
        { value: "Entire Company", label: "Entire Company" }
    ];

    // --- Handle Dynamic Dropdowns for Company User ---
    useEffect(() => {
        if (user && user.role === "Company") {
            const licensedProducts = productsArray;
            const instantIdsObj = parseInstantIds(user.instant_ids);
            if (licensedProducts.length > 0) {
                setTicketProduct(licensedProducts[0]);
                setTicketInstantId(instantIdsObj[licensedProducts[0]] || "");
            }
            // Pre-fill requester info
            setReqName(user.full_name || user.name || "");
            setReqEmail(user.email || "");
            setReqPhone(user.contact_no || "");
        } else if (user && user.role !== "Company") {
            router.replace("/leads");
        }
    }, [user, router]);

    const handleProductChange = (prod: string) => {
        setTicketProduct(prod);
        const instantIdsObj = parseInstantIds(user?.instant_ids);
        setTicketInstantId(instantIdsObj[prod] || "");
    };

    // -- File Upload Handlers --
    const handleFilesSelected = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const MAX_FILES = 5;
        const MAX_SIZE_MB = 10;

        const incoming = Array.from(files).slice(0, MAX_FILES - attachmentFiles.length);
        if (incoming.length === 0) {
            showToast(`Maximum ${MAX_FILES} attachments allowed`, "error");
            return;
        }

        const newEntries: AttachmentFile[] = incoming
            .filter(f => {
                if (f.size > MAX_SIZE_MB * 1024 * 1024) {
                    showToast(`${f.name} exceeds ${MAX_SIZE_MB}MB limit`, "error");
                    return false;
                }
                return true;
            })
            .map(f => ({
                file: f,
                preview: URL.createObjectURL(f),
                uploading: true,
            }));

        setAttachmentFiles(prev => [...prev, ...newEntries]);

        // Upload each file to Vercel Blob
        for (const entry of newEntries) {
            try {
                const url = await uploadToBlob(entry.file);
                setAttachmentFiles(prev =>
                    prev.map(a =>
                        a.preview === entry.preview
                            ? { ...a, uploading: false, url }
                            : a
                    )
                );
            } catch {
                setAttachmentFiles(prev =>
                    prev.map(a =>
                        a.preview === entry.preview
                            ? { ...a, uploading: false, error: "Upload failed" }
                            : a
                    )
                );
                showToast(`Failed to upload ${entry.file.name}`, "error");
            }
        }
    };

    const removeAttachment = (preview: string) => {
        setAttachmentFiles(prev => {
            const entry = prev.find(a => a.preview === preview);
            if (entry) URL.revokeObjectURL(entry.preview);
            return prev.filter(a => a.preview !== preview);
        });
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!ticketTitle.trim()) {
            showToast("Ticket Title is required", "error");
            return;
        }
        if (!reqName.trim() || !reqEmail.trim() || !reqPhone.trim()) {
            showToast("Please fill in all required requester fields", "error");
            return;
        }
        if (!issueDesc.trim()) {
            showToast("Issue Description is required", "error");
            return;
        }
        if (attachmentFiles.some(a => a.uploading)) {
            showToast("Please wait for attachments to finish uploading", "error");
            return;
        }

        // Build the attachments JSON string with all uploaded URLs
        const uploadedUrls = attachmentFiles
            .filter(a => a.url)
            .map(a => a.url as string);
        const attachmentsValue = uploadedUrls.length > 0 ? JSON.stringify(uploadedUrls) : "";

        setIsPending(true);
        try {
            await LeadsService.createTicket({
                ticket_number: ticketNumber,
                title: ticketTitle,
                category: ticketCategory,
                priority: ticketPriority,
                product: ticketProduct,
                instant_id: ticketInstantId,
                requester_name: reqName,
                requester_email: reqEmail,
                requester_phone: reqPhone,
                requester_department: reqDept,
                requester_branch: reqBranch,
                description: issueDesc,
                impact_level: impactLevel,
                impact_user_details: impactDetails,
                attachments: attachmentsValue,
                company_user_id: user?.id
            });

            showToast("Support Inquiry created successfully!", "success");

            setTimeout(() => {
                router.push("/leads");
            }, 1500);
        } catch (err) {
            showToast("Failed to create support ticket", "error");
        } finally {
            setIsPending(false);
        }
    };

    if (!user || user.role !== "Company") {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <RedSpinner />
            </div>
        );
    }

    return (
        <div className="relative w-full min-h-screen bg-gray-50 text-gray-900 font-sans pb-16">
            <Toast
                message={toast.message}
                type={toast.type}
                visible={toast.visible}
                onClose={hideToast}
            />

            <Header title="Digitrust Ticketing System" />
            <SideMenu />

            <main className="pt-28 px-16 ml-16 min-[1500px]:ml-auto max-w-[1350px] mx-auto flex flex-col gap-6">

                {/* Back button */}
                <div className="flex items-center">
                    <button
                        onClick={() => router.push("/leads")}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition font-medium cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>
                </div>

                {/* Premium Styled Form Block */}
                <section className="relative bg-[#FFFFFF4D] bg-opacity-30 rounded-[45px] px-14 py-10 flex justify-between items-center border border-gray-200/50 shadow-xl">
                    <form onSubmit={onSubmit} className="flex flex-col w-full">
                        <div className="flex-1 space-y-6">

                            {/* Heading and Action Row */}
                            <div className="flex flex-row items-center justify-between border-b border-gray-200/40 pb-6">
                                <h2 className="font-semibold text-[22px] text-[#000000] mb-0">Create Support Ticket</h2>
                                <div>
                                    <button
                                        type="submit"
                                        disabled={isPending || attachmentFiles.some(a => a.uploading)}
                                        className="ml-auto mt-8 md:mt-0 bg-[#DB2727] text-white text-base font-medium rounded-full px-9 py-2 hover:bg-red-650 transition disabled:bg-gray-400 cursor-pointer flex items-center gap-2"
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : "Send"}
                                    </button>
                                </div>
                            </div>

                            {/* Section 1: Ticket Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <FormField
                                    label="Ticket Number"
                                    type="text"
                                    value={ticketNumber}
                                    disabled={true}
                                />

                                <FormField
                                    label="Licensed Product"
                                    type="select"
                                    options={productOptions}
                                    value={ticketProduct}
                                    onChange={(e) => handleProductChange(e.target.value)}
                                    placeholder="Select licensed product"
                                />

                                <FormField
                                    label="Instant ID"
                                    type="text"
                                    value={ticketInstantId}
                                    disabled={true}
                                />

                                <FormField
                                    label="Category"
                                    type="select"
                                    options={categoryOptions}
                                    value={ticketCategory}
                                    onChange={(e) => setTicketCategory(e.target.value)}
                                    placeholder="Select a category"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                                <FormField
                                    label="Priority"
                                    type="select"
                                    options={priorityOptions}
                                    value={ticketPriority}
                                    onChange={(e) => setTicketPriority(e.target.value)}
                                    placeholder="Select priority level"
                                />

                                <div className="md:col-span-3">
                                    <FormField
                                        label="Ticket Title"
                                        type="text"
                                        placeholder="Brief summary of the support issue"
                                        value={ticketTitle}
                                        onChange={(e) => setTicketTitle(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Section 2: Requester Details */}
                            <div className="flex flex-row items-center justify-between mt-10">
                                <h2 className="font-semibold text-[19px] mb-2">Requester Details</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <FormField
                                    label="Requester Name"
                                    type="text"
                                    placeholder="Your Name"
                                    value={reqName}
                                    onChange={(e) => setReqName(e.target.value)}
                                />

                                <FormField
                                    label="Email Address"
                                    type="text"
                                    placeholder="name@company.com"
                                    value={reqEmail}
                                    onChange={(e) => setReqEmail(e.target.value)}
                                />

                                <FormField
                                    label="Contact Number"
                                    type="text"
                                    placeholder="077 1234567"
                                    value={reqPhone}
                                    onChange={(e) => setReqPhone(e.target.value)}
                                />

                                <FormField
                                    label="Department"
                                    type="text"
                                    placeholder="e.g. IT, HR, Finance"
                                    value={reqDept}
                                    onChange={(e) => setReqDept(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                                <FormField
                                    label="Branch / Location"
                                    type="text"
                                    placeholder="e.g. Colombo Office"
                                    value={reqBranch}
                                    onChange={(e) => setReqBranch(e.target.value)}
                                />
                            </div>

                            {/* Section 3: Issue details & impact */}
                            <div className="flex flex-row items-center justify-between mt-10">
                                <h2 className="font-semibold text-[19px] mb-2">Issue Description & Impact</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <FormField
                                    label="Impact Level"
                                    type="select"
                                    options={impactOptions}
                                    value={impactLevel}
                                    onChange={(e) => setImpactLevel(e.target.value)}
                                    placeholder="Select impact range"
                                />

                                <div className="md:col-span-3">
                                    <FormField
                                        label="Impact User Details"
                                        type="text"
                                        placeholder="Describe who is affected (e.g. All accounting staff)"
                                        value={impactDetails}
                                        onChange={(e) => setImpactDetails(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <FormField
                                    label="Description / Detailed Error"
                                    type="textarea"
                                    placeholder="Describe exact details of the error message, steps to reproduce, or technical descriptions..."
                                    value={issueDesc}
                                    onChange={(e) => setIssueDesc(e.target.value)}
                                />
                            </div>

                            {/* Section 4: Attachments */}
                            <div className="mt-8">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[#1D1D1D] font-medium text-[17px] montserrat">
                                        Attachments <span className="text-xs text-gray-400 font-normal ml-1">(screenshots, logs, images — up to 5 files, 10MB each)</span>
                                    </span>
                                    {attachmentFiles.length < 5 && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-2 text-sm font-semibold text-[#DB2727] border border-[#DB2727]/30 hover:bg-[#DB2727]/5 rounded-full px-4 py-2 transition cursor-pointer"
                                        >
                                            <Paperclip className="w-4 h-4" />
                                            Add Files
                                        </button>
                                    )}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*,.pdf,.log,.txt"
                                    className="hidden"
                                    onChange={(e) => handleFilesSelected(e.target.files)}
                                />

                                {attachmentFiles.length === 0 ? (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full border-2 border-dashed border-gray-200 hover:border-[#DB2727]/40 rounded-[28px] py-10 flex flex-col items-center gap-3 text-gray-400 hover:text-[#DB2727]/70 transition cursor-pointer bg-white/40"
                                    >
                                        <ImageIcon className="w-8 h-8" />
                                        <span className="text-sm font-medium">Click to upload screenshots or log files</span>
                                        <span className="text-xs">PNG, JPG, PDF, LOG — Max 10MB per file</span>
                                    </button>
                                ) : (
                                    <div className="flex flex-wrap gap-3">
                                        {attachmentFiles.map((att) => (
                                            <div
                                                key={att.preview}
                                                className="relative group w-28 h-28 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm flex-shrink-0"
                                            >
                                                {att.file.type.startsWith("image/") ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={att.preview}
                                                        alt={att.file.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : att.file.type === "application/pdf" || att.file.name.toLowerCase().endsWith(".pdf") ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-red-50/50 text-red-550 p-2 text-center">
                                                        <FileText className="w-6 h-6 mb-1 text-red-500" />
                                                        <span className="text-[9px] font-bold uppercase tracking-wider text-red-600">PDF File</span>
                                                        <span className="text-[9px] truncate w-full text-center text-gray-500 mt-0.5">{att.file.name}</span>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-500 p-2 text-center">
                                                        <Paperclip className="w-6 h-6 mb-1" />
                                                        <span className="text-[10px] truncate w-full text-center">{att.file.name}</span>
                                                    </div>
                                                )}

                                                {/* Upload overlay */}
                                                {att.uploading && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                                                    </div>
                                                )}
                                                {att.error && (
                                                    <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center">
                                                        <span className="text-white text-[10px] text-center px-1">Failed</span>
                                                    </div>
                                                )}
                                                {!att.uploading && !att.error && (
                                                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                )}

                                                {/* Remove button */}
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttachment(att.preview)}
                                                    className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Add more button */}
                                        {attachmentFiles.length < 5 && (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-28 h-28 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#DB2727]/40 flex items-center justify-center text-gray-300 hover:text-[#DB2727]/50 transition cursor-pointer bg-white/40"
                                            >
                                                <Paperclip className="w-6 h-6" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}
