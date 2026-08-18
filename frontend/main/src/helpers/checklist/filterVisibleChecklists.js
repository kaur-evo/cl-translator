export default function filterVisibleChecklists(
  checklistTasks,
  visibleChecklistIdsByStation,
  stationId,
) {
  if (!visibleChecklistIdsByStation) {
    return checklistTasks;
  }
  const stationKey = String(stationId);

  if (!(stationKey in visibleChecklistIdsByStation)) {
    return checklistTasks;
  }

  const visibleIds = visibleChecklistIdsByStation[stationKey];

  if (!visibleIds.length) {
    return checklistTasks;
  }

  const visibleSet = new Set(visibleIds);
  return checklistTasks.filter((task) => visibleSet.has(task.checklistId));
}
