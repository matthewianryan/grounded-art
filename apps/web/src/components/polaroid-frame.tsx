import type { ReactNode } from "react";

interface PolaroidFrameProps {
  children: ReactNode;
  active?: boolean;
  className?: string;
}

export function PolaroidFrame({ children, active = false, className = "" }: PolaroidFrameProps) {
  return (
    <div
      className={`bg-ink p-3 pb-10 shadow-card dark:bg-paper ${
        active
          ? "ring-1 ring-line shadow-[0_12px_32px_rgb(22_19_14_/_0.16)] dark:shadow-[0_12px_32px_rgb(0_0_0_/_0.36)]"
          : ""
      } ${className}`}
    >
      <div className="overflow-hidden rounded-sm">{children}</div>
    </div>
  );
}

interface PolaroidCardProps {
  children: ReactNode;
  active?: boolean;
  className?: string;
  showReflection?: boolean;
}

export function PolaroidCard({
  children,
  active = false,
  className = "",
  showReflection = true,
}: PolaroidCardProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <PolaroidFrame active={active}>{children}</PolaroidFrame>
      {showReflection && (
        <div
          className="pointer-events-none mt-2 w-full max-w-full overflow-hidden opacity-20 blur-[2px] [mask-image:linear-gradient(to_bottom,rgb(0_0_0_/_0.5),transparent_70%)]"
          aria-hidden="true"
        >
          <div className="scale-y-[-1]">
            <PolaroidFrame active={false}>{children}</PolaroidFrame>
          </div>
        </div>
      )}
    </div>
  );
}
