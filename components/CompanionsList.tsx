import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, getSubjectColor } from "@/lib/utils";
import Link from "next/link";

interface CompanionsListProps {
  title: string;
  companions?: Companion[];
  classNames?: string;
}

const CompanionsList = ({ title, companions, classNames }: CompanionsListProps) => {
  return (
    <div className={cn("companion-list", classNames)}>
      <h2 className="font-semibold text-lg mb-3">{title}</h2>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-xs text-muted-foreground font-normal">Name</TableHead>
            <TableHead className="text-xs text-muted-foreground font-normal max-md:hidden">Subject</TableHead>
            <TableHead className="text-xs text-muted-foreground font-normal text-right">Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companions?.map(({ id, name, topic, subject, duration }: any) => (
            <TableRow key={id} className="border-border/60 hover:bg-secondary/40">
              <TableCell className="py-3">
                <Link href={`/companions/${id}`} className="flex flex-col">
                  <span className="font-medium text-sm">{name}</span>
                  <span className="text-xs text-muted-foreground">{topic}</span>
                </Link>
              </TableCell>
              <TableCell className="max-md:hidden">
                <span
                  className="subject-badge"
                  style={{ backgroundColor: `${getSubjectColor(subject)}18`, color: getSubjectColor(subject) }}
                >
                  {subject}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="text-xs text-muted-foreground">{duration} min</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompanionsList;