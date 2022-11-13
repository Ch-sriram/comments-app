import * as React from 'react';
import styled from 'styled-components';
import Button from '../../../ui/Button';

enum Defaults {
  PLACEHOLDER = 'type in your comment ...'
}

export enum SubmitLabel {
  POST = 'Post',
  REPLY = 'Reply',
  UPDATE = 'Update'
}

export type SubmitLabelType = `${SubmitLabel}`;

const noop = () => undefined;

const StlyedTextArea = styled.textarea`
  width: 75%;
  padding: 10px;
  resize: vertical;
  font: 16px 'Ubuntu', sans-serif;
`;

const ButtonWrapper = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
  width: fit-content;
`;

export interface CommentFormProps {
  submitLabel: SubmitLabelType,
  commentBody?: string;
  hasCancelButton?: boolean;
  handleCommentSubmit?: (commentTextBody: string, parentId?: string) => void;
  handleCommentCancel?: () => void;
}

const CommentForm = ({
  submitLabel,
  commentBody = '',
  hasCancelButton = false,
  handleCommentSubmit = noop,
  handleCommentCancel = noop
}: CommentFormProps) => {
  const [commentText, setCommentText] = React.useState<string>(commentBody);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  const onSubmitClick = () => {
    handleCommentSubmit(commentText);
    setCommentText('');
  };

  const onControlEnterKeyDown = (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (ev.ctrlKey && ev.key.toLowerCase().includes('enter')) {
      onSubmitClick();
    }
  }

  React.useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.setSelectionRange(commentText.length, commentText.length);
      textareaRef.current.focus();
    }
  }, []);

  return (
    <React.Fragment>
      <StlyedTextArea
        ref={textareaRef}
        className="comment-text-area"
        placeholder={Defaults.PLACEHOLDER}
        onChange={ev => setCommentText(ev.currentTarget.value)}
        onKeyDown={onControlEnterKeyDown}
        value={commentText}
      ></StlyedTextArea>
      <ButtonWrapper>
        <Button
          title={`Click to ${submitLabel}`}
          onClick={onSubmitClick}
          disabled={commentText.trim().length === 0}
        >
          {submitLabel}
        </Button>
        {hasCancelButton &&
          <Button
            title={`Click to Cancel ${submitLabel}`}
            onClick={handleCommentCancel}
          >
            Cancel
          </Button>}
      </ButtonWrapper>
    </React.Fragment>
  );
};

export default CommentForm;
