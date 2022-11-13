import * as React from 'react';
import { createdAtComparator } from "../../../app/App";
import { CollectionTypes } from "@db/types";
import RenderComment, {
  CommentMetadata,
  CommentActionListenerType,
  CommentInteractionListenersType,
} from "./RenderComment";

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

const AllComments = ({
  allUsers,
  comments,
  currentLevel = 0,
  commonParentId = null,
  commentActionListeners,
  commentInteractionListeners
}: AllCommentsProps) => {
  const topLevelComments = comments.filter(comment => comment.parentId === commonParentId);
  console.log(currentLevel, topLevelComments);
  return (
    <React.Fragment>
      {topLevelComments.map(topLevelComment => {
        const replies = getReplies(comments, topLevelComment.id);
        return (<>
          <RenderComment
            key={topLevelComment.id}
            currentLevel={currentLevel}
            comment={topLevelComment}
            commentActionListeners={commentActionListeners}
            commentInteractionListeners={commentInteractionListeners}
          />
          {replies.length > 0 && replies.map(reply => (
            <AllComments
              comments={comments}
              allUsers={allUsers}
              currentLevel={currentLevel + 1}
              commonParentId={topLevelComment.id}
              commentActionListeners={commentActionListeners}
              commentInteractionListeners={commentInteractionListeners}
            />
          ))}
        </>);
      })}
    </React.Fragment>
  );
};

export default AllComments;
