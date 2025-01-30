/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getMessage = /* GraphQL */ `
  query GetMessage($id: ID!) {
    getMessage(id: $id) {
      id
      content
      userID
      chatroomID
      createdAt
      updatedAt
    }
  }
`;
export const listMessages = /* GraphQL */ `
  query ListMessages(
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMessages(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        content
        userID
        chatroomID
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getChatRoom = /* GraphQL */ `
  query GetChatRoom($id: ID!) {
    getChatRoom(id: $id) {
      id
      newMessages
      LastMessage {
        id
        content
        userID
        chatroomID
        createdAt
        updatedAt
      }
      Messages {
        items {
          id
          content
          userID
          chatroomID
          createdAt
          updatedAt
        }
        nextToken
      }
      ChatRoomUsers {
        items {
          id
          chatRoomID
          userID
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
      chatRoomLastMessageId
    }
  }
`;
export const listChatRooms = /* GraphQL */ `
  query ListChatRooms(
    $filter: ModelChatRoomFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listChatRooms(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        newMessages
        LastMessage {
          id
          content
          userID
          chatroomID
          createdAt
          updatedAt
        }
        Messages {
          nextToken
        }
        ChatRoomUsers {
          nextToken
        }
        createdAt
        updatedAt
        chatRoomLastMessageId
      }
      nextToken
    }
  }
`;
export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      name
      imageUri
      status
      Messages {
        items {
          id
          content
          userID
          chatroomID
          createdAt
          updatedAt
        }
        nextToken
      }
      chatrooms {
        items {
          id
          chatRoomID
          userID
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        imageUri
        status
        Messages {
          nextToken
        }
        chatrooms {
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getChatRoomUser = /* GraphQL */ `
  query GetChatRoomUser($id: ID!) {
    getChatRoomUser(id: $id) {
      id
      chatRoomID
      userID
      chatRoom {
        id
        newMessages
        LastMessage {
          id
          content
          userID
          chatroomID
          createdAt
          updatedAt
        }
        Messages {
          nextToken
        }
        ChatRoomUsers {
          nextToken
        }
        createdAt
        updatedAt
        chatRoomLastMessageId
      }
      user {
        id
        name
        imageUri
        status
        Messages {
          nextToken
        }
        chatrooms {
          nextToken
        }
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
export const listChatRoomUsers = /* GraphQL */ `
  query ListChatRoomUsers(
    $filter: ModelChatRoomUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listChatRoomUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        chatRoomID
        userID
        chatRoom {
          id
          newMessages
          createdAt
          updatedAt
          chatRoomLastMessageId
        }
        user {
          id
          name
          imageUri
          status
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
