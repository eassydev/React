'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import initials from 'initials';
import { Circle, ChevronDown, ChevronRight } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { buttonVariants } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  sidebarSections,
  NavSection,
  NavItem,
  ChildNavItem,
  getItemRoutes,
} from '@/navigation/sidebar-items/sidebarItems';
import useSidebarState from '@/hooks/useSidebarState';
import usePermissions from '@/hooks/usePermissions';

// ============================================================================
// TYPES
// ============================================================================

interface NavProps {
  readonly isCollapsed: boolean;
  readonly isMobileSidebar?: boolean;
}

type GetVariantFunction = (route: string) => 'default' | 'ghost';

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Hook to determine the variant based on current route
 */
function useVariantBasedOnRoute(): GetVariantFunction {
  const pathname = usePathname();

  return (route: string) => {
    if (!route) return 'ghost';

    // Exact match
    if (pathname === route) return 'default';

    // Handle query params
    const routeBase = route.split('?')[0];
    const pathnameBase = pathname.split('?')[0];

    if (pathnameBase === routeBase) return 'default';

    // Check if current path starts with route (for nested pages)
    if (route !== '/admin' && pathname.startsWith(route + '/')) {
      return 'default';
    }

    return 'ghost';
  };
}

// ============================================================================
// CHILD NAV ITEM COMPONENT
// ============================================================================

function ChildNavItemComponent({
  child,
  isCollapsed,
  getVariant,
}: {
  readonly child: ChildNavItem;
  readonly isCollapsed: boolean;
  readonly getVariant: GetVariantFunction;
}) {
  const variant = getVariant(child.route);

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={child.route}
            className={cn(
              buttonVariants({ variant, size: 'icon' }),
              'h-8 w-8 text-xs'
            )}
          >
            <span className="text-xs">{initials(child.title)}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {child.title}
          {child.label && (
            <span className="ml-auto text-muted-foreground">{child.label}</span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      href={child.route}
      className={cn(
        buttonVariants({ variant, size: 'sm' }),
        'flex items-center justify-start py-1 px-3 h-8 text-sm'
      )}
    >
      <Circle className="mr-2 h-2 w-2" />
      <span className="truncate">{child.title}</span>
      {child.label && <span className="ml-auto text-xs">{child.label}</span>}
    </Link>
  );
}

// ============================================================================
// NAV ITEM WITH CHILDREN (2ND LEVEL ACCORDION)
// ============================================================================

function NavItemWithChildren({
  item,
  isCollapsed,
  getVariant,
  expandedSubMenus,
  setExpandedSubMenus,
}: {
  readonly item: NavItem;
  readonly isCollapsed: boolean;
  readonly getVariant: GetVariantFunction;
  readonly expandedSubMenus: string[];
  readonly setExpandedSubMenus: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const pathname = usePathname();
  const childRoutes = item.children?.map((child) => child.route) ?? [];
  const isActive = childRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
  const isExpanded = expandedSubMenus.includes(item.title);

  const toggleExpand = () => {
    setExpandedSubMenus((prev) =>
      prev.includes(item.title)
        ? prev.filter((t) => t !== item.title)
        : [...prev, item.title]
    );
  };

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            onClick={toggleExpand}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              'h-9 w-9',
              isActive && 'bg-accent'
            )}
          >
            <item.icon className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex flex-col gap-1 p-2">
          <span className="font-medium">{item.title}</span>
          <div className="flex flex-col gap-1 pt-1 border-t">
            {item.children?.map((child) => (
              <Link
                key={child.route}
                href={child.route}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {child.title}
              </Link>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <button
        onClick={toggleExpand}
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          'flex items-center justify-between w-full px-2 h-9',
          isActive && 'bg-accent'
        )}
      >
        <div className="flex items-center">
          <item.icon className="mr-2 h-4 w-4" />
          <span className="truncate">{item.title}</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isExpanded && (
        <div className="ml-4 pl-2 border-l flex flex-col gap-0.5">
          {item.children?.map((child) => (
            <ChildNavItemComponent
              key={child.route}
              child={child}
              isCollapsed={false}
              getVariant={getVariant}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// NAV ITEM COMPONENT (LEAF OR WITH CHILDREN)
// ============================================================================

function NavItemComponent({
  item,
  isCollapsed,
  getVariant,
  expandedSubMenus,
  setExpandedSubMenus,
}: {
  readonly item: NavItem;
  readonly isCollapsed: boolean;
  readonly getVariant: GetVariantFunction;
  readonly expandedSubMenus: string[];
  readonly setExpandedSubMenus: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  if (item.children && item.children.length > 0) {
    return (
      <NavItemWithChildren
        item={item}
        isCollapsed={isCollapsed}
        getVariant={getVariant}
        expandedSubMenus={expandedSubMenus}
        setExpandedSubMenus={setExpandedSubMenus}
      />
    );
  }

  const variant = getVariant(item.route ?? '');

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={item.route ?? '#'}
            className={cn(buttonVariants({ variant, size: 'icon' }), 'h-9 w-9')}
          >
            <item.icon className="h-4 w-4" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.title}
          {item.label && (
            <span className="ml-auto text-muted-foreground">{item.label}</span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      href={item.route ?? '#'}
      className={cn(
        buttonVariants({ variant, size: 'sm' }),
        'flex items-center justify-start px-2 h-9'
      )}
    >
      <item.icon className="mr-2 h-4 w-4" />
      <span className="truncate">{item.title}</span>
      {item.label && <span className="ml-auto text-xs">{item.label}</span>}
    </Link>
  );
}

// ============================================================================
// SECTION COMPONENT (MAIN HEADING)
// ============================================================================

function SectionComponent({
  section,
  isCollapsed,
  getVariant,
  expandedSubMenus,
  setExpandedSubMenus,
  hasPermissionForRoute,
  isSuperAdmin,
}: {
  readonly section: NavSection;
  readonly isCollapsed: boolean;
  readonly getVariant: GetVariantFunction;
  readonly expandedSubMenus: string[];
  readonly setExpandedSubMenus: React.Dispatch<React.SetStateAction<string[]>>;
  readonly hasPermissionForRoute: (route: string) => boolean;
  readonly isSuperAdmin: boolean;
}) {
  const pathname = usePathname();

  // ALWAYS show all main section items - main headings are always visible
  // Permission filtering only applies to child items (handled at NavItem level)
  // This ensures all 8 main sections are always visible regardless of permissions
  const filteredItems = section.items;

  // Main sections are ALWAYS rendered (never return null here)

  // Check if any child is active for highlighting
  const sectionRoutes: string[] = [];
  filteredItems.forEach((item) => {
    if (item.route) sectionRoutes.push(item.route);
    if (item.children) {
      item.children.forEach((child) => sectionRoutes.push(child.route));
    }
  });
  const isActive = sectionRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (isCollapsed) {
    return (
      <AccordionItem value={section.title} className="border-none">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <AccordionTrigger
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'h-9 w-9 hide-accordion-icon',
                isActive && 'bg-accent'
              )}
            >
              <section.icon className="h-4 w-4" />
            </AccordionTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {section.title}
          </TooltipContent>
        </Tooltip>
        <AccordionContent className="flex flex-col gap-1 pb-0 pt-1">
          {filteredItems.map((item) => (
            <NavItemComponent
              key={item.title}
              item={item}
              isCollapsed={true}
              getVariant={getVariant}
              expandedSubMenus={expandedSubMenus}
              setExpandedSubMenus={setExpandedSubMenus}
            />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <AccordionItem value={section.title} className="border-none">
      <AccordionTrigger
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          'flex items-center justify-between w-full px-2 h-10 hover:no-underline',
          isActive && 'bg-accent/50'
        )}
      >
        <div className="flex items-center">
          <section.icon className="mr-2 h-4 w-4" />
          <span className="font-medium">{section.title}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-0.5 pb-2 pt-1 pl-2">
        {filteredItems.map((item) => (
          <NavItemComponent
            key={item.title}
            item={item}
            isCollapsed={false}
            getVariant={getVariant}
            expandedSubMenus={expandedSubMenus}
            setExpandedSubMenus={setExpandedSubMenus}
          />
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}

// ============================================================================
// MAIN SIDEBAR COMPONENT
// ============================================================================

export default function Sidebar({ isCollapsed, isMobileSidebar = false }: NavProps) {
  const getVariant = useVariantBasedOnRoute();
  const { expandedSections, setExpandedSections, isHydrated } = useSidebarState();
  const { hasPermission, isSuperAdmin, loading: permissionsLoading } = usePermissions();

  // State for 2nd level sub-menus
  const [expandedSubMenus, setExpandedSubMenus] = React.useState<string[]>([]);

  // Load sub-menu state from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('admin-sidebar-expanded-submenus');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setExpandedSubMenus(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading sub-menu state:', error);
    }
  }, []);

  // Save sub-menu state to localStorage
  React.useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(
          'admin-sidebar-expanded-submenus',
          JSON.stringify(expandedSubMenus)
        );
      } catch (error) {
        console.error('Error saving sub-menu state:', error);
      }
    }
  }, [expandedSubMenus, isHydrated]);

  // Permission check wrapper
  const hasPermissionForRoute = React.useCallback(
    (route: string): boolean => {
      // During loading, return true to show all items
      if (permissionsLoading) return true;
      return hasPermission(route);
    },
    [hasPermission, permissionsLoading]
  );

  // Check if super admin (default to false during loading to avoid flash)
  const superAdmin = !permissionsLoading && isSuperAdmin();

  return (
    <TooltipProvider delayDuration={0}>
      <Accordion
        type="multiple"
        value={expandedSections}
        onValueChange={setExpandedSections}
      >
        <div
          data-collapsed={isCollapsed}
          className="group flex flex-col gap-1 py-2 data-[collapsed=true]:py-2"
        >
          <nav
            className={cn(
              'grid gap-0.5 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2 h-[calc(100dvh-64px)] overflow-y-auto scrollbar-thin',
              isMobileSidebar && 'p-0 h-[calc(100dvh-64px)] overflow-y-auto'
            )}
          >
            {sidebarSections.map((section) => (
              <SectionComponent
                key={section.title}
                section={section}
                isCollapsed={isCollapsed}
                getVariant={getVariant}
                expandedSubMenus={expandedSubMenus}
                setExpandedSubMenus={setExpandedSubMenus}
                hasPermissionForRoute={hasPermissionForRoute}
                isSuperAdmin={superAdmin}
              />
            ))}
          </nav>
        </div>
      </Accordion>
    </TooltipProvider>
  );
}
