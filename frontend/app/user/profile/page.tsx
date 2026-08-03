import type { Metadata } from "next";
import { ProfileHeader } from "@/app/user/components/Profile/profile-header";
import { ProfileInfo } from "@/app/user/components/Profile/profile-info";
import { SavedLocations } from "@/app/user/components/Profile/saved-locations";

export const metadata: Metadata = {
    title: "Profile",
};

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