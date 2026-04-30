import Image from "next/image";
import Link from "next/link";

const Cta = () => {
  return (
    <section className="cta-section">
      <div className="cta-badge">✦ Start learning your way</div>
      <h2 className="text-2xl font-bold leading-tight">
        Build and personalize your AI companion.
      </h2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        Pick a name, subject, voice & personality — and start learning through
        natural voice conversations.
      </p>
      <Link href="/companions/new" className="btn-primary">
        <Image src="/icons/plus.svg" alt="plus" width={12} height={12} />
        <span>Build a new companion</span>
      </Link>
    </section>
  );
};

export default Cta;