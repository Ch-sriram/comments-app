import db, { collections } from '../firebase';
import { CollectionTypes, DocumentTypes } from '../types';

const { comments } = collections;

type Comment = DocumentTypes.Comment;
type Comments = CollectionTypes.Comments;
export type CommentCreateRequestType = {
  userId?: string | null;
  userName?: string;
  createdAt: string;
  commentTextBody: string;
  parentCommentId: string | null;
};
  
export const getAllComments = async () => {
  const allDocs = await db.getDocs(comments);
  const allComments: Comments = [];
  allDocs.forEach(doc => {
    allComments.push({ id: doc.id, ...doc.data() } as Comment);
  });
  return allComments;
};

export const createComment = async ({
  userId = 'anonymous-user',
  userName = 'anonymous',
  createdAt,
  commentTextBody,
  parentCommentId = null
}: CommentCreateRequestType) => {
  const addedCommentRef = await db.addDoc(comments, {
    userId,
    userName,
    createdAt,
    parentId: parentCommentId,
    commentTextBody,
    upvotes: 0,
    downvotes: 0
  } as Partial<Comment>);
  return await getCommentById({ commentId: addedCommentRef.id });
};

export const getCommentById = async({ commentId }: { commentId: string }) => {
  const docRef = db.doc(comments, commentId);
  const snapshot = await db.getDoc(docRef);
  return snapshot.data() as Comment;
};

export const updateCommentById = async({ commentId, commentTextBody }: { commentId: string, commentTextBody: string }) => {
  const docRef = db.doc(comments, commentId);
  await db.updateDoc(docRef, { commentTextBody });
}
