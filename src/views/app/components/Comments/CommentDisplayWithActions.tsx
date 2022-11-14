import { Fragment } from 'react';
import styled from 'styled-components';
import { useStore, StoreKeys } from '../../store';
import { getIcon, CommentAction, CommentActionType } from '../util';
import { CommentActionClickFnType, CommentMetadata } from './RenderComment';

const CommentBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border: 1px solid #22202017;
  padding: 10px;
  min-width: 80%;
  border-radius: 4px;
`;

const CommentBoxWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledUserName = styled.h3`
  margin: 0 0 10px 0;
`;

const CommentBody = styled.div`
  font-family: 'Ubuntu', sans-serif;
`;

const CommentActions = styled.div`
  display: flex;
  gap: 32px;
  margin-left: 5px;
`;

const CommonActionWrapperSpan = styled.span`
  cursor: pointer;
  transition: .1s all ease-out;
  :not(.upvotes) :hover {
    transform: translateY(-1px);
  }
`;

const UpvoteWrapper = styled(CommonActionWrapperSpan)`
  display: flex;
  align-items: center;
  gap: 8px;
  color: steelblue;
  :active {
    svg {
      fill: #4682d6;
    }
  }
`;

const UpvoteIconWrapper = styled(UpvoteWrapper)`
  transform: translateY(1px);
`;

const ReplyWrapper = styled(CommonActionWrapperSpan)`
  color: darkslateblue;
`;

const EditWrapper = styled(CommonActionWrapperSpan)`
  color: darkviolet;
`;

const DeleteWrapper = styled(CommonActionWrapperSpan)`
  color: orangered;
`;

export interface CommentDisplayWithActionsProps {
  comment: CommentMetadata;
  onEditClick: CommentActionClickFnType;
  onReplyClick: CommentActionClickFnType;
  onDeleteClick: CommentActionClickFnType;
  onUpvoteClick: CommentActionClickFnType;
}

const CommentDisplayWithActions = (props: CommentDisplayWithActionsProps) => {
  const { store } = useStore();
  const currentUserId = store.get(StoreKeys.USER_ID);
  const commentActionCallbackFactory = (commentActionType: CommentActionType) => {
    switch (commentActionType) {
      case CommentAction.REPLY: return props.onReplyClick;
      case CommentAction.EDIT: return props.onEditClick;
      case CommentAction.DELETE: return props.onDeleteClick;
      case CommentAction.UPVOTE: return props.onUpvoteClick;
      default: return undefined;
    }
  };

  const handleActionClick = (commentAction: CommentActionType) => {
    const callback = commentActionCallbackFactory(commentAction);
    if (!callback) return () => undefined;
    return callback;
  };

  return (
    <CommentBoxWrapper className="comment-box-wrapper">
      <CommentBox className="comment-box">
        <StyledUserName>{props.comment.userName || 'anonymous'}</StyledUserName>
        <CommentBody className="comment-text-body">
          {props.comment.commentTextBody}
        </CommentBody>
      </CommentBox>
      <CommentActions className="comment-actions">
        <UpvoteWrapper
          title="Upvote Comment"
          className="comment-upvote"
          onClick={() => handleActionClick(CommentAction.UPVOTE)(props.comment.id)}
        >
          <UpvoteIconWrapper>{getIcon(CommentAction.UPVOTE)}</UpvoteIconWrapper>
          <span className="upvotes">{props.comment.upvotes}</span>
        </UpvoteWrapper>
        <ReplyWrapper
          title="Reply to this Comment"
          className="comment-reply"
          onClick={() => handleActionClick(CommentAction.REPLY)(props.comment.id)}
        >
          {getIcon(CommentAction.REPLY)}
        </ReplyWrapper>
        {(props.comment.userId === currentUserId) && 
          <Fragment>
            <EditWrapper
              title="Edit Comment"
              className="comment-edit"
              onClick={() => handleActionClick(CommentAction.EDIT)(props.comment.id)}
            >
              {getIcon(CommentAction.EDIT)}
            </EditWrapper>
            <DeleteWrapper
              title="Delete Comment"
              className="comment-delete"
              onClick={() => handleActionClick(CommentAction.DELETE)(props.comment.id)}
            >
              {getIcon(CommentAction.DELETE)}
            </DeleteWrapper>
          </Fragment>}
      </CommentActions>
    </CommentBoxWrapper>
  );
}

export default CommentDisplayWithActions;
