import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

type WebhookResponse = {
  title?: string;
  image?: string;
  imageUrl?: string;
  time?: string;
  description?: string;
};

type AppProps = {
  data: WebhookResponse | null;
  loading: boolean;
  error: string | null;
};

function App({ data, loading, error }: AppProps) {
  const { rowNumber } = useParams();

  const imageUrl = useMemo(() => data?.imageUrl ?? data?.image ?? '', [data]);
  const title = useMemo(() => data?.title ?? `Row ${rowNumber ?? ''}`, [data?.title, rowNumber]);
  const description = useMemo(() => data?.description ?? 'No description found.', [data?.description]);

  return (
    <main className="screen">
      {loading && <p className="status">Loading webhook data...</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && !error && data && (
        <article className="content-card">
          {imageUrl && <img className="hero-image" src={imageUrl} alt={title} />}
          <section className="content-text">
            <h1 className="content-title">{title}</h1>
            <p className="content-description">{description}</p>
          </section>
        </article>
      )}

      {!loading && !error && !data && <p className="status">No data returned from webhook.</p>}
    </main>
  );
}

export default App;
