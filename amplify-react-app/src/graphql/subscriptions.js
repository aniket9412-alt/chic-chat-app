/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateMessage = /* GraphQL */ `
  subscription OnCreateMessage {
    onCreateMessage {
      id
      channelID
      author
      body
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateMessage = /* GraphQL */ `
  subscription OnUpdateMessage {
    onUpdateMessage {
      id
      channelID
      author
      body
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteMessage = /* GraphQL */ `
  subscription OnDeleteMessage {
    onDeleteMessage {
      id
      channelID
      author
      body
      createdAt
      updatedAt
    }
  }
`;
export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser {
    onCreateUser {
      id
      userName
      password
      name
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser {
    onUpdateUser {
      id
      userName
      password
      name
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser {
    onDeleteUser {
      id
      userName
      password
      name
      createdAt
      updatedAt
    }
  }
`;
export const onCreateChat = /* GraphQL */ `
  subscription OnCreateChat {
    onCreateChat {
      id
      user1
      user2
      status
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateChat = /* GraphQL */ `
  subscription OnUpdateChat {
    onUpdateChat {
      id
      user1
      user2
      status
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteChat = /* GraphQL */ `
  subscription OnDeleteChat {
    onDeleteChat {
      id
      user1
      user2
      status
      createdAt
      updatedAt
    }
  }
`;
