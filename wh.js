async function getWhatsAppClicks(storeSlug) {
  try {
    const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],

    dimensions: [{ name: "store_name" }],

    metrics: [{ name: "eventCount" }],

    dimensionFilter: {
      andGroup: {
        expressions: [
          {
            filter: {
              fieldName: "eventName",
              stringFilter: {
                matchType: "EXACT",
                value: "whatsapp_click",
              },
            },
          },
          {
            filter: {
              fieldName: "store_name",
              stringFilter: {
                matchType: "EXACT",
                value: storeSlug,
              },
            },
          },
        ],
      },
    },
  });

  const total =
    response.rows?.reduce((sum, row) => {
      return sum + Number(row.metricValues[0].value);
    }, 0) || 0;

  return total;
  } catch (error) {
    console.error("GA4 error:", error);
    throw error;
  }
}