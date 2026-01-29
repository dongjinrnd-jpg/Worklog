declare module 'googleapis' {
  export const google: {
    auth: {
      JWT: any;
      GoogleAuth: any;
    };
    sheets: (options: { version: string; auth: any }) => {
      spreadsheets: {
        get: (params: any) => Promise<any>;
        batchUpdate: (params: any) => Promise<any>;
        values: {
          get: (params: any) => Promise<any>;
          append: (params: any) => Promise<any>;
          update: (params: any) => Promise<any>;
        };
      };
    };
  };
} 