// Used to indicate the time range goes into the next day
const DAY_THRESHOLD = 2400;
const DAY_OF_WEEK = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];

export interface Restaurant {
    name: string;
    hours: OperatingHours[];
};

export interface OperatingHours {
    /** 0-6 indicating Sun-Sat  */
    dayIdx: number;
    /** start of range */
    start: number;
    /** end of range, a value > 2400 means the end time goes into the following day*/
    end: number;
};

export interface TimeRange {
    /** start of the time range */
    start: number;
    /** end of the range, if > 2400 range goes into subesquent day */
    end: number;
}

/**
 * Converts day of week and time information into the internal format
 * ```
 * // given: ["Mon-Wed 5 pm - 12:30 am", "Thu-Fri 5 pm - 1:30 am", "Sat 3 pm - 1:30 am", "Sun 3 pm - 11:30 pm"]
 * // outputs: [
 *   { day: 1, start: 1700, end: 2430 },
 *   { day: 2, start:    0, end:   30 },
 *   { day: 2, start: 1700, end: 2430 },
 *   { day: 3, start:    0, end:   30 },
 *   { day: 3, start: 1700, end: 2430 },
 *   { day: 4, start:    0, end:   30 },
 *   { day: 4, start: 1700, end: 2530 },
 *   { day: 5, start:    0, end:  130 },
 *   { day: 5, start: 1700, end: 2530 },
 *   { day: 6, start:    0, end:  130 },
 *   { day: 6, start: 1500, end: 2530 },
 *   { day: 0, start:    0, end:  130 },
 *   { day: 0, start: 1500, end: 2330 },
 * ]
 * ```
 * @param times 
 */
export function toOperatingHours(times: string[]) {
    const hours: OperatingHours[] = [];
    times.forEach( dayTimeStr => {
        const parts = dayTimeStr.split( /[ ,]/ ).map( x => x.trim() ).filter( x => !!x );
        const timeRange = parseTimeRange( parts.slice( -5 ) );
        const days = parseDayRanges( parts.slice( 0, parts.length - 5 ) );
        for ( const dayIdx of days  ) {
            hours.push({ dayIdx, start: timeRange.start, end: timeRange.end });
            if ( timeRange.end >= DAY_THRESHOLD ) {
                hours.push( { dayIdx: nextDayIdx( dayIdx ), start: 0, end: timeRange.end - DAY_THRESHOLD });
            }
        }
    });
    return hours;
}

/**
 * Returns the index position for the day of the week given a date/string.
 * @param val date or string with a valid day of week short name
 * @returns the index within the DAY_OF_WEEK
 */
export function getDayOfWeekIdx(val: Date | string | undefined): number {
    if ( !val ) { return -1; }
    const dayName = typeof val === 'string' ? val : val.toLocaleString('en-us', { weekday: 'short' } );
    return DAY_OF_WEEK.indexOf( dayName );
}

/**
 * Returns the index for the next day 
 * @param dayIdx 
 * @returns 
 */
export function nextDayIdx(dayIdx: number) {
    dayIdx++;
    if ( dayIdx === DAY_OF_WEEK.length ) { dayIdx = 0; }
    return dayIdx;
}

/**
 * Given an array of day ranges returns the day index of each day within the ranges
 * @param dayRanges
 */
export function parseDayRanges(dayRanges: string[]) {
    const dayIdxs = new Set<number>();
    for ( const range of dayRanges ) {
        const [ start, end ] = range.split( '-' );
        let dayIdx = getDayOfWeekIdx( start );
        let endIdx = getDayOfWeekIdx( end );
        dayIdxs.add( dayIdx );
        while ( endIdx !== -1 && dayIdx !== endIdx ) {
            dayIdx = nextDayIdx( dayIdx );
            dayIdxs.add( dayIdx );
        }
    }
    return dayIdxs;
}

/**
 * Parses out the time components from a day time string
 * @param dayTimeStr
 */
export function parseTimeRange([ startTime, startA, , endTime, endA ]: string[]) {
    const range = {
        start: toIntTime( startTime, startA ),
        end: toIntTime( endTime, endA ),
    };
    if ( range.end < range.start ) {
        // the time range goes into the next day
        range.end += DAY_THRESHOLD;
    }
    return range;
}

/**
 * Converts a time string into an integer representation
 * @param time string indicating a given time eg. 9:30 am
 * @returns 
 */
export function toIntTime(time: string = '0', amPm: string = 'am'): number {
    const lowerAmPm = amPm.toLowerCase();
    let [ hour, minutes ] = time.split(':').map( x => parseInt( x, 10 ));
    if ( hour < 12 && lowerAmPm === 'pm' ) {
        hour += 12;
    } else if ( hour === 12 && lowerAmPm === 'am' ) {
        hour -= 12;
    }
    return ( hour * 100 ) + ( minutes || 0 );
}

/**
 * Given either a Date object or a string in the format of HH:MM AM/PM return
 * time and AM/PM portions as separate elements so they can be used with toIntTime
 * @param val
 */
export function getTimeParts(val: Date | string): { hourMin: string, amOrPm: string } {
    const [ hourMin, amOrPm ] = ((typeof val === 'string') ? val : val.toLocaleString('en-us', { timeStyle: 'short' })).split(/\s+/).map( x => x.trim() );
    return { hourMin, amOrPm };
}
