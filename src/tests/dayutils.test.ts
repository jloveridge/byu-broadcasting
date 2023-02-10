import { parseDayRanges, getDayOfWeekIdx, nextDayIdx } from '../utils';

describe('getDayOfWeekIdx', () => {
    it('should return 0 for Sun', () => {
        expect( getDayOfWeekIdx( 'Sun' ) ).toEqual( 0 );
    });
    it('should return 1 for Mon', () => {
        expect( getDayOfWeekIdx( 'Mon' ) ).toEqual( 1 );
    });
    it('should return 2 for Tue', () => {
        expect( getDayOfWeekIdx( 'Tue' ) ).toEqual( 2 );
    });
    it('should return 3 for Wed', () => {
        expect( getDayOfWeekIdx( 'Wed' ) ).toEqual( 3 );
    });
    it('should return 4 for Thu', () => {
        expect( getDayOfWeekIdx( 'Thu' ) ).toEqual( 4 );
    });
    it('should return 5 for Fri', () => {
        expect( getDayOfWeekIdx( 'Fri' ) ).toEqual( 5 );
    });
    it('should return 6 for Sat', () => {
        expect( getDayOfWeekIdx( 'Sat' ) ).toEqual( 6 );
    });
});

describe('nextDayIdx', () => {
    it('should handle rolling over from Sat -> Sun', () => {
        expect( nextDayIdx( 6) ).toEqual( 0 );
    });
    [ 0, 1, 2, 3, 4, 5 ].forEach( dayIdx => {
        it(`given ${dayIdx} should return ${ dayIdx + 1 }`, () => {
            expect( nextDayIdx( dayIdx ) ).toEqual( dayIdx + 1);
        });
    });
});

describe('parseDayRanges', () => {
    it('given a single day should return a single value', () => {
        expect( parseDayRanges( [ 'Mon' ] ) ).toEqual( new Set([ 1 ]) );
    });
    it('given a range should return all indexes within the range (inclusive)', () => {
        expect( parseDayRanges( [ 'Mon-Wed' ] ) ).toEqual( new Set([ 1, 2, 3 ]) );
    });
    it('given multiple ranges it should return the appropriate values', () => {
        expect( parseDayRanges( [ 'Mon-Wed', 'Fri-Sat' ] ) ).toEqual( new Set([ 1, 2, 3, 5, 6 ]) );
    });
    it('given a range and a single day should return appropriate values', () => {
        expect( parseDayRanges( [ 'Mon-Tue', 'Thu' ] ) ).toEqual( new Set([ 1, 2, 4 ]) );
    });
    it('should handle Sat-Sun range', () => {
        expect( parseDayRanges( [ 'Sat-Sun' ] ) ).toEqual( new Set([ 6, 0 ]) );
    });
});
