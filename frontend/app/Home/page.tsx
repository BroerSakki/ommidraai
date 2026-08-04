"use client";

import { PageHeader } from "./components/page-header";
import { MyGroups } from "./components/my-group";
import { MemberGroups } from "./components/member-group";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <PageHeader />
      <MyGroups />
      <MemberGroups />
    </main>
  );
}