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
export type CommentIdRequestType = {
  commentId: string;
}
export interface CommentUpdateRequestType {
  commentId: string;
  commentTextBody?: string;
  upvotedBy?: Array<DocumentTypes.UserId>;
}
  
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
    upvotedBy: []
  } as Partial<Comment>);
  return await getCommentById({ commentId: addedCommentRef.id });
};

export const getCommentById = async({ commentId }: CommentIdRequestType) => {
  const docRef = db.doc(comments, commentId);
  const snapshot = await db.getDoc(docRef);
  return { ...snapshot.data(), id: commentId } as Comment;
};

export const updateCommentById = async({ commentId, commentTextBody, upvotedBy }: CommentUpdateRequestType) => {
  const docRef = db.doc(comments, commentId);
  if (!commentTextBody && !upvotedBy) return;
  const updatePayload = {
    ...(commentTextBody ? { commentTextBody } : {}),
    ...(upvotedBy ? { upvotedBy } : {})
  } as Partial<Comment>;
  await db.updateDoc(docRef, updatePayload);
}

export const archiveComment = async({ commentId }: CommentIdRequestType) => {
  const docRef = db.doc(comments, commentId);
  await db.updateDoc(docRef, { isArchived: true });
}

export const purgeComment = async ({ commentId }: CommentIdRequestType) => {
  const docRef = db.doc(comments, commentId);
  await db.deleteDoc(docRef);
}

export const purgeAllComments = async () => {
  const allDocs = await db.getDocs(comments);
  allDocs.forEach(async (doc) => await purgeComment({ commentId: doc.id }));
}
