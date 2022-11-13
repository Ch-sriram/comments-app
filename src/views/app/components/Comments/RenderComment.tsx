import * as React from 'react';
import styled, { css } from 'styled-components';
import { CommentType } from '@app/App';
import { DocumentTypes } from '@db/types';
import Avatar from '../Avatar';
import { CommentAction } from '../util';
import CommentDisplayWithActions from './CommentDisplayWithActions';
import CommentEditForm from './Form/CommentEditForm';
import CommentReplyForm from './Form/CommentReplyForm';

const CommentWrapper = styled.div<{ commentLevel?: number, isReplyOrEdit?: boolean }>`
  display: flex;
  gap: 10px;
  position: relative;
  margin-bottom: ${({ isReplyOrEdit }) => !isReplyOrEdit ? 15 : 24}px;
  flex-wrap: wrap;
  ${({ commentLevel }) => !commentLevel ? '' : css`
    left: ${(commentLevel * 3)}%;
  `};
`;

const CommentFormWrapper = styled.div`
  display: flex;
  flex-flow: column;
  flex-grow: 1;
`;

export type CommentActionClickFnType = (id: string) => void;
export interface CommentActionListenerType {
  onEditClick: CommentActionClickFnType;
  onReplyClick: CommentActionClickFnType;
  onDeleteClick: CommentActionClickFnType;
  onUpvoteClick: CommentActionClickFnType;
};

export interface CommentInteractionListenersType {
  onReplyCancel: () => void;
  onReplySubmit: (commentBody: string, commentParentId: string | null) => void;
  onEditCancel: () => void;
  onEditSubmit: (commentBody: string, commentId: string) => void;
}

export interface CommentMetadata extends DocumentTypes.Comment {
  userName: string | null;
  commentType?: CommentType;
}

export interface RenderCommentProps {
  currentLevel: number;
  comment: CommentMetadata;
  commentActionListeners: CommentActionListenerType;
  commentInteractionListeners: CommentInteractionListenersType;
}

const RenderComment = ({ comment, currentLevel, commentActionListeners, ...rest }: RenderCommentProps) => {
  const { userId, userName } = comment;
  const uniqueKey = `${comment.userId}-${currentLevel}`;
  const avatarComponent = <Avatar key={uniqueKey} userId={userId} userName={userName} />;
  const isReplyOrEdit = comment.commentType === CommentAction.REPLY || comment.commentType === CommentAction.EDIT;

  const commentRenderFactory = (commentType?: CommentType) => {
    const {
      onReplyCancel, onReplySubmit, onEditCancel, onEditSubmit
    } = rest['commentInteractionListeners'];
    const replyFormProps = { onReplyCancel, onReplySubmit };
    const editFormProps = { onEditCancel, onEditSubmit };

    switch (commentType) {
      case CommentAction.REPLY:
        return (<>
          {avatarComponent}
          <CommentFormWrapper className="comment-reply-form">
            <CommentReplyForm {...replyFormProps} commentParentId={comment.parentId as string} />
          </CommentFormWrapper>
        </>);
      case CommentAction.EDIT:
        return (<>
          {avatarComponent}
          <CommentFormWrapper className="comment-edit-form">
            <CommentEditForm {...editFormProps} commentBody={comment.commentTextBody} commentId={comment.id} />
          </CommentFormWrapper>
        </>);
      case CommentAction.DELETE:
        return <div>Deleted Comment</div>;
      default:
        return (
          <React.Fragment>
            {avatarComponent}
            <CommentDisplayWithActions {...commentActionListeners} comment={comment} />
          </React.Fragment>
        );
    }
  }

  return (
    <CommentWrapper
      className="comment-wrapper"
      commentLevel={currentLevel}
      isReplyOrEdit={isReplyOrEdit}
      data-commentid={comment.id}
    >
      {commentRenderFactory(comment.commentType)}
    </CommentWrapper>
  );
}

export default RenderComment;
