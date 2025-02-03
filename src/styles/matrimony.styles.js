import { Button, Card, Paragraph, Title } from 'react-native-paper';
import styled from 'styled-components/native';
import Theme from './theme';
export const MatrimonyHomeCard = styled(Card)`
  width: 100%;
  align-self: center;
  border-radius: 16px;
  position: relative;
  margin-bottom: 24px;
`;
export const TempleHomeCard = styled(Card)`
  width: 100%;
  align-self: center;
  border-radius: 16px;
  position: relative;
  margin-bottom: 24px;
 `;

export const MatrimonyHomeCardTitle = styled(Title)`
  font-size: 20px;
  color: #ffffff;
  /* color : red; */
  text-transform: capitalize;
`;

export const MatrimonyHomeCardSubTitle = styled(Paragraph)`
  font-size: 14px;
  color: #ffffff;
  
`;

export const MatrimonyHomeSwitch = styled(Button)`
  border-radius: 10px;
  border-color: #d4d4d4;
  border-width: 1px;
  margin-right: 8px;
`;

export const MatrimonyMessageSwitch = styled(Button)`

  border-color: ${(props) => props.themeColor || Theme.themeColor};
  border-radius: 0px;
  margin: 10px 0px;
  padding: 0 10px;
`;

export const InterestPill = styled(Paragraph)`
  border-radius: 32px;
  background-color: #f7efd5;
  padding: 8px 20px;
  font-size: 12px;
  justify-content: center;
  align-items: center;
  margin: 12px;
  margin-left: 0;
  `;

export const LikeButton = styled.TouchableOpacity`
  background-color: ${(props) => props.themeColor || Theme.themeColor};
  border-radius: 8px;
  color: #fff;
  font-size: 12px;
  padding: 6px 14px;
  margin-right: 10px;
`;
