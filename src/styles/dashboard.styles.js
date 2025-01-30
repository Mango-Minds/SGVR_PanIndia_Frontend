import styled from "styled-components";
import { Dimensions } from "react-native";

const windowWidth = Dimensions.get("window").width;





export const TopHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  width: 100%;
`;

export const HeaderText = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #b98c13;
`;


export const BannerContainer = styled.Image`
  width: 100%;
  height: 145px;
  background-color: #D4AF371A;
  margin: 0 auto;
  margin-bottom: 42px;
  padding: 16px;
  border-radius: 8px;
  border-width: 1px;
  border-color: lightgrey;
`;

export const BannerTitle = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: #fff;
  width: 50%;
`;
export const BannerTextCommunity = styled.Text`
  font-size: 11px;
  color: #fff;
  margin-top: 4px;
`;

export const BannerButton = styled.Text`
  width: 100px;
  background-color: #fff;
  align-items: center;
  justify-content: center;
  padding: 8px;
  color: #d4af37;
  border-radius: 6px;
  margin-top: 8px;
`;

export const DashboardSection = styled.View`
  margin-bottom: 42px;
`;

export const MainContainerDashboard = styled.ScrollView`
  padding: 20px 16px;
`;

export const SectionTitle = styled.Text`
  font-size: 18px;
  color: #2b2b2b;
  font-weight: bold;
`;

export const ExploreContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  padding: 0px 10px;
`;

export const ExploreIconContainer = styled.TouchableOpacity`
  align-items: center;
  border-radius: 10px;
  margin-top: 15px; 
`;

export const ExploreIconName = styled.Text`
  color: #686868;
  font-size: 14px;
  font-weight: 600;
  letterSpacing : 0.3px;
  margin-top: 2px;
 `;

export const ExploreIcon = styled.Image`
  width: 90%;
  height: 90%;
  border-color: red;
  border-width: 3px;
`;

export const IconWrapper = styled.View`
  width: 90px; 
  height: 90px; 
  background-color: white;
  border-radius: 10px; 
  justify-content: center;
  align-items: center;
  shadow-color: #000;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 5; 
  margin-bottom: 8px;
`;

export const NewsContainer = styled.View`
  /* flex-direction: row; */
  margin-top: 28px;
  background: white;
  box-shadow: 0px 0px 3px #0000001a;
  width: 100%;
  padding: 10px ;
`;

export const NewsImage = styled.Image`
  width: 100%;
  height: 150px;
  resize-mode: contain;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  background: #f7f7f7;
  padding: 10px;
`;

export const NewsContentContainer = styled.View``;

export const NewsPreview = styled.Text`
  /* width: 50%; */
 font-size: 12px;
  color: gray;
  line-height: 16px;
  font-weight: 500;
`;

export const Rating = styled.Text`
  font-size: 10px;
  color: #fff;
  background: #d4af37;
  border-radius: 4px;
  padding: 4px 10px;
`;

export const Row = styled.View`
  flex-direction: row;
`;

export const JobDetails = styled.View`
  flex-direction: column;
`;

export const JobHeading = styled.Text`
  font-size: 14px;
  color: #2b2b2b;
  font-weight: 800;
`;

export const JobType = styled.Text`
  font-size: 12px;
  color: #898e92;
  margin-top: 4px;
`;

export const JobLocation = styled.Text`
  font-size: 11px;
  color: gray;
  margin-top: 4px;
  fontWeight: 500;
  text-transform: capitalize;
  letterSpacing : 0.3px;
`;

export const JobSalary = styled.View`
  background-color: #f8f8f8;
  padding: 4px 10px;
  font-size: 14px;
  justify-content: center;
  align-items: center;
  color: #898e92;
  border-radius: 4px;
`;

export const HallImageContainer = styled.View`
  width: 40%;
 `;
export const HallDetailsContainer = styled.View`
  width: 70%;
  padding: 0 16px;
`;

export const Heading = styled.Text`
  color: goldenrod;
  font-size: 16px;
  font-weight: 700;
  text-transform: capitalize;
  letterSpacing : 0.3px;
  width: 100%;
`;

export const Timings = styled.Text`
  background: #f7efd5;
  border-radius: 4px;
  padding: 4px 8px;
  margin: 8px;
  margin-left: 0;

  font-size: 9px;
`;

export const ViewDetails = styled.Text`
  color: #d4af37;
  font-size: 12px;
  font-weight: 600;
  /* text-decoration: underline; */
  margin-top: 40px;
  background-color: #fff;
`;
