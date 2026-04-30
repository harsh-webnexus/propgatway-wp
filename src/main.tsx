import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, useSearchParams } from 'react-router-dom';
import App from './App';
import './style.css';

type PageData = {
  title?: string;
  imageUrl?: string;
  insta_imageUrl?:string;
  long_description?: string;
  short_description?:string;
};

function ContentPage() {
  const [searchParams] = useSearchParams();

  const data = React.useMemo((): PageData | null => {
    const title = searchParams.get('title')?.trim() ?? '';
    const long_description = searchParams.get('long_description')?.trim() ?? '';
    const short_description = searchParams.get('short_description')?.trim() ?? '';
    const image = searchParams.get('image')?.trim() ?? '';
    const insta_image = searchParams.get('insta_image')?.trim() ?? '';
    if (!title && !long_description && !short_description && !image) {
      return null;
    }
    return {
      ...(title ? { title } : {}),
      ...(long_description ? { long_description } : {}),
      ...(short_description ? { short_description } : {}),
      ...(image ? { imageUrl: image } : {}),
      ...(insta_image ? { insta_imageUrl: insta_image } : {}),
    };
  }, [searchParams]);

  return <App data={data} />;
}

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<ContentPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
