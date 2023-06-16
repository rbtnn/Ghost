export const getDateString = (isoDate) => {
    if (!isoDate) {
        return '';
    }
    const event = new Date(isoDate);
    const options = {year: 'numeric', month: 'short', day: 'numeric'};
    return event.toLocaleDateString('en-GB', options);
};

export const getDateStringJa = (isoDate) => {
    var ss = getDateString(isoDate).split(' ');
    var dateJa = '';
    if (3 === ss.length) {
        switch (ss[1]) {
        case 'Jan': dateJa = ss[2] + '年1月' + ss[0] + '日'; break;
        case 'Feb': dateJa = ss[2] + '年2月' + ss[0] + '日'; break;
        case 'Mar': dateJa = ss[2] + '年3月' + ss[0] + '日'; break;
        case 'Apr': dateJa = ss[2] + '年4月' + ss[0] + '日'; break;
        case 'May': dateJa = ss[2] + '年5月' + ss[0] + '日'; break;
        case 'Jun': dateJa = ss[2] + '年6月' + ss[0] + '日'; break;
        case 'Jul': dateJa = ss[2] + '年7月' + ss[0] + '日'; break;
        case 'Aug': dateJa = ss[2] + '年8月' + ss[0] + '日'; break;
        case 'Sep': dateJa = ss[2] + '年9月' + ss[0] + '日'; break;
        case 'Oct': dateJa = ss[2] + '年10月' + ss[0] + '日'; break;
        case 'Nov': dateJa = ss[2] + '年11月' + ss[0] + '日'; break;
        case 'Dec': dateJa = ss[2] + '年12月' + ss[0] + '日'; break;
        default: break;
        }
    }
    if (0 === dateJa.length) {
        dateJa = getDateString(isoDate);
    }
    return dateJa;
};
