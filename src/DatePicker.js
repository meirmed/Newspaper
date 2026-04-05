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

export default function DatePicker({ onGenerate, language, error }) {
  const isHe = language === 'he';
  const [val, setVal] = useState('');
  const [inputError, setInputError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setInputError('');
    if (!val) {
      setInputError(isHe ? 'אנא הכנס תאריך' : 'Please enter a date');
      return;
    }
    onGenerate(formatDate(val, language));
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
        <form onSubmit={handleSubmit} className="picker-form">
          <input
            type="date"
            className="date-input"
            value={val}
            min="1800-01-01"
            max="2024-12-31"
            onChange={e => setVal(e.target.value)}
          />
          <button type="submit" className="print-btn">
            {isHe ? 'הדפס מהדורה' : 'Print Edition'}
          </button>
        </form>
        {(inputError || error) && <p className="error-msg">{inputError || error}</p>}
      </div>
    </div>
  );
}
