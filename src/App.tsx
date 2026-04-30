import { useMemo } from 'react';

type PageData = {
  title?: string;
  image?: string;
  imageUrl?: string;
  description?: string;
};

type AppProps = {
  data: PageData | null;
};

function App({ data }: AppProps) {
  const imageUrl = useMemo(() => data?.imageUrl ?? data?.image ?? '', [data]);
  const insta_imageUrl = useMemo(() => (data as any)?.insta_imageUrl ?? (data as any)?.insta_image ?? '', [data]);
  const title = useMemo(() => data?.title?.trim() || 'Untitled', [data?.title]);
  const long_description = useMemo(
    () => (data as any)?.long_description?.trim() ?? '',
    [(data as any)?.long_description]
  );
  const short_description = useMemo(
    () => (data as any)?.short_description?.trim() ?? '',
    [(data as any)?.short_description]
  );

  if (!data) {
    return (
      <main className="screen">
        <p className="status">
          Add query parameters to the URL: <code>image</code>, <code>title</code>, and{' '}
          <code>description</code>. Example:{' '}
          <code>
            ?title=Hello&amp;description=World&amp;image=https%3A%2F%2Fexample.com%2Fphoto.jpg
          </code>
        </p>
      </main>
    );
  }

  return (
    <main className="screen">
      <article className="content-card">
        {imageUrl ? <>
          <p className="content-title" style={{marginLeft:"20px", marginTop:"20px"}}>Blog Image</p>
          <img className="hero-image" src={imageUrl} alt={title} />
        </>
          :
          null}
        <section className="content-text">
          <h1 className="content-title">{title}</h1>
          {short_description && long_description ? (<>
            <p className="content-description"><b>Short Description:</b>{short_description}</p>
            <p className="content-description"><b>Long Description:</b>{long_description}</p>
          </>
          ) : (
            <p className="content-description">No description.</p>
          )}
        </section>
        {insta_imageUrl ? <>
          <p style={{borderTop:"3px solid",marginLeft:"5px",marginRight:"5px"}}></p>
          <p className="content-title" style={{marginLeft:"20px", marginTop:"20px"}}>Instagram Image</p>
          <img className="hero-image" src={insta_imageUrl} alt={title} />
        </>
          :
          null
        }
      </article>
    </main>
  );
}

export default App;
