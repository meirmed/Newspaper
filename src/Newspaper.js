import './Newspaper.css';

export default function Newspaper({ data, formattedDate, language }) {
  const isHe = language === 'he';
  const year = formattedDate.split(/\s|,/).find(p => /^\d{4}$/.test(p)) || '';

  const births = (data.notableBirths || []).map((b, i) => (
    <li key={i}>
      <span className="born-year">{b.year}</span>
      <span>{b.name}{b.note && <em> — {b.note}</em>}</span>
    </li>
  ));

  const curiosities = (data.curiosities || []).map((c, i) => (
    <div key={i} className="curi">
      <div className="curi-title">{c.title}</div>
      <div className="curi-body">{c.body}</div>
    </div>
  ));

  return (
    <div className={`np ${isHe ? 'rtl' : 'ltr'}`}>
      <div className="dateline">
        <span>{isHe ? 'מאז שחר ההיסטוריה' : 'Est. Since The Dawn of History'}</span>
        <span>{formattedDate}</span>
        <span>{isHe ? `כרך ${year}` : `Vol. ${year} · No. 1`}</span>
      </div>

      <div className="nameplate-en">The Chronicle of Time</div>
      {isHe && <div className="nameplate-he">דברי הימים — כרוניקת הזמן</div>}
      <div className="np-tagline">
        {isHe ? '"כל ההיסטוריה הראויה לדפוס"' : '"All the History That\'s Fit to Print"'}
      </div>
      <div className="thick-rule" />

      <h1 className="main-hed">{data.mainHeadline}</h1>
      <p className="main-deck">{data.mainDeck}</p>
      <p className="main-body">{data.mainBody}</p>

      <div className="cols3">
        {[
          { tag: data.col1Tag, hed: data.col1Headline, body: data.col1Body },
          { tag: data.col2Tag, hed: data.col2Headline, body: data.col2Body },
          { tag: data.col3Tag, hed: data.col3Headline, body: data.col3Body },
        ].map((col, i) => (
          <div key={i} className="col">
            <span className="col-tag">{col.tag}</span>
            <div className="col-hed">{col.hed}</div>
            <div className="col-body">{col.body}</div>
          </div>
        ))}
      </div>

      <div className="bottom">
        <div className="bcol">
          <div className="sec-label">{isHe ? 'סקרנות ולוח שנה' : 'Curiosities & Almanac'}</div>
          {curiosities}
        </div>
        <div className="bcol">
          <div className="sec-label">{isHe ? 'ילידי יום זה' : 'Notable Births on This Date'}</div>
          <ul className="born-list">{births}</ul>
        </div>
      </div>

      <hr className="foot-rule" />
      <div className="foot-txt">
        {isHe
          ? 'נדפס על ידי דברי הימים · ההיסטוריה אינה ישנה לעולם'
          : 'Printed by The Chronicle of Time · History never sleeps'}
      </div>
    </div>
  );
}
