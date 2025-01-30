/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createMessage = /* GraphQL */ `
  mutation CreateMessage(
    $input: CreateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    createMessage(input: $input, condition: $condition) {
      id
      content
      userID
      chatroomID
      createdAt
      updatedAt
    }
  }
`;
export const updateMessage = /* GraphQL */ `
  mutation UpdateMessage(
    $input: UpdateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    updateMessage(input: $input, condition: $condition) {
      id
      content
      userID
      chatroomID
      createdAt
      updatedAt
    }
  }
`;
export const deleteMessage = /* GraphQL */ `
  mutation DeleteMessage(
    $input: DeleteMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    deleteMessage(input: $input, condition: $condition) {
      id
      content
      userID
      chatroomID
      createdAt
      updatedAt
    }
  }
`;
export const createChatRoom = /* GraphQL */ `
  mutation CreateChatRoom(
    $input: CreateChatRoomInput!
    $condition: ModelChatRoomConditionInput
  ) {
    createChatRoom(input: $input, condition: $condition) {
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
export const updateChatRoom = /* GraphQL */ `
  mutation UpdateChatRoom(
    $input: UpdateChatRoomInput!
    $condition: ModelChatRoomConditionInput
  ) {
    updateChatRoom(input: $input, condition: $condition) {
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
export const deleteChatRoom = /* GraphQL */ `
  mutation DeleteChatRoom(
    $input: DeleteChatRoomInput!
    $condition: ModelChatRoomConditionInput
  ) {
    deleteChatRoom(input: $input, condition: $condition) {
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
export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
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
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
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
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
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
export const createChatRoomUser = /* GraphQL */ `
  mutation CreateChatRoomUser(
    $input: CreateChatRoomUserInput!
    $condition: ModelChatRoomUserConditionInput
  ) {
    createChatRoomUser(input: $input, condition: $condition) {
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
export const updateChatRoomUser = /* GraphQL */ `
  mutation UpdateChatRoomUser(
    $input: UpdateChatRoomUserInput!
    $condition: ModelChatRoomUserConditionInput
  ) {
    updateChatRoomUser(input: $input, condition: $condition) {
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
export const deleteChatRoomUser = /* GraphQL */ `
  mutation DeleteChatRoomUser(
    $input: DeleteChatRoomUserInput!
    $condition: ModelChatRoomUserConditionInput
  ) {
    deleteChatRoomUser(input: $input, condition: $condition) {
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
