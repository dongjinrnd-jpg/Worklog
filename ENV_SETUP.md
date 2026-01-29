# 환경 변수 설정 방법

이 프로젝트는 Google Sheets API를 사용하여 데이터를 관리합니다. 프로젝트를 실행하기 위해서는 다음 환경 변수를 설정해야 합니다.

## 1. 환경 변수 파일 생성

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```
# Google Sheets API 연결 설정
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email@example.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
```

각 환경 변수를 실제 값으로 대체해야 합니다.

## 2. Google Cloud Console에서 서비스 계정 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속합니다.
2. 프로젝트를 생성하거나 기존 프로젝트를 선택합니다.
3. Google Sheets API를 활성화합니다.
4. 서비스 계정을 생성합니다:
   - "IAM 및 관리" > "서비스 계정" 메뉴로 이동
   - "서비스 계정 만들기" 버튼 클릭
   - 서비스 계정 이름과 설명 입력
   - 권한 설정 (편집자 권한 권장)
   - 서비스 계정 생성 완료
5. 서비스 계정에 대한 JSON 키 파일을 생성합니다:
   - 생성된 서비스 계정 클릭
   - "키" 탭 선택
   - "키 추가" > "새 키 만들기" 클릭
   - "JSON" 선택 후 "만들기" 클릭
   - 키 파일 다운로드 (안전하게 보관)

## 3. 스프레드시트 공유 설정

1. 사용할 Google 스프레드시트를 엽니다.
2. "공유" 버튼 클릭
3. 서비스 계정 이메일 주소 입력 (예: your_service_account_email@example.iam.gserviceaccount.com)
4. "편집자" 권한 부여
5. 알림 체크 해제 (선택 사항)
6. "공유" 버튼 클릭

## 4. 환경 변수 값 설정

1. `GOOGLE_SPREADSHEET_ID`: 스프레드시트 URL에서 ID 부분 추출
   - URL 형식: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`
   - URL에서 `[SPREADSHEET_ID]` 부분만 복사하여 설정

2. `GOOGLE_SERVICE_ACCOUNT_EMAIL`: 서비스 계정 이메일 주소
   - 형식: `[name]@[project-id].iam.gserviceaccount.com`

3. `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`: 다운로드한 JSON 키 파일에서 `private_key` 값
   - JSON 파일 열기
   - `private_key` 값 복사 (따옴표 포함)
   - 환경 변수에 설정 (줄바꿈 문자 `\n` 유지 필요)

## 주의사항

- `.env.local` 파일은 절대 공개 저장소에 커밋하지 마세요.
- `.gitignore` 파일에 `.env.local`이 포함되어 있는지 확인하세요.
- 서비스 계정 키는 비밀 정보이므로 안전하게 관리해야 합니다. 