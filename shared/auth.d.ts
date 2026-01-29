declare module '#auth-utils' {
  interface User {
    id: string;
    subjectId: string;
    employeeId: string;
    name: string;
    email: string;
    department: string;
    position: string;
    isAdmin: boolean;
    isSuperAdmin: boolean;
  }
}

export {};
