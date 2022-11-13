import * as React from 'react';
import { createdAtComparator } from "../../../app/App";
import { CollectionTypes } from "@db/types";
import RenderComment, {
  CommentMetadata,
  CommentActionListenerType,
  CommentInteractionListenersType,
} from "./RenderComment";
import { CommentAction } from '../util';

const getReplies = (comments: Array<CommentMetadata>, currentCommentId: string) =>
  comments.filter(comment => comment.parentId === currentCommentId).sort(createdAtComparator);

interface AllCommentsProps {
  allUsers: CollectionTypes.Users;
  comments: Array<CommentMetadata>;
  currentLevel?: number;
  commonParentId?: string | null;
  commentActionListeners: CommentActionListenerType;
  commentInteractionListeners: CommentInteractionListenersType;
}

type AllCommentsHelperProps = {
  comment: CommentMetadata;
  replies: Array<CommentMetadata>;
} & Omit<AllCommentsProps, 'allUsers' | 'commonParentId'>;

/**
 * Component to render the provided comment, and its respective replies.
 * The replies are rendered by recursing on the same component.
 */
const AllCommentsHelper = ({
  comment,
  replies,
  comments,
  currentLevel = 0,
  commentActionListeners,
  commentInteractionListeners
}: AllCommentsHelperProps) => {
  return (<>
    <RenderComment
      key={comment.id}
      currentLevel={currentLevel}
      comment={comment}
      commentActionListeners={commentActionListeners}
      commentInteractionListeners={commentInteractionListeners}
    />
    {replies.length > 0 && replies.map((reply: any) => (
      <AllCommentsHelper
        comment={reply}
        comments={comments}
        replies={getReplies(comments, reply.id)}
        currentLevel={currentLevel + 1}
        commentActionListeners={commentActionListeners}
        commentInteractionListeners={commentInteractionListeners}
      />
    ))}
  </>);
};

const AllComments = ({
  allUsers,
  comments,
  currentLevel = 0,
  commonParentId = null,
  commentActionListeners,
  commentInteractionListeners
}: AllCommentsProps) => {
  // top-level comments cannot be a reply, therefore filtering out all the comments which are replies.
  const topLevelComments = comments.filter(comment => comment.parentId === commonParentId && comment.commentType !== CommentAction.REPLY);
  return (
    <React.Fragment>
      {topLevelComments.map(topLevelComment => (
        <AllCommentsHelper
          comment={topLevelComment}
          comments={comments}
          replies={getReplies(comments, topLevelComment.id)}
          currentLevel={currentLevel}
          commentActionListeners={commentActionListeners}
          commentInteractionListeners={commentInteractionListeners}
        />
      ))}
    </React.Fragment>
  );
};

export default AllComments;
