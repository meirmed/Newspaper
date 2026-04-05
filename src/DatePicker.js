import { useState } from 'react';
import './DatePicker.css';

const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
const DAYS_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function formatDate(val, language) {
  const [year, month, day] = val.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  if (language === 'he') {
    return {
      formattedDate: `${day} ב${MONTHS_HE[month - 1]} ${year}`,
      month: String(month).padStart(2, '0'),
      day: String(day).padStart(2, '0'),
      year: String(year),
    };
  }
  return {
    formattedDate: `${DAYS_EN[d.getDay()]}, ${MONTHS_EN[month - 1]} ${day}, ${year}`,
    month: String(month).padStart(2, '0'),
    day: String(day).padStart(2, '0'),
    year: String(year),
  };
}

function parseManualDate(text) {
  text = text.trim();
  const slashMatch = text.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (slashMatch) {
    const d = parseInt(slashMatch[1], 10);
    const m = parseInt(slashMatch[2], 10);
    const y = parseInt(slashMatch[3], 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1800 && y <= 2024)
      return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }
  const isoMatch = text.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10);
    const d = parseInt(isoMatch[3], 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1800 && y <= 2024)
      return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }
  for (let i = 0; i < MONTHS_EN.length; i++) {
    const mName = MONTHS_EN[i];
    const mNameHe = MONTHS_HE[i];
    const mNum = i + 1;
    const r1 = new RegExp(`^(?:${mName}|${mNameHe})\\s+(\\d{1,2})[,\\s]+(\\d{4})$`, 'i');
    const r2 = new RegExp(`^(\\d{1,2})\\s+(?:${mName}|${mNameHe})[,\\s]+(\\d{4})$`, 'i');
    const m1 = text.match(r1);
    const m2 = text.match(r2);
    if (m1) { const d2 = parseInt(m1[1],10), y = parseInt(m1[2],10); if (y>=1800&&y<=2024) return `${y}-${String(mNum).padStart(2,'0')}-${String(d2).padStart(2,'0')}`; }
    if (m2) { const d2 = parseInt(m2[1],10), y = parseInt(m2[2],10); if (y>=1800&&y<=2024) return `${y}-${String(mNum).padStart(2,'0')}-${String(d2).padStart(2,'0')}`; }
  }
  return null;
}

export default function DatePicker({ onGenerate, language, error }) {
  const isHe = language === 'he';
  const [manualVal, setManualVal] = useState('');
  const [manualError, setManualError] = useState('');
  const [inputMode, setInputMode] = useState('picker');

  function handlePickerSubmit(e) {
    e.preventDefault();
    const val = e.target.dateInput.value;
    if (!val) return;
    onGenerate(formatDate(val, language));
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    setManualError('');
    const parsed = parseManualDate(manualVal);
    if (!parsed) {
      setManualError(isHe ? 'פורמט לא תקין. נסה: DD/MM/YYYY למשל 20/06/1974' : 'Invalid format. Try: DD/MM/YYYY e.g. 20/06/1974');
      return;
    }
    onGenerate(formatDate(parsed, language));
  }

  return (
    <div className="picker-wrap">
      <div className="picker-card">
        <div className="nameplate-en">The Chronicle of Time</div>
        {isHe && <div className="nameplate-he">דברי הימים — כרוניקת הזמן</div>}
        <div className="tagline">
          {isHe ? '"כל ההיסטוריה הראויה לדפוס"' : '"All the History That\'s Fit to Print"'}
        </div>
        <div className="thick-rule" />
        <p className="intro">
          {isHe
            ? 'בחר תאריך — יום הולדת, יום נישואין, או כל רגע בזמן — וקבל עמוד שער היסטורי.'
            : 'Enter any date — a birthday, anniversary, or moment in time — and receive a historical front page.'}
        </p>

        <div className="mode-toggle">
          <button type="button" className={inputMode === 'picker' ? 'active' : ''} onClick={() => setInputMode('picker')}>
            {isHe ? 'בחר תאריך' : 'Date Picker'}
          </button>
          <button type="button" className={inputMode === 'manual' ? 'active' : ''} onClick={() => setInputMode('manual')}>
            {isHe ? 'הקלד תאריך' : 'Type Date'}
          </button>
        </div>

        {inputMode === 'picker' ? (
          <form onSubmit={handlePickerSubmit} className="picker-form">
            <input type="date" name="dateInput" className="date-input" min="1800-01-01" max="2024-12-31" required />
            <button type="submit" className="print-btn">{isHe ? 'הדפס מהדורה' : 'Print Edition'}</button>
          </form>
        ) : (
          <form onSubmit={handleManualSubmit} className="picker-form">
            <input
              type="text"
              className="date-input"
              placeholder={isHe ? 'למשל: 20/06/1974' : 'e.g. 20/06/1974'}
              value={manualVal}
              onChange={e => setManualVal(e.target.value)}
              inputMode="decimal"
            />
            <button type="submit" className="print-btn">{isHe ? 'הדפס מהדורה' : 'Print Edition'}</button>
            {manualError && <p className="error-msg">{manualError}</p>}
          </form>
        )}

        {error && <p className="error-msg">{error}</p>}
      </div>
    </div>
  );
}
