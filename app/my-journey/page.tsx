import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getUserCompanions,
  getUserSessions,
} from "@/lib/actions/companions.actions";
import Image from "next/image";
import CompanionsList from "@/components/CompanionsList";

const ProfilePage = async () => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const companions = await getUserCompanions(user.id);
  const sessionHistory = await getUserSessions(user.id);

  return (
    <main>
      {/* Profile header */}
      <section className="flex items-center gap-4">
        <Image
          src={user.imageUrl}
          alt={user.firstName!}
          width={48}
          height={48}
          className="rounded-full"
        />
        <div>
          <h1 className="text-xl">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-muted-foreground text-xs">
            {user.emailAddresses[0].emailAddress}
          </p>
        </div>
        <div className="flex gap-2 ml-auto">
          <div className="border border-border rounded-lg px-3 py-2 bg-card text-center min-w-[80px]">
            <p className="text-lg font-semibold">{sessionHistory.length}</p>
            <span className="text-[10px] text-muted-foreground">Sessions</span>
          </div>
          <div className="border border-border rounded-lg px-3 py-2 bg-card text-center min-w-[80px]">
            <p className="text-lg font-semibold">{companions.length}</p>
            <span className="text-[10px] text-muted-foreground">Created</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <Accordion type="multiple" defaultValue={["recent", "companions"]}>
        <AccordionItem value="recent" className="border-border">
          <AccordionTrigger className="text-base font-medium">
            Recent Sessions
          </AccordionTrigger>
          <AccordionContent>
            <CompanionsList title="" companions={sessionHistory} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="companions" className="border-border">
          <AccordionTrigger className="text-base font-medium">
            My Companions ({companions.length})
          </AccordionTrigger>
          <AccordionContent>
            <CompanionsList title="" companions={companions} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </main>
  );
};

export default ProfilePage;