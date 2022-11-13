import CommentForm, { SubmitLabel } from './CommentForm';

export interface CommentEditFormProps {
  commentId: string;
  commentBody: string;
  onEditCancel: () => void;
  onEditSubmit: (commentBody: string, commentId: string) => void;
}

const CommentEditForm = (props: CommentEditFormProps) => (
  <CommentForm
    commentBody={props.commentBody}
    hasCancelButton={true}
    submitLabel={SubmitLabel.UPDATE}
    handleCommentCancel={props.onEditCancel}
    handleCommentSubmit={commentBody => props.onEditSubmit(commentBody, props.commentId)}
  />
);

export default CommentEditForm;
