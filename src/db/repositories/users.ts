import db, { collections } from '../firebase';
import { CollectionTypes, DocumentTypes } from '../types';

const { users } = collections;

type User = DocumentTypes.User;
type Users = CollectionTypes.Users;
  
export const getAllUsers = async () => {
  const allDocs = await db.getDocs(users);
  const allUsers: Users = [];
  allDocs.forEach(doc => allUsers.push({ id: doc.id, ...doc.data() } as User));
  return allUsers;
};

export const createUser = async ({ name }: { name: string }) => {
  const addedUserRef = await db.addDoc(users, { name } as Partial<User>);
  return await getUserById({ userId: addedUserRef.id });
};

export const getUserById = async({ userId }: { userId: string }) => {
  const docRef = db.doc(users, userId);
  const snapshot = await db.getDoc(docRef);
  return { id: snapshot.id, ...snapshot.data() } as User;
};
