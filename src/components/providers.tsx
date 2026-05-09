"use client";
import { QueryProviders } from "@/components/query-provider";

interface ProvidersProps {
    children: React.ReactNode
}

export const Providers = ({ children }: ProvidersProps) => {
    return (
        <QueryProviders>
            { children }
        </QueryProviders>
    )
}