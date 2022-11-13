import * as React from 'react';
import styled from 'styled-components';
import {
  getAllComments,
  createComment,
  updateCommentById,
  // archiveComment,
  // purgeComment
} from '../../db/repositories/comments';
import { createUser, getAllUsers } from '../../db/repositories/users';
import { CollectionTypes, DocumentTypes } from '../../db/types';
import CommentForm, { SubmitLabel } from './components/Comments/Form/CommentForm';
import { useStore, StoreKeys } from './store';
import { CommentActionClickFnType, CommentMetadata } from './components/Comments/RenderComment';
import { CommentAction } from './components/util';
import AllComments from './components/Comments/AllComments';

const NewCommentPostSection = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: space-around;
  height: 180px;
  margin-bottom: 20px;
`;

const CommentsSection = styled.section`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  margin: 0;
  font: 32px 'Noto Sans', sans-serif;
  text-transform: uppercase;
`;

const Heading = styled.h4`
  font-size: 26px;
  margin-top: 14px;
  margin-bottom: 5px;
`;

const fakeCommentId = 'fakeComment';

export enum ActiveComment {
  REPLY = 'reply',
  EDIT = 'edit',
  DELETE = 'delete'
}

export type CommentType = `${ActiveComment}`;

export interface AppProps {
  children?: React.ReactNode;
}

export const createdAtComparator = <T extends DocumentTypes.Comment>(commentA: T, commentB: T) =>
  new Date(commentB.createdAt).getTime() - new Date(commentA.createdAt).getTime();

const CommentsApp = () => {
  const { store } = useStore();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [users, setUsers] = React.useState<CollectionTypes.Users>([]);
  const [comments, setComments] = React.useState<Array<CommentMetadata>>([]);

  const fetchAllComments = async () => {
    const allComments = (await getAllComments()).sort(createdAtComparator);
    console.log('fetchAllComments', allComments);
    return allComments;
  }
  
  /**
   * Triggered when user clicks on any comment reply.
   * @param commentId considered to be the `parentId` for the dummy comment that'll be added for rendering a reply form
   */
  const onReplyClick: CommentActionClickFnType = commentId => {
    console.log('onReplyClick', commentId);
    const commentsWithoutStaleRepliesAndEdits = comments.reduce((acc, c) => {
      if (c.commentType === CommentAction.REPLY || c.id === fakeCommentId) {
        return acc;
      }
      if (c.commentType === CommentAction.EDIT) {
        return [...acc, { ...c, commentType: undefined }];
      }
      return [...acc, { ...c }];
    }, [] as CommentMetadata[]).sort(createdAtComparator);
    
    const userId = store.get(StoreKeys.USER_ID)!;
    const userName = (users.find(user => user.id === userId))?.name || undefined;
    const replyWithoutCommentId = {
      id: fakeCommentId,
      commentType: CommentAction.REPLY,
      commentTextBody: '',
      createdAt: new Date().toISOString(),
      downvotes: 0,
      upvotes: 0,
      parentId: commentId,
      userId,
      userName
    } as CommentMetadata;
    setComments([replyWithoutCommentId, ...commentsWithoutStaleRepliesAndEdits]);
  };

  // WIP
  // const onDeleteClick = async (commentId: string) => {
  //   try {
  //     if (window.confirm('Are you sure you want to delete the comment?')) {
  //       const doesCommentContainReplies = comments.some(c => c.parentId === commentId);
  //       if (doesCommentContainReplies) {
  //         await archiveComment({ commentId });
  //         const commentsCopy = comments.map(c => ({ ...c }) as CommentMetadata);
  //         const archivedCommentIndex = commentsCopy.findIndex(c => c.id === commentId);
  //         commentsCopy[archivedCommentIndex].isArchived = true;
  //         setComments(commentsCopy);
  //       } else {
  //         await purgeComment({ commentId });
          
  //       }
  //     }
  //   } catch (err: any) {
  //     console.error(err, 'comment could not be deleted!');
  //   }
  // };

  /**
   * Triggered when user clicks on any comment edit, if edit is available.
   * @param commentId is the `commentId` of the comment that's being edited.
   */
  const onEditClick: CommentActionClickFnType = commentId => {
    console.log('onEditClick', commentId);
    const commentsCopyWithoutStaleRepliesOrEdits = comments.reduce((acc, c) => {
      if (c.commentType === CommentAction.REPLY) {
        return acc;
      }
      if (c.id === commentId) {
        return [...acc, { ...c, commentType: CommentAction.EDIT } as CommentMetadata];
      }
      if (c.commentType === CommentAction.EDIT) {
        return [...acc, { ...c, commentType: undefined }];
      }
      return [...acc, { ...c }];
    }, [] as CommentMetadata[]);
    setComments(commentsCopyWithoutStaleRepliesOrEdits);
  };

  /**
   * 
   * @param commentTextBody comment's text body, the comment might just have a body already existing.
   * @param commentId unique identifier for the comment that's about to be edited.
   */
  const onEditSubmit = async (commentTextBody: string, commentId: string) => {
    console.log('onEditSubmit', commentId);
    await updateCommentById({ commentTextBody, commentId });
    const commentsCopy = comments.map(c => ({ ...c }) as CommentMetadata);
    const editedCommentIndex = commentsCopy.findIndex(c => c.id === commentId);
    console.log(commentsCopy[editedCommentIndex]);
    if (editedCommentIndex >= 0) {
      commentsCopy[editedCommentIndex].commentTextBody = commentTextBody;
      commentsCopy[editedCommentIndex].commentType = undefined;
      setComments(commentsCopy);
    }
  };

  /**
   * 
   * @param commentTextBody replied comment's body.
   * @param parentCommentId if `null`, then it's a comment with no parent (*i.e.* new top-level comment), otherwise, there's a comment which is parent to it.
   */
  const onReplySubmit = async (commentTextBody: string, parentCommentId: string | null) => {
    console.log('onReplySubmit', parentCommentId);
    const newComment = await getNewAddedComment(commentTextBody, parentCommentId);
    const commentsCopy = comments.map(c => ({ ...c }) as CommentMetadata);
    const replyCommentIndex = commentsCopy.findIndex(c => c.id === fakeCommentId);
    console.log(commentsCopy[replyCommentIndex]);
    console.log(newComment);
    commentsCopy[replyCommentIndex] = newComment;
    setComments(commentsCopy);
  }

  const checkAndSetUserInStore = async (allUsers: CollectionTypes.Users) => {
    const currentUserId = store.get(StoreKeys.USER_ID);
    if (!currentUserId) {
      const username = window.prompt("What's your name?")?.trim();
      if (!username || username.length > 18) {
        window.alert("Username too long. Max Length: 18 characters. Note: Initial & Trailing Spaces will be removed.");
        checkAndSetUserInStore(allUsers);
        return;
      }
      const newUser = await createUser({ name: username });
      store.set(StoreKeys.USER_ID, newUser.id);
    }
    store.set(StoreKeys.ALL_USERS, JSON.stringify(allUsers));
  }

  const fetchAllUsers = async () => {
    const allUsers = await getAllUsers();
    setUsers(allUsers);
    await checkAndSetUserInStore(allUsers);
    return allUsers;
  };

  const onMountFetch = async () => {
    setLoading(true);
    const allUsers = await fetchAllUsers();
    const allComments = await fetchAllComments();
    const userTuplesIterable = allUsers.reduce((usersTillNow, user) => {
      const { id, name } = user;
      return [...usersTillNow, [id, name] as [string, string]];
    }, [] as [string, string][]);
    const userIdMap = new Map(userTuplesIterable);
    const allCommentsWithUserName = allComments.reduce((commentsTillNow, comment) => {
      const userName = userIdMap.get(comment.userId);
      return [...commentsTillNow, { ...comment, userName } as CommentMetadata];
    }, [] as CommentMetadata[]);
    setComments(allCommentsWithUserName);
    setLoading(false);
  }

  const getNewAddedComment = async (commentTextBody: string, parentId?: string | null) => {
    const createdAt = new Date().toISOString();
    const userId = store.get(StoreKeys.USER_ID);
    const userName = users.find(user => user.id === userId)!.name;
    const parentCommentId = parentId || null;
    const payload = { userId, userName, parentCommentId, commentTextBody, createdAt };
    return { ...(await createComment(payload)), userName, commentType: undefined } as CommentMetadata;
  }

  const addNewComment = async (commentTextBody: string, parentId?: string) =>
    setComments([await getNewAddedComment(commentTextBody, parentId), ...comments]);

  /**
   * Triggered on cancelling either the Edit/Reply when commenting.
   */
  const onCancel = () => {
    const commentsWithNoRepliesAndEdits = comments.reduce((acc, c) => {
      if (c.commentType === CommentAction.EDIT) {
        return [...acc, { ...c, commentType: undefined }];
      }
      if (c.commentType === CommentAction.REPLY) {
        if (c.id === fakeCommentId) {
          return acc;
        } else {
          return [...acc, { ...c, commentType: undefined }];
        }
      }
      return [...acc, { ...c }];
    }, [] as CommentMetadata[]);
    setComments(commentsWithNoRepliesAndEdits);
  };

  // Effects: onMount
  React.useEffect(() => {
    onMountFetch();
    return () => {
      setUsers([]);
      setComments([]);
    };
  }, []);

  return (
    <div className="Comments-App">
      <Title>Comments App</Title>
      <NewCommentPostSection>
        <Heading>Post Your Comment</Heading>
        <CommentForm submitLabel={SubmitLabel.POST} handleCommentSubmit={addNewComment} />
      </NewCommentPostSection>
      <CommentsSection>
        {loading && <div>{'loading comments...'}</div>}
        {!loading &&
          <AllComments
            comments={comments}
            allUsers={users}
            commentActionListeners={{
              onReplyClick,
              onEditClick,
              onDeleteClick: () => undefined,
              onUpvoteClick: () => undefined
            }}
            commentInteractionListeners={{
              onEditCancel: onCancel,
              onReplyCancel: onCancel,
              onEditSubmit,
              onReplySubmit
            }}
          />
        }
      </CommentsSection>
    </div>
  );
};

export default CommentsApp;
