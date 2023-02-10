import { toOperatingHours } from '../utils';

describe('toOperatingHours', () => {
    it('should handle simple case of "Mon-Wed 10 am - 10 pm" properly', () => {
        expect( toOperatingHours( [ "Mon-Wed 10 am - 10 pm" ] ) ).toEqual([
            { dayIdx: 1, start: 1000, end: 2200 },
            { dayIdx: 2, start: 1000, end: 2200 },
            { dayIdx: 3, start: 1000, end: 2200 },
        ]);
    });
    it('should handle case of hours extending into the following day', () => {
        expect( toOperatingHours( ["Mon-Tue 10 am - 1 am"] ) ).toEqual([
            { dayIdx: 1, start: 1000, end: 2500 },
            { dayIdx: 2, start: 0, end: 100 },
            { dayIdx: 2, start: 1000, end: 2500 },
            { dayIdx: 3, start: 0, end: 100 },
        ]);
    });
    it('should handle multiple day ranges and a single time range', () => {
        expect( toOperatingHours( [ "Mon-Tue, Thu-Fri 10 am - 10 pm" ] ) ).toEqual([
            { dayIdx: 1, start: 1000, end: 2200 },
            { dayIdx: 2, start: 1000, end: 2200 },
            // no entry for Wednesday since they are closed
            { dayIdx: 4, start: 1000, end: 2200 },
            { dayIdx: 5, start: 1000, end: 2200 },
        ]);
    });
    it('should handle multiple ranges', () => {
        const times = [
            "Mon 10 am - 10 pm",
            "Wed-Thu, Sat 10 am - 11 pm",
        ];
        expect( toOperatingHours( times ) ).toEqual([
            { dayIdx: 1, start: 1000, end: 2200 },
            // closed on Tuesday
            { dayIdx: 3, start: 1000, end: 2300 },
            { dayIdx: 4, start: 1000, end: 2300 },
            // closed on Friday
            { dayIdx: 6, start: 1000, end: 2300 },
        ]);
    });
});
