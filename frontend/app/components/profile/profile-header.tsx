import { HomeButton } from "@/app/components/navigation/home-menu";

export function ProfileHeader() {
    return (
        <header className="h-20 bg-[#3d3461] shadow-lg flex items-center justify-between px-8">

            {/*<h1 className="text-3xl font-bold text-white">
                Invites
            </h1>*/}
            <HomeButton />

            <button className="rounded-lg bg-[#a8be8f] px-5 py-2 font-semibold text-[#3d3461] transition hover:scale-105 hover:bg-[#b6cfc6]">
                Invite Friends
            </button>

        </header>
    );
}