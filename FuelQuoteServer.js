function getSeasonFromDate(d) {
    let month = d.getMonth() + 1;

    let season = '';

    switch(month.toString()) {
        case '12':
        case '1':
        case '2':
            season = 'winter';
            break;
        case '3':
        case '4':
        case '5':
            season = 'spring';
            break;
        case '6':
        case '7':
        case '8':
            season = 'summer';
            break;
        case '9':
        case '10':
        case '11':
            season = 'fall';
            break;
    }

    return season;
}

function dateFromString(string)
{
    let day   = parseInt(string.substring(8, 10));
    let month  = parseInt(string.substring(5, 7));
    let year   = parseInt(string.substring(0, 4));

    return new Date(year, month - 1, day);
}