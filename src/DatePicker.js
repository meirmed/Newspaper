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

function validateAndGenerate(day, month, year, language, setError, onGenerate, isHe) {
  const d = parseInt(day, 10), m = parseInt(month, 10), y = parseInt(year, 10);
  if (!d || !m || !y) { setError(isHe ? 'אנא מלא את כל השדות' : 'Please fill all fields'); return; }
  if (m < 1 || m > 12) { setError(isHe ? 'חודש לא תקין (1-12)' : 'Invalid month (1–12)'); return; }
  if (d < 1 || d > 31) { setError(isHe ? 'יום לא תקין (1-31)' : 'Invalid day (1–31)'); return; }
  if (y < 1800 || y > 2024) { setError(isHe ? 'שנה לא תקינה (1800-2024)' : 'Invalid year (1800–2024)'); return; }
  const dateObj = new Date(y, m - 1, d);
  if (dateObj.getMonth() !== m - 1) { setError(isHe ? 'תאריך לא קיים' : 'Date does not exist'); return; }
  setError('');
  onGenerate(formatDate(y, m, d, language));
}

export default function DatePicker({ onGenerate, language, error }) {
  const isHe = language === 'he';
  const [pickerVal, setPickerVal] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [mDay, setMDay] = useState('');
  const [mMonth, setMMonth] = useState('');
  const [mYear, setMYear] = useState('');
  const [inputError, setInputError] = useState('');

  function handlePickerSubmit(e) {
    e.preventDefault();
    setInputError('');
    if (!pickerVal) { setInputError(isHe ? 'אנא בחר תאריך' : 'Please select a date'); return; }
    const [y, m, d] = pickerVal.split('-').map(Number);
    onGenerate(formatDate(y, m, d, language));
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    validateAndGenerate(mDay, mMonth, mYear, language, setInputError, onGenerate, isHe);
  }

  function limitInput(val, max) {
    const num = val.replace(/\D/g, '');
    return num.slice(0, max);
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
            ? 'הכנס תאריך — יום הולדת, יום נישואין, או כל רגע בזמן — וקבל עמוד שער היסטורי.'
            : 'Enter any date — a birthday, anniversary, or moment in time — and receive a historical front page.'}
        </p>

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
            <button type="submit" className="print-btn">
              {isHe ? 'הדפס מהדורה' : 'Print Edition'}
            </button>
            <button type="button" className="toggle-link" onClick={() => { setInputError(''); setShowManual(true); }}>
              {isHe ? 'הקלד תאריך ידנית' : 'Type date manually'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleManualSubmit} className="picker-form">
            <div className="dmy-row" dir="ltr">
              <div className="dmy-field">
                <label>{isHe ? 'יום' : 'Day'}</label>
                <input
                  type="text"
                  className="dmy-input"
                  placeholder="DD"
                  maxLength="2"
                  value={mDay}
                  onChange={e => setMDay(limitInput(e.target.value, 2))}
                  inputMode="numeric"
                />
              </div>
              <div className="dmy-sep">/</div>
              <div className="dmy-field">
                <label>{isHe ? 'חודש' : 'Month'}</label>
                <input
                  type="text"
                  className="dmy-input"
                  placeholder="MM"
                  maxLength="2"
                  value={mMonth}
                  onChange={e => setMMonth(limitInput(e.target.value, 2))}
                  inputMode="numeric"
                />
              </div>
              <div className="dmy-sep">/</div>
              <div className="dmy-field dmy-field--year">
                <label>{isHe ? 'שנה' : 'Year'}</label>
                <input
                  type="text"
                  className="dmy-input"
                  placeholder="YYYY"
                  maxLength="4"
                  value={mYear}
                  onChange={e => setMYear(limitInput(e.target.value, 4))}
                  inputMode="numeric"
                />
              </div>
            </div>
            <button type="submit" className="print-btn">
              {isHe ? 'הדפס מהדורה' : 'Print Edition'}
            </button>
            <button type="button" className="toggle-link" onClick={() => { setInputError(''); setShowManual(false); }}>
              {isHe ? 'חזור לבחירת תאריך' : 'Use date picker instead'}
            </button>
          </form>
        )}

        {(inputError || error) && <p className="error-msg">{inputError || error}</p>}
      </div>
    </div>
  );
}
