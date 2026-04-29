import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import App from './App';
import './style.css';

type WebhookResponse = {
  title?: string;
  image?: string;
  imageUrl?: string;
  time?: string;
  description?: string;
};

const WEBHOOK_BASE_URL = import.meta.env.VITE_WEBHOOK_BASE_URL ?? '';

function getDummyData(rowNumber?: string): WebhookResponse {
  const row = Number.parseInt(rowNumber ?? '1', 10);
  const safeRow = Number.isNaN(row) ? 1 : row;
  const baseTime = new Date();
  baseTime.setMinutes(baseTime.getMinutes() - safeRow * 3);

  return {
    title: `Row ${safeRow}`,
    imageUrl: `https://picsum.photos/seed/webhook-${safeRow}/600/340`,
    description: `Fallback message for row ${safeRow}.`,
    time: baseTime.toISOString(),
  };
}

function RowPage() {
  const { rowNumber } = useParams();
  const [data, setData] = React.useState<WebhookResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!rowNumber) {
      return;
    }
    if (!WEBHOOK_BASE_URL) {
      setData(getDummyData(rowNumber));
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchRowData() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${WEBHOOK_BASE_URL.replace(/\/$/, '')}/${rowNumber}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          setData(getDummyData(rowNumber));
          return;
        }

        const json = (await response.json()) as WebhookResponse;
        if (json && Object.keys(json).length > 0) {
          setData(json);
        } else {
          setData(getDummyData(rowNumber));
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return;
        }
        setData(getDummyData(rowNumber));
        setError(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRowData();

    return () => {
      controller.abort();
    };
  }, [rowNumber]);

  return <App data={data} loading={loading} error={error} />;
}

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/row/1" replace />} />
        <Route path="/row/:rowNumber" element={<RowPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
