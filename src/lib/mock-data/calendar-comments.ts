export type CommentVisibility = "Internal" | "External";

export interface CalendarComment {
  id: string;
  author: string;
  authorRole?: string;
  visibility: CommentVisibility;
  content: string;
  createdAt: string;
}

export const CURRENT_CALENDAR_USER = "Jordan Lee";

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function getAuthorInitials(name: string): string {
  return initials(name);
}

export const CALENDAR_COMMENT_SEED: CalendarComment[] = [
  {
    id: "cal_cmt_001",
    author: "Nina Carter",
    authorRole: "Category Manager",
    visibility: "Internal",
    content:
      "Can we pull Halloween Animatronics forward to September? Competitor scans show early demand building in late August.",
    createdAt: "2026-07-08T09:14:00Z",
  },
  {
    id: "cal_cmt_002",
    author: "Ava Patel",
    authorRole: "Category Manager",
    visibility: "Internal",
    content:
      "The outdoor grill window overlaps Labour Day — I'd shorten it to May–Jun so we don't compete with patio furniture.",
    createdAt: "2026-07-08T10:02:00Z",
  },
  {
    id: "cal_cmt_003",
    author: CURRENT_CALENDAR_USER,
    authorRole: "Acquisition Manager",
    visibility: "Internal",
    content:
      "Agreed on Sep launch for Halloween. I'll adjust Version 1 and flag Outdoor Living for a second pass.",
    createdAt: "2026-07-08T10:28:00Z",
  },
  {
    id: "cal_cmt_004",
    author: "Ethan Brooks",
    authorRole: "Acquisition Manager",
    visibility: "Internal",
    content:
      "Should we align Kitchen & Dining launches with Q2 events, or keep them spread across the year?",
    createdAt: "2026-07-08T11:05:00Z",
  },
  {
    id: "cal_cmt_005",
    author: "Maya Johnson",
    authorRole: "Category Manager",
    visibility: "Internal",
    content:
      "Spreading them helps avoid warehouse bottlenecks — let's keep bakeware in Mar–Apr and dinnerware in Jun–Jul.",
    createdAt: "2026-07-08T11:42:00Z",
  },
];

export function formatCommentTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getInternalComments(comments: CalendarComment[]): CalendarComment[] {
  return comments
    .filter((comment) => comment.visibility === "Internal")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}
