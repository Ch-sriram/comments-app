import CommentForm, { SubmitLabel } from './CommentForm';

export interface CommentReplyFormProps {
  commentParentId: string | null;
  onReplyCancel: () => void;
  onReplySubmit: (commentBody: string, commentParentId: string | null) => void;
}

const CommentReplyForm = (props: CommentReplyFormProps) => (
  <CommentForm
    hasCancelButton={true}
    submitLabel={SubmitLabel.REPLY}
    handleCommentCancel={props.onReplyCancel}
    handleCommentSubmit={commentBody => props.onReplySubmit(commentBody, props.commentParentId)}
  />
);

export default CommentReplyForm;
