import { toIntTime, getTimeParts, parseTimeRange } from '../utils';

describe('toIntTime', () => {
    it('should default to am', () => {
        expect( toIntTime('9') ).toEqual(900);
    });
    it('should handle specifying am/pm', () => {
        expect( toIntTime('9', 'am') ).toEqual( 900 );
        expect( toIntTime('9', 'AM') ).toEqual( 900 );
        expect( toIntTime('1', 'pm') ).toEqual( 1300 );
        expect( toIntTime('1', 'PM') ).toEqual( 1300 );
    });
    it('should handle HH:MM time formats', () => {
        expect( toIntTime('8:30') ).toEqual( 830 );
        expect( toIntTime('1:30', 'pm') ).toEqual( 1330 );
    });
    it('should handle 12:00 AM - 12:59 AM properly (zero hour)', () => {
        expect( toIntTime('12', 'am') ).toEqual( 0 );
        expect( toIntTime('12:30', 'am') ).toEqual( 30 );
        expect( toIntTime('12:59', 'am') ).toEqual( 59 );
    });
});

describe('getTimeParts', () => {
    const isoString = '2023-02-09T22:30:00Z';
    const apiDate = '2023-02-09T15:30';

    it('should handle strings properly', () => {
        expect( getTimeParts('9 am') ).toEqual( { hourMin: '9', amOrPm: 'am' } );
        expect( getTimeParts('9:30 am') ).toEqual( { hourMin: '9:30', amOrPm: 'am' } );
        expect( getTimeParts('9:30 PM') ).toEqual( { hourMin: '9:30', amOrPm: 'PM' } );
    });
    it('should handle dates appropriately', () => {
        const date = new Date( isoString );
        expect( getTimeParts( date) ).toEqual( { hourMin: '3:30', amOrPm: 'PM' } );
    });
    it('should handle parsed Date properly', () => {
        const date = new Date( Date.parse(apiDate) );
        expect( getTimeParts( date) ).toEqual( { hourMin: '3:30', amOrPm: 'PM' } );
    });
});

describe('parseTimeRange', () => {
    it('should return a range with end < 2400', () => {
        const range = ['10', 'am', '-', '11:30', 'pm'];
        const result = parseTimeRange( range );
        expect( result.start ).toEqual( 1000 );
        expect( result.end ).toEqual( 2330 );
    });
    it('should return a range ending at 2400 (midnight)', () => {
        const range = ['10', 'am', '-', '12:00', 'am'];
        const result = parseTimeRange( range );
        expect( result.start ).toEqual( 1000 );
        expect( result.end ).toEqual( 2400 );
    });
    it('should return a range ending at 2500 (next day 1 am)', () => {
        const range = ['10', 'am', '-', '1:00', 'am'];
        const result = parseTimeRange( range );
        expect( result.start ).toEqual( 1000 );
        expect( result.end ).toEqual( 2500 );
    });
});
