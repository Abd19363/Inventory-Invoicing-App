"use client";

import { useEffect, useRef } from "react";

// ============================================================
// CONFIRM MODAL
//
// A styled dark-theme confirmation dialog to replace
// native window.confirm() calls across the InvPro app.
//
// Props:
//   isOpen     - boolean: whether the modal is shown
//   title      - string: modal header title
//   message    - string: confirmation message body
//   confirmLabel - string (optional): confirm button text (default: "Delete")
//   onConfirm  - function: called when user confirms
//   onCancel   - function: called when user cancels / closes modal
//   variant    - "danger" | "warning" (default: "danger")
// ============================================================

export default function ConfirmModal({
    isOpen,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmLabel = "Delete",
    onConfirm,
    onCancel,
    variant = "danger",
}) {
    const confirmBtnRef = useRef(null);

    // Focus the cancel button on open for keyboard accessibility
    useEffect(() => {
        if (isOpen) {
            confirmBtnRef.current?.focus();
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;

        function handleKey(e) {
            if (e.key === "Escape") onCancel?.();
        }

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const isDanger = variant === "danger";

    const confirmBtnClass = isDanger
        ? "bg-red-600 hover:bg-red-500 shadow-red-900/30"
        : "bg-yellow-500 hover:bg-yellow-400 shadow-yellow-900/30";

    const iconBg = isDanger
        ? "bg-red-500/10 border-red-500/20"
        : "bg-yellow-500/10 border-yellow-500/20";

    const iconColor = isDanger ? "text-red-400" : "text-yellow-400";

    return (
        /* ── BACKDROP ── */
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(1, 15, 31, 0.80)", backdropFilter: "blur(6px)" }}
            onClick={onCancel}
        >
            {/* ── MODAL CARD ── */}
            <div
                className="relative w-full max-w-md rounded-2xl border border-[#273647] bg-[#0d1c2d] shadow-2xl"
                style={{
                    animation: "modalSlideIn 0.22s cubic-bezier(0.16,1,0.3,1)",
                    boxShadow: "0 25px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(78,222,163,0.04)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── HEADER ── */}
                <div className="flex items-start gap-4 p-6 pb-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-11 h-11 rounded-full border flex items-center justify-center ${iconBg}`}>
                        {isDanger ? (
                            <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        ) : (
                            <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                        )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-white leading-tight">
                            {title}
                        </h3>
                        <p className="mt-1.5 text-sm text-[#86948a] leading-relaxed">
                            {message}
                        </p>
                    </div>

                    {/* Close × */}
                    <button
                        onClick={onCancel}
                        className="flex-shrink-0 text-[#3c4a42] hover:text-[#d4e4fa] transition-colors p-1 rounded-lg hover:bg-[#1c2b3c]"
                        aria-label="Close"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* ── DIVIDER ── */}
                <div className="h-px bg-[#1c2b3c] mx-6" />

                {/* ── ACTIONS ── */}
                <div className="flex items-center justify-end gap-3 p-6 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2.5 rounded-xl bg-[#1c2b3c] hover:bg-[#273647] border border-[#3c4a42] text-[#bbcabf] hover:text-white text-sm font-semibold transition-all duration-200 cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        ref={confirmBtnRef}
                        type="button"
                        onClick={onConfirm}
                        className={`px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 shadow-lg cursor-pointer ${confirmBtnClass}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>

            {/* ── ANIMATION KEYFRAME (inline style) ── */}
            <style>{`
                @keyframes modalSlideIn {
                    from { opacity: 0; transform: scale(0.94) translateY(-8px); }
                    to   { opacity: 1; transform: scale(1)    translateY(0);     }
                }
            `}</style>
        </div>
    );
}
