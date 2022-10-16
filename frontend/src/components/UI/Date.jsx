const ymd = {year: "numeric", month: "numeric", day: "numeric"};
const hms = {hour: "numeric", minute: "numeric", second: "numeric", hour12: false};

const fdate = new Intl.DateTimeFormat("en-CA", ymd);
const ftime = new Intl.DateTimeFormat("en-CA", hms);
const fdatetime = new Intl.DateTimeFormat("en-CA", {...ymd, ...hms});

const leadingZero = n =>
  (n < 10 ? "0" : "") + String(n)

function duration(ms = 0) {
  const h = Math.floor(ms / 60 / 60)
  const m = Math.floor(ms / 60) % 60
  const s = Math.floor(ms) % 60
  return [leadingZero(h), leadingZero(m), leadingZero(s)].join(":")
}

function format(dtf, datetime) {
  switch (datetime?.constructor) {
    case Date:
      return dtf.format(datetime);
    case String:
      try {
        return dtf.format(
          datetime ? new Date(Date.parse(datetime)) : new Date()
        );
      }
      catch (err) {
        throw Error(`could not parse date from string: ${datetime}`);
      }
    default:
      return dtf.format(new Date());
  }
}

const Date_ = ({ children }) => format(fdate, children);
const Time = ({ children }) => format(ftime, children);
const DateTime = ({ children }) => format(fdatetime, children);
const Duration = ({ children = 0.0 }) => duration(children)

export { Date_ as Date, Time, DateTime, Duration, duration }
