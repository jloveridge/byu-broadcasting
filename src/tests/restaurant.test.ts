import { findOpen, isTimeInRange, loadData } from '../restaurant';

describe('isTimeInRange', () => {
    const item = { dayIdx: 1, start: 1000, end: 2200 };
    describe('(inclusive range)', () => {
        it('should return true if time between range', () => {
            expect( isTimeInRange( item, 1100, 1 )).toEqual( true );
        });
        it('should return true on begining of range', () => {
            expect( isTimeInRange( item, 1000, 1 )).toEqual( true );
        });
        it('should return true on end of range', () => {
            expect( isTimeInRange( item, 2200, 1 )).toEqual( true );
        });
        it('should return false if dayIdx does not match', () => {
            expect( isTimeInRange( item, 1100, 2 )).toEqual( false );
        });
    });
    describe('(exclusive range)', () => {
        it('should return true for value between range', () => {
            expect( isTimeInRange( item, 1100, 1, false )).toEqual( true );
        });
        it('should return false for value at start of range', () => {
            expect( isTimeInRange( item, 1000, 1, false )).toEqual( false );
        });
        it('should return false for value at end of range', () => {
            expect( isTimeInRange( item, 2200, 1, false )).toEqual( false );
        });
    });
});

describe('loadData', () => {
    it('should convert times format into operating hours format', () => {
        const timesData = [
            {
                name: 'Open on Weekdays',
                times: [
                    "Mon-Fri 10 am - 10 pm",
                ],
            }
        ];
        expect( loadData( timesData ) ).toEqual([
            {
                name: 'Open on Weekdays',
                hours: [
                    { dayIdx: 1, start: 1000, end: 2200 },
                    { dayIdx: 2, start: 1000, end: 2200 },
                    { dayIdx: 3, start: 1000, end: 2200 },
                    { dayIdx: 4, start: 1000, end: 2200 },
                    { dayIdx: 5, start: 1000, end: 2200 },
                ],
            },
        ]);
    });
});

describe('findOpen', () => {
    const weekdaysAt1PM = [
        new Date( Date.parse('2023-02-06T13:00:00') ),
        new Date( Date.parse('2023-02-07T13:00:00') ),
        new Date( Date.parse('2023-02-08T13:00:00') ),
        new Date( Date.parse('2023-02-09T13:00:00') ),
        new Date( Date.parse('2023-02-10T13:00:00') ),
    ];
    const weekendsAt1PM = [
        new Date( Date.parse('2023-02-11T13:00:00') ),
        new Date( Date.parse('2023-02-12T13:00:00') ),
    ];

    describe('weekdays only', () => {
        const db = loadData([ { name: 'Weekdays only', times: ['Mon-Fri 10 am - 10 pm'] } ] );
        it('should return an empty array if checking a date on Sat or Sun', () => {
            for ( const date of weekendsAt1PM ) {
                expect( findOpen( db, date ) ).toEqual( [] );
            }
        });
        it('should return an array with "Weekdays only" as the only element for any weekday at 1 PM', () => {
            for ( const date of weekdaysAt1PM ) {
                expect( findOpen( db, date ) ).toEqual( [ "Weekdays only" ] );
            }
        });
    });
    describe('hours extend to the following day', () => {
        const db = loadData([ { name: 'Weekdays only', times: ['Mon-Fri 10 am - 1 am'] } ] );
        it('should return array with Weekdays only if date is Saturday at 12:30 AM', () => {
            const date = new Date( Date.parse("2023-02-11T01:00:00") );
            expect( findOpen( db, date ) ).toEqual( [ "Weekdays only" ] );
        });
        it('should not find any open restaurants for Sunday at 1:00 AM', () => {
            const date = new Date( Date.parse("2023-02-12T01:00:00") );
            expect( findOpen( db, date ) ).toEqual( [] );
        });
    });
    describe('multiple matches', () => {
        const sunday1PM = weekendsAt1PM[1];
        const db = loadData([
            { name: 'Weekdays only', times: [ 'Mon-Fri 10 am - 10 pm' ] },
            { name: 'Everyday', times: [ 'Mon-Thu 10 am - 10 pm', 'Fri-Sat 10 am - 1 am', 'Sun 10 am - 12 am' ] },
            { name: 'Weekends only', times: [ 'Sat-Sun 10 am - 12 am' ] },
        ]);
        it('should not include "Weekdays only"', () => {
            expect( findOpen( db, sunday1PM ) ).toEqual([ 'Everyday', 'Weekends only' ] );
        });
        it('should only return "Everyday"', () => {
            const dates = [
                new Date( Date.parse('2023-02-11T01:00:00') ), // Sat 1 AM
                new Date( Date.parse('2023-02-12T01:00:00') ), // Sun 1 AM
            ];
            for ( const date of dates ) {
                expect( findOpen( db, date ) ).toEqual( [ 'Everyday' ] );
            }
        });
        it('should not find any open restaurants for Mon at 1 AM', () => {
            const monday1AM = new Date( Date.parse('2023-02-13T01:00:00') );
            expect( findOpen( db, monday1AM ) ).toEqual( [] );
        });
        it('should return "Everyday" and "Weekends only"', () => {
            const dates = [
                new Date( Date.parse('2023-02-12T00:00:00') ), // Sun 12 AM
                new Date( Date.parse('2023-02-13T00:00:00') ), // Mon 12 AM
            ];
            for ( const date of dates ) {
                const result = findOpen( db, date );
                const expected = [ 'Everyday', 'Weekends only' ];
                expect( result ).toEqual( expected );
            }
        });
        it('should only return "Everyday" when checking Sat at 12 AM', () => {
            const date = new Date( Date.parse('2023-02-11T00:00:00') ); // Sat 12 AM
            expect( findOpen( db, date ) ).toEqual( [ 'Everyday' ] );
        });
    });
});
