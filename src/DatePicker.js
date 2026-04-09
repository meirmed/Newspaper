import { useState } from 'react';
import './DatePicker.css';

const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
const DAYS_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function formatDate(year, month, day, language) {
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

export default function DatePicker({ onGenerateDate, onGenerateYear, language, error, mode, setMode }) {
  const isHe = language === 'he';
  const [pickerVal, setPickerVal] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [mDay, setMDay] = useState('');
  const [mMonth, setMMonth] = useState('');
  const [mYear, setMYear] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [inputError, setInputError] = useState('');

  function limitInput(val, max) {
    return val.replace(/\D/g, '').slice(0, max);
  }

  function handlePickerSubmit(e) {
    e.preventDefault();
    setInputError('');
    if (!pickerVal) { setInputError(isHe ? 'אנא בחר תאריך' : 'Please select a date'); return; }
    const [y, m, d] = pickerVal.split('-').map(Number);
    onGenerateDate(formatDate(y, m, d, language));
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    setInputError('');
    const d = parseInt(mDay, 10), m = parseInt(mMonth, 10), y = parseInt(mYear, 10);
    if (!d || !m || !y) { setInputError(isHe ? 'אנא מלא את כל השדות' : 'Please fill all fields'); return; }
    if (m < 1 || m > 12) { setInputError(isHe ? 'חודש לא תקין' : 'Invalid month'); return; }
    if (d < 1 || d > 31) { setInputError(isHe ? 'יום לא תקין' : 'Invalid day'); return; }
    if (y < 1800 || y > 2024) { setInputError(isHe ? 'שנה לא תקינה (1800-2024)' : 'Invalid year (1800–2024)'); return; }
    const dateObj = new Date(y, m - 1, d);
    if (dateObj.getMonth() !== m - 1) { setInputError(isHe ? 'תאריך לא קיים' : 'Date does not exist'); return; }
    onGenerateDate(formatDate(y, m, d, language));
  }

  function handleYearSubmit(e) {
    e.preventDefault();
    setInputError('');
    const y = parseInt(birthYear, 10);
    if (!y || y < 1800 || y > 2024) { setInputError(isHe ? 'שנה לא תקינה (1800-2024)' : 'Invalid year (1800–2024)'); return; }
    onGenerateYear(y);
  }

  return (
    <div className="picker-wrap">
      <div className="picker-card">
        <div className="nameplate-en">{isHe ? '' : 'The Chronicle of Time'}</div>
        <div className="nameplate-he">{isHe ? 'דברי הימים — כרוניקת הזמן' : '"All the History That\'s Fit to Print"'}</div>
        <div className="thick-rule" />
        <p className="intro">
          {isHe
            ? 'הכנס תאריך — יום הולדת, יום נישואין, או כל רגע בזמן — וקבל עמוד שער היסטורי.'
            : 'Enter any date — a birthday, anniversary, or moment in time — and receive a historical front page.'}
        </p>

        <div className="mode-tabs">
          <button className={mode === 'date' ? 'active' : ''} onClick={() => { setMode('date'); setInputError(''); }}>
            {isHe ? 'תאריך מלא' : 'Full Date'}
          </button>
          <button className={mode === 'year' ? 'active' : ''} onClick={() => { setMode('year'); setInputError(''); }}>
            {isHe ? 'שנת לידה' : 'Birth Year'}
          </button>
        </div>

        {mode === 'date' ? (
          <>
            <div className="manual-label">
              {isHe ? 'הקלד תאריך ידנית, או בחר מלוח שנה:' : 'Type the date manually, or choose from calendar:'}
            </div>
            {!showManual ? (
              <form onSubmit={handlePickerSubmit} className="picker-form">
                <input
                  type="date"
                  className="date-input"
                  value={pickerVal}
                  min="1800-01-01"
                  max="2024-12-31"
                  onChange={e => setPickerVal(e.target.value)}
                />
                <button type="button" className="toggle-link" onClick={() => { setInputError(''); setShowManual(true); }}>
                  {isHe ? 'הקלד תאריך ידנית' : 'Type date manually instead'}
                </button>
                <button type="submit" className="print-btn">
                  {isHe ? 'הדפס מהדורה' : 'Print Edition'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleManualSubmit} className="picker-form">
                <div className="dmy-row" dir="ltr">
                  <div className="dmy-field">
                    <label>{isHe ? 'יום' : 'Day'}</label>
                    <input type="text" className="dmy-input" placeholder="DD" maxLength="2"
                      value={mDay} onChange={e => setMDay(limitInput(e.target.value, 2))} inputMode="numeric" />
                  </div>
                  <div className="dmy-sep">/</div>
                  <div className="dmy-field">
                    <label>{isHe ? 'חודש' : 'Month'}</label>
                    <input type="text" className="dmy-input" placeholder="MM" maxLength="2"
                      value={mMonth} onChange={e => setMMonth(limitInput(e.target.value, 2))} inputMode="numeric" />
                  </div>
                  <div className="dmy-sep">/</div>
                  <div className="dmy-field dmy-field--year">
                    <label>{isHe ? 'שנה' : 'Year'}</label>
                    <input type="text" className="dmy-input" placeholder="YYYY" maxLength="4"
                      value={mYear} onChange={e => setMYear(limitInput(e.target.value, 4))} inputMode="numeric" />
                  </div>
                </div>
                <button type="button" className="toggle-link" onClick={() => { setInputError(''); setShowManual(false); }}>
                  {isHe ? 'חזור לבחירת תאריך' : 'Use date picker instead'}
                </button>
                <button type="submit" className="print-btn">
                  {isHe ? 'הדפס מהדורה' : 'Print Edition'}
                </button>
              </form>
            )}
          </>
        ) : (
          <>
            <div className="manual-label">
              {isHe
                ? 'הכנס שנת לידה וקבל עיתון מיוחד על השנה שנולדת:'
                : 'Enter a birth year and get a special edition about the year you were born:'}
            </div>
            <form onSubmit={handleYearSubmit} className="picker-form">
              <input
                type="text"
                className="date-input year-input"
                placeholder={isHe ? 'למשל: 1974' : 'e.g. 1974'}
                value={birthYear}
                maxLength="4"
                onChange={e => setBirthYear(limitInput(e.target.value, 4))}
                inputMode="numeric"
              />
              <button type="submit" className="print-btn">
                {isHe ? 'הדפס מהדורת שנה' : 'Print Year Edition'}
              </button>
            </form>
          </>
        )}

        {(inputError || error) && <p className="error-msg">{inputError || error}</p>}
      </div>
    </div>
  );
}
