import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSubjectColor } from "@/lib/utils";
import Link from "next/link";
import CompanionComponent from "@/components/CompanionComponent";
import { getCompanion } from "@/lib/actions/companions.actions";

interface CompanionSessionPageProps {
  params: Promise<{ id: string }>;
}

const CompanionSession = async ({ params }: CompanionSessionPageProps) => {
  const { id } = await params;
  const companion = await getCompanion(id);
  const user = await currentUser();

  const { name, subject, topic, duration } = companion;

  if (!user) redirect("/sign-in");
  if (!name) redirect("/companions");

  return (
    <main>
      {/* Compact info bar */}
      <section className="flex items-center justify-between border-b border-border pb-4 -mt-2">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            ← Back
          </Link>
          <div className="w-px h-4 bg-border" />
          <span className="font-medium text-sm">{name}</span>
          <span
            className="subject-badge"
            style={{
              backgroundColor: `${getSubjectColor(subject)}18`,
              color: getSubjectColor(subject),
            }}
          >
            {subject}
          </span>
        </div>
        <span className="text-xs text-muted-foreground max-sm:hidden">
          {topic} · {duration} min
        </span>
      </section>

      <CompanionComponent
        {...companion}
        companionId={id}
        userName={user.firstName!}
        userImage={user.imageUrl!}
      />
    </main>
  );
};

export default CompanionSession;