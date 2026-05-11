import { useEffect, useMemo, useState } from 'react';

type PageData = {
  image?: string;
  short_description?: string;
  long_description?: string;
  instagram_description?: string;
  facebook_description?: string;
};

const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1Atww3T9F3icCBKLlgfKMfOA2NibiwcR7slXYWZoOLC0/gviz/tq?tqx=out:csv&sheet=AI%20GENERATED%20DATA';

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
    } else if (
      (char === '\n' || char === '\r') &&
      !insideQuotes
    ) {
      if (currentValue || currentRow.length > 0) {
        currentRow.push(currentValue.trim());

        rows.push(currentRow);

        currentRow = [];
        currentValue = '';
      }

      if (char === '\r' && nextChar === '\n') {
        i++;
      }
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

function extractDriveFileId(value?: string) {
  if (!value) return '';

  const text = String(value).trim();

  if (!text) return '';

  // already file id only
  if (
    !text.includes('http') &&
    !text.includes('id=')
  ) {
    return text;
  }

  // query param
  const idFromQuery =
    text.match(/[?&]id=([^&]+)/)?.[1];

  if (idFromQuery) {
    return idFromQuery;
  }

  // /d/FILE_ID/
  const idFromPath =
    text.match(/\/d\/([^/?]+)/)?.[1];

  if (idFromPath) {
    return idFromPath;
  }

  return '';
}

function getGoogleDriveImageUrl(value?: string) {
  if (!value) return '';

  const fileId = extractDriveFileId(value);

  if (!fileId) return '';

  return `https://lh3.googleusercontent.com/d/${fileId}=s0`;
}

async function fetchContentById(
  contentId: string
): Promise<PageData | null> {

  const response = await fetch(SHEET_CSV_URL);

  if (!response.ok) {
    throw new Error(
      'Failed to fetch Google Sheet data'
    );
  }

  const csvText = await response.text();

  const rows = parseCSV(csvText);

  console.log('All rows:', rows);

  const matchedRow = rows.find((row) => {
    return (
      String(
        row.CONTENTID ||
        row.contentid ||
        row['CONTENT ID'] ||
        ''
      ).trim() ===
      String(contentId || '').trim()
    );
  });

  console.log('Matched Row:', matchedRow);

  if (!matchedRow) {
    return null;
  }

  const driveFileId =
    matchedRow.DRIVEFILEID ||
    matchedRow.drivefileid ||
    matchedRow['DRIVE FILE ID'] ||
    '';

  console.log('Drive File ID:', driveFileId);

  const generatedImageUrl =
    getGoogleDriveImageUrl(driveFileId);

  console.log(
    'Generated Image URL:',
    generatedImageUrl
  );

  return {
    image: generatedImageUrl,

    short_description:
      matchedRow['SHORT DESCRIPTION'] ||
      matchedRow.short_description ||
      '',

    long_description:
      matchedRow['LONG DESCRIPTION'] ||
      matchedRow.long_description ||
      '',

    instagram_description:
      matchedRow['INSTAGRAM DESCRIPTION'] ||
      matchedRow.instagram_description ||
      '',

    facebook_description:
      matchedRow['FACEBOOK DESCRIPTION'] ||
      matchedRow.facebook_description ||
      '',
  };
}

function App() {
  const [data, setData] =
    useState<PageData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const params =
          new URLSearchParams(
            window.location.search
          );

        const id = params.get('id');

        if (!id) {
          setError(
            'Missing content id in URL.'
          );

          setLoading(false);

          return;
        }

        const result =
          await fetchContentById(id);

        if (!result) {
          setError('Content not found.');

          setLoading(false);

          return;
        }

        setData(result);

        setLoading(false);

      } catch (err) {
        console.error(err);

        setError(
          'Unable to load content.'
        );

        setLoading(false);
      }
    }

    loadData();
  }, []);

  const imageUrl = useMemo(
    () => data?.image?.trim() || '',
    [data?.image]
  );

  const shortDescription = useMemo(
    () =>
      data?.short_description?.trim() || '',
    [data?.short_description]
  );

  const longDescription = useMemo(
    () =>
      data?.long_description?.trim() || '',
    [data?.long_description]
  );

  const instagramDescription = useMemo(
    () =>
      data?.instagram_description?.trim() ||
      '',
    [data?.instagram_description]
  );

  const facebookDescription = useMemo(
    () =>
      data?.facebook_description?.trim() ||
      '',
    [data?.facebook_description]
  );

  if (loading) {
    return (
      <main className="screen">
        <p className="status">
          Loading...
        </p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="screen">
        <p className="status">
          {error || 'No data found.'}
        </p>
      </main>
    );
  }

  return (
    <main className="screen">
      <article className="content-card">

        {imageUrl ? (
          <>
            <p className="section-title">
              Image
            </p>

            <img
              className="hero-image"
              src={imageUrl}
              alt="Content"
              referrerPolicy="no-referrer"
            />
          </>
        ) : null}

        {shortDescription ? (
          <section className="content-text">
            <h2 className="content-title">
              Short Description
            </h2>

            <p className="content-description">
              {shortDescription}
            </p>
          </section>
        ) : null}

        {longDescription ? (
          <section className="content-text">
            <h2 className="content-title">
              Long Description
            </h2>

            <p className="content-description">
              {longDescription}
            </p>
          </section>
        ) : null}

        {instagramDescription ? (
          <section className="content-text">
            <h2 className="content-title">
              Instagram Description
            </h2>

            <p className="content-description">
              {instagramDescription}
            </p>
          </section>
        ) : null}

        {facebookDescription ? (
          <section className="content-text">
            <h2 className="content-title">
              Facebook Description
            </h2>

            <p className="content-description">
              {facebookDescription}
            </p>
          </section>
        ) : null}

      </article>
    </main>
  );
}

export default App;
