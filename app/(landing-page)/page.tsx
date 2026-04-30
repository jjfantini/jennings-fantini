import { AuroraText } from "@/components/ui/aurora-text";
import { ChasingLogoGate } from "@/app/(landing-page)/_components/chasing-logo-gate";
import { RepellingText } from "@/app/(landing-page)/_components/repelling-title";
import { TerminalIntro } from "@/app/(landing-page)/_components/terminal-intro";

export default function LandingPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChasingLogoGate />
      <div className="flex flex-1 flex-col items-center justify-center p-4 gap-8">
        <span>
          <RepellingText 
            text="Jennings Fantini"
            className="max-w-4xl text-4xl md:text-6xl lg:text-8xl font-bold text-neutral-900 dark:text-neutral-100"
          />
        </span>
        <span className="max-w-4xl">
          <TerminalIntro />
        </span>

        <span className="font-bold tracking-tighter text-4xl md:text-6xl lg:text-7xl">
          <p><AuroraText>execute.</AuroraText></p>
        </span>
      </div>
    </div>
  );
}
