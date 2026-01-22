import {
  BarChart3,
  Building2,
  CreditCard,
  FileText,
  HelpCircle,
  ListCheckIcon,
  Receipt,
  Users2,
  Star,
  CheckSquare,
  BookOpen,
  Settings,
  Shield,
  Megaphone,
  Headphones,
  Wrench,
  Wallet,
  Plug,
  LucideIcon,
  PanelsTopLeft,
  Target,
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ChildNavItem {
  title: string;
  label?: string;
  route: string;
}

export interface NavItem {
  title: string;
  label?: string;
  icon: LucideIcon;
  route?: string;
  children?: ChildNavItem[];
}

export interface NavSection {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
}

// Legacy types for backwards compatibility
export interface NavHeader {
  heading: string;
}

export type SidebarItem = NavItem | NavHeader;

// ============================================================================
// BASE PATH
// ============================================================================

const basePath = '/admin';

// ============================================================================
// NEW HIERARCHICAL NAVIGATION STRUCTURE
// ============================================================================

export const sidebarSections: NavSection[] = [
  // -------------------------------------------------------------------------
  // 1. ANALYTICS
  // -------------------------------------------------------------------------
  {
    title: 'Analytics',
    icon: BarChart3,
    items: [
      {
        title: 'Dashboard',
        icon: PanelsTopLeft,
        route: basePath,
      },
      {
        title: 'Detailed Reports',
        icon: BarChart3,
        route: `${basePath}/analytics`,
      },
      {
        title: 'Goal Tracking',
        icon: Target,
        route: `${basePath}/analytics/goal-tracking`,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 2. B2B
  // -------------------------------------------------------------------------
  {
    title: 'B2B',
    icon: Building2,
    items: [
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
    ],
  },

  // -------------------------------------------------------------------------
  // 3. MARKETING
  // -------------------------------------------------------------------------
  {
    title: 'Marketing',
    icon: Megaphone,
    items: [
      {
        title: 'Banner',
        icon: ListCheckIcon,
        route: `${basePath}/banner`,
      },
      {
        title: 'BOGO',
        icon: ListCheckIcon,
        route: `${basePath}/bogo`,
      },
      {
        title: 'UTM',
        icon: ListCheckIcon,
        route: `${basePath}/campaign`,
      },
      {
        title: 'Notification',
        icon: ListCheckIcon,
        route: `${basePath}/notification`,
      },
      {
        title: 'Wallet Offer',
        icon: ListCheckIcon,
        route: `${basePath}/wallet-offer`,
      },
      {
        title: 'VIP Plan',
        icon: ListCheckIcon,
        route: `${basePath}/vip-plan`,
      },
      {
        title: 'Blog',
        icon: ListCheckIcon,
        route: `${basePath}/blog`,
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
        title: 'SEO Content',
        icon: FileText,
        route: `${basePath}/seo-content`,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 4. CRM
  // -------------------------------------------------------------------------
  {
    title: 'CRM',
    icon: Headphones,
    items: [
      {
        title: 'Customer',
        icon: Users2,
        route: `${basePath}/user`,
      },
      {
        title: 'Live Cart',
        icon: ListCheckIcon,
        route: `${basePath}/live-cart`,
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
        title: 'App',
        icon: Receipt,
        children: [
          { title: 'Quick Service', route: `${basePath}/quick-service/add` },
          { title: 'Onboarding', route: `${basePath}/onboarding` },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 5. OPS
  // -------------------------------------------------------------------------
  {
    title: 'OPS',
    icon: Wrench,
    items: [
      {
        title: 'Service',
        icon: Receipt,
        children: [
          { title: 'Category', route: `${basePath}/category` },
          { title: 'Sub Category', route: `${basePath}/sub-category` },
          { title: 'Segment', route: `${basePath}/segment` },
          { title: 'Service Video', route: `${basePath}/video` },
          { title: 'Description', route: `${basePath}/description` },
          { title: 'Nested Attributes', route: `${basePath}/attribute-nested/add` },
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
        children: [
          { title: 'Category Package', route: `${basePath}/category-package` },
          { title: 'Packages', route: `${basePath}/package` },
        ],
      },
      {
        title: 'Location',
        icon: ListCheckIcon,
        children: [
          { title: 'Country', route: `${basePath}/country` },
          { title: 'State', route: `${basePath}/state` },
          { title: 'City', route: `${basePath}/city` },
          { title: 'Hub', route: `${basePath}/hub` },
          { title: 'Hub Pincode', route: `${basePath}/hub-pincode` },
        ],
      },
      {
        title: 'SP Hub',
        icon: ListCheckIcon,
        route: `${basePath}/sp-hubs`,
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
        title: 'Training',
        icon: Receipt,
        children: [
          { title: 'Course', route: `${basePath}/course` },
          { title: 'Course Quiz', route: `${basePath}/course-quiz` },
          { title: 'Badge', route: `${basePath}/badge` },
        ],
      },
      {
        title: 'Provider Learning',
        icon: BookOpen,
        // route: `${basePath}/video-learning`,
        children: [
          { title: 'All Modules', route: `${basePath}/video-learning` },
          { title: 'Add Module', route: `${basePath}/video-learning/add` },
          { title: 'Statistics', route: `${basePath}/video-learning/statistics` },
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
    ],
  },

  // -------------------------------------------------------------------------
  // 6. FINANCE & LEGAL
  // -------------------------------------------------------------------------
  {
    title: 'Finance & Legal',
    icon: Wallet,
    items: [
      {
        title: 'SP Payout',
        icon: CreditCard,
        children: [
          { title: 'Payout Details', route: `${basePath}/sp-payout` },
          { title: 'Transactions', route: `${basePath}/transactions` },
        ],
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
        title: 'GST Rates',
        icon: ListCheckIcon,
        route: `${basePath}/gst`,
      },
      {
        title: 'Donation',
        icon: ListCheckIcon,
        route: `${basePath}/donation`,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 7. APP ADMINISTRATION
  // -------------------------------------------------------------------------
  {
    title: 'App Administration',
    icon: Shield,
    items: [
      {
        title: 'System Admin',
        icon: ListCheckIcon,
        route: `${basePath}/admin`,
      },
      {
        title: 'Role',
        icon: ListCheckIcon,
        route: `${basePath}/role`,
      },
      {
        title: 'Permission',
        icon: ListCheckIcon,
        route: `${basePath}/permission`,
      },
      {
        title: 'Setting',
        icon: Settings,
        route: `${basePath}/setting`,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 8. APP INTEGRATIONS
  // -------------------------------------------------------------------------
  {
    title: 'App Integrations',
    icon: Plug,
    items: [
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
    ],
  },
];

// ============================================================================
// LEGACY FLAT STRUCTURE (for backwards compatibility if needed)
// ============================================================================

export const sidebarItems: SidebarItem[] = [
  { heading: 'Admin' },
  {
    title: 'Dashboard',
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
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all routes from the sidebar sections for permission checking
 */
export const getAllRoutes = (): string[] => {
  const routes: string[] = [];

  sidebarSections.forEach((section) => {
    section.items.forEach((item) => {
      if (item.route) {
        routes.push(item.route);
      }
      if (item.children) {
        item.children.forEach((child) => {
          routes.push(child.route);
        });
      }
    });
  });

  return routes;
};

/**
 * Get all routes for a specific section
 */
export const getSectionRoutes = (sectionTitle: string): string[] => {
  const section = sidebarSections.find((s) => s.title === sectionTitle);
  if (!section) return [];

  const routes: string[] = [];
  section.items.forEach((item) => {
    if (item.route) {
      routes.push(item.route);
    }
    if (item.children) {
      item.children.forEach((child) => {
        routes.push(child.route);
      });
    }
  });

  return routes;
};

/**
 * Get routes for a specific nav item (including children)
 */
export const getItemRoutes = (item: NavItem): string[] => {
  const routes: string[] = [];
  if (item.route) {
    routes.push(item.route);
  }
  if (item.children) {
    item.children.forEach((child) => {
      routes.push(child.route);
    });
  }
  return routes;
};
