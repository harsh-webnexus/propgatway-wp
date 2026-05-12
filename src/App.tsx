import {
  useEffect,
  useMemo,
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

function parseCSV(
  csvText: string
): Record<string, string>[] {

  const rows: string[][] = [];

  let currentRow: string[] = [];

  let currentValue = '';

  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {

    const char = csvText[i];

    const nextChar = csvText[i + 1];

    if (
      char === '"' &&
      nextChar === '"'
    ) {

      currentValue += '"';

      i++;
    }

    else if (char === '"') {

      insideQuotes = !insideQuotes;
    }

    else if (
      char === ',' &&
      !insideQuotes
    ) {

      currentRow.push(
        currentValue.trim()
      );

      currentValue = '';
    }

    else if (
      (char === '\n' || char === '\r') &&
      !insideQuotes
    ) {

      if (
        currentValue ||
        currentRow.length > 0
      ) {

        currentRow.push(
          currentValue.trim()
        );

        rows.push(currentRow);

        currentRow = [];

        currentValue = '';
      }

      if (
        char === '\r' &&
        nextChar === '\n'
      ) {
        i++;
      }
    }

    else {

      currentValue += char;
    }
  }

  if (
    currentValue ||
    currentRow.length > 0
  ) {

    currentRow.push(
      currentValue.trim()
    );

    rows.push(currentRow);
  }

  const headers = rows[0] || [];

  return rows.slice(1).map((row) => {

    const item: Record<
      string,
      string
    > = {};

    headers.forEach(
      (header, index) => {

        item[header.trim()] =
          row[index]?.trim() || '';
      }
    );

    return item;
  });
}

/* ---------------- DRIVE HELPERS ---------------- */

function extractDriveFileId(
  value?: string
) {

  if (!value) return '';

  const text =
    String(value).trim();

  // already file id
  if (
    !text.includes('http') &&
    !text.includes('id=')
  ) {
    return text;
  }

  return (

    text.match(
      /[?&]id=([^&]+)/
    )?.[1] ||

    text.match(
      /\/d\/([^/?]+)/
    )?.[1] ||

    ''
  );
}

function buildImageCandidates(
  value?: string
) {

  if (!value) return [];

  const fileId =
    extractDriveFileId(value);

  // normal image url
  if (!fileId) {

    return [value];
  }

  return [

    // BEST
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`,

    // FALLBACK
    `https://lh3.googleusercontent.com/d/${fileId}=s0`,

    // FALLBACK
    `https://drive.google.com/uc?export=view&id=${fileId}`,
  ];
}

/* ---------------- SMART IMAGE ---------------- */

function SmartImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {

  const candidates =
    useMemo(
      () =>
        buildImageCandidates(src),
      [src]
    );

  const [index, setIndex] =
    useState(0);

  useEffect(() => {

    setIndex(0);

  }, [src]);

  const currentSrc =
    candidates[index] || '';

  console.log(
    'TRYING IMAGE:',
    currentSrc
  );

  return (

    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"

      onLoad={() => {

        console.log(
          'IMAGE LOADED:',
          currentSrc
        );
      }}

      onError={() => {

        console.log(
          'IMAGE FAILED:',
          currentSrc
        );

        if (
          index <
          candidates.length - 1
        ) {

          setIndex(
            prev => prev + 1
          );
        }
      }}
    />
  );
}

/* ---------------- FETCH DATA ---------------- */

async function fetchContentById(
  contentId: string
): Promise<PageData | null> {

  const response =
    await fetch(SHEET_CSV_URL);

  const csvText =
    await response.text();

  const rows =
    parseCSV(csvText);

  console.log(
    'TOTAL ROWS:',
    rows.length
  );

  const matchedRow =
    rows.find((row) => {

      return (
        String(
          row.CONTENTID || ''
        ).trim() ===
        contentId.trim()
      );
    });

  console.log(
    'MATCHED ROW:',
    matchedRow
  );

  if (!matchedRow) {

    return null;
  }

  return {

    // BLOG
    blog_image:

      matchedRow.BLOGDRIVEFILEID ||

      matchedRow[
        'BLOG IMAGE URL'
      ] ||

      '',

    blog_title:
      matchedRow[
        'BLOG TITLE'
      ] || '',

    short_description:
      matchedRow[
        'SHORT DESCRIPTION'
      ] || '',

    long_description:
      matchedRow[
        'LONG DESCRIPTION'
      ] || '',

    // FACEBOOK
    facebook_image:

      matchedRow.FBDRIVEFILEID ||

      matchedRow[
        'FB IMAGE URL'
      ] ||

      '',

    facebook_title:
      matchedRow[
        'FACEBOOK TITLE'
      ] || '',

    facebook_description:
      matchedRow[
        'FACEBOOK DESCRIPTION'
      ] || '',

    // INSTAGRAM
    instagram_image:

      matchedRow.INSTADRIVEFILEID ||

      matchedRow[
        'INSTA IMAGE URL'
      ] ||

      '',

    instagram_title:
      matchedRow[
        'INSTAGRAM TITLE'
      ] || '',

    instagram_description:
      matchedRow[
        'INSTAGRAM DESCRIPTION'
      ] || '',
  };
}

/* ---------------- APP ---------------- */

function App() {

  const [data, setData] =
    useState<PageData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [showMore, setShowMore] =
    useState(false);

  useEffect(() => {

    async function load() {

      try {

        const id =
          new URLSearchParams(
            window.location.search
          ).get('id');

        console.log(
          'CONTENT ID:',
          id
        );

        if (!id) {

          setError(
            'Missing content id'
          );

          return;
        }

        const result =
          await fetchContentById(
            id
          );

        console.log(
          'FINAL RESULT:',
          result
        );

        if (!result) {

          setError(
            'Content not found'
          );

          return;
        }

        setData(result);
      }

      catch (err) {

        console.error(err);

        setError(
          'Something went wrong'
        );
      }

      finally {

        setLoading(false);
      }
    }

    load();

  }, []);

  if (loading) {

    return (
      <div className="status">
        Loading...
      </div>
    );
  }

  if (error || !data) {

    return (
      <div className="status">
        {error}
      </div>
    );
  }

  return (

    <main className="screen">

      {/* BLOG */}

      <section className="platform-card">

        <h2 className="platform-heading">
          Blog
        </h2>

        {data.blog_image && (

          <SmartImage
            src={data.blog_image}
            alt="Blog"
            className="blog-image"
          />
        )}

        {data.blog_title && (

          <h1 className="title">
            {data.blog_title}
          </h1>
        )}

        {data.short_description && (

          <p className="description">
            {data.short_description}
          </p>
        )}

        {showMore &&
          data.long_description && (

            <p className="description">
              {data.long_description}
            </p>
        )}

        {data.long_description && (

          <button
            className="read-more-btn"
            onClick={() =>
              setShowMore(!showMore)
            }
          >
            {showMore
              ? 'Show Less'
              : 'Read More'}
          </button>
        )}

      </section>

      <div className="divider" />

      {/* FACEBOOK */}

      <section className="platform-card">

        <h2 className="platform-heading">
          Facebook
        </h2>

        {data.facebook_image && (

          <SmartImage
            src={data.facebook_image}
            alt="Facebook"
            className="facebook-image"
          />
        )}

        {data.facebook_title && (

          <h1 className="title">
            {data.facebook_title}
          </h1>
        )}

        {data.facebook_description && (

          <p className="description">
            {data.facebook_description}
          </p>
        )}

      </section>

      <div className="divider" />

      {/* INSTAGRAM */}

      <section className="platform-card">

        <h2 className="platform-heading">
          Instagram
        </h2>

        {data.instagram_image && (

          <SmartImage
            src={data.instagram_image}
            alt="Instagram"
            className="instagram-image"
          />
        )}

        {data.instagram_title && (

          <h1 className="title">
            {data.instagram_title}
          </h1>
        )}

        {data.instagram_description && (

          <p className="description">
            {data.instagram_description}
          </p>
        )}

      </section>

    </main>
  );
}

export default App;