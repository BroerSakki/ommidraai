import { LocationMap } from "./location-map";

export function SavedLocations() {
    return (
        <section className="mt-12">

            <h2 className="mb-6 text-3xl font-bold text-[#3d3461]">
                Saved Locations
            </h2>

            <div
                className="
            relative
            rounded-2xl
            bg-[#eef5f1]
            border-2
            border-[#b6cfc6]
            p-6
        "
            >

                <LocationMap />

            </div>

        </section>
    );
}
