export interface Transaction {
    type: 'VOTE' | 'REGISTRATION' | 'ADMIN_ACTION';
    data: any;
    timestamp: number;
}
