import * as d3 from "d3";
/*
  * Sorts an array of commit data objects by their date property.
  * Returns A sorted array of dates.
  */
export function sortDates(commitData: { date: Date }[]) {
  const sortedCommits = [...commitData].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
  return sortedCommits.map((commit) => commit.date);
}

/*
  * Computes the frequency of commits per month from a list of dates.
  * Returns A Map where keys are month strings (ISO format) and values are commit counts.
  */
export function computeFrequency(dates: Date[]) {
  // Convert dates to UTC months and then to ISO strings for map keys
  const monthStrings = dates.map((d) => d3.utcMonth(d).toISOString());
  
  // Create frequency map with string keys
  const freqMap = new Map<string, number>();
  monthStrings.forEach((key) => {
    freqMap.set(key, (freqMap.get(key) ?? 0) + 1);
  });

  // If we have dates, fill in missing months
  if (dates.length > 0) {
    // Get min and max dates
    const minDate = d3.utcMonth(new Date(Math.min(...monthStrings.map(str => new Date(str).getTime()))));
    const maxDate = d3.utcMonth(new Date(Math.max(...monthStrings.map(str => new Date(str).getTime()))));
    
    // Fill gaps with zeros
    d3.utcMonths(minDate, maxDate).forEach((date) => {
      const key = date.toISOString();
      if (!freqMap.has(key)) {
        freqMap.set(key, 0);
      }
    });
  }

  // Sort by date (parsing strings back to dates for comparison)
  return new Map(
    Array.from(freqMap).sort((a, b) => {
      const dateA = new Date(a[0]);
      const dateB = new Date(b[0]);
      return dateA.getTime() - dateB.getTime();
    })
  );
}