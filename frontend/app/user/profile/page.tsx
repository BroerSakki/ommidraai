"use client";

import { useEffect, useState } from "react";
import { ProfileHeader } from "@/app/components/profile/profile-header";
import { ProfileInfo } from "@/app/components/profile/profile-info";
import { SavedLocations } from "@/app/components/profile/saved-locations";

type ApiMeResponse = {
    id: number;
    username: string;
    email: string;
    default_location_id: number;
};

export default function ProfilePage() {
    const [user, setUser] = useState<ApiMeResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [updateError, setUpdateError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUser() {
            setLoading(true);
            try {
                const response = await fetch(`/api/backend/auth/me`);
                if (!response.ok) {
                    throw new Error("Failed to fetch user data");
                }
                const data = await response.json() as ApiMeResponse;
                setUser(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, []);

    async function handleUpdateUsername(newUsername: string) {
        setUpdateError(null);
        try {
            const response = await fetch(`/api/backend/auth/update`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: newUsername }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to update username");
            }

            setUser((prev) => prev ? { ...prev, username: newUsername } : prev);
        } catch (err) {
            setUpdateError(
                err instanceof Error ? err.message : "An unexpected error occurred"
            );
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-[#b6cfc6] to-white">
            <div className="mx-auto max-w-5xl">

                <ProfileHeader />

                <div className="bg-white p-8">

                    {loading ? (
                        <p className="text-gray-500">Loading profile…</p>
                    ) : user ? (
                        <ProfileInfo
                            username={user.username}
                            email={user.email}
                            onUpdateUsername={handleUpdateUsername}
                        />
                    ) : (
                        <p className="text-red-600">Could not load profile.</p>
                    )}

                    {updateError && (
                        <p className="mt-2 text-sm text-red-600">{updateError}</p>
                    )}

                    <SavedLocations />

                </div>

            </div>
        </main>
    );
}
