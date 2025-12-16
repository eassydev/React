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
  ListCheckIcon,
  CreditCard,
  Star,
  Building2,
  Calendar,
  Settings,
  Tags,
  FileText,
  HelpCircle,
  FileImage,
  HardDrive,
  BarChart3,
  TrendingUp,
  CheckSquare,
} from 'lucide-react';

export interface NavItem {
  title: string;
  label?: string;
  icon: LucideIcon;
  route?: string;
  children?: ChildNavItem[];
}

export interface ChildNavItem {
  title: string;
  label?: string;
  route: string;
}

export interface NavHeader {
  heading: string;
}

export type SidebarItem = NavItem | NavHeader;

const basePath = '/admin';

export const sidebarItems: SidebarItem[] = [
  { heading: 'Admin' },
  {
    title: "Dashboard",
    icon: PanelsTopLeft,
    route: basePath,
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    children: [
      { title: 'Dashboard', route: `${basePath}` },
      { title: 'Detailed Reports', route: `${basePath}/analytics` },
    ],
  },
  // { heading: "Apps & Pages" },
  {
    title: 'Banner',
    icon: ListCheckIcon,
    route: `${basePath}/banner`,
  },
  {
    title: 'Bogo',
    icon: ListCheckIcon,
    route: `${basePath}/banner`,
  },
  {
    title: 'UTM',
    icon: ListCheckIcon,
    route: `${basePath}/campaign`,
  },
  {
    title: 'System Admin',
    icon: ListCheckIcon,
    route: `${basePath}/admin`,
  },
  {
    title: 'Notification',
    icon: ListCheckIcon,
    route: `${basePath}/notification`,
  },
  {
    title: 'Live cart',
    icon: ListCheckIcon,
    route: `${basePath}/live-cart`,
  },
  {
    title: 'SP Payout',
    icon: CreditCard,
    children: [
      { title: 'Payout Details', route: `${basePath}/sp-payout` },
      { title: 'Transactions', route: `${basePath}/transactions` },
    ],
  },
  {
    title: 'Service',
    icon: Receipt,
    children: [
      { title: 'Category', route: `${basePath}/category` },
      { title: 'Sub category', route: `${basePath}/sub-category` },
      { title: 'Segment', route: `${basePath}/segment` },
      { title: 'Service Video', route: `${basePath}/video` },
      { title: 'Description', route: `${basePath}/description` },
      { title: 'Nested Attributes ', route: `${basePath}/attribute-nested/add` },
    ],
  },
  {
    title: 'Rate Card',
    icon: ListCheckIcon,
    route: `${basePath}/rate-card`,
  },
  {
    title: 'Package',
    icon: ListCheckIcon,
    route: `${basePath}/package`,
  },
  {
    title: 'Country',
    icon: ListCheckIcon,
    route: `${basePath}/country`,
  },
  {
    title: 'State',
    icon: ListCheckIcon,
    route: `${basePath}/state`,
  },
  {
    title: 'City',
    icon: ListCheckIcon,
    route: `${basePath}/city`,
  },
  {
    title: 'Hub',
    icon: ListCheckIcon,
    route: `${basePath}/hub`,
  },
  {
    title: 'Hub Pincode',
    icon: ListCheckIcon,
    route: `${basePath}/hub-pincode`,
  },
  {
    title: 'Sp Hub',
    icon: ListCheckIcon,
    route: `${basePath}/sp-hubs`,
  },
  {
    title: 'CMS Pages',
    icon: FileText,
    children: [
      { title: 'All Pages', route: `${basePath}/pages` },
      { title: 'Privacy Policy', route: `${basePath}/pages?type=privacy-policy` },
      { title: 'Terms & Conditions', route: `${basePath}/pages?type=terms-conditions` },
      { title: 'About Us', route: `${basePath}/pages?type=about-us` },
      { title: 'Custom Pages', route: `${basePath}/pages?type=custom` },
    ],
  },
  {
    title: 'Booking',
    icon: ListCheckIcon,
    route: `${basePath}/booking`,
  },
  {
    title: 'Booking Feedback',
    icon: Star,
    route: `${basePath}/booking-experience`,
  },
  {
    title: 'Customer',
    icon: ListCheckIcon,
    route: `${basePath}/user`,
  },
  {
    title: 'Wallet Offer',
    icon: ListCheckIcon,
    route: `${basePath}/wallet-offer`,
  },
  {
    title: 'Provider',
    icon: Users2,
    children: [
      { title: 'All Providers', route: `${basePath}/provider` },
      { title: 'B2B Providers', route: `${basePath}/provider/b2b` },
    ],
  },
  {
    title: 'Checklist',
    icon: CheckSquare,
    children: [
      { title: 'All Checklists', route: `${basePath}/checklist` },
      { title: 'Manage Questions', route: `${basePath}/checklist/questions` },
      { title: 'Create Checklist', route: `${basePath}/checklist/create` },
    ],
  },
  {
    title: 'Staff',
    icon: ListCheckIcon,
    route: `${basePath}/staff`,
  },
  {
    title: 'Bank',
    icon: ListCheckIcon,
    route: `${basePath}/bank`,
  },
  {
    title: 'Gst',
    icon: ListCheckIcon,
    route: `${basePath}/gst`,
  },
  {
    title: 'Vip plan',
    icon: ListCheckIcon,
    route: `${basePath}/vip-plan`,
  },
  {
    title: 'Blog',
    icon: ListCheckIcon,
    route: `${basePath}/blog`,
  },
  {
    title: 'role',
    icon: ListCheckIcon,
    route: `${basePath}/role`,
  },
  {
    title: 'Permission',
    icon: ListCheckIcon,
    route: `${basePath}/permission`,
  },
  {
    title: 'Promocode',
    icon: ListCheckIcon,
    route: `${basePath}/promocode`,
  },
  {
    title: 'FAQ',
    icon: HelpCircle,
    route: `${basePath}/faq`,
  },
  {
    title: 'Setting',
    icon: ListCheckIcon,
    route: `${basePath}/setting`,
  },
  {
    title: 'App',
    icon: Receipt,
    children: [
      { title: 'Quick service', route: `${basePath}/quick-service/add` },
      { title: 'Onboarding', route: `${basePath}/onboarding` },
    ],
  },
  {
    title: 'Traning',
    icon: Receipt,
    children: [
      { title: 'Course', route: `${basePath}/course` },
      { title: 'Course-quiz', route: `${basePath}/course-quiz` },
      { title: 'Badge', route: `${basePath}/badge` },
    ],
  },
  {
    title: 'B2B Management',
    icon: Building2,
    children: [
      { title: 'Daily Operations', route: `${basePath}/b2b/daily-operations` },
      { title: 'Analytics Dashboard', route: `${basePath}/b2b/analytics` },
      { title: 'Monthly Report', route: `${basePath}/b2b/reports/monthly` },
      { title: 'Customers', route: `${basePath}/b2b/customers` },
      { title: 'Contact Management', route: `${basePath}/b2b/contacts` },
      { title: 'SPOC Management', route: `${basePath}/b2b/spoc` },
      { title: 'Orders', route: `${basePath}/b2b/orders` },
      { title: 'Quotations', route: `${basePath}/b2b/quotations` },
      { title: 'Invoices', route: `${basePath}/b2b/invoices` },
      { title: 'SP Invoices', route: `${basePath}/b2b/sp-invoices` },
      { title: 'Payment Reminders', route: `${basePath}/b2b/payment-reminders` },
      { title: 'Service Attachments', route: `${basePath}/b2b/service-attachments` },
      { title: 'File Lifecycle', route: `${basePath}/b2b/file-lifecycle` },
    ],
  },
  {
    title: 'B2B Finance',
    icon: CreditCard,
    children: [
      { title: 'Finance Dashboard', route: `${basePath}/b2b/finance/dashboard` },
      { title: 'Record Payment', route: `${basePath}/b2b/finance/payments/record` },
      { title: 'Payment Verification', route: `${basePath}/b2b/finance/payments/verify` },
      { title: 'All Payments', route: `${basePath}/b2b/finance/payments` },
      { title: 'Generate Invoice', route: `${basePath}/b2b/finance/invoices/generate` },
      { title: 'Customer Statements', route: `${basePath}/b2b/finance/statements` },
    ],
  },
  {
    title: 'Woloo',
    icon: Building2,
    children: [
      { title: 'Categories', route: `${basePath}/woloo/categories` },
      { title: 'Subcategories', route: `${basePath}/woloo/subcategories` },
      { title: 'Attributes', route: `${basePath}/woloo/attributes` },
      { title: 'Rate Cards', route: `${basePath}/woloo/rate-cards` },
      { title: 'Bookings', route: `${basePath}/woloo/bookings` },
    ],
  },
  {
    title: 'SEO Content',
    icon: FileText,
    route: `${basePath}/seo-content`,
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
];
