import {
  AlertCircle,
  Archive,
  ArchiveX,
  File,
  Inbox,
  MessagesSquare,
  Send,
  ShoppingCart,
  Trash2,
  Users2,
  Receipt,
  LucideIcon,
  PanelsTopLeft,
  ListCheckIcon
} from "lucide-react"

export interface NavItem {
  title: string
  label?: string
  icon: LucideIcon
  route?: string
  children?: ChildNavItem[]
}

export interface ChildNavItem {
  title: string
  label?: string
  route: string
}

export interface NavHeader {
  heading: string
}

export type SidebarItem = NavItem | NavHeader

const basePath = "/admin"

export const sidebarItems: SidebarItem[] = [
  { heading: "Overview" },
  // {
  //   title: "Dashboard",
  //   icon: PanelsTopLeft,
  //   route: basePath,
  // },
  // { heading: "Apps & Pages" },
  {
    title: "Category",
    icon: ListCheckIcon,
    route: `${basePath}/category`,
  },
  {
    title: "Sub category",
    icon: ListCheckIcon,
    route: `${basePath}/sub-category`,
  },
  {
    title: "Rate Card",
    icon: ListCheckIcon,
    route: `${basePath}/rate-card`,
  },
  {
    title: "Package",
    icon: ListCheckIcon,
    route: `${basePath}/package`,
  },
  {
    title: "Pages",
    icon: ListCheckIcon,
    route: `${basePath}/pages`,
  },
  {
    title: "Customer",
    icon: ListCheckIcon,
    route: `${basePath}/user`,
  },
  {
    title: "Provider",
    icon: ListCheckIcon,
    route: `${basePath}/provider`,
  },
  {
    title: "Bank",
    icon: ListCheckIcon,
    route: `${basePath}/pages`,
  },
  {
    title: "Provider account",
    icon: ListCheckIcon,
    route: `${basePath}/user`,
  },
  {
    title: "Vip plan",
    icon: ListCheckIcon,
    route: `${basePath}/provider`,
  },
  // {
  //   title: "Invoice",
  //   icon: Receipt,
  //   children: [{ title: "List Preview", route: "about" }],
  // },
  // {
  //   title: "Auth",
  //   icon: Receipt,
  //   children: [{ title: "Unauthorized", route: "unauthorized" }],
  // },
  // {
  //   title: "Drafts",
  //   icon: File,
  //   route: "drafts",
  // },
  // {
  //   title: "Sent",
  //   icon: Send,
  //   route: "sent",
  // },
  // {
  //   title: "Junk",
  //   icon: ArchiveX,
  //   route: "junk",
  // },
  // {
  //   title: "Trash",
  //   icon: Trash2,
  //   route: "trash",
  // },
  // {
  //   title: "Archive",
  //   icon: Archive,
  //   route: "archive",
  // },
  // {
  //   title: "Social",
  //   icon: Users2,
  //   route: "social",
  // },
  // {
  //   title: "Updates",
  //   icon: AlertCircle,
  //   route: "updates",
  // },
  // {
  //   title: "Forums",
  //   icon: MessagesSquare,
  //   route: "forums",
  // },
  // {
  //   title: "Shopping",
  //   icon: ShoppingCart,
  //   route: "shopping",
  // },
  // {
  //   title: "Promotions",
  //   icon: Archive,
  //   route: "promotions",
  // },
  // { heading: "Billing" },
]
