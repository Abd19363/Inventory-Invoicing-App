"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={10}
            containerStyle={{
                top: 24,
                right: 24,
            }}
            toastOptions={{
                // Default options
                duration: 4000,
                style: {
                    background: "#0d1c2d",
                    color: "#d4e4fa",
                    border: "1px solid #3c4a42",
                    borderRadius: "14px",
                    padding: "14px 18px",
                    fontSize: "14px",
                    fontWeight: "500",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(78,222,163,0.05)",
                    backdropFilter: "blur(12px)",
                    maxWidth: "400px",
                    lineHeight: "1.5",
                },

                // Success style
                success: {
                    duration: 3500,
                    style: {
                        background: "#0d1c2d",
                        color: "#d4e4fa",
                        border: "1px solid #10b981",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 0 12px rgba(16,185,129,0.12)",
                    },
                    iconTheme: {
                        primary: "#4edea3",
                        secondary: "#003824",
                    },
                },

                // Error style
                error: {
                    duration: 5000,
                    style: {
                        background: "#0d1c2d",
                        color: "#d4e4fa",
                        border: "1px solid #93000a",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 0 12px rgba(255,180,171,0.10)",
                    },
                    iconTheme: {
                        primary: "#ffb4ab",
                        secondary: "#93000a",
                    },
                },

                // Loading style
                loading: {
                    style: {
                        background: "#0d1c2d",
                        color: "#d4e4fa",
                        border: "1px solid #3c4a42",
                    },
                    iconTheme: {
                        primary: "#4edea3",
                        secondary: "#0d1c2d",
                    },
                },
            }}
        />
    );
}
