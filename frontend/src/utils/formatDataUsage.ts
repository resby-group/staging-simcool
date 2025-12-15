// utils/formatDataUsage.ts
export function formatDataUsage(input: string | null | undefined): string {
    if (!input || input.trim() === '') return '0 MB';

    const normalizedInput = input.trim().toUpperCase();

    // Check for unlimited
    if (normalizedInput.includes('UNLIMITED') || normalizedInput.includes('UNLIMIT')) {
        return 'Unlimited';
    }

    // Extract numeric value
    const numericPart = normalizedInput.replace(/[^\d.]/g, '');
    const value = parseFloat(numericPart);

    if (isNaN(value)) return '0 MB';

    // If input contains "GB"
    if (normalizedInput.includes('GB')) {
        if (value >= 1) {
            return `${value < 10 ? value.toFixed(1) : value.toFixed(0)} GB`;
        } else {
            // Convert to MB
            return `${(value * 1024).toFixed(0)} MB`;
        }
    }

    // If input contains "MB"
    if (normalizedInput.includes('MB')) {
        if (value >= 1024) {
            // Convert to GB
            return `${(value / 1024).toFixed(1)} GB`;
        } else {
            return `${value.toFixed(0)} MB`;
        }
    }

    // Default to MB
    return `${value.toFixed(0)} MB`;
}
