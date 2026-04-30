import Image from "next/image";
import Link from "next/link";

interface CompanionCardProps {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  color: string;
}

function CompanionCard({ id, name, duration, color, subject, topic }: CompanionCardProps) {
  return (
    <Link href={`/companions/${id}`}>
      <article className="companion-card">
        <div className="companion-card-accent" style={{ backgroundColor: color }} />
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-[15px] truncate">{name}</h3>
            <span
              className="subject-badge shrink-0"
              style={{ backgroundColor: `${color}18`, color }}
            >
              {subject}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-snug line-clamp-2">{topic}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
            <span>{duration} min</span>
            <span className="text-border">·</span>
            <span>Voice session</span>
          </div>
        </div>
        <div className="shrink-0 self-center">
          <div className="text-muted-foreground hover:text-foreground transition-colors text-xs">→</div>
        </div>
      </article>
    </Link>
  );
}

export default CompanionCard;