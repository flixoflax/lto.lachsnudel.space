export interface Chapter {
  /**
   * In seconds.
   */
  start: number;
  title: string;
  /**
   * Original format like "00:15:20".
   */
  startFormatted: string;
}

export interface Episode {
  guid: string;
  title: string;
  audioUrl: string;
  duration: string;
  pubDate: string;
  description?: string;
  chapters?: Chapter[];
}

const parseTimeToSeconds = (timeStr: string): number => {
  const parts = timeStr.split(":").map(Number);

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  return 0;
};

export const parsePodcastFeed = (xmlText: string): Episode[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");

  const items = doc.querySelectorAll("item");
  const episodes: Episode[] = [];

  items.forEach((item) => {
    const guid = item.querySelector("guid")?.textContent || "";
    const title =
      item.querySelector("title")?.textContent || "Untitled Episode";
    const enclosure = item.querySelector("enclosure");
    const audioUrl = enclosure?.getAttribute("url") || "";
    const duration =
      item.querySelector("itunes\\:duration, duration")?.textContent ||
      "00:00:00";
    const pubDate =
      item.querySelector("pubDate")?.textContent || new Date().toISOString();

    // Parse description - properly extract text from HTML
    const descriptionElement = item.querySelector("description");
    let description = "";

    if (descriptionElement?.textContent) {
      const rawDesc = descriptionElement.textContent;
      // Remove CDATA wrapper
      const cleanedDesc = rawDesc
        .replaceAll("<![CDATA[", "")
        .replaceAll("]]>", "");

      // Parse HTML and extract text content
      const tempDiv = document.createElement("div");

      tempDiv.innerHTML = cleanedDesc;
      description = tempDiv.textContent || tempDiv.innerText || "";

      // Clean up whitespace
      description = description.replaceAll(/\s+/g, " ").trim();
    }

    // Parse chapters if available
    const chapters: Chapter[] = [];
    const chapterElements = item.querySelectorAll("chapter");

    chapterElements.forEach((chapter) => {
      const startStr = chapter.getAttribute("start") || "00:00:00";
      const chapterTitle = chapter.getAttribute("title") || "Untitled";

      chapters.push({
        start: parseTimeToSeconds(startStr),
        title: chapterTitle,
        startFormatted: startStr,
      });
    });

    if (guid && audioUrl) {
      episodes.push({
        guid,
        title,
        audioUrl,
        duration,
        pubDate,
        description: description || undefined,
        chapters: chapters.length > 0 ? chapters : undefined,
      });
    }
  });

  return episodes;
};
