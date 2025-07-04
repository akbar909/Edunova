import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    role: string;
    isApproved: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      isApproved: boolean;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    isApproved: boolean;
  }
}