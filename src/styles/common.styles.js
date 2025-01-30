import styled from 'styled-components';
import { Dimensions } from 'react-native';
const windowWidth = Dimensions.get('window').width;

export const RowBetween = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const BoldText = styled.Text`
  font-weight: bold;
`;

export const PrimaryText = styled.Text`
  font-size: 16px;
  color: #b98c13;
`;

export const Container = styled.View`
  flex: 1;
  padding: 20px 0;
`;

export const View = styled.View`
  flex: 1;
  flex-direction: row;
`;

export const ViewContainer = styled.View``;

export const InputField = styled.TextInput`
  padding: 0 16px;
  font-size: 14px;
  color: #78849e;
`;

export const SearchField = styled.TextInput`
  padding: 10px 16px;
  font-size: 16px;
  background-color: #e9ebef;
  border-radius: 30px;
  width: 100%;
  margin: 8px 0;
  color: black;
`;

export const MatrimonySearch = styled.View`
  padding: 22px 16px;
  font-size: 16px;
  background-color: #e9ebef;
  border-radius: 4px;
  width: 100%;
  margin: 8px 0;
  color: black;
`;
