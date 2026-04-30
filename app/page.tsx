export const dynamic = "force-dynamic";

import CompanionCard from "@/components/CompanionCard";
import CompanionsList from "@/components/CompanionsList";
import Link from "next/link";
import {
  getAllCompanions,
  getRecentSessions,
  seedTemplateCompanions,
} from "@/lib/actions/companions.actions";
import { getSubjectColor } from "@/lib/utils";

const Page = async () => {
  await seedTemplateCompanions();

  const companions = await getAllCompanions({ limit: 6 });
  const recentSessionCompanions = await getRecentSessions(10);

  return (
    <main>
      {/* Hero */}
      <section className="flex items-end justify-between gap-4 max-sm:flex-col max-sm:items-start">
        <div>
          <h1 className="text-3xl max-sm:text-2xl">Your AI Tutors</h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Start a voice session or create a new companion.
          </p>
        </div>
        <Link href="/companions/new" className="btn-primary text-xs shrink-0">
          + New companion
        </Link>
      </section>

      {/* Companions */}
      <section className="companions-grid">
        {companions.map((companion: any) => (
          <CompanionCard
            key={companion.id}
            {...companion}
            color={getSubjectColor(companion.subject)}
          />
        ))}
      </section>

      {/* Recent sessions */}
      {recentSessionCompanions.length > 0 && (
        <section>
          <CompanionsList
            title="Recent Sessions"
            companions={recentSessionCompanions}
          />
        </section>
      )}
    </main>
  );
};

export default Page;