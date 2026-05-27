import React from "react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";

type FormFieldProps = {
    label: string;
    placeholder?: string;
    isIcon?: boolean;
    type?: "text" | "number" | "date" | "textarea" | "select";
    options?: { value: string; label: string }[];
    register?: UseFormRegisterReturn;
    error?: FieldError;
    disabled?: boolean;
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
                    />
                ) : type === "select" ? (
                    <select
                        className={baseInputClasses}
                        {...register}
                        disabled={disabled}
                        style={{ appearance: "none" }}
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

export default FormField;