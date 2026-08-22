/**
 * Generate a unique idempotency key for mutation requests.
 * This key should be regenerated only on genuinely new submissions,
 * not on retries of the same operation.
 */
export function generateIdempotencyKey(): string {
  return `${Date.now()}-${crypto.randomUUID()}`;
}
