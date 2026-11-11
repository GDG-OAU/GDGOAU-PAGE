const dataSourceCache = new Map();

function normalizeUuid(rawId = "") {
  const clean = String(rawId).trim().replace(/-/g, "");
  if (clean.length !== 32) return String(rawId).trim();
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
}

function extractPlainText(richTextArray = []) {
  if (!Array.isArray(richTextArray)) return "";
  return richTextArray.map((segment) => segment?.plain_text || "").join("");
}

function extractRichTextSegments(richTextArray = []) {
  if (!Array.isArray(richTextArray)) return [];
  return richTextArray.map((segment) => ({
    text: segment?.plain_text || "",
    href: segment?.href || segment?.text?.link?.url || null,
    bold: Boolean(segment?.annotations?.bold),
    italic: Boolean(segment?.annotations?.italic),
    underline: Boolean(segment?.annotations?.underline),
    strikethrough: Boolean(segment?.annotations?.strikethrough),
    code: Boolean(segment?.annotations?.code),
  }));
}

function extractFiles(filesProperty = []) {
  if (!Array.isArray(filesProperty)) return [];
  return filesProperty
    .map((fileItem) => {
      const url =
        fileItem?.file?.url ||
        fileItem?.external?.url ||
        null;
      if (!url) return null;
      return {
        name: fileItem?.name || "Event Media",
        url,
        expiryTime: fileItem?.file?.expiry_time || null,
      };
    })
    .filter(Boolean);
}

function extractCoverUrl(page) {
  if (!page?.cover) return null;
  return page.cover?.file?.url || page.cover?.external?.url || null;
}

export function mapNotionPageToEvent(page) {
  const props = page?.properties || {};

  const title = extractPlainText(props["Event Name"]?.title).trim();
  const description = extractPlainText(props["Description"]?.rich_text).trim();
  const descriptionRichText = extractRichTextSegments(props["Description"]?.rich_text);
  const venue = extractPlainText(props["Venue"]?.rich_text).trim();
  const host = extractPlainText(props["Host"]?.rich_text).trim();
  const link = props["Link"]?.url || null;

  const dateObj = props["Date"]?.date || null;
  const date = dateObj
    ? {
        start: dateObj.start || null,
        end: dateObj.end || null,
        timeZone: dateObj.time_zone || null,
      }
    : null;

  const statusSelect = props["Status"]?.select || null;
  const status = statusSelect?.name || "Planning";
  const statusColor = statusSelect?.color || "default";

  const teams = Array.isArray(props["Team"]?.multi_select)
    ? props["Team"].multi_select.map((item) => ({
        id: item.id,
        name: item.name,
        color: item.color || "default",
      }))
    : [];

  const files = extractFiles(props["Files & media"]?.files);
  const coverUrl = extractCoverUrl(page);
  const flyerUrl = files[0]?.url || coverUrl || null;

  return {
    id: page.id,
    title,
    description,
    descriptionRichText,
    date,
    venue,
    link,
    host,
    teams,
    status,
    statusColor,
    files,
    flyerUrl,
    coverUrl,
    notionUrl: page.public_url || page.url || null,
    lastEditedTime: page.last_edited_time || null,
  };
}

async function resolveDataSourceId(apiKey, databaseId) {
  const key = databaseId.replace(/-/g, "");
  if (dataSourceCache.has(key)) {
    return dataSourceCache.get(key);
  }

  const response = await fetch(
    `https://api.notion.com/v1/databases/${normalizeUuid(databaseId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2025-09-03",
      },
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Notion database lookup failed (${response.status}): ${errText}`);
  }

  const db = await response.json();
  const dataSourceId = db?.data_sources?.[0]?.id;
  if (!dataSourceId) {
    throw new Error(
      `No data source found for Notion database ${databaseId}. Ensure the integration has access to the database.`
    );
  }

  dataSourceCache.set(key, dataSourceId);
  return dataSourceId;
}

export async function fetchCommunityCalendarEvents(env = {}) {
  const rawApiKey =
    env.NOTION_API_KEY ||
    (typeof process !== "undefined" ? process.env?.NOTION_API_KEY : undefined);
  const rawDatabaseId =
    env.NOTION_DATABASE_ID ||
    (typeof process !== "undefined" ? process.env?.NOTION_DATABASE_ID : undefined);

  if (!rawApiKey) {
    throw new Error("Missing NOTION_API_KEY environment variable.");
  }
  if (!rawDatabaseId) {
    throw new Error("Missing NOTION_DATABASE_ID environment variable.");
  }

  const apiKey = String(rawApiKey).trim();
  const databaseId = normalizeUuid(rawDatabaseId);

  const sorts = [
    {
      property: "Date",
      direction: "ascending",
    },
  ];

  const dataSourceId = await resolveDataSourceId(apiKey, databaseId);

  const pages = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const bodyPayload = {
      sorts,
      page_size: 100,
    };
    if (startCursor) {
      bodyPayload.start_cursor = startCursor;
    }

    const response = await fetch(
      `https://api.notion.com/v1/data_sources/${dataSourceId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Notion-Version": "2025-09-03",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyPayload),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Notion query failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    pages.push(...(data.results || []));
    hasMore = Boolean(data.has_more);
    startCursor = data.next_cursor || undefined;
  }

  const events = pages
    .filter((page) => !page.archived && !page.in_trash)
    .map(mapNotionPageToEvent)
    .filter(
      (event) =>
        Boolean(event.title) &&
        event.status.toLowerCase() !== "draft"
    );

  // Ensure deterministic chronological sorting by Date.start (undated events at the end)
  events.sort((a, b) => {
    const aStart = a.date?.start ? new Date(a.date.start).getTime() : Number.POSITIVE_INFINITY;
    const bStart = b.date?.start ? new Date(b.date.start).getTime() : Number.POSITIVE_INFINITY;
    if (aStart !== bStart) return aStart - bStart;
    return a.title.localeCompare(b.title);
  });

  return events;
}
