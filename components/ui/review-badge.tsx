import { siteConfig } from "@/lib/site-config";

interface ReviewBadgeProps {
  className?: string;
  variant?: "light" | "dark";
}

export function ReviewBadge({ className = "", variant = "light" }: ReviewBadgeProps) {
  return (
    <a
      href={siteConfig.officeMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex cursor-pointer items-center gap-2 ${className}`}
    >
      {/* Yorum puanı ve sayısı gösterilmez; gerçek işletme profiline bağlantı korunur. */}
      <span
        className={`text-sm font-semibold ${variant === "dark" ? "text-white" : "text-navy"}`}
      >
        Google yorumlarını inceleyin →
      </span>
    </a>
  );
}
