import * as d3 from 'd3';
import { computed } from 'vue';

import useProfileStore from '@/stores/profile';
import SimpleTimeAxis from '@/d3/SimpleTimeAxis';
export default function useHourAxis(hourAxisRef, scale, { tickFrequency }) {
  let d3HourAxis = null;
  const profileStore = useProfileStore();
  const language = computed(() => profileStore.language);
  const currentUser = computed(() => profileStore.currentUser);

  function formatTick(d) {
    return d.toLocaleString(language.value, { hour: '2-digit', minute: '2-digit', hour12: currentUser.value.timeFormat === 12 });
  }

  function drawHourAxis() {
    if (hourAxisRef.value === null) return;
    d3HourAxis = new SimpleTimeAxis(hourAxisRef.value, {
      fontSize: 10,
      scale: scale.value,
      ticks: d3.timeHour.every(tickFrequency.value),
      tickFormat: formatTick,
    });
    d3HourAxis.draw();
  }

  function updateHourAxis() {
    if (d3HourAxis === null) return;
    d3HourAxis.update({
      scale: scale.value,
      tickFormat: formatTick,
      ticks: d3.timeHour.every(tickFrequency.value),
    });
  }

  return {
    drawHourAxis,
    updateHourAxis,
  };
}
