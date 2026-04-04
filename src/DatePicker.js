import './DatePicker.css';

const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
const DAYS_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function formatDate(val, language) {
  const [year, month, day] = val.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  if (language === 'he') {
    const months = MONTHS_HE;
    return {
      formattedDate: `${day} ב${months[month - 1]} ${year}`,
      month: String(month).padStart(2, '0'),
      day: String(day).padStart(2, '0'),
      year: String(year),
    };
  }
  const dayName = DAYS_EN[d.getDay()];
  const months = MONTHS_EN;
  return {
    formattedDate: `${dayName}, ${months[month - 1]} ${day}, ${year}`,
    month: String(month).padStart(2, '0'),
    day: String(day).padStart(2, '0'),
    year: String(year),
  };
}

export default function DatePicker({ onGenerate, language, error }) {
  const isHe = language === 'he';

  function handleSubmit(e) {
    e.preventDefault();
    const val = e.target.dateInput.value;
    if (!val) return;
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
            ? 'בחר תאריך — יום הולדת, יום נישואין, או כל רגע בזמן — וקבל עמוד שער היסטורי.'
            : 'Enter any date — a birthday, anniversary, or moment in time — and receive a historical front page.'}
        </p>
        <form onSubmit={handleSubmit} className="picker-form">
          <input
            type="date"
            name="dateInput"
            className="date-input"
            min="1800-01-01"
            max="2024-12-31"
            required
          />
          <button type="submit" className="print-btn">
            {isHe ? 'הדפס מהדורה' : 'Print Edition'}
          </button>
        </form>
        {error && <p className="error-msg">{error}</p>}
      </div>
    </div>
  );
}
