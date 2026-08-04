type GroupPageProps = {
  params: Promise<{
    groupName: string;
  }>;
};

export default async function GroupPage({ params }: GroupPageProps) {
  const { groupName } = await params;

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-4xl font-bold">
        {decodeURIComponent(groupName)}
      </h1>

      <p className="mt-4">
        Welcome to the {decodeURIComponent(groupName)} group.
      </p>
    </main>
  );
}