/**
 * Extracts the stop reason ID from a table row item.
 * The reports table uses `commentId` as the primary identifier for stop reasons,
 * falling back to `entityId` when `commentId` is not present.
 */
export const getStopReasonId = (
  item: { commentId?: number | string; entityId?: number | string },
): number | null => {
  // Uses || intentionally: 0 is not a valid stop reason ID (areValidIds requires id > 0)
  const raw = item.commentId || item.entityId;

  if (raw === undefined) return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
};
