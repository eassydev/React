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
  { heading: "Admin" },
  // {
  //   title: "Dashboard",
  //   icon: PanelsTopLeft,
  //   route: basePath,
  // },
  // { heading: "Apps & Pages" },
  {
    title: "Banner",
    icon: ListCheckIcon,
    route: `${basePath}/banner`,
  },
  {
    title: "UTM",
    icon: ListCheckIcon,
    route: `${basePath}/campaign/add`,
  },
  {
    title: "System Admin",
    icon: ListCheckIcon,
    route: `${basePath}/admin`,
  },
  {
    title: "Notification",
    icon: ListCheckIcon,
    route: `${basePath}/notification`,
  },
  {
    title: "Live cart",
    icon: ListCheckIcon,
    route: `${basePath}/live-cart`,
  },
  {
    title: "Service",
    icon: Receipt,
    children: [
      { title: "Catgeory", route: `${basePath}/category` },
       { title: "Sub category", route: `${basePath}/sub-category` },
       { title: "Segment", route: `${basePath}/segment` },
       { title: "Service Video", route: `${basePath}/video` }, 
       { title: "Description", route: `${basePath}/description` }
      ],
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
    title: "Country",
    icon: ListCheckIcon,
    route: `${basePath}/country`,
  },
  {
    title: "State",
    icon: ListCheckIcon,
    route: `${basePath}/state`,
  },
  {
    title: "City",
    icon: ListCheckIcon,
    route: `${basePath}/city`,
  },
  {
    title: "Hub",
    icon: ListCheckIcon,
    route: `${basePath}/hub`,
  },
  {
    title: "Hub Pincode",
    icon: ListCheckIcon,
    route: `${basePath}/hub-pincode`,
  }, {
    title: "Sp Hub",
    icon: ListCheckIcon,
    route: `${basePath}/sp-hubs`,
  },
  {
    title: "Pages",
    icon: ListCheckIcon,
    route: `${basePath}/pages`,
  },
  {
    title: "Booking",
    icon: ListCheckIcon,
    route: `${basePath}/booking`,
  },
  {
    title: "Customer",
    icon: ListCheckIcon,
    route: `${basePath}/user`,
  },
  {
    title: "Wallet Offer",
    icon: ListCheckIcon,
    route: `${basePath}/wallet-offer`,
  },
  {
    title: "Provider",
    icon: ListCheckIcon,
    route: `${basePath}/provider`,
  },
  {
    title: "Staff",
    icon: ListCheckIcon,
    route: `${basePath}/staff`,
  },
  {
    title: "Bank",
    icon: ListCheckIcon,
    route: `${basePath}/bank`,
  },
  {
    title: "Gst",
    icon: ListCheckIcon,
    route: `${basePath}/gst`,
  },
  {
    title: "Vip plan",
    icon: ListCheckIcon,
    route: `${basePath}/vip-plan`,
  },
  {
    title: "Blog",
    icon: ListCheckIcon,
    route: `${basePath}/blog`,
  },
  {
    title: "role",
    icon: ListCheckIcon,
    route: `${basePath}/role`,
  },
  {
    title: "Permission",
    icon: ListCheckIcon,
    route: `${basePath}/permission`,
  },
  {
    title: "Promocode",
    icon: ListCheckIcon,
    route: `${basePath}/promocode`,
  },
  {
    title: "FAQ",
    icon: ListCheckIcon,
    route: `${basePath}/faq`,
  },
  {
    title: "Setting",
    icon: ListCheckIcon,
    route: `${basePath}/setting`,
  },
  {
    title: "App",
    icon: Receipt,
    children: [{ title: "Quick service", route: `${basePath}/quick-service/add` }, { title: "Onboarding", route: `${basePath}/onboarding` }],
  },
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
