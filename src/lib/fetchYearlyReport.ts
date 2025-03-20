async function fetchYearlyReport(year: number) {
  const response = await fetch("/api/strapi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      method: "GET",
      collection: "operations/yearly-report",
      query: { year },
    }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Error fetching report");
  return result;
}

export default fetchYearlyReport;