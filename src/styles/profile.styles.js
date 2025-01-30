import styled from 'styled-components';
import { Dimensions } from 'react-native';
const windowWidth = Dimensions.get('window').width;

export const ProfileContainer = styled.View`
  padding: 0;
  margin: 0;
`;

export const ProfileStats = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
  flex-direction: column;
  border-bottom-width: 3px;
  padding: 0 12px;
  padding-bottom: 8px;
`;

export const ProfileImageGrid = styled.View`
  padding: 0;
  padding-top: 8px;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  flex-direction: row;
`;

export const PostImage = styled.TouchableOpacity`
  margin:1px;
  width: 32.5%;
  height: 120px;
  border-radius: 0px;
`;

// export const ConfirmButton = styled.TouchableOpacity`
//   background-color: #b98c13;
//   border-radius: 4px;
//   padding: 0.4rem 1.2rem;
//   color: white;
//   font-weight: bold;
// `;
