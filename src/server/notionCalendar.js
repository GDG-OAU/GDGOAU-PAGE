import notionPkg from "@notionhq/client";

const Client =
  notionPkg?.Client ||
  notionPkg?.default?.Client ||
  (typeof notionPkg === "function" ? notionPkg : null);

const dataSourceCache = new Map();

function normalizeId(rawId = "") {
  return String(rawId).trim().replace(/-/g, "");
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

async function resolveDataSourceId(notion, databaseId) {
  const key = normalizeId(databaseId);
  if (dataSourceCache.has(key)) {
    return dataSourceCache.get(key);
  }

  const db = await notion.databases.retrieve({ database_id: databaseId });
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
  const apiKey =
    env.NOTION_API_KEY ||
    (typeof process !== "undefined" ? process.env?.NOTION_API_KEY : undefined);
  const databaseId =
    env.NOTION_DATABASE_ID ||
    (typeof process !== "undefined" ? process.env?.NOTION_DATABASE_ID : undefined);

  if (!apiKey) {
    throw new Error("Missing NOTION_API_KEY environment variable.");
  }
  if (!databaseId) {
    throw new Error("Missing NOTION_DATABASE_ID environment variable.");
  }

  const notion = new Client({ auth: apiKey });

  const sorts = [
    {
      property: "Date",
      direction: "ascending",
    },
  ];

  let pages = [];
  let hasMore = true;
  let startCursor = undefined;

  if (notion.dataSources?.query) {
    const dataSourceId = await resolveDataSourceId(notion, databaseId);
    while (hasMore) {
      const response = await notion.dataSources.query({
        data_source_id: dataSourceId,
        sorts,
        start_cursor: startCursor,
        page_size: 100,
      });
      pages.push(...(response.results || []));
      hasMore = Boolean(response.has_more);
      startCursor = response.next_cursor || undefined;
    }
  } else if (notion.databases?.query) {
    while (hasMore) {
      const response = await notion.databases.query({
        database_id: databaseId,
        sorts,
        start_cursor: startCursor,
        page_size: 100,
      });
      pages.push(...(response.results || []));
      hasMore = Boolean(response.has_more);
      startCursor = response.next_cursor || undefined;
    }
  } else {
    throw new Error("Unsupported @notionhq/client version: no query method found.");
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
