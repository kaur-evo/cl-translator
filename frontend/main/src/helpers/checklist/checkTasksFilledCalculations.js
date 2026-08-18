import { checkTypes } from '@/constants/checklistsConstants';
import { formatNumber } from '@/helpers/numbers/formatNumber';

const isElementFilled = (element) => {
  if (element.notApplicableEnabled && element.valueNotApplicable) {
    return true;
  }

  if (element.multipleSelection || element.type === checkTypes.SELECTION || element.type === checkTypes.YES_NO) {
    return element.value && element.value.length !== 0;
  }

  return element.value !== null && element.value !== undefined;
};

const getTasksCounts = (check) => {
  if (!check || !check.elements || !Array.isArray(check.elements) || check.elements.length === 0) {
    return { filledTasks: 0, totalTasks: 0 };
  }

  const filledTasks = check.elements.filter((element) => isElementFilled(element)).length;
  const totalTasks = check.elements.length;

  return { filledTasks, totalTasks };
};

export const getCheckTasksFilledPercentage = (check) => {
  const { filledTasks, totalTasks } = getTasksCounts(check);

  if (totalTasks === 0) {
    return 0;
  }

  return formatNumber((filledTasks / totalTasks) * 100);
};

export const getCheckTasksFilledString = (check) => {
  const { filledTasks, totalTasks } = getTasksCounts(check);
  const percentage = getCheckTasksFilledPercentage(check);

  return `${filledTasks}/${totalTasks} (${percentage}%)`;
};
