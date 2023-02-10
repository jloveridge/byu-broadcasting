import { getDayOfWeekIdx, getTimeParts, Restaurant, toIntTime, toOperatingHours, OperatingHours } from "./utils";

export function loadData(data: { name: string, times: string[] }[] ) {
    const restaurants: Restaurant[] = [];
    for ( const entry of data ) {
        restaurants.push({
            name: entry.name,
            hours: toOperatingHours( entry.times ),
        });
    }
    return restaurants;
}

/**
 * Returns the names of open restaruants
 * @param db the data to search for open restaraunts
 * @param date date for the search
 * @returns 
 */
export function findOpen(db: Restaurant[], date: Date) {
    const dayIdx = getDayOfWeekIdx( date );
    const { hourMin, amOrPm } = getTimeParts( date );
    const timeInt = toIntTime( hourMin, amOrPm );
    // console.log(`Finding open restaurants for ${dayIdx} ${hourMin} ${amOrPm} (${timeInt})`);
    const names = db.filter( x => x.hours.some( item => isTimeInRange( item, timeInt, dayIdx ) ) ).map( x => x.name );
    return names;
}

/**
 * Returns `true` if the day and time are valid for the given `OperatingHours` entry
 * @param item the `OperatingHours` entry to compare
 * @param timeInt integer time used in the check
 * @param dayIdx
 * @param inclusive when `true` start and end times are inclusive (default); exclusive when`false` 
 * @returns 
 */
export function isTimeInRange(item: OperatingHours, timeInt: number, dayIdx: number, inclusive = true): boolean {
    if ( dayIdx !== item.dayIdx ) { return false; }
    if ( inclusive ) {
        return ( item.start <= timeInt && item.end >= timeInt );
    } else {
        return ( item.start < timeInt && item.end > timeInt );
    }
}
