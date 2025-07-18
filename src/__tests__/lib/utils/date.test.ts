import { isToday, formatDate, getTodayString } from "@/lib/utils/date";

describe("Date Utils", () => {
  describe("isToday", () => {
    test("같은 날짜 타임스탬프는 true를 반환해야 함", () => {
      const today = new Date();
      const currentDate = today.toDateString();
      const timestamp = today.getTime();

      expect(isToday(timestamp, currentDate)).toBe(true);
    });

    test("다른 날짜 타임스탬프는 false를 반환해야 함", () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const currentDate = today.toDateString();
      const timestamp = yesterday.getTime();

      expect(isToday(timestamp, currentDate)).toBe(false);
    });

    test("타임스탬프가 0일 때 false를 반환해야 함", () => {
      const currentDate = new Date().toDateString();

      expect(isToday(0, currentDate)).toBe(false);
    });

    test("타임스탬프가 null이나 undefined일 때 false를 반환해야 함", () => {
      const currentDate = new Date().toDateString();

      expect(isToday(null as unknown as number, currentDate)).toBe(false);
      expect(isToday(undefined as unknown as number, currentDate)).toBe(false);
    });
  });

  describe("formatDate", () => {
    test("타임스탬프를 올바른 로케일 날짜 문자열로 변환해야 함", () => {
      const timestamp = new Date("2024-01-15").getTime();
      const formatted = formatDate(timestamp);

      expect(formatted).toBe("1/15/2024");
    });

    test("다른 타임스탬프도 올바르게 변환해야 함", () => {
      const timestamp = new Date("2023-12-25").getTime();
      const formatted = formatDate(timestamp);

      expect(formatted).toBe("12/25/2023");
    });
  });

  describe("getTodayString", () => {
    test("현재 날짜를 문자열로 반환해야 함", () => {
      const today = new Date();
      const expected = today.toDateString();

      expect(getTodayString()).toBe(expected);
    });

    test("반환되는 문자열이 유효한 날짜 형식이어야 함", () => {
      const result = getTodayString();
      const date = new Date(result);

      expect(date.toDateString()).toBe(result);
    });
  });
});
