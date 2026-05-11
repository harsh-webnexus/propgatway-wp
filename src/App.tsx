import {
  useEffect,
  useState,
} from 'react';

type PageData = {

  // BLOG
  blog_image?: string;
  blog_title?: string;
  short_description?: string;
  long_description?: string;

  // FACEBOOK
  facebook_image?: string;
  facebook_title?: string;
  facebook_description?: string;

  // INSTAGRAM
  instagram_image?: string;
  instagram_title?: string;
  instagram_description?: string;
};

const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1Atww3T9F3icCBKLlgfKMfOA2NibiwcR7slXYWZoOLC0/gviz/tq?tqx=out:csv&sheet=AI%20GENERATED%20DATA';

/* ---------------- CSV PARSER ---------------- */

function parseCSV(csvText: string): Record<string, string>[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"' && nextChar === '"') {
      currentValue += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentValue.trim());
      currentValue = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (currentValue || currentRow.length > 0) {
        currentRow.push(currentValue.trim());
        rows.push(currentRow);
        currentRow = [];
        currentValue = '';
      }
      if (char === '\r' && nextChar === '\n') i++;
    } else {
      currentValue += char;
    }
  }

  if (currentValue || currentRow.length > 0) {
    currentRow.push(currentValue.trim());
    rows.push(currentRow);
  }

  const headers = rows[0] || [];

  return rows.slice(1).map((row) => {
    const item: Record<string, string> = {};
    headers.forEach((header, index) => {
      item[header.trim()] = row[index]?.trim() || '';
    });
    return item;
  });
}

/* ---------------- DRIVE IMAGE ---------------- */

function extractDriveFileId(value?: string) {
  if (!value) return '';

  const text = String(value).trim();

  if (!text.includes('http') && !text.includes('id=')) {
    return text;
  }

  return (
    text.match(/[?&]id=([^&]+)/)?.[1] ||
    text.match(/\/d\/([^/?]+)/)?.[1] ||
    ''
  );
}

function getGoogleDriveImageUrl(value?: string) {
  const fileId = extractDriveFileId(value);
  if (!fileId) return '';
  return `https://lh3.googleusercontent.com/d/${fileId}=s0`;
}

/* ---------------- FETCH DATA ---------------- */

async function fetchContentById(contentId: string): Promise<PageData | null> {
  const res = await fetch(SHEET_CSV_URL);
  const csv = await res.text();
  const rows = parseCSV(csv);

  const row = rows.find(r =>
    String(r.CONTENTID || '').trim() === String(contentId || '').trim()
  );

  if (!row) return null;

  return {
    blog_image: getGoogleDriveImageUrl(row.BLOGDRIVEFILEID),
    blog_title: row['BLOG TITLE'] || '',
    short_description: row['SHORT DESCRIPTION'] || '',
    long_description: row['LONG DESCRIPTION'] || '',

    facebook_image: getGoogleDriveImageUrl(row.FBDRIVEFILEID),
    facebook_title: row['FACEBOOK TITLE'] || '',
    facebook_description: row['FACEBOOK DESCRIPTION'] || '',

    instagram_image: getGoogleDriveImageUrl(row.INSTADRIVEFILEID),
    instagram_title: row['INSTAGRAM TITLE'] || '',
    instagram_description: row['INSTAGRAM DESCRIPTION'] || '',
  };
}

/* ---------------- COMPONENT ---------------- */

function App() {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    async function load() {
      const id = new URLSearchParams(window.location.search).get('id');

      if (!id) {
        setError('Missing content id');
        setLoading(false);
        return;
      }

      const result = await fetchContentById(id);

      if (!result) {
        setError('Content not found');
        setLoading(false);
        return;
      }

      setData(result);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <div className="status">Loading...</div>;
  if (error || !data) return <div className="status">{error}</div>;

  return (
    <main className="screen">

      {/* ---------------- BLOG ---------------- */}
      <section className="platform-card">

        <h2 className="platform-heading">Blog</h2>

        {data.blog_image && (
          <img className="blog-image" src={data.blog_image} />
        )}

        {data.blog_title && <h1 className="title">{data.blog_title}</h1>}

        {data.short_description && (
          <p className="description">{data.short_description}</p>
        )}

        {showMore && (
          <p className="long-description">{data.long_description}</p>
        )}

        {data.long_description && (
          <button
            className="read-more-btn"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? 'Show Less' : 'Read More'}
          </button>
        )}

      </section>

      <div className="divider" />

      {/* ---------------- FACEBOOK ---------------- */}
      <section className="platform-card facebook">

        <h2 className="platform-heading">Facebook</h2>

        {data.facebook_image && (
          <img className="facebook-image" src={data.facebook_image} />
        )}

        {data.facebook_title && <h1 className="title">{data.facebook_title}</h1>}

        {data.facebook_description && (
          <p className="description">{data.facebook_description}</p>
        )}

      </section>

      <div className="divider" />

      {/* ---------------- INSTAGRAM ---------------- */}
      <section className="platform-card instagram">

        <h2 className="platform-heading">Instagram</h2>

        {data.instagram_image && (
          <img className="instagram-image" src={data.instagram_image} />
        )}

        {data.instagram_title && <h1 className="title">{data.instagram_title}</h1>}

        {data.instagram_description && (
          <p className="description">{data.instagram_description}</p>
        )}

      </section>

    </main>
  );
}

export default App;