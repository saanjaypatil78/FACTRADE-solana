import { Connection, PublicKey, AccountInfo } from '@solana/web3.js';
import { useEffect, useRef, useCallback } from 'react';

/**
 * Real-time blockchain synchronization hook
 * Automatically syncs with Solana blockchain every second
 */

export interface SyncConfig {
  interval?: number; // Sync interval in milliseconds (default: 1000)
  enabled?: boolean; // Enable/disable auto-sync (default: true)
  onError?: (error: Error) => void; // Error callback
}

/**
 * Custom hook for real-time account data synchronization
 * @param connection - Solana connection instance
 * @param publicKey - Public key to monitor
 * @param callback - Callback function when data updates
 * @param config - Sync configuration
 */
export function useAccountSync(
  connection: Connection | null,
  publicKey: PublicKey | null,
  callback: (accountInfo: AccountInfo<Buffer> | null) => void,
  config: SyncConfig = {}
) {
  const {
    interval = 1000,
    enabled = true,
    onError,
  } = config;

  const subscriptionRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket subscription for real-time updates
  const subscribeToAccount = useCallback(() => {
    if (!connection || !publicKey || !enabled) return;

    try {
      // Subscribe to account changes via WebSocket
      const subscriptionId = connection.onAccountChange(
        publicKey,
        (accountInfo) => {
          console.log('Account updated via WebSocket:', publicKey.toBase58());
          callback(accountInfo);
        },
        'confirmed' // commitment level
      );

      subscriptionRef.current = subscriptionId;
      console.log('WebSocket subscription established:', subscriptionId);
    } catch (error) {
      console.error('WebSocket subscription error:', error);
      onError?.(error as Error);
    }
  }, [connection, publicKey, enabled, callback, onError]);

  // Polling as fallback and for redundancy
  const startPolling = useCallback(() => {
    if (!connection || !publicKey || !enabled) return;

    const poll = async () => {
      try {
        const accountInfo = await connection.getAccountInfo(publicKey, 'confirmed');
        callback(accountInfo);
      } catch (error) {
        console.error('Polling error:', error);
        onError?.(error as Error);
      }
    };

    // Initial fetch
    poll();

    // Set up interval
    intervalRef.current = setInterval(poll, interval);
    console.log(`Polling started: every ${interval}ms`);
  }, [connection, publicKey, enabled, interval, callback, onError]);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Unsubscribe from WebSocket
    if (subscriptionRef.current !== null && connection) {
      try {
        connection.removeAccountChangeListener(subscriptionRef.current);
        console.log('WebSocket subscription removed');
      } catch (error) {
        console.error('Error removing subscription:', error);
      }
      subscriptionRef.current = null;
    }

    // Clear polling interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('Polling stopped');
    }
  }, [connection]);

  useEffect(() => {
    if (enabled && connection && publicKey) {
      // Set up both WebSocket and polling
      subscribeToAccount();
      startPolling();
    }

    // Cleanup on unmount or when dependencies change
    return cleanup;
  }, [enabled, connection, publicKey, subscribeToAccount, startPolling, cleanup]);

  return { cleanup };
}

/**
 * Custom hook for monitoring multiple accounts
 * @param connection - Solana connection instance
 * @param publicKeys - Array of public keys to monitor
 * @param callback - Callback function when any account updates
 * @param config - Sync configuration
 */
export function useMultiAccountSync(
  connection: Connection | null,
  publicKeys: PublicKey[],
  callback: (publicKey: PublicKey, accountInfo: AccountInfo<Buffer> | null) => void,
  config: SyncConfig = {}
) {
  const {
    interval = 1000,
    enabled = true,
    onError,
  } = config;

  const subscriptionsRef = useRef<Map<string, number>>(new Map());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !connection || publicKeys.length === 0) return;

    // Subscribe to each account
    publicKeys.forEach((publicKey) => {
      try {
        const subscriptionId = connection.onAccountChange(
          publicKey,
          (accountInfo) => {
            console.log('Account updated:', publicKey.toBase58());
            callback(publicKey, accountInfo);
          },
          'confirmed'
        );

        subscriptionsRef.current.set(publicKey.toBase58(), subscriptionId);
      } catch (error) {
        console.error('Subscription error for', publicKey.toBase58(), error);
        onError?.(error as Error);
      }
    });

    // Polling for all accounts
    const pollAll = async () => {
      try {
        const accountInfos = await connection.getMultipleAccountsInfo(
          publicKeys,
          'confirmed'
        );

        accountInfos.forEach((accountInfo, index) => {
          callback(publicKeys[index], accountInfo);
        });
      } catch (error) {
        console.error('Multi-account polling error:', error);
        onError?.(error as Error);
      }
    };

    // Initial fetch
    pollAll();

    // Set up interval
    intervalRef.current = setInterval(pollAll, interval);

    // Cleanup
    return () => {
      // Remove all subscriptions
      subscriptionsRef.current.forEach((subId) => {
        try {
          connection.removeAccountChangeListener(subId);
        } catch (error) {
          console.error('Error removing subscription:', error);
        }
      });
      subscriptionsRef.current.clear();

      // Clear interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, connection, publicKeys, interval, callback, onError]);
}

/**
 * Custom hook for monitoring transaction status
 * @param connection - Solana connection instance
 * @param signature - Transaction signature to monitor
 * @param callback - Callback when transaction is confirmed
 * @param config - Sync configuration
 */
export function useTransactionSync(
  connection: Connection | null,
  signature: string | null,
  callback: (status: 'processing' | 'confirmed' | 'finalized' | 'error', error?: Error) => void,
  config: SyncConfig = {}
) {
  const {
    interval = 1000,
    enabled = true,
    onError,
  } = config;

  useEffect(() => {
    if (!enabled || !connection || !signature) return;

    let cancelled = false;

    const monitorTransaction = async () => {
      try {
        callback('processing');

        // Wait for confirmation
        const confirmation = await connection.confirmTransaction(
          signature,
          'confirmed'
        );

        if (cancelled) return;

        if (confirmation.value.err) {
          callback('error', new Error('Transaction failed'));
          onError?.(new Error('Transaction failed'));
        } else {
          callback('confirmed');

          // Wait for finalization
          const finalization = await connection.confirmTransaction(
            signature,
            'finalized'
          );

          if (cancelled) return;

          if (!finalization.value.err) {
            callback('finalized');
          }
        }
      } catch (error) {
        if (!cancelled) {
          callback('error', error as Error);
          onError?.(error as Error);
        }
      }
    };

    monitorTransaction();

    return () => {
      cancelled = true;
    };
  }, [enabled, connection, signature, callback, onError]);
}

/**
 * Utility to create a connection with WebSocket support
 * @param rpcUrl - RPC endpoint URL
 * @param wsUrl - WebSocket endpoint URL (optional)
 * @returns Connection instance with WebSocket enabled
 */
export function createRealtimeConnection(
  rpcUrl: string,
  wsUrl?: string
): Connection {
  return new Connection(
    rpcUrl,
    {
      commitment: 'confirmed',
      wsEndpoint: wsUrl,
      confirmTransactionInitialTimeout: 60000, // 60 seconds
    }
  );
}

/**
 * Helper to get sync interval from environment or default
 */
export function getSyncInterval(): number {
  const envInterval = process.env.NEXT_PUBLIC_SYNC_INTERVAL;
  return envInterval ? parseInt(envInterval, 10) : 1000;
}
