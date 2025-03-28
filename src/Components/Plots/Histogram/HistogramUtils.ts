import * as d3 from "d3";

export function sortDates(commitData: { date: Date }[]) {
  const sortedCommits = [...commitData].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
  return sortedCommits.map((commit) => commit.date);
}

export function computeFrequency(dates: Date[]) {
  const data = dates.map((d) => ({ date: d3.timeMonth(d) }));
  const freqMap = d3.rollup(
    data,
    (v) => v.length,
    (d) => d.date
  );

  const minDate = d3.min(data, (d) => d.date) as Date;
  const maxDate = d3.max(data, (d) => d.date) as Date;
  d3.timeMonths(minDate, maxDate).forEach((d) => {
    if (!freqMap.has(d)) freqMap.set(d, 0);
  });

  return new Map(
    Array.from(freqMap).sort((a, b) => d3.ascending(a[0], b[0]))
  );
}