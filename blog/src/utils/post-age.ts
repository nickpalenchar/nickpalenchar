const ARCHIVE_AGE_MONTHS = 18;

export function isArchivedPost(
    publishedAt: Date,
    now: Date = new Date(),
): boolean {
    const cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() - ARCHIVE_AGE_MONTHS);
    return publishedAt < cutoff;
}

export function formatArchiveDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}
