import { useState } from 'react';
import DatePicker from './DatePicker';
import Newspaper from './Newspaper';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function App() {
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [printedDate, setPrintedDate] = useState('');

  async function handleGenerate(dateObj) {
    setError('');
    setData(null);
    setLoading(true);

    const { formattedDate, month, day, year } = dateObj;
    setPrintedDate(formattedDate);

    try {
      const res = await fetch(`${API_URL}/api/newspaper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formattedDate, month, day, year, language }),
      });
      if (!res.ok) throw new Error('Server error ' + res.status);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(language === 'he' ? 'שגיאה בטעינה, אנא נסה שוב.' : 'Failed to load. Please try again.');
    }
    setLoading(false);
  }

  function handleReset() {
    setData(null);
    setError('');
  }

  const isHe = language === 'he';

  return (
    <div className="app" dir={isHe ? 'rtl' : 'ltr'}>
      <div className="lang-toggle">
        <button
          className={language === 'en' ? 'active' : ''}
          onClick={() => { setLanguage('en'); setData(null); }}
        >EN</button>
        <button
          className={language === 'he' ? 'active' : ''}
          onClick={() => { setLanguage('he'); setData(null); }}
        >עב</button>
      </div>

      {!data && !loading && (
        <DatePicker onGenerate={handleGenerate} language={language} error={error} />
      )}

      {loading && (
        <div className="loading-screen">
          <div className="press-anim">
            {[20,30,24,16,28].map((h, i) => (
              <div key={i} className="bar" style={{ height: h, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <p className="loading-text">
            {isHe ? 'המדפיסות פועלות...' : 'The presses are rolling...'}
          </p>
          <p className="loading-sub">{printedDate}</p>
        </div>
      )}

      {data && !loading && (
        <>
          <button className="back-btn" onClick={handleReset}>
            {isHe ? '← מהדורה חדשה' : '← New Edition'}
          </button>
          <Newspaper data={data} formattedDate={printedDate} language={language} />
        </>
      )}
    </div>
  );
}
