/**
 * Chart.js calls scriptable colors on every draw. A new CanvasGradient each
 * time counts as a changed option, so the chart schedules another draw and
 * never yields the main thread.
 */
export const cachedChartAreaGradient = ({
  top = "rgba(245, 175, 82, 0.35)",
  bottom = "rgba(245, 175, 82, 0.02)",
  fallback = "rgba(245, 175, 82, 0.15)",
} = {}) => {
  let gradient = null;
  let width = 0;
  let height = 0;

  return (context) => {
    const chart = context?.chart;
    const chartArea = chart?.chartArea;
    const ctx = chart?.ctx;
    if (!ctx || !chartArea) return fallback;

    const nextWidth = chartArea.right - chartArea.left;
    const nextHeight = chartArea.bottom - chartArea.top;
    if (gradient && width === nextWidth && height === nextHeight) return gradient;

    width = nextWidth;
    height = nextHeight;
    gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, top);
    gradient.addColorStop(1, bottom);
    return gradient;
  };
};
