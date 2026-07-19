"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TruncatedTextProps {
  text: string;
  tooltipText?: string;
  className?: string;
  /** Use for inline/truncated pills and badges */
  inline?: boolean;
}

export function TruncatedText({
  text,
  tooltipText,
  className,
  inline = false,
}: TruncatedTextProps) {
  if (!text) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            inline ? "inline-block max-w-full truncate align-bottom" : "block truncate",
            className,
          )}
        >
          {text}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-sm break-words">
        {tooltipText ?? text}
      </TooltipContent>
    </Tooltip>
  );
}
