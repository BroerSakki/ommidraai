"use client";

import { ProfileHeader } from "@/app/components/profile/profile-header";
import { ProfileInfo } from "@/app/components/profile/profile-info";
import { SavedLocations } from "@/app/components/profile/saved-locations";

const user = {
    username: "Username",
    bio: "",
    avatarUrl: "/images/avatar.png",
};

export default function ProfilePage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-[#b6cfc6] to-white">
            <div className="mx-auto max-w-5xl">

                <ProfileHeader />

                <div className="bg-white p-8">

                    <ProfileInfo {...user} />

                    <SavedLocations />

                </div>

            </div>
        </main>
    );
}