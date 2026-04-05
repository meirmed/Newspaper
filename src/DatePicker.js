import { useState } from 'react';
import './DatePicker.css';

const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
const DAYS_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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

export default function DatePicker({ onGenerate, language, error }) {
  const isHe = language === 'he';

  // Desktop state
  const [pickerVal, setPickerVal] = useState('');

  // Mobile state
  const [mDay, setMDay] = useState('');
  const [mMonth, setMMonth] = useState('');
  const [mYear, setMYear] = useState('');

  const [inputError, setInputError] = useState('');

  function handleDesktopSubmit(e) {
    e.preventDefault();
    setInputError('');
    if (!pickerVal) {
      setInputError(isHe ? 'אנא הכנס תאריך' : 'Please enter a date');
      return;
    }
    const [y, m, d] = pickerVal.split('-').map(Number);
    onGenerate(formatDate(y, m, d, language));
  }

  function handleMobileSubmit(e) {
    e.preventDefault();
    setInputError('');
    const d = parseInt(mDay, 10);
    const m = parseInt(mMonth, 10);
    const y = parseInt(mYear, 10);
    if (!d || !m || !y) {
      setInputError(isHe ? 'אנא מלא יום, חודש ושנה' : 'Please fill in day, month and year');
      return;
    }
    if (m < 1 || m > 12) { setInputError(isHe ? 'חודש לא תקין (1-12)' : 'Invalid month (1-12)'); return; }
    if (d < 1 || d > 31) { setInputError(isHe ? 'יום לא תקין (1-31)' : 'Invalid day (1-31)'); return; }
    if (y < 1800 || y > 2024) { setInputError(isHe ? 'שנה לא תקינה (1800-2024)' : 'Invalid year (1800-2024)'); return; }
    const dateObj = new Date(y, m - 1, d);
    if (dateObj.getMonth() !== m - 1) { setInputError(isHe ? 'תאריך לא קיים' : 'Date does not exist'); return; }
    onGenerate(formatDate(y, m, d, language));
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

        {!isMobile ? (
          <form onSubmit={handleDesktopSubmit} className="picker-form">
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
          </form>
        ) : (
          <form onSubmit={handleMobileSubmit} className="picker-form">
            <div className="dmy-row" dir="ltr">
              <div className="dmy-field">
                <label>{isHe ? 'יום' : 'Day'}</label>
                <input
                  type="number"
                  className="dmy-input"
                  placeholder="DD"
                  min="1" max="31"
                  value={mDay}
                  onChange={e => setMDay(e.target.value)}
                  inputMode="numeric"
                />
              </div>
              <div className="dmy-sep">/</div>
              <div className="dmy-field">
                <label>{isHe ? 'חודש' : 'Month'}</label>
                <input
                  type="number"
                  className="dmy-input"
                  placeholder="MM"
                  min="1" max="12"
                  value={mMonth}
                  onChange={e => setMMonth(e.target.value)}
                  inputMode="numeric"
                />
              </div>
              <div className="dmy-sep">/</div>
              <div className="dmy-field dmy-field--year">
                <label>{isHe ? 'שנה' : 'Year'}</label>
                <input
                  type="number"
                  className="dmy-input"
                  placeholder="YYYY"
                  min="1800" max="2024"
                  value={mYear}
                  onChange={e => setMYear(e.target.value)}
                  inputMode="numeric"
                />
              </div>
            </div>
            <button type="submit" className="print-btn">
              {isHe ? 'הדפס מהדורה' : 'Print Edition'}
            </button>
          </form>
        )}

        {(inputError || error) && <p className="error-msg">{inputError || error}</p>}
      </div>
    </div>
  );
}
