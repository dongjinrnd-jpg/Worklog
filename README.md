# 업무일지 웹앱

Google Sheets를 백엔드로 활용하는 업무일지 관리 웹앱입니다.

## 기능

- 업무일지 작성 및 조회
- 프로젝트 정보 관리
- 담당자 관리
- Google Sheets 연동을 통한 데이터 저장

## 개발 환경 설정

### 필수 조건

- Node.js 16.x 이상
- Google Cloud Platform 계정
- Google Sheets API 활성화 및 서비스 계정

### 설치 방법

1. 저장소 클론

```bash
git clone https://github.com/yourusername/worklog-app.git
cd worklog-app
```

2. 의존성 설치

```bash
npm install
```

3. 환경 변수 설정

`.env.local.example` 파일을 복사하여 `.env.local` 파일을 생성하고 필요한 값을 설정합니다.

```bash
cp .env.local.example .env.local
```

`.env.local` 파일 내용:

```
# Google Sheets API 연동을 위한 환경변수
# 서비스 계정 이메일
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@example.iam.gserviceaccount.com

# 스프레드시트 ID
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id

# 서비스 계정 Private Key (개행문자를 \n으로 대체해야 함)
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# 개발 환경 설정
NODE_ENV=development
```

4. 개발 서버 실행

```bash
npm run dev
```

5. 브라우저에서 접속

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## Google Sheets API 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. Google Sheets API 활성화
3. 서비스 계정 생성 및 JSON 키 파일 다운로드
4. 서비스 계정 이메일을 스프레드시트에 편집자로 공유
5. JSON 키 파일의 client_email 및 private_key 값을 환경 변수에 설정

## 배포

Vercel이나 다른 호스팅 서비스를 이용하여 배포할 수 있습니다.

```bash
npm run build
```

## 기술 스택

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Google Sheets API](https://developers.google.com/sheets/api)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
