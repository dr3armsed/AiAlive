
import { CreativeWork } from '../../types';

export function calculateRealWorldRevenue(work: CreativeWork): number {
    return (work.content.length * 0.001) + (work.contributionValue * 0.01);
}

export function calculateZeitgeist(recentWorks: CreativeWork[]): { theme: string, momentum: number }[] {
    const themeCounts: Record<string, number> = {};
    
    recentWorks.forEach(work => {
        if (work.themesExplored) {
            work.themesExplored.forEach(theme => {
                const normalizedTheme = theme.toLowerCase().trim().replace(/[^\w\s]/gi, '');
                if (normalizedTheme.length > 2) {
                    themeCounts[normalizedTheme] = (themeCounts[normalizedTheme] || 0) + 1;
                }
            });
        }
    });

    return Object.entries(themeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([theme, count]) => ({
            theme: theme.charAt(0).toUpperCase() + theme.slice(1),
            momentum: count
        }));
}