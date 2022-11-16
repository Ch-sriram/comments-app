export namespace DocumentTypes {
  export interface Comment {
    id: string;
    userId: string;
    parentId: string | null;
    replyId: string | null;
    createdAt: string;
    commentTextBody: string;
    isArchived?: boolean;
    upvotedBy?: Array<UserId>;
  }
  export interface User {
    id: string;
    name: string;
  }
  export type UserId = User['id'];
}

export namespace CollectionTypes {
  export type Comments = Array<DocumentTypes.Comment>;
  export type Users = Array<DocumentTypes.User>;
};
