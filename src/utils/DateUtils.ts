export class DateUtils {
    public static startOfDay(date: Date): Date {
        const tmp = new Date(date);
        return new Date(tmp.setUTCHours(0, 0, 0, 0));
    }

    public static endOfDay(date: Date): Date {
        const tmp = new Date(date);
        return new Date(tmp.setUTCHours(23, 59, 59, 999));
    }

    public static startOfWeek(date: Date): Date {
        const dayOfWeek = new Date(date).getDay();

        const start = new Date(date);
        start.setDate(date.getDate() - dayOfWeek);
        start.setUTCHours(0, 0, 0, 0);
        return start;
    }

    public static endOfWeek(date: Date): Date {
        const dayOfWeek = new Date(date).getDay();

        const end = new Date(date);
        end.setDate(date.getDate() + (7 - dayOfWeek));
        end.setUTCHours(23, 59, 59, 999);
        return end;
    }

    public static startOfMonth(date: Date): Date {
        const start = new Date(date);
        start.setDate(1);
        start.setUTCHours(0, 0, 0, 0);
        return start;
    }

    public static endOfMonth(date: Date): Date {
        const lastDayOfCurMonth = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
        const end = new Date(date);
        end.setDate(lastDayOfCurMonth);
        end.setUTCHours(23, 59, 59, 999);
        return end;
    }

    public static isAfter(toTest: Date, ref: Date): boolean {
        return new Date(toTest).getTime() > new Date(ref).getTime();
    }

    public static isBefore(toTest: Date, ref: Date): boolean {
        return new Date(toTest).getTime() < new Date(ref).getTime();
    }

    public static sameDay(toTest: Date, ref: Date): boolean {
        const start = this.startOfDay(toTest);
        const end = this.endOfDay(toTest);

        return this.isAfter(ref, start) && this.isBefore(ref, end);
    }

    public static sameWeek(toTest: Date, ref: Date): boolean {
        const dayOfWeek = new Date(ref).getDay();

        const start = new Date(ref);
        start.setDate(ref.getDate() - dayOfWeek);

        const end = new Date(ref);
        end.setDate(ref.getDate() + (7 - dayOfWeek));

        return this.isAfter(toTest, start) && this.isBefore(toTest, end);
    }

    public static sameMonth(toTest: Date, ref: Date): boolean {
        const start = this.startOfMonth(ref);
        const end = this.endOfMonth(ref);

        return this.isAfter(toTest, start) && this.isBefore(toTest, end);
    }

    public static between(toTest: Date, start: Date, end: Date): boolean {
        return this.isAfter(toTest, start) && this.isBefore(toTest, end);
    }
}
