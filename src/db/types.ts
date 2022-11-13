export namespace DocumentTypes {
  export interface Comment {
    id: string;
    userId: string;
    parentId: string | null;
    replyId: string | null;
    upvotes: number;
    downvotes: number;
    createdAt: string;
    commentTextBody: string;
    isArchived?: boolean;
  }
  export interface User {
    id: string;
    name: string;
  }
}

export namespace CollectionTypes {
  export type Comments = Array<DocumentTypes.Comment>;
  export type Users = Array<DocumentTypes.User>;
};
