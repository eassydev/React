import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'admin-sidebar-expanded-sections';
const DEFAULT_EXPANDED = ['Analytics']; // Analytics expanded by default

interface SidebarStateOptions {
    defaultExpanded?: string[];
}

/**
 * Custom hook to manage sidebar expanded/collapsed state with localStorage persistence.
 * Handles SSR hydration safely by only reading localStorage on the client.
 */
export const useSidebarState = (options: SidebarStateOptions = {}) => {
    const { defaultExpanded = DEFAULT_EXPANDED } = options;

    // Initialize with default state (for SSR)
    const [expandedSections, setExpandedSections] = useState<string[]>(defaultExpanded);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load saved state from localStorage on mount (client-side only)
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setExpandedSections(parsed);
                }
            }
        } catch (error) {
            console.error('Error loading sidebar state from localStorage:', error);
        }
        setIsHydrated(true);
    }, []);

    // Save to localStorage whenever expandedSections changes (after hydration)
    useEffect(() => {
        if (isHydrated) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedSections));
            } catch (error) {
                console.error('Error saving sidebar state to localStorage:', error);
            }
        }
    }, [expandedSections, isHydrated]);

    // Toggle a section's expanded state
    const toggleSection = useCallback((sectionTitle: string) => {
        setExpandedSections((prev) => {
            if (prev.includes(sectionTitle)) {
                return prev.filter((s) => s !== sectionTitle);
            }
            return [...prev, sectionTitle];
        });
    }, []);

    // Expand a section
    const expandSection = useCallback((sectionTitle: string) => {
        setExpandedSections((prev) => {
            if (prev.includes(sectionTitle)) {
                return prev;
            }
            return [...prev, sectionTitle];
        });
    }, []);

    // Collapse a section
    const collapseSection = useCallback((sectionTitle: string) => {
        setExpandedSections((prev) => prev.filter((s) => s !== sectionTitle));
    }, []);

    // Check if a section is expanded
    const isSectionExpanded = useCallback(
        (sectionTitle: string) => expandedSections.includes(sectionTitle),
        [expandedSections]
    );

    // Reset to default state
    const resetToDefault = useCallback(() => {
        setExpandedSections(defaultExpanded);
    }, [defaultExpanded]);

    // Collapse all sections
    const collapseAll = useCallback(() => {
        setExpandedSections([]);
    }, []);

    // Expand all sections
    const expandAll = useCallback((allSectionTitles: string[]) => {
        setExpandedSections(allSectionTitles);
    }, []);

    return {
        expandedSections,
        setExpandedSections,
        toggleSection,
        expandSection,
        collapseSection,
        isSectionExpanded,
        resetToDefault,
        collapseAll,
        expandAll,
        isHydrated,
    };
};

export default useSidebarState;
