export type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  biography?: string;
  profilePictureUrl?: string;
  createdAt: string;
  isAdmin: boolean;
};
