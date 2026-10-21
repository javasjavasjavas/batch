/** Accent-insensitive search works with both Spanish copy and familiar English terms. */
export const searchText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
