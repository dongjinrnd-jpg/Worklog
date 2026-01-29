"use server";

import { unstable_cache as cache } from "next/cache";
import { getGoogleSheetsClient, getSpreadsheetId } from "@/lib/google/sheets";

/**
 * 담당자 데이터 인터페이스
 * 담당자 항목의 데이터 구조를 정의합니다.
 */
export interface Manager {
  id: string;
  rank: string;
  name: string;
}

/**
 * 담당자 목록을 가져오는 함수
 * 모든 담당자 데이터를 스프레드시트에서 조회합니다.
 */
export const getManagers = cache(
  async (): Promise<Manager[]> => {
    try {
      console.log("담당자 목록 조회 시작...");
      
      const sheets = await getGoogleSheetsClient();
      const spreadsheetId = await getSpreadsheetId();

      // 담당자 시트에서 데이터 조회
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "담당자!A2:B", // A2부터 B열까지의 모든 데이터 (직급, 이름)
      });

      const rows = response.data.values;

      if (!rows || rows.length === 0) {
        console.log("담당자 데이터 없음");
        return [];
      }

      console.log(`담당자 ${rows.length}명 조회 완료`);
      
      // 데이터를 객체 형태로 변환
      return rows.map((row: string[], index: number): Manager => ({
        id: index.toString(),
        rank: row[0] || "",
        name: row[1] || "",
      }));
    } catch (error) {
      console.error("담당자 데이터 조회 실패:", error);
      throw new Error("담당자 데이터를 가져오는 중 오류가 발생했습니다.");
    }
  },
  ["managers"],
  {
    revalidate: 3600, // 1시간마다 캐시 재검증
    tags: ["managers"],
  }
); 