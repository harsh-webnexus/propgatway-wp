import { useEffect, useMemo, useState } from 'react';
import './App.css';

type PageData = {
  blog_image?: string;
  blog_title?: string;
  short_description?: string;
  long_description?: string;
  post_slug?: string;

  facebook_image?: string;
  facebook_title?: string;
  facebook_description?: string;

  instagram_image?: string;
  instagram_title?: string;
  instagram_description?: string;
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
function BlogHero() {
  return (
    <section className="pgBlogHero">
      <h1>PropGateway Blog – Real Estate Insights</h1>
      <p>
        Stay updated with the latest trends, guides, and insights into the real
        estate market in Noida and Greater Noida.
      </p>
    </section>
  );
}
function buildImageCandidates(value?: string) {
  if (!value) return [];

  const text = String(value).trim();
  const fileId = extractDriveFileId(text);

  if (!fileId) return [text];

  return [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`,
    `https://lh3.googleusercontent.com/d/${fileId}=s0`,
    `https://drive.google.com/uc?export=view&id=${fileId}`,
  ];
}

function SmartImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  const candidates = useMemo(() => buildImageCandidates(src), [src]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [src]);

  return (
    <img
      src={candidates[index] || ''}
      alt={alt}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      onError={() => {
        if (index < candidates.length - 1) {
          setIndex((prev) => prev + 1);
        }
      }}
    />
  );
}

async function fetchContentById(contentId: string): Promise<PageData | null> {
  const response = await fetch(SHEET_CSV_URL);
  const csvText = await response.text();
  const rows = parseCSV(csvText);

  const matchedRow = rows.find((row) => {
    return String(row.CONTENTID || '').trim() === contentId.trim();
  });

  if (!matchedRow) return null;

  return {
    blog_image:
      matchedRow.BLOGDRIVEFILEID || matchedRow['BLOG IMAGE URL'] || '',

    blog_title: matchedRow['BLOG TITLE'] || '',

    short_description: matchedRow['SHORT DESCRIPTION'] || '',

    long_description: matchedRow['LONG DESCRIPTION'] || '',

    post_slug: matchedRow['post_slug'] || '',

    facebook_image: matchedRow.FBDRIVEFILEID || matchedRow['FB IMAGE URL'] || '',

    facebook_title: matchedRow['FACEBOOK TITLE'] || '',

    facebook_description: matchedRow['FACEBOOK DESCRIPTION'] || '',

    instagram_image:
      matchedRow.INSTADRIVEFILEID || matchedRow['INSTA IMAGE URL'] || '',

    instagram_title: matchedRow['INSTAGRAM TITLE'] || '',

    instagram_description: matchedRow['INSTAGRAM DESCRIPTION'] || '',
  };
}

function PropGatewayLogo() {
  return (
    <div className="pgLogo">
      <div className="pgLogoMark">PG</div>
      <span>PropGateway</span>
    </div>
  );
}

// function BlogSidebar({ data }: { data: PageData }) {
//   const featured = [
//     {
//       title: 'XU 3 Greater Noida – Residential Sector Offering Affordable Living & Future Growth',
//       image: data.blog_image,
//     },
//     {
//       title: 'XU 2 Greater Noida – Emerging Residential Sector with Affordable Housing Opportunities',
//       image: data.blog_image,
//     },
//     {
//       title: 'XU 1 Greater Noida – Affordable Residential Sector with Strong Connectivity & Rental Scope',
//       image: data.blog_image,
//     },
//     {
//       title: 'MU 1 Greater Noida – Residential Sector Near Knowledge Park with Strong Rental Demand',
//       image: data.blog_image,
//     },
//   ];

//   // return (
//   //   // <aside className="pgSidebar">
//   //   //   <div className="pgSearchCard">
//   //   //     <h3>Search</h3>
//   //   //     <input placeholder="Search articles, categories, tags, etc." />
//   //   //     <button>Search</button>
//   //   //   </div>

//   //   //   <div className="pgFeaturedCard">
//   //   //     <h3>FEATURED STORIES</h3>

//   //   //     {featured.map((item, index) => (
//   //   //       <div className="pgFeaturedItem" key={index}>
//   //   //         {item.image && (
//   //   //           <SmartImage
//   //   //             src={item.image}
//   //   //             alt=""
//   //   //             className="pgFeaturedThumb"
//   //   //           />
//   //   //         )}
//   //   //         <p>{item.title}</p>
//   //   //       </div>
//   //   //     ))}
//   //   //   </div>
//   //   // </aside>
//   // );
// }

function BlogPreview({ data }: { data: PageData }) {
  return (
    <>
      <header className="pgHeader">
        <div className="pgHeaderInner">
          <PropGatewayLogo />
          <button className="pgCallBtn">Call</button>
        </div>
      </header>

      <BlogHero />

      <section className="pgBlogPage">
        <div className="pgBlogLayout">
          <article className="pgBlogPost">
            {data.blog_image && (
              <SmartImage
                src={data.blog_image}
                alt={data.blog_title || 'Blog'}
                className="pgBlogImage"
              />
            )}

            <h1>{data.blog_title}</h1>

            {data.short_description && <p>{data.short_description}</p>}

            <span className="pgDate">May 8, 2026</span>

            {data.post_slug && (
              <a
                href={`https://propgateway.com/blog/${data.post_slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pgReadMore"
              >
                Continue Reading
              </a>
            )}
          </article>
        </div>
      </section>
    </>
  );
}

function InstagramPreview({ data }: { data: PageData }) {
  if (!data.instagram_image && !data.instagram_description) return null;

  const menuItems = [
    { icon: '⌂', label: 'Home', active: true },
    { icon: '▻', label: 'Reels' },
    { icon: '✈', label: 'Messages' },
    { icon: '⌕', label: 'Search' },
    { icon: '⊙', label: 'Explore' },
    { icon: '♡', label: 'Notifications' },
    { icon: '＋', label: 'Create' },
    { icon: '▣', label: 'Dashboard' },
    { icon: '◉', label: 'Profile' },
    { icon: '☰', label: 'More' },
    { icon: '▦', label: 'Also from Meta' },
  ];

  return (
    <section className="instagramFullPagePreview">
      {/* <h2>Instagram Preview</h2> */}

      <div className="instagramFullShell">
        <aside className="igLeftNav">
          <div className="igLogoIcon">◎</div>

          <nav className="igSideMenu">
            {menuItems.map((item) => (
              <div
                key={item.label}
                className={`igMenuItem ${item.active ? 'active' : ''}`}
              >
                <span className="igMenuIcon">{item.icon}</span>
                <span className="igMenuLabel">{item.label}</span>
              </div>
            ))}
          </nav>
        </aside>

        <main className="igMainFeed">
          <article className="igPost">
            <div className="igPostHeader">
              <div className="igAvatarRing">
                <div className="pgMiniAvatar">PG</div>
              </div>

              <div className="igAccountInfo">
                <strong>propgateway</strong>
                <span>14 h</span>
              </div>

              <button className="igFollowBtn">Follow</button>
              <button className="igMoreBtn">•••</button>
            </div>

            {data.instagram_image && (
              <SmartImage
                src={data.instagram_image}
                alt={data.instagram_title || ''}
                className="igPostImage"
              />
            )}

            <div className="igActionRow">
              <span>♡</span>
              <span>💬</span>
              <span>↗</span>
              <span className="igSave">⌑</span>
            </div>

            <div className="igLikes">75.1K likes</div>

            <p className="igCaption">
              <strong>propgateway</strong>{' '}
              {data.instagram_description || data.instagram_title}
            </p>
          </article>
        </main>

        <aside className="igRightPanel">
          <div className="igProfileRow">
            <div className="igProfileAvatar">
              <div className="pgMiniAvatar">PG</div>
            </div>

            <div>
              <strong>propgateway</strong>
              <span>PropGateway</span>
            </div>

            <a>Switch</a>
          </div>

          <div className="igSuggestHead">
            <strong>Suggested for you</strong>
            <a>See all</a>
          </div>

          {[
            'Greater Noida Property',
            'Real Estate Investment',
            'Residential Plots',
            'Affordable Housing',
            'Property Updates',
          ].map((name) => (
            <div className="igSuggestRow" key={name}>
              <div className="igSuggestAvatar">
                <div className="pgMiniAvatar">PG</div>
              </div>

              <div>
                <strong>{name}</strong>
                <span>Suggested for you</span>
              </div>

              <a>Follow</a>
            </div>
          ))}

          <div className="igFooter">
            About · Help · Press · API · Jobs · Privacy · Terms · Locations ·
            Language · Meta Verified
            <br />
            <br />© 2026 INSTAGRAM FROM META
          </div>
        </aside>
      </div>
    </section>
  );
}

function FacebookPreview({ data }: { data: PageData }) {
  if (!data.facebook_image && !data.facebook_description) return null;

  return (
    <section className="facebookFullPagePreview">
      {/* <h2>Facebook Preview</h2> */}

      <div className="facebookFullShell">
        <aside className="fbFullLeftPanel">
          <div className="fbFullTopSearch">
            <div className="fbFullLogo">f</div>
            <div className="fbFullSearch">Search Facebook</div>
          </div>

          <h3>Manage Page</h3>

          <div className="fbFullPageRow">
            <div className="pgMiniAvatar">PG</div>
            <strong>PropGateway</strong>
            <span>⌄</span>
          </div>

          <div className="fbFullMenu">
            <span>Professional dashboard</span>
            <span>Insights</span>
            <span>Ad Center</span>
            <span>Create ads</span>
            <span>Boost Instagram post</span>
            <span>Settings</span>
            <span>Meta Verified</span>
            <span>Leads Center</span>
            <span>Meta Business Suite</span>
          </div>
        </aside>

        <main className="fbFullMain">
          <div className="fbFullTopNav">
            <span>⌂</span>
            <span>👥</span>
            <span>▣</span>
            <span>🏪</span>
            <span>◎</span>
          </div>

          <div className="fbFullPageHeader">
            <div>
              <div className="pgMiniAvatar">PG</div>
              <strong>PropGateway</strong>
            </div>
            <button>•••</button>
          </div>

          <div className="fbFullBody">
            <aside className="fbFullInfoCol">
              <div className="fbFullCard">
                <h3>Details</h3>
                <p>🕘 Open now</p>
                <p>📍 Greater Noida, Uttar Pradesh, India</p>

                <h3>Links</h3>
                <p>🔗 propgateway.com</p>

                <h3>Contact info</h3>
                <p>☎ Call for property consultation</p>
                <p>✉ info@propgateway.com</p>
              </div>

              <div className="fbFullCard">
                <div className="fbFullPhotosHead">
                  <h3>Photos</h3>
                  <a>See all photos</a>
                </div>

                <div className="fbFullPhotoGrid">
                  {[
                    data.facebook_image,
                    data.blog_image,
                    data.instagram_image,
                    data.blog_image,
                    data.facebook_image,
                    data.instagram_image,
                    data.blog_image,
                    data.facebook_image,
                    data.instagram_image,
                  ].map((img, index) =>
                    img ? (
                      <SmartImage
                        key={index}
                        src={img}
                        alt=""
                        className="fbFullPhotoThumb"
                      />
                    ) : null
                  )}
                </div>
              </div>
            </aside>

            <section className="fbFullFeedCol">
              <article className="fbFullPost">
                <div className="fbFullPostHeader">
                  <div className="pgMiniAvatar">PG</div>

                  <div>
                    <strong>PropGateway</strong>
                    <span>Just now · 🌐</span>
                  </div>

                  <button>•••</button>
                </div>

                {data.facebook_title && (
                  <p className="fbFullPostText">
                    <strong>{data.facebook_title}</strong>
                  </p>
                )}

                {data.facebook_description && (
                  <p className="fbFullPostText">{data.facebook_description}</p>
                )}

                {data.facebook_image && (
                  <div className="fbFullPostImageWrap">
                    <SmartImage
                      src={data.facebook_image}
                      alt={data.facebook_title || ''}
                      className="fbFullPostImage"
                    />
                  </div>
                )}

                <div className="fbFullStats">
                  <span>👍😮 7</span>
                  <span>2 comments · 209 views</span>
                </div>

                <div className="fbFullActions">
                  <span>👍 Like</span>
                  <span>💬 Comment</span>
                  <span>↗ Share</span>
                </div>
              </article>
            </section>
          </div>
        </main>
      </div>
    </section>
  );
}

function App() {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const id = new URLSearchParams(window.location.search).get('id');

        if (!id) {
          setError('Missing content id');
          return;
        }

        const result = await fetchContentById(id);

        if (!result) {
          setError('Content not found');
          return;
        }

        setData(result);
      } catch (err) {
        console.error(err);
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div className="status">Loading...</div>;
  if (error || !data) return <div className="status">{error}</div>;

  return (
    <main>
      <BlogPreview data={data} />
      <InstagramPreview data={data} />
      <FacebookPreview data={data} />
    </main>
  );
}

export default App;