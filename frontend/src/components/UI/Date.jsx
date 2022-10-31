const ymd = {year: "numeric", month: "numeric", day: "numeric"};
const hms = {hour: "numeric", minute: "numeric", second: "numeric", hour12: false};

const fdate = new Intl.DateTimeFormat([], ymd);
const ftime = new Intl.DateTimeFormat([], hms);
const fdatetime = new Intl.DateTimeFormat([], {...ymd, ...hms});

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

export { Date_ as Date, Time, DateTime };
