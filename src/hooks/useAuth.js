"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/Services/authService";

export default function useAuth() {

    const router = useRouter();

    useEffect(() => {

        if (!isAuthenticated()) {
            router.replace("/Login");
        }

    }, [router]);

}