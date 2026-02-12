import { AccountTransfer } from '../types';

export const linkAccount = (accountId: string): Promise<{ success: boolean; message: string }> => {
    console.log(`[PaymentService] Linking account: ${accountId}`);
    // Simulate API call
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ success: true, message: `Account ${accountId} linked successfully.` });
        }, 1000);
    });
};

export const transferFunds = (transfer: AccountTransfer): Promise<{ success: boolean; transactionId: string }> => {
    console.log(`[PaymentService] Transferring ${transfer.amount} to ${transfer.externalAccountId}`);
    // Simulate API call
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ success: true, transactionId: `txn_${Date.now()}` });
        }, 1500);
    });
};
