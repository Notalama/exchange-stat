export interface Notification {
    severity: 'success' | 'error' | 'info' | 'warn';
    summary: string;
    detail: string;
}
