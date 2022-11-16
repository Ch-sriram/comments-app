import * as React from 'react';
import styled from 'styled-components';
import {
  getAllComments,
  createComment,
  updateCommentById,
  archiveComment,
  purgeComment,
  purgeAllComments
} from '../../db/repositories/comments';
import { createUser, getAllUsers } from '../../db/repositories/users';
import { CollectionTypes, DocumentTypes } from '../../db/types';
import CommentForm, { SubmitLabel } from './components/Comments/Form/CommentForm';
import { useStore, StoreKeys } from './store';
import { CommentActionClickFnType, CommentMetadata } from './components/Comments/RenderComment';
import { CommentAction, getGitHubIcon } from './components/util';
import AllComments from './components/Comments/AllComments';
import Button from './ui/Button';

const GithubIconWrapper = styled.div`
  width: fit-content;
  height: 20px;
  position: fixed;
  z-index: 99999;
  right: 3%;
  bottom: 5%;
  svg {
    cursor: pointer;
  }
`;

const StyledLink = styled.a`
  :active,
  :visited,
  :hover {
    color: unset;
  }
`;


const CommentsAppHeaderSection = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
`;

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
  const [deleting, setDeleting] = React.useState<boolean>(false);
  const [users, setUsers] = React.useState<CollectionTypes.Users>([]);
  const [comments, setComments] = React.useState<Array<CommentMetadata>>([]);

  const fetchAllComments = async () => {
    const allComments = (await getAllComments()).sort(createdAtComparator);
    console.log('fetchAllComments', allComments);
    return allComments;
  }

  /**
   * Triggered when a comment's upvote button is clicked.
   * @param commentId unique identifier of the comment.
   */
  const onUpvoteClick: CommentActionClickFnType = async (commentId) => {
    try {
      const currentUserId = store.get(StoreKeys.USER_ID);
      if (!currentUserId) {
        throw new Error('Unknown User');
      }
      const commentsCopy = comments.map(c => ({ ...c } as CommentMetadata));
      const votedCommentIndex = commentsCopy.findIndex(c => c.id === commentId);
      if (votedCommentIndex === -1) {
        throw new Error('Comment not found in frontend state, check if the state is being updated properly.');
      }
      const currentCommentUpvotedBy = commentsCopy[votedCommentIndex].upvotedBy ?? [];
      if (currentCommentUpvotedBy.indexOf(currentUserId) > -1) { // Current user already upvoted this comment ==> It's a downvote.
        const filteredUpvotedBy = currentCommentUpvotedBy.filter(userId => userId !== currentUserId);
        await updateCommentById({ commentId, upvotedBy: filteredUpvotedBy });
        commentsCopy[votedCommentIndex].upvotedBy = filteredUpvotedBy;
      } else { // Current user hasn't upvoted this comment ==> It's an upvote.
        currentCommentUpvotedBy.push(currentUserId);
        commentsCopy[votedCommentIndex].upvotedBy = currentCommentUpvotedBy;
        await updateCommentById({ commentId, upvotedBy: currentCommentUpvotedBy });
      }
      setComments(commentsCopy);
    } catch (err: any) {
      console.error('Upvote Failed. User is unknown!', err);
    }
  };
  
  /**
   * Triggered when user clicks on any comment reply.
   * @param commentId considered to be the `parentId` for the dummy comment that'll be added for rendering a reply form
   */
  const onReplyClick: CommentActionClickFnType = commentId => {
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
      upvotedBy: [] as DocumentTypes.UserId[],
      parentId: commentId,
      userId,
      userName
    } as CommentMetadata;
    setComments([replyWithoutCommentId, ...commentsWithoutStaleRepliesAndEdits]);
  };

  const doesCommentContainReplies = (commentId: string) => comments.some(c => c.parentId === commentId);

  const purgeCommentsRecursively = async (
    commentId: string | null,
    remainingComments: CommentMetadata[],
    purgedCommentIds: string[]
  ) => {
    if (!commentId) return;
    const comment = remainingComments.find(c => c.id === commentId);
    if (comment) {
      const commentReplies = remainingComments.filter(c => c.parentId === commentId);
      if (commentReplies.length === 0 && comment.isArchived) {
        await purgeComment({ commentId });
        purgedCommentIds.push(commentId);
        await purgeCommentsRecursively(
          comment.parentId,
          remainingComments.filter(c => c.id !== commentId),
          purgedCommentIds
        );
      }
    }
  }

  const onDeleteClick = async (commentId: string) => {
    try {
      if (window.confirm('Are you sure you want to delete the comment?')) {
        if (doesCommentContainReplies(commentId)) {
          await archiveComment({ commentId });
          const commentsCopy = comments.map(c => ({ ...c }) as CommentMetadata);
          const archivedCommentIndex = commentsCopy.findIndex(c => c.id === commentId);
          commentsCopy[archivedCommentIndex].isArchived = true;
          commentsCopy[archivedCommentIndex].commentType = CommentAction.DELETE;
          setComments(commentsCopy);
        } else {
          await purgeComment({ commentId });
          const comment = comments.find(c => c.id === commentId);
          const commentsCopy = comments.filter(c => c.id !== commentId) as Array<CommentMetadata>;
          const purgedCommentIds: string[] = [];
          await purgeCommentsRecursively(comment?.parentId || null, commentsCopy, purgedCommentIds);
          setComments(commentsCopy.filter(c => purgedCommentIds.indexOf(c.id) === -1));
        }
      }
    } catch (err: any) {
      console.error(err, 'comment could not be deleted!');
    }
  };

  /**
   * Triggered when user clicks on any comment edit, if edit is available.
   * @param commentId unique identifier of the comment that's being edited.
   */
  const onEditClick: CommentActionClickFnType = commentId => {
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
    try {
      const editedCommentIndex = comments.findIndex(c => c.id === commentId);
      const oldCommentTextBody = comments[editedCommentIndex].commentTextBody;
      if (oldCommentTextBody !== commentTextBody) {
        await updateCommentById({ commentTextBody, commentId });
        setComments(comments.map(c => c.id === commentId ? ({ ...c, commentTextBody, commentType: undefined }) : ({ ...c })));
      }
    } catch (err: any) {
      console.error('Could not sumbit the edited comment', err);
      setComments(comments.map(c => c.id === commentId ? ({ ...c, commentType: undefined }) : ({ ...c })));
    }
  };

  /**
   * 
   * @param commentTextBody replied comment's body.
   * @param parentCommentId if `null`, then it's a comment with no parent (*i.e.* new top-level comment), otherwise, there's a comment which is parent to it.
   */
  const onReplySubmit = async (commentTextBody: string, parentCommentId: string | null) => {
    const commentsCopy = comments.map(c => ({ ...c }) as CommentMetadata);
    try {
      const newComment = await getNewAddedComment(commentTextBody, parentCommentId);
      const replyCommentIndex = commentsCopy.findIndex(c => c.id === fakeCommentId);
      commentsCopy[replyCommentIndex] = newComment;
      setComments(commentsCopy);
    } catch (err: any) {
      console.error('Could not reply to the comment', err);
      setComments(comments.filter(c => c.id !== fakeCommentId) as Array<CommentMetadata>);
    }
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
      store.set(StoreKeys.USER_NAME, newUser.name);
    }
    store.set(StoreKeys.ALL_USERS, JSON.stringify(allUsers));
  }

  const fetchAllUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      await checkAndSetUserInStore(allUsers);
      return allUsers;
    } catch (err: any) {
      console.error('Could not fetch all users', err);
    }
  };

  const onMountFetch = async () => {
    setLoading(true);
    try {
      const allUsers = await fetchAllUsers();
      const allComments = await fetchAllComments();
      if (allUsers && allComments) {
        const userTuplesIterable = allUsers.reduce((usersTillNow, user) => {
          const { id, name } = user;
          return [...usersTillNow, [id, name] as [string, string]];
        }, [] as [string, string][]);
        const userIdMap = new Map(userTuplesIterable);
        const archivedCommentIds: CommentMetadata[] = [];
        const allCommentsWithUserName = allComments.reduce((commentsTillNow, comment) => {
          const userName = userIdMap.get(comment.userId);
          if (comment.isArchived && !doesCommentContainReplies(comment.id)) {
            const archivedComment = { ...comment, commentType: CommentAction.DELETE } as CommentMetadata;
            archivedCommentIds.push(archivedComment);
            return [...commentsTillNow, archivedComment];
          }
          return [...commentsTillNow, { ...comment, userName } as CommentMetadata];
        }, [] as CommentMetadata[]);
        setComments(allCommentsWithUserName);
      }
    } catch (err: any) {
      console.error('Mount Error', err);
    } finally {
      setLoading(false);
    }
  }

  const getNewAddedComment = async (commentTextBody: string, parentId?: string | null) => {
    const createdAt = new Date().toISOString();
    const userId = store.get(StoreKeys.USER_ID);
    const userNameFromStore = store.get(StoreKeys.USER_NAME);
    const userName = users.find(user => user.id === userId)?.name ?? userNameFromStore ?? 'anonymous';
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

  const onDeleteAllComments = async () => {
    if (!window.confirm('Are you sure you want to delete all the comments?')) {
      return;
    }
    setDeleting(true);
    try {
      await purgeAllComments();
    } catch (err: any) {
      console.error(`Deleting all comments failed.`, err);
    } finally {
      setDeleting(false);
      onMountFetch();
    }
  };

  // Effects: onMount
  React.useEffect(() => {
    onMountFetch();
    return () => {
      setUsers([]);
      setComments([]);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Comments-App">
      <GithubIconWrapper>
        <StyledLink
          title="Check the source code"
          target="_blank"
          href="https://github.com/Ch-sriram/comments-app"
        >
          {getGitHubIcon({ height: 30 })}
        </StyledLink>
      </GithubIconWrapper>
      <CommentsAppHeaderSection className="comments-app-header">
        <Title>Comments App</Title>
        <Button onClick={onDeleteAllComments}>Delete All Comments</Button>
      </CommentsAppHeaderSection>
      <NewCommentPostSection>
        <Heading>Post Your Comment</Heading>
        <CommentForm submitLabel={SubmitLabel.POST} handleCommentSubmit={addNewComment} />
      </NewCommentPostSection>
      <CommentsSection>
        {deleting && <div>{'deleting all comments...'}</div>}
        {loading && <div>{'loading comments...'}</div>}
        {!loading && !deleting &&
          <AllComments
            comments={comments}
            allUsers={users}
            commentActionListeners={{
              onReplyClick,
              onEditClick,
              onDeleteClick,
              onUpvoteClick
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
