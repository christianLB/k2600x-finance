async function fetchMonthlyGroupReport(year: number, month: string, parent_tag_id: number) {
  const response = await fetch("/api/strapi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      method: "GET",
      collection: "operations/monthly-group-report",
      query: { year, month, parent_tag_id },
    }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Error fetching report");
  return result;
}

export default fetchMonthlyGroupReport;