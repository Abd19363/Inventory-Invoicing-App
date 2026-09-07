"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUserRole } from "@/Services/authService";

export default function useAuth() {

    const router = useRouter();

    const [checkingAuth, setCheckingAuth] = useState(true);
    const [role, setRole] = useState(null);

    useEffect(() => {

        const authenticated =
            isAuthenticated();

        console.log(
            "useAuth - Authentication:",
            authenticated
        );

        if (!authenticated) {

            console.log(
                "useAuth - No access token. Redirecting to Login."
            );

            router.replace("/Login");

            return;
        }

        const currentRole = getUserRole();
        setRole(currentRole);

        console.log(
            "useAuth - User authenticated with role:",
            currentRole
        );

        setCheckingAuth(false);

    }, [router]);


    return {
        checkingAuth,
        role,
        isAdmin: role === "ADMIN",
        isSalesManager: role === "SALES_MANAGER"
    };

}